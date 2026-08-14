/*
 * SPDX-FileCopyrightText: 2026 m0p4rk
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { findBestQuality } from "./byte-solver";
import { createOutputFilename } from "./filename";
import { calculateDrawPlan, calculatePreviewDrawPlan, scaleDrawPlan } from "./geometry";
import { inspectImage, mimeLabel } from "./inspect";
import {
  assertImageDimensionsWithinLimits,
  dimensionsExpectation,
  dimensionsPass,
  normalizeImageRequirements,
} from "./requirements";
import {
  IMAGE_LIMITS,
  ImageProcessingError,
  type ConstraintCheck,
  type DrawPlan,
  type ImageInspection,
  type ImagePreviewResult,
  type ImageRequirements,
  type ImageWorkerStage,
  type ProcessedImageResult,
  type SupportedImageMime,
} from "./types";

type ProgressReporter = (stage: ImageWorkerStage) => void;

function formatBytes(bytes: number) {
  const exact = `${bytes.toLocaleString("en-US")} bytes`;
  if (bytes < 1000) return exact;
  if (bytes < 1_000_000) return `${(bytes / 1000).toFixed(1)} KB (${exact})`;
  return `${(bytes / 1_000_000).toFixed(2)} MB (${exact})`;
}

function makeChecks(
  input: ImageInspection,
  output: ImageInspection,
  requirements: ImageRequirements,
): ConstraintCheck[] {
  const checks: ConstraintCheck[] = [
    {
      key: "format",
      label: "Format",
      expected: mimeLabel(requirements.outputMime),
      before: mimeLabel(input.mime),
      beforePass: input.mime === requirements.outputMime,
      after: mimeLabel(output.mime),
      afterPass: output.mime === requirements.outputMime,
    },
    {
      key: "dimensions",
      label: "Dimensions",
      expected: dimensionsExpectation(input, requirements),
      before: `${input.width} × ${input.height} px`,
      beforePass: dimensionsPass(input, requirements, input),
      after: `${output.width} × ${output.height} px`,
      afterPass: dimensionsPass(output, requirements, input),
    },
    {
      key: "metadata",
      label: "Private photo details",
      expected: "Removed",
      before: input.hasApplicationMetadata ? "Found" : "None",
      beforePass: !input.hasApplicationMetadata,
      after: output.hasApplicationMetadata ? "Found" : "Removed",
      afterPass: !output.hasApplicationMetadata,
    },
  ];

  if (requirements.maxBytes !== undefined) {
    checks.splice(2, 0, {
      key: "bytes",
      label: "File size",
      expected: `At most ${formatBytes(requirements.maxBytes)}`,
      before: formatBytes(input.bytes),
      beforePass: input.bytes <= requirements.maxBytes,
      after: formatBytes(output.bytes),
      afterPass: output.bytes <= requirements.maxBytes,
    });
  }

  return checks;
}

function getCanvasContext(canvas: OffscreenCanvas) {
  const context = canvas.getContext("2d", { alpha: true });

  if (!context) {
    throw new ImageProcessingError(
      "unsupported_browser",
      "This browser could not prepare the image. Try another browser.",
    );
  }

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  return context;
}

async function render(
  bitmap: ImageBitmap,
  plan: DrawPlan,
  outputMime: SupportedImageMime,
  backgroundColor?: string,
) {
  if (typeof OffscreenCanvas === "undefined") {
    throw new ImageProcessingError(
      "unsupported_browser",
      "This browser could not prepare the image. Try another browser.",
    );
  }

  const canvas = new OffscreenCanvas(plan.canvasWidth, plan.canvasHeight);
  const context = getCanvasContext(canvas);
  const fillColor =
    outputMime === "image/jpeg" ? (backgroundColor ?? "#ffffff") : backgroundColor;

  if (fillColor !== undefined) {
    context.fillStyle = fillColor;
    context.fillRect(0, 0, plan.canvasWidth, plan.canvasHeight);
  }

  context.drawImage(
    bitmap,
    plan.sourceX,
    plan.sourceY,
    plan.sourceWidth,
    plan.sourceHeight,
    plan.destinationX,
    plan.destinationY,
    plan.destinationWidth,
    plan.destinationHeight,
  );

  return canvas;
}

async function encodeCanvas(
  canvas: OffscreenCanvas,
  mime: SupportedImageMime,
  quality?: number,
) {
  const options: ImageEncodeOptions = { type: mime };
  if (quality !== undefined) options.quality = quality;
  const blob = await canvas.convertToBlob(options);

  if (blob.type !== mime) {
    throw new ImageProcessingError(
      "unsupported_encoder",
      `This browser cannot encode ${mimeLabel(mime)} images.`,
    );
  }

  return blob;
}

async function encodeWithinLimit(
  canvas: OffscreenCanvas,
  mime: SupportedImageMime,
  maximumBytes: number | undefined,
) {
  if (mime === "image/png") {
    const blob = await encodeCanvas(canvas, mime);
    return {
      blob: blob.size <= (maximumBytes ?? Number.POSITIVE_INFINITY) ? blob : null,
      smallest: blob,
      attempts: 1,
    };
  }

  if (maximumBytes === undefined) {
    const quality = 1;
    const blob = await encodeCanvas(canvas, mime, quality);
    return { blob, smallest: blob, attempts: 1, quality };
  }

  const search = await findBestQuality(
    (quality) => encodeCanvas(canvas, mime, quality),
    maximumBytes,
    { maximum: 1 },
  );

  if (!search.match) {
    return {
      blob: null,
      smallest: search.smallest.value,
      attempts: search.attempts,
    };
  }

  return {
    blob: search.match.value,
    smallest: search.smallest.value,
    attempts: search.attempts,
    quality: search.match.quality,
  };
}

async function decode(file: Blob, resize?: { width: number; height: number }) {
  if (typeof createImageBitmap === "undefined") {
    throw new ImageProcessingError(
      "unsupported_browser",
      "This browser could not open this image. Try another browser.",
    );
  }

  try {
    return await createImageBitmap(
      file,
      resize
        ? {
            imageOrientation: "from-image",
            resizeHeight: resize.height,
            resizeQuality: "high",
            resizeWidth: resize.width,
          }
        : { imageOrientation: "from-image" },
    );
  } catch {
    throw new ImageProcessingError(
      "invalid_image",
      "The image could not be decoded safely in this browser.",
    );
  }
}

async function inspectSafeInput(
  file: File,
  reportProgress: ProgressReporter = () => undefined,
) {
  if (file.size > IMAGE_LIMITS.maxInputBytes) {
    throw new ImageProcessingError(
      "file_too_large",
      `Choose a file no larger than ${formatBytes(IMAGE_LIMITS.maxInputBytes)}.`,
    );
  }

  reportProgress("inspecting");
  const inspection = await inspectImage(file);

  if (inspection.isAnimated) {
    throw new ImageProcessingError(
      "animated_image",
      "Animated images are not supported because re-encoding would discard frames.",
    );
  }

  assertImageDimensionsWithinLimits(inspection);
  return inspection;
}

export async function createImagePreview(file: File): Promise<ImagePreviewResult> {
  const inspection = await inspectSafeInput(file);
  const decodePlan = calculatePreviewDrawPlan(
    inspection.width,
    inspection.height,
    IMAGE_LIMITS.previewMaxSide,
    IMAGE_LIMITS.previewMaxPixels,
  );
  const bitmap = await decode(file, {
    width: decodePlan.canvasWidth,
    height: decodePlan.canvasHeight,
  });

  try {
    assertImageDimensionsWithinLimits(bitmap);
    const plan = calculatePreviewDrawPlan(
      bitmap.width,
      bitmap.height,
      IMAGE_LIMITS.previewMaxSide,
      IMAGE_LIMITS.previewMaxPixels,
    );
    const previewMime: SupportedImageMime = inspection.hasAlpha
      ? "image/png"
      : "image/jpeg";
    const canvas = await render(bitmap, plan, previewMime);
    const blob = await encodeCanvas(
      canvas,
      previewMime,
      previewMime === "image/jpeg" ? 0.82 : undefined,
    );

    return {
      blob,
      mime: previewMime,
      width: plan.canvasWidth,
      height: plan.canvasHeight,
    };
  } finally {
    bitmap.close();
  }
}

export async function processImageFile(
  file: File,
  rawRequirements: ImageRequirements,
  reportProgress: ProgressReporter = () => undefined,
): Promise<ProcessedImageResult> {
  const requirements = normalizeImageRequirements(rawRequirements);
  const headerInspection = await inspectSafeInput(file, reportProgress);

  reportProgress("decoding");
  const bitmap = await decode(file);
  let totalAttempts = 0;

  try {
    assertImageDimensionsWithinLimits(bitmap);

    const input: ImageInspection = {
      ...headerInspection,
      width: bitmap.width,
      height: bitmap.height,
    };
    let plan = calculateDrawPlan(bitmap.width, bitmap.height, requirements.resize);
    if (
      plan.canvasWidth > IMAGE_LIMITS.maxOutputSide ||
      plan.canvasHeight > IMAGE_LIMITS.maxOutputSide ||
      plan.canvasWidth * plan.canvasHeight > IMAGE_LIMITS.maxOutputPixels
    ) {
      throw new ImageProcessingError(
        "image_too_large",
        "The requested output exceeds the 8,192-pixel-side or 40-megapixel safety limit.",
      );
    }
    const initialOutputWidth = plan.canvasWidth;
    const initialOutputHeight = plan.canvasHeight;
    let encodedBlob: Blob | null = null;
    let encodedQuality: number | undefined;
    const backgroundColor =
      requirements.resize.mode === "exact"
        ? requirements.resize.backgroundColor
        : undefined;

    const maximumReductionAttempts = 24;
    for (let reduction = 0; reduction <= maximumReductionAttempts; reduction += 1) {
      reportProgress(reduction === 0 ? "rendering" : "optimizing");
      const canvas = await render(
        bitmap,
        plan,
        requirements.outputMime,
        backgroundColor,
      );
      const encoded = await encodeWithinLimit(
        canvas,
        requirements.outputMime,
        requirements.maxBytes,
      );
      totalAttempts += encoded.attempts;

      if (encoded.blob) {
        encodedBlob = encoded.blob;
        encodedQuality = encoded.quality;
        break;
      }

      if (requirements.resize.mode !== "max" || requirements.maxBytes === undefined) {
        break;
      }

      if (plan.canvasWidth === 1 && plan.canvasHeight === 1) {
        break;
      }

      const estimatedFactor =
        Math.sqrt(requirements.maxBytes / encoded.smallest.size) * 0.94;
      const factor =
        reduction === maximumReductionAttempts - 1
          ? 1 / Math.max(plan.canvasWidth, plan.canvasHeight)
          : Math.min(0.9, Math.max(0.1, estimatedFactor));
      const nextPlan = scaleDrawPlan(plan, factor);

      if (
        nextPlan.canvasWidth === plan.canvasWidth &&
        nextPlan.canvasHeight === plan.canvasHeight
      ) {
        break;
      }

      plan = nextPlan;
    }

    if (!encodedBlob) {
      const formatAdvice =
        requirements.outputMime === "image/png"
          ? " Try JPEG or WebP, raise the byte limit, or use maximum dimensions that may shrink."
          : " Raise the byte limit or use maximum dimensions that may shrink.";
      throw new ImageProcessingError(
        "constraint_unsatisfied",
        `The selected dimensions and file-size limit cannot all be satisfied.${formatAdvice}`,
      );
    }

    reportProgress("validating");
    const output = await inspectImage(encodedBlob);
    const decodedOutput = await decode(encodedBlob);

    try {
      output.width = decodedOutput.width;
      output.height = decodedOutput.height;
    } finally {
      decodedOutput.close();
    }

    if (
      output.mime !== requirements.outputMime ||
      !dimensionsPass(output, requirements, input)
    ) {
      throw new ImageProcessingError(
        "output_validation_failed",
        "The generated file did not pass its format and dimension checks.",
      );
    }

    if (requirements.maxBytes !== undefined && output.bytes > requirements.maxBytes) {
      throw new ImageProcessingError(
        "output_validation_failed",
        "The finished image was larger than your file-size limit.",
      );
    }

    if (output.hasApplicationMetadata) {
      throw new ImageProcessingError(
        "metadata_not_removed",
        "We could not remove all private photo details, so no download was created.",
      );
    }

    const checks = makeChecks(input, output, requirements);
    if (checks.some((check) => !check.afterPass)) {
      throw new ImageProcessingError(
        "output_validation_failed",
        "We could not make an image that matches all of your settings.",
      );
    }

    const warnings: string[] = [];
    if (input.hasApplicationMetadata) {
      warnings.push("Camera and editing details were removed.");
    }
    if (input.hasAlpha && requirements.outputMime === "image/jpeg") {
      warnings.push("Transparency was replaced with a solid background.");
    }
    if (
      requirements.resize.mode === "max" &&
      (output.width < initialOutputWidth || output.height < initialOutputHeight)
    ) {
      warnings.push("The image was made smaller to meet the file-size limit.");
    }

    const result: ProcessedImageResult = {
      blob: encodedBlob,
      filename: createOutputFilename(file.name, requirements.outputMime),
      mime: output.mime,
      width: output.width,
      height: output.height,
      bytes: output.bytes,
      input,
      output,
      checks,
      attempts: totalAttempts,
      metadataStripped: true,
      warnings,
    };

    if (encodedQuality !== undefined) {
      result.quality = encodedQuality;
    }

    return result;
  } finally {
    bitmap.close();
  }
}
