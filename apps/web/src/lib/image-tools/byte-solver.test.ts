/*
 * SPDX-FileCopyrightText: 2026 m0p4rk
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, expect, it } from "vitest";

import { findBestQuality } from "./byte-solver";

describe("quality search", () => {
  it("returns the maximum quality immediately when it fits", async () => {
    const result = await findBestQuality(
      async (quality) => ({ size: quality * 1000 }),
      950,
    );

    expect(result.match?.quality).toBe(0.92);
    expect(result.attempts).toBe(1);
  });

  it("finds the highest tested quality within the byte ceiling", async () => {
    const result = await findBestQuality(
      async (quality) => ({ size: Math.round(quality * 1000) }),
      500,
      { minimum: 0.1, maximum: 0.9, iterations: 8 },
    );

    expect(result.match).not.toBeNull();
    expect(result.match!.value.size).toBeLessThanOrEqual(500);
    expect(result.match!.quality).toBeGreaterThan(0.49);
    expect(result.match!.quality).toBeLessThanOrEqual(0.5);
  });

  it("reports no match and the smallest observed value when the limit is impossible", async () => {
    const result = await findBestQuality(
      async (quality) => ({ size: quality > 0.4 ? 900 : 700 }),
      600,
      { minimum: 0.1, maximum: 0.9, iterations: 4 },
    );

    expect(result.match).toBeNull();
    expect(result.smallest.value.size).toBe(700);
    expect(result.attempts).toBe(2);
  });

  it("selects by measured quality even when encoded sizes plateau", async () => {
    const result = await findBestQuality(
      async (quality) => ({ size: quality < 0.75 ? 480 : 700 }),
      500,
      { minimum: 0.1, maximum: 0.9, iterations: 8 },
    );

    expect(result.match).not.toBeNull();
    expect(result.match!.quality).toBeGreaterThan(0.7);
    expect(result.match!.value.size).toBe(480);
  });
});
