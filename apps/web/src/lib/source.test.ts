/*
 * SPDX-FileCopyrightText: 2026 m0p4rk
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, expect, it } from "vitest";

import { getSourceUrl } from "./source";

describe("source URL", () => {
  it("pins the hosted source link to the deployed revision", () => {
    const commitSha = "a".repeat(40);

    expect(getSourceUrl({ VERCEL_GIT_COMMIT_SHA: commitSha })).toBe(
      `https://github.com/m0p4rk/PayForWhat/tree/${commitSha}`,
    );
  });

  it("allows an explicit revision for non-Git production deploys", () => {
    const commitSha = "b".repeat(40);

    expect(
      getSourceUrl({ SOURCE_COMMIT_SHA: commitSha, VERCEL_ENV: "production" }),
    ).toContain(commitSha);
  });

  it("rejects an unpinned production source link", () => {
    expect(() => getSourceUrl({ VERCEL_ENV: "production" })).toThrow(
      "A production build requires",
    );
  });

  it("rejects conflicting explicit and Vercel revisions", () => {
    expect(() =>
      getSourceUrl({
        SOURCE_COMMIT_SHA: "a".repeat(40),
        VERCEL_GIT_COMMIT_SHA: "b".repeat(40),
      }),
    ).toThrow("does not match");
  });

  it("rejects abbreviated commit identifiers", () => {
    expect(() => getSourceUrl({ SOURCE_COMMIT_SHA: "abc123" })).toThrow(
      "complete 40-character SHAs",
    );
  });

  it("uses the repository root during local development", () => {
    expect(getSourceUrl({})).toBe("https://github.com/m0p4rk/PayForWhat");
  });
});
