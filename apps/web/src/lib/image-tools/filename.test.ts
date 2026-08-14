/*
 * SPDX-FileCopyrightText: 2026 m0p4rk
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, expect, it } from "vitest";

import { createOutputFilename } from "./filename";

describe("output filename", () => {
  it("replaces unsafe path and platform characters", () => {
    expect(createOutputFilename(" travel/photo:final?.PNG", "image/jpeg")).toBe(
      "travel-photo-final-ready.jpg",
    );
  });

  it("preserves normalized Unicode names", () => {
    expect(createOutputFilename("résumé.png", "image/webp")).toBe("résumé-ready.webp");
  });

  it("falls back when the original basename is empty", () => {
    expect(createOutputFilename("...", "image/png")).toBe("image-ready.png");
  });
});
