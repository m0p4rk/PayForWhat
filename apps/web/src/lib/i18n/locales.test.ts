/*
 * SPDX-FileCopyrightText: 2026 m0p4rk
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, expect, it } from "vitest";

import { DEFAULT_LOCALE, isLocale, matchLocale } from "./locales";

describe("locale matching", () => {
  it("falls back to the default when the header is missing or empty", () => {
    expect(matchLocale(null)).toBe(DEFAULT_LOCALE);
    expect(matchLocale("")).toBe(DEFAULT_LOCALE);
  });

  it("matches a plain primary tag", () => {
    expect(matchLocale("ko")).toBe("ko");
    expect(matchLocale("en")).toBe("en");
  });

  it("matches a regional tag by its primary subtag", () => {
    expect(matchLocale("ko-KR")).toBe("ko");
    expect(matchLocale("en-GB,en;q=0.9")).toBe("en");
  });

  it("respects quality ordering rather than header order", () => {
    expect(matchLocale("en;q=0.4,ko;q=0.9")).toBe("ko");
    expect(matchLocale("ko;q=0.3,en;q=0.8")).toBe("en");
  });

  it("skips unsupported languages and takes the first supported one", () => {
    expect(matchLocale("fr-FR,fr;q=0.9,ko;q=0.7")).toBe("ko");
    expect(matchLocale("ja,zh-CN")).toBe(DEFAULT_LOCALE);
  });

  it("ignores zero-quality entries", () => {
    expect(matchLocale("ko;q=0,en;q=0.5")).toBe("en");
  });

  it("treats a wildcard as no preference", () => {
    expect(matchLocale("*")).toBe(DEFAULT_LOCALE);
  });

  it("is case-insensitive", () => {
    expect(matchLocale("KO-kr")).toBe("ko");
  });

  it("recognises only supported locales", () => {
    expect(isLocale("ko")).toBe(true);
    expect(isLocale("en")).toBe(true);
    expect(isLocale("ja")).toBe(false);
  });
});
