/*
 * SPDX-FileCopyrightText: 2026 m0p4rk
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { Metadata } from "next";
import Link from "next/link";
import { LockSimpleIcon } from "@phosphor-icons/react/ssr";

import { ImageResizer } from "@/components/image-tools/image-resizer";
import { getSourceUrl } from "@/lib/source";

export const metadata: Metadata = {
  title: "Image Resizer",
  description:
    "Resize, compress, or convert an image to meet upload limits. Your image stays on your device.",
  robots: {
    follow: false,
    index: false,
  },
};

export default function ImageResizerPage() {
  return (
    <main className="min-h-[100dvh] bg-[var(--canvas)] text-[var(--ink)]">
      <div className="mx-auto w-full max-w-7xl px-5 py-5 sm:px-10 lg:px-16">
        <header className="flex items-center justify-between border-b border-[var(--line)] pb-5">
          <Link className="text-sm font-bold tracking-[-0.02em]" href="/">
            PayForWhat
          </Link>
          <a
            className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--muted)] transition-colors hover:text-[var(--ink)]"
            href={getSourceUrl()}
          >
            GitHub
          </a>
        </header>

        <section className="py-9 sm:py-12">
          <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">
              Image Resizer
            </h1>
            <p className="inline-flex items-center gap-2 text-sm text-[var(--muted)]">
              <LockSimpleIcon aria-hidden="true" size={17} weight="regular" />
              Stays on your device
            </p>
          </div>

          <ImageResizer />
        </section>
      </div>
    </main>
  );
}
