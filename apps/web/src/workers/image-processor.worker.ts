/// <reference lib="webworker" />

/*
 * SPDX-FileCopyrightText: 2026 m0p4rk
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  createImagePreview,
  ImageProcessingError,
  processImageBatch,
  processImageFile,
  type ImageWorkerRequest,
  type ImageWorkerResponse,
} from "../lib/image-tools";

const worker = self as DedicatedWorkerGlobalScope;

function post(response: ImageWorkerResponse) {
  worker.postMessage(response);
}

post({ type: "ready" });

async function handleRequest(request: ImageWorkerRequest) {
  try {
    if (request.type === "preview") {
      const result = await createImagePreview(request.file);
      post({ type: "preview_success", requestId: request.requestId, result });
      return;
    }

    if (request.type === "process_batch") {
      const result = await processImageBatch(
        request.files,
        request.requirements,
        ({ fileIndex, fileCount, filename, stage }) => {
          post({
            type: "batch_progress",
            requestId: request.requestId,
            fileIndex,
            fileCount,
            filename,
            stage,
          });
        },
      );
      post({ type: "batch_success", requestId: request.requestId, result });
      return;
    }

    const result = await processImageFile(
      request.file,
      request.requirements,
      (stage) => {
        post({ type: "progress", requestId: request.requestId, stage });
      },
    );
    post({ type: "success", requestId: request.requestId, result });
  } catch (error) {
    const normalized =
      error instanceof ImageProcessingError
        ? error
        : new ImageProcessingError(
            "processing_failed",
            "The image could not be processed in this browser.",
          );

    if (request.type === "preview") {
      post({
        type: "preview_error",
        requestId: request.requestId,
        error: { code: normalized.code, message: normalized.message },
      });
      return;
    }

    post({
      type: "error",
      requestId: request.requestId,
      error: { code: normalized.code, message: normalized.message },
    });
  }
}

let requestQueue = Promise.resolve();

worker.onmessage = (event: MessageEvent<ImageWorkerRequest>) => {
  const request = event.data;
  requestQueue = requestQueue.then(() => handleRequest(request));
};

export {};
