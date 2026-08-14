/*
 * SPDX-FileCopyrightText: 2026 m0p4rk
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { SupportedImageMime } from "./types";

const EXTENSIONS: Record<SupportedImageMime, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export function createOutputFilename(name: string, mime: SupportedImageMime) {
  const withoutExtension = name.replace(/\.[^.]+$/, "");
  const sanitizedBase = withoutExtension
    .normalize("NFC")
    .replace(/[\u0000-\u001f\u007f/\\<>:"|?*]+/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[. -]+|[. -]+$/g, "");
  const safeBase = Array.from(sanitizedBase).slice(0, 72).join("");

  return `${safeBase || "image"}-ready.${EXTENSIONS[mime]}`;
}
