/*
 * SPDX-FileCopyrightText: 2026 m0p4rk
 * SPDX-License-Identifier: AGPL-3.0-only
 */

"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Route } from "next";

import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale } from "./locales";

/**
 * Records an explicit language choice and returns to the same page in it.
 *
 * Setting the cookie here rather than in the browser keeps the switcher a
 * plain form: it works before hydration and without client JavaScript, and the
 * stored choice then outranks the Accept-Language header on every later visit.
 */
export async function selectLocale(formData: FormData) {
  const requested = String(formData.get("locale") ?? "");
  const locale = isLocale(requested) ? requested : DEFAULT_LOCALE;

  const rawPath = String(formData.get("path") ?? "");
  // Only ever a same-site path: no scheme, no host, no protocol-relative form.
  const path = rawPath.startsWith("/") && !rawPath.startsWith("//") ? rawPath : "";

  const store = await cookies();
  store.set(LOCALE_COOKIE, locale, {
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
    sameSite: "lax",
  });

  redirect(`/${locale}${path}` as Route);
}
