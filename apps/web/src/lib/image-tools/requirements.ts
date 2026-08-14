/*
 * SPDX-FileCopyrightText: 2026 m0p4rk
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  IMAGE_LIMITS,
  ImageProcessingError,
  SUPPORTED_IMAGE_MIME_TYPES,
  type ImageInspection,
  type ImageRequirements,
} from "./types";

function requireInteger(value: number, label: string, maximum: number) {
  if (
    !Number.isInteger(value) ||
    value < IMAGE_LIMITS.minOutputSide ||
    value > maximum
  ) {
    throw new ImageProcessingError(
      "invalid_requirements",
      `${label} must be a whole number between ${IMAGE_LIMITS.minOutputSide} and ${maximum}.`,
    );
  }
}

export function normalizeImageRequirements(
  requirements: ImageRequirements,
): ImageRequirements {
  if (!SUPPORTED_IMAGE_MIME_TYPES.includes(requirements.outputMime)) {
    throw new ImageProcessingError(
      "invalid_requirements",
      "Choose JPEG, PNG, or WebP as the output format.",
    );
  }

  const { resize } = requirements;

  if (resize.mode === "max") {
    requireInteger(resize.maxWidth, "Maximum width", IMAGE_LIMITS.maxOutputSide);
    requireInteger(resize.maxHeight, "Maximum height", IMAGE_LIMITS.maxOutputSide);
  }

  if (resize.mode === "exact") {
    requireInteger(resize.width, "Width", IMAGE_LIMITS.maxOutputSide);
    requireInteger(resize.height, "Height", IMAGE_LIMITS.maxOutputSide);

    if (resize.width * resize.height > IMAGE_LIMITS.maxOutputPixels) {
      throw new ImageProcessingError(
        "invalid_requirements",
        "The exact output dimensions exceed the 40-megapixel safety limit.",
      );
    }

    if (
      resize.backgroundColor !== undefined &&
      !/^#[0-9a-f]{6}$/i.test(resize.backgroundColor)
    ) {
      throw new ImageProcessingError(
        "invalid_requirements",
        "The background color must be a six-digit hexadecimal color.",
      );
    }
  }

  if (requirements.maxBytes !== undefined) {
    if (
      !Number.isInteger(requirements.maxBytes) ||
      requirements.maxBytes < IMAGE_LIMITS.minTargetBytes ||
      requirements.maxBytes > IMAGE_LIMITS.maxInputBytes
    ) {
      throw new ImageProcessingError(
        "invalid_requirements",
        `The maximum file size must be between ${IMAGE_LIMITS.minTargetBytes} and ${IMAGE_LIMITS.maxInputBytes} bytes.`,
      );
    }
  }

  return structuredClone(requirements);
}

export function assertImageDimensionsWithinLimits(
  inspection: Pick<ImageInspection, "width" | "height">,
) {
  if (
    inspection.width > IMAGE_LIMITS.maxInputSide ||
    inspection.height > IMAGE_LIMITS.maxInputSide ||
    inspection.width * inspection.height > IMAGE_LIMITS.maxInputPixels
  ) {
    throw new ImageProcessingError(
      "image_too_large",
      "The image exceeds the 8,192-pixel-side or 40-megapixel safety limit.",
    );
  }
}

export function dimensionsPass(
  inspection: Pick<ImageInspection, "width" | "height">,
  requirements: ImageRequirements,
  input: Pick<ImageInspection, "width" | "height">,
) {
  const { resize } = requirements;

  if (resize.mode === "keep") {
    return inspection.width === input.width && inspection.height === input.height;
  }

  if (resize.mode === "max") {
    return (
      inspection.width <= resize.maxWidth &&
      inspection.height <= resize.maxHeight &&
      aspectRatioPass(input, inspection)
    );
  }

  return inspection.width === resize.width && inspection.height === resize.height;
}

export function aspectRatioPass(
  input: Pick<ImageInspection, "width" | "height">,
  output: Pick<ImageInspection, "width" | "height">,
) {
  const lowerScale = Math.max(
    (output.width - 0.5) / input.width,
    (output.height - 0.5) / input.height,
  );
  const upperScale = Math.min(
    (output.width + 0.5) / input.width,
    (output.height + 0.5) / input.height,
  );

  return Math.max(0, lowerScale) < upperScale;
}

export function dimensionsExpectation(
  input: Pick<ImageInspection, "width" | "height">,
  requirements: ImageRequirements,
) {
  const { resize } = requirements;

  if (resize.mode === "keep") {
    return `${input.width} × ${input.height} px`;
  }

  if (resize.mode === "max") {
    return `At most ${resize.maxWidth} × ${resize.maxHeight} px`;
  }

  return `Exactly ${resize.width} × ${resize.height} px`;
}
