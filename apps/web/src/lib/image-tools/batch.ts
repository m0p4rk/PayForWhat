/*
 * SPDX-FileCopyrightText: 2026 m0p4rk
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Zip, ZipPassThrough } from "fflate";

import { processImageFile } from "./process";
import {
  IMAGE_LIMITS,
  ImageProcessingError,
  type ImageRequirements,
  type ImageWorkerError,
  type ImageWorkerStage,
  type ProcessedBatchItem,
  type ProcessedImageBatchResult,
} from "./types";

export interface BatchProgress {
  fileIndex: number;
  fileCount: number;
  filename: string;
  stage: ImageWorkerStage;
}

type BatchProgressReporter = (progress: BatchProgress) => void;

function normalizeError(error: unknown): ImageWorkerError {
  if (error instanceof ImageProcessingError) {
    return { code: error.code, message: error.message };
  }

  return {
    code: "processing_failed",
    message: "The image could not be processed in this browser.",
  };
}

export function createUniqueArchiveFilename(
  filename: string,
  usedFilenames: ReadonlySet<string>,
) {
  if (!usedFilenames.has(filename)) return filename;

  const extensionIndex = filename.lastIndexOf(".");
  const base = extensionIndex > 0 ? filename.slice(0, extensionIndex) : filename;
  const extension = extensionIndex > 0 ? filename.slice(extensionIndex) : "";
  let suffix = 2;
  let candidate = `${base}-${suffix}${extension}`;

  while (usedFilenames.has(candidate)) {
    suffix += 1;
    candidate = `${base}-${suffix}${extension}`;
  }

  return candidate;
}

export class LocalZipArchive {
  readonly #archive: Zip;
  readonly #chunks: Uint8Array<ArrayBuffer>[] = [];
  readonly #completed: Promise<Blob>;
  #resolveArchive: (blob: Blob) => void = () => undefined;
  #rejectArchive: (error: Error) => void = () => undefined;
  #settled = false;

  constructor() {
    this.#completed = new Promise<Blob>((resolve, reject) => {
      this.#resolveArchive = resolve;
      this.#rejectArchive = reject;
    });
    this.#archive = new Zip((error, chunk, final) => {
      if (this.#settled) return;
      if (error) {
        this.#settled = true;
        this.#rejectArchive(error);
        return;
      }

      this.#chunks.push(chunk);
      if (final) {
        this.#settled = true;
        this.#resolveArchive(new Blob(this.#chunks, { type: "application/zip" }));
      }
    });
  }

  async add(filename: string, blob: Blob) {
    const entry = new ZipPassThrough(filename);
    this.#archive.add(entry);
    entry.push(new Uint8Array(await blob.arrayBuffer()), true);
  }

  async finish() {
    this.#archive.end();
    return await this.#completed;
  }

  terminate() {
    this.#archive.terminate();
  }
}

export async function processImageBatch(
  files: File[],
  requirements: ImageRequirements,
  reportProgress: BatchProgressReporter = () => undefined,
): Promise<ProcessedImageBatchResult> {
  if (files.length < 2 || files.length > IMAGE_LIMITS.maxBatchFiles) {
    throw new ImageProcessingError(
      "invalid_requirements",
      `Choose between 2 and ${IMAGE_LIMITS.maxBatchFiles} images for a ZIP download.`,
    );
  }

  const inputBytes = files.reduce((total, file) => total + file.size, 0);
  if (inputBytes > IMAGE_LIMITS.maxBatchInputBytes) {
    throw new ImageProcessingError(
      "batch_too_large",
      "The selected images exceed the 200 MB batch safety limit.",
    );
  }

  const archive = new LocalZipArchive();
  const items: ProcessedBatchItem[] = [];
  const failures: ProcessedImageBatchResult["failures"] = [];
  const usedFilenames = new Set<string>();
  let outputBytes = 0;

  try {
    for (const [index, file] of files.entries()) {
      try {
        const processed = await processImageFile(file, requirements, (stage) => {
          reportProgress({
            fileIndex: index,
            fileCount: files.length,
            filename: file.name,
            stage,
          });
        });

        outputBytes += processed.bytes;
        if (outputBytes > IMAGE_LIMITS.maxBatchOutputBytes) {
          throw new ImageProcessingError(
            "batch_too_large",
            "The finished images exceed the 100 MB ZIP safety limit.",
          );
        }

        const outputFilename = createUniqueArchiveFilename(
          processed.filename,
          usedFilenames,
        );
        usedFilenames.add(outputFilename);

        await archive.add(outputFilename, processed.blob);

        items.push({
          inputFilename: file.name,
          outputFilename,
          mime: processed.mime,
          width: processed.width,
          height: processed.height,
          bytes: processed.bytes,
          warnings: processed.warnings,
        });
      } catch (error) {
        const normalized = normalizeError(error);
        if (normalized.code === "batch_too_large") throw error;
        failures.push({ inputFilename: file.name, error: normalized });
      }
    }

    if (items.length === 0) {
      throw new ImageProcessingError(
        "processing_failed",
        "None of the selected images could be resized with these settings.",
      );
    }

    const blob = await archive.finish();
    if (blob.size > IMAGE_LIMITS.maxBatchOutputBytes) {
      throw new ImageProcessingError(
        "batch_too_large",
        "The finished ZIP exceeds the 100 MB safety limit.",
      );
    }

    return {
      blob,
      filename: "resized-images.zip",
      bytes: blob.size,
      succeeded: items.length,
      failed: failures.length,
      items,
      failures,
    };
  } catch (error) {
    archive.terminate();
    throw error;
  }
}
