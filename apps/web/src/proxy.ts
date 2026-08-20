/*
 * SPDX-FileCopyrightText: 2026 m0p4rk
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { NextResponse, type NextRequest } from "next/server";

import { LOCALES, isLocale, matchLocale } from "@/lib/i18n/locales";

/** Remembers an explicit choice from the language switcher for a year. */
const LOCALE_COOKIE = "payforwhat-locale";

/**
 * Sends a request without a locale prefix to the visitor's own language.
 *
 * An explicit choice, stored by the switcher, wins over the browser header so
 * that picking a language sticks. Requests that already name a locale pass
 * through untouched.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasLocale = LOCALES.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
  if (hasLocale) return;

  const chosen = request.cookies.get(LOCALE_COOKIE)?.value;
  const locale =
    chosen && isLocale(chosen)
      ? chosen
      : matchLocale(request.headers.get("accept-language"));

  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Everything except Next internals, the metadata routes, and files with an
  // extension — those must never be redirected into a locale path.
  matcher: ["/((?!_next|favicon\\.ico|robots\\.txt|sitemap\\.xml|.*\\..*).*)"],
};
