/*
 * SPDX-FileCopyrightText: 2026 m0p4rk
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export const SUPPORTED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type SupportedImageMime = (typeof SUPPORTED_IMAGE_MIME_TYPES)[number];

export const IMAGE_LIMITS = {
  maxInputBytes: 25_000_000,
  maxInputPixels: 40_000_000,
  maxInputSide: 8192,
  maxBatchFiles: 20,
  maxBatchInputBytes: 200_000_000,
  maxBatchOutputBytes: 100_000_000,
  maxOutputPixels: 40_000_000,
  maxOutputSide: 8192,
  minOutputSide: 1,
  minTargetBytes: 1000,
  previewMaxPixels: 360_000,
  previewMaxSide: 720,
} as const;

export type ResizeRequirement =
  | { mode: "keep" }
  | {
      mode: "max";
      maxWidth: number;
      maxHeight: number;
      allowUpscale?: boolean;
    }
  | {
      mode: "exact";
      width: number;
      height: number;
      fit: "cover" | "contain";
      backgroundColor?: string;
    };

export interface ImageRequirements {
  outputMime: SupportedImageMime;
  resize: ResizeRequirement;
  maxBytes?: number;
}

export interface ImageInspection {
  mime: SupportedImageMime;
  width: number;
  height: number;
  bytes: number;
  hasAlpha: boolean;
  isAnimated: boolean;
  hasApplicationMetadata: boolean;
}

export interface DrawPlan {
  canvasWidth: number;
  canvasHeight: number;
  sourceX: number;
  sourceY: number;
  sourceWidth: number;
  sourceHeight: number;
  destinationX: number;
  destinationY: number;
  destinationWidth: number;
  destinationHeight: number;
}

export type ConstraintKey = "format" | "dimensions" | "bytes" | "metadata";

export interface ConstraintCheck {
  key: ConstraintKey;
  label: string;
  expected: string;
  before: string;
  beforePass: boolean;
  after: string;
  afterPass: boolean;
}

export interface ProcessedImageResult {
  blob: Blob;
  filename: string;
  mime: SupportedImageMime;
  width: number;
  height: number;
  bytes: number;
  input: ImageInspection;
  output: ImageInspection;
  checks: ConstraintCheck[];
  attempts: number;
  metadataStripped: true;
  warnings: string[];
  quality?: number;
}

export interface ImagePreviewResult {
  blob: Blob;
  mime: SupportedImageMime;
  width: number;
  height: number;
}

export interface ProcessedBatchItem {
  inputFilename: string;
  outputFilename: string;
  mime: SupportedImageMime;
  width: number;
  height: number;
  bytes: number;
  warnings: string[];
}

export interface ProcessedBatchFailure {
  inputFilename: string;
  error: ImageWorkerError;
}

export interface ProcessedImageBatchResult {
  blob: Blob;
  filename: string;
  bytes: number;
  succeeded: number;
  failed: number;
  items: ProcessedBatchItem[];
  failures: ProcessedBatchFailure[];
}

export type ImageWorkerStage =
  "inspecting" | "decoding" | "rendering" | "optimizing" | "validating";

export interface ImageWorkerError {
  code: ImageProcessingErrorCode;
  message: string;
}

export type ImageWorkerRequest =
  | {
      type: "preview";
      requestId: string;
      file: File;
    }
  | {
      type: "process";
      requestId: string;
      file: File;
      requirements: ImageRequirements;
    }
  | {
      type: "process_batch";
      requestId: string;
      files: File[];
      requirements: ImageRequirements;
    };

export type ImageWorkerResponse =
  | { type: "ready" }
  | {
      type: "preview_success";
      requestId: string;
      result: ImagePreviewResult;
    }
  | {
      type: "preview_error";
      requestId: string;
      error: ImageWorkerError;
    }
  | {
      type: "progress";
      requestId: string;
      stage: ImageWorkerStage;
    }
  | {
      type: "batch_progress";
      requestId: string;
      fileIndex: number;
      fileCount: number;
      filename: string;
      stage: ImageWorkerStage;
    }
  | {
      type: "success";
      requestId: string;
      result: ProcessedImageResult;
    }
  | {
      type: "batch_success";
      requestId: string;
      result: ProcessedImageBatchResult;
    }
  | {
      type: "error";
      requestId: string;
      error: ImageWorkerError;
    };

export type ImageProcessingErrorCode =
  | "invalid_requirements"
  | "file_too_large"
  | "unsupported_format"
  | "animated_image"
  | "invalid_image"
  | "image_too_large"
  | "unsupported_browser"
  | "unsupported_encoder"
  | "constraint_unsatisfied"
  | "metadata_not_removed"
  | "output_validation_failed"
  | "batch_too_large"
  | "processing_failed";

export class ImageProcessingError extends Error {
  readonly code: ImageProcessingErrorCode;

  constructor(code: ImageProcessingErrorCode, message: string) {
    super(message);
    this.name = "ImageProcessingError";
    this.code = code;
  }
}
