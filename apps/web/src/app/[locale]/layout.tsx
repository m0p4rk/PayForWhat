/*
 * SPDX-FileCopyrightText: 2026 m0p4rk
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";

import { LOCALES, LOCALE_HTML_LANG, isLocale } from "@/lib/i18n/locales";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "PayForWhat",
    template: "%s | PayForWhat",
  },
  description:
    "Focused tools for one-time digital tasks, free from subscriptions and built in public.",
};

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{ children: ReactNode; params: Promise<{ locale: string }> }>) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return (
    <html
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      lang={LOCALE_HTML_LANG[locale]}
    >
      <body>{children}</body>
    </html>
  );
}
