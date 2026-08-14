/*
 * SPDX-FileCopyrightText: 2026 m0p4rk
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { ImageProcessingError, type DrawPlan, type ResizeRequirement } from "./types";

function assertSourceDimensions(width: number, height: number) {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width < 1 || height < 1) {
    throw new ImageProcessingError(
      "invalid_image",
      "The image dimensions are invalid.",
    );
  }
}

export function calculateDrawPlan(
  sourceWidth: number,
  sourceHeight: number,
  resize: ResizeRequirement,
): DrawPlan {
  assertSourceDimensions(sourceWidth, sourceHeight);

  if (resize.mode === "keep") {
    return {
      canvasWidth: sourceWidth,
      canvasHeight: sourceHeight,
      sourceX: 0,
      sourceY: 0,
      sourceWidth,
      sourceHeight,
      destinationX: 0,
      destinationY: 0,
      destinationWidth: sourceWidth,
      destinationHeight: sourceHeight,
    };
  }

  if (resize.mode === "max") {
    const scaleLimit = Math.min(
      resize.maxWidth / sourceWidth,
      resize.maxHeight / sourceHeight,
    );
    const scale = resize.allowUpscale ? scaleLimit : Math.min(1, scaleLimit);
    const canvasWidth = Math.round(sourceWidth * scale);
    const canvasHeight = Math.round(sourceHeight * scale);

    if (canvasWidth < 1 || canvasHeight < 1) {
      throw new ImageProcessingError(
        "constraint_unsatisfied",
        "The image is too thin to preserve its aspect ratio inside those maximum dimensions.",
      );
    }

    return {
      canvasWidth,
      canvasHeight,
      sourceX: 0,
      sourceY: 0,
      sourceWidth,
      sourceHeight,
      destinationX: 0,
      destinationY: 0,
      destinationWidth: canvasWidth,
      destinationHeight: canvasHeight,
    };
  }

  if (resize.fit === "cover") {
    const sourceRatio = sourceWidth / sourceHeight;
    const targetRatio = resize.width / resize.height;
    let cropWidth = sourceWidth;
    let cropHeight = sourceHeight;

    if (sourceRatio > targetRatio) {
      cropWidth = sourceHeight * targetRatio;
    } else if (sourceRatio < targetRatio) {
      cropHeight = sourceWidth / targetRatio;
    }

    return {
      canvasWidth: resize.width,
      canvasHeight: resize.height,
      sourceX: (sourceWidth - cropWidth) / 2,
      sourceY: (sourceHeight - cropHeight) / 2,
      sourceWidth: cropWidth,
      sourceHeight: cropHeight,
      destinationX: 0,
      destinationY: 0,
      destinationWidth: resize.width,
      destinationHeight: resize.height,
    };
  }

  const scale = Math.min(resize.width / sourceWidth, resize.height / sourceHeight);
  const destinationWidth = Math.max(1, Math.round(sourceWidth * scale));
  const destinationHeight = Math.max(1, Math.round(sourceHeight * scale));

  return {
    canvasWidth: resize.width,
    canvasHeight: resize.height,
    sourceX: 0,
    sourceY: 0,
    sourceWidth,
    sourceHeight,
    destinationX: (resize.width - destinationWidth) / 2,
    destinationY: (resize.height - destinationHeight) / 2,
    destinationWidth,
    destinationHeight,
  };
}

export function scaleDrawPlan(plan: DrawPlan, factor: number): DrawPlan {
  if (!Number.isFinite(factor) || factor <= 0 || factor >= 1) {
    throw new ImageProcessingError(
      "processing_failed",
      "The output reduction factor is invalid.",
    );
  }

  const maximumWidth = Math.max(1, Math.floor(plan.canvasWidth * factor));
  const maximumHeight = Math.max(1, Math.floor(plan.canvasHeight * factor));
  const scale = Math.min(
    maximumWidth / plan.sourceWidth,
    maximumHeight / plan.sourceHeight,
  );
  const canvasWidth = Math.round(plan.sourceWidth * scale);
  const canvasHeight = Math.round(plan.sourceHeight * scale);

  if (canvasWidth < 1 || canvasHeight < 1) {
    throw new ImageProcessingError(
      "constraint_unsatisfied",
      "The byte limit would require dimensions that cannot preserve the original aspect ratio.",
    );
  }

  return {
    ...plan,
    canvasWidth,
    canvasHeight,
    destinationX: 0,
    destinationY: 0,
    destinationWidth: canvasWidth,
    destinationHeight: canvasHeight,
  };
}

export function calculatePreviewDrawPlan(
  sourceWidth: number,
  sourceHeight: number,
  maximumSide: number,
  maximumPixels: number,
): DrawPlan {
  assertSourceDimensions(sourceWidth, sourceHeight);

  if (
    !Number.isFinite(maximumSide) ||
    !Number.isFinite(maximumPixels) ||
    maximumSide < 1 ||
    maximumPixels < 1
  ) {
    throw new ImageProcessingError(
      "invalid_requirements",
      "The preview limits are invalid.",
    );
  }

  const scale = Math.min(
    1,
    maximumSide / sourceWidth,
    maximumSide / sourceHeight,
    Math.sqrt(maximumPixels / (sourceWidth * sourceHeight)),
  );
  const canvasWidth = Math.max(1, Math.floor(sourceWidth * scale));
  const canvasHeight = Math.max(1, Math.floor(sourceHeight * scale));

  return {
    canvasWidth,
    canvasHeight,
    sourceX: 0,
    sourceY: 0,
    sourceWidth,
    sourceHeight,
    destinationX: 0,
    destinationY: 0,
    destinationWidth: canvasWidth,
    destinationHeight: canvasHeight,
  };
}
