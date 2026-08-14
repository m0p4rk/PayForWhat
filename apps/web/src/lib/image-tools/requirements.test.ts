/*
 * SPDX-FileCopyrightText: 2026 m0p4rk
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, expect, it } from "vitest";

import {
  aspectRatioPass,
  assertImageDimensionsWithinLimits,
  dimensionsPass,
  normalizeImageRequirements,
} from "./requirements";
import { ImageProcessingError, type ImageInspection } from "./types";

const inspection: ImageInspection = {
  mime: "image/jpeg",
  width: 1600,
  height: 900,
  bytes: 100_000,
  hasAlpha: false,
  isAnimated: false,
  hasApplicationMetadata: false,
};

describe("image requirements", () => {
  it("normalizes a valid maximum-dimension requirement without mutating it", () => {
    const requirement = {
      outputMime: "image/webp" as const,
      resize: { mode: "max" as const, maxWidth: 1200, maxHeight: 1200 },
      maxBytes: 500_000,
    };

    const normalized = normalizeImageRequirements(requirement);

    expect(normalized).toEqual(requirement);
    expect(normalized).not.toBe(requirement);
  });

  it.each([
    [0, 100],
    [100, 8193],
    [100.5, 100],
  ])("rejects invalid exact dimensions (%s × %s)", (width, height) => {
    expect(() =>
      normalizeImageRequirements({
        outputMime: "image/png",
        resize: { mode: "exact", width, height, fit: "cover" },
      }),
    ).toThrow(ImageProcessingError);
  });

  it("rejects malformed background colors and byte ceilings below 1 KB", () => {
    expect(() =>
      normalizeImageRequirements({
        outputMime: "image/jpeg",
        resize: {
          mode: "exact",
          width: 300,
          height: 300,
          fit: "contain",
          backgroundColor: "white",
        },
      }),
    ).toThrow("six-digit hexadecimal");

    expect(() =>
      normalizeImageRequirements({
        outputMime: "image/jpeg",
        resize: { mode: "keep" },
        maxBytes: 999,
      }),
    ).toThrow("between 1000");
  });

  it("rejects exact outputs above the decoded-pixel safety limit", () => {
    expect(() =>
      normalizeImageRequirements({
        outputMime: "image/png",
        resize: { mode: "exact", width: 8192, height: 8192, fit: "cover" },
      }),
    ).toThrow("40-megapixel");
  });

  it("rejects an extreme input side before browser decoding", () => {
    expect(() =>
      assertImageDimensionsWithinLimits({ width: 1, height: 40_000_000 }),
    ).toThrow("8,192-pixel-side");
    expect(() =>
      assertImageDimensionsWithinLimits({ width: 8000, height: 5000 }),
    ).not.toThrow();
  });

  it("evaluates keep, maximum, and exact dimension rules", () => {
    expect(
      dimensionsPass(
        inspection,
        {
          outputMime: "image/jpeg",
          resize: { mode: "keep" },
        },
        inspection,
      ),
    ).toBe(true);
    expect(
      dimensionsPass(
        inspection,
        {
          outputMime: "image/jpeg",
          resize: { mode: "max", maxWidth: 1600, maxHeight: 900 },
        },
        inspection,
      ),
    ).toBe(true);
    expect(
      dimensionsPass(
        inspection,
        {
          outputMime: "image/jpeg",
          resize: { mode: "max", maxWidth: 1200, maxHeight: 1200 },
        },
        inspection,
      ),
    ).toBe(false);
    expect(
      dimensionsPass(
        inspection,
        {
          outputMime: "image/jpeg",
          resize: { mode: "exact", width: 1600, height: 900, fit: "cover" },
        },
        inspection,
      ),
    ).toBe(true);
  });

  it("rejects a keep-size result whose decoded dimensions changed", () => {
    expect(
      dimensionsPass(
        { width: 1, height: 1 },
        { outputMime: "image/png", resize: { mode: "keep" } },
        inspection,
      ),
    ).toBe(false);
  });

  it("accepts only maximum-mode rasters compatible with shared pixel rounding", () => {
    expect(
      aspectRatioPass({ width: 789, height: 658 }, { width: 25, height: 21 }),
    ).toBe(true);
    expect(
      aspectRatioPass({ width: 8192, height: 1 }, { width: 1200, height: 1 }),
    ).toBe(false);
    expect(
      dimensionsPass(
        { width: 1200, height: 1 },
        {
          outputMime: "image/png",
          resize: { mode: "max", maxWidth: 1200, maxHeight: 1200 },
        },
        { width: 8192, height: 1 },
      ),
    ).toBe(false);
  });
});
