/*
 * SPDX-FileCopyrightText: 2026 m0p4rk
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, expect, it } from "vitest";

import { toolCatalog, toolManifestSchema } from "./catalog";

describe("tool catalog", () => {
  it("contains only valid manifests", () => {
    expect(() =>
      toolCatalog.forEach((tool) => toolManifestSchema.parse(tool)),
    ).not.toThrow();
  });

  it("uses unique identifiers and slugs", () => {
    const ids = toolCatalog.map((tool) => tool.id);
    const slugs = toolCatalog.map((tool) => tool.slug);

    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});
