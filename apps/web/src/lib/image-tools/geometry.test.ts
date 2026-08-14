/*
 * SPDX-FileCopyrightText: 2026 m0p4rk
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, expect, it } from "vitest";

import { calculateDrawPlan, calculatePreviewDrawPlan, scaleDrawPlan } from "./geometry";

describe("image draw geometry", () => {
  it("keeps original dimensions without moving the source", () => {
    expect(calculateDrawPlan(1600, 900, { mode: "keep" })).toEqual({
      canvasWidth: 1600,
      canvasHeight: 900,
      sourceX: 0,
      sourceY: 0,
      sourceWidth: 1600,
      sourceHeight: 900,
      destinationX: 0,
      destinationY: 0,
      destinationWidth: 1600,
      destinationHeight: 900,
    });
  });

  it("fits within maximum dimensions without upscaling by default", () => {
    const reduced = calculateDrawPlan(1600, 900, {
      mode: "max",
      maxWidth: 800,
      maxHeight: 800,
    });
    const unchanged = calculateDrawPlan(400, 300, {
      mode: "max",
      maxWidth: 800,
      maxHeight: 800,
    });

    expect([reduced.canvasWidth, reduced.canvasHeight]).toEqual([800, 450]);
    expect([unchanged.canvasWidth, unchanged.canvasHeight]).toEqual([400, 300]);
  });

  it("enlarges only when explicitly allowed", () => {
    const plan = calculateDrawPlan(400, 300, {
      mode: "max",
      maxWidth: 800,
      maxHeight: 800,
      allowUpscale: true,
    });

    expect([plan.canvasWidth, plan.canvasHeight]).toEqual([800, 600]);
  });

  it("centers a cover crop for exact square dimensions", () => {
    const plan = calculateDrawPlan(1600, 900, {
      mode: "exact",
      width: 300,
      height: 300,
      fit: "cover",
    });

    expect(plan.canvasWidth).toBe(300);
    expect(plan.canvasHeight).toBe(300);
    expect(plan.sourceWidth).toBe(900);
    expect(plan.sourceHeight).toBe(900);
    expect(plan.sourceX).toBe(350);
    expect(plan.sourceY).toBe(0);
  });

  it("centers contained content without changing the target canvas", () => {
    const plan = calculateDrawPlan(1600, 900, {
      mode: "exact",
      width: 300,
      height: 300,
      fit: "contain",
    });

    expect([plan.canvasWidth, plan.canvasHeight]).toEqual([300, 300]);
    expect([plan.destinationWidth, plan.destinationHeight]).toEqual([300, 169]);
    expect(plan.destinationX).toBe(0);
    expect(plan.destinationY).toBe(65.5);
  });

  it("reduces a maximum-dimension plan while retaining its source", () => {
    const original = calculateDrawPlan(1600, 900, {
      mode: "max",
      maxWidth: 800,
      maxHeight: 800,
    });
    const reduced = scaleDrawPlan(original, 0.5);

    expect([reduced.canvasWidth, reduced.canvasHeight]).toEqual([400, 225]);
    expect([reduced.sourceWidth, reduced.sourceHeight]).toEqual([1600, 900]);
    expect([reduced.destinationWidth, reduced.destinationHeight]).toEqual([400, 225]);
  });

  it("rejects maximum dimensions that cannot retain an extreme aspect ratio", () => {
    expect(() =>
      calculateDrawPlan(8192, 1, {
        mode: "max",
        maxWidth: 1200,
        maxHeight: 1200,
      }),
    ).toThrow("too thin to preserve its aspect ratio");
  });

  it("bounds preview dimensions by side length and decoded pixels", () => {
    const landscape = calculatePreviewDrawPlan(8000, 4000, 720, 360_000);
    const portrait = calculatePreviewDrawPlan(1200, 2400, 720, 360_000);

    expect([landscape.canvasWidth, landscape.canvasHeight]).toEqual([720, 360]);
    expect(landscape.canvasWidth * landscape.canvasHeight).toBeLessThanOrEqual(360_000);
    expect([portrait.canvasWidth, portrait.canvasHeight]).toEqual([360, 720]);
    expect(portrait.canvasWidth * portrait.canvasHeight).toBeLessThanOrEqual(360_000);
  });
});
