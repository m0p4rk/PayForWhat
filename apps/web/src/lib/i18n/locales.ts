/*
 * SPDX-FileCopyrightText: 2026 m0p4rk
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export const LOCALES = ["en", "ko"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

/** Stores an explicit language choice so it outranks the browser header. */
export const LOCALE_COOKIE = "payforwhat-locale";

export const LOCALE_LABELS: Readonly<Record<Locale, string>> = {
  en: "English",
  ko: "한국어",
};

/** BCP 47 tags for the `lang` attribute and hreflang annotations. */
export const LOCALE_HTML_LANG: Readonly<Record<Locale, string>> = {
  en: "en",
  ko: "ko",
};

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/**
 * Picks the best supported locale for an Accept-Language header.
 *
 * Parses quality values so `ko;q=0.9, en;q=0.8` prefers Korean, and matches on
 * the primary subtag so `ko-KR` and `en-GB` still resolve. Falls back to the
 * default locale when nothing matches or the header is missing.
 */
export function matchLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return DEFAULT_LOCALE;

  const ranked = acceptLanguage
    .split(",")
    .map((part) => {
      const [tag, ...parameters] = part.trim().split(";");
      const quality = parameters
        .map((parameter) => parameter.trim())
        .find((parameter) => parameter.startsWith("q="));
      const parsedQuality = quality ? Number.parseFloat(quality.slice(2)) : 1;

      return {
        quality: Number.isFinite(parsedQuality) ? parsedQuality : 0,
        tag: (tag ?? "").trim().toLowerCase(),
      };
    })
    .filter((entry) => entry.tag.length > 0 && entry.quality > 0)
    .sort((a, b) => b.quality - a.quality);

  for (const entry of ranked) {
    if (entry.tag === "*") return DEFAULT_LOCALE;
    const primary = entry.tag.split("-")[0] ?? "";
    if (isLocale(primary)) return primary;
  }

  return DEFAULT_LOCALE;
}
