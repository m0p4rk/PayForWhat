/*
 * SPDX-FileCopyrightText: 2026 m0p4rk
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { Route } from "next";
import Link from "next/link";
import { ArrowRightIcon, ImageSquareIcon } from "@phosphor-icons/react/ssr";

import { getSourceUrl } from "@/lib/source";
import { firstTool } from "@/lib/tools/catalog";

export default function HomePage() {
  if (!firstTool) {
    return null;
  }

  const firstToolHref = `/en/tools/${firstTool.slug}` as Route;

  return (
    <main className="min-h-[100dvh] bg-[var(--canvas)] text-[var(--ink)]">
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-7xl flex-col px-6 py-6 sm:px-10 lg:px-16">
        <header className="flex items-center justify-between pb-5">
          <Link className="text-sm font-bold tracking-[-0.02em]" href="/">
            PayForWhat
          </Link>
          <a
            className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)] transition-colors hover:text-[var(--ink)]"
            href={getSourceUrl()}
          >
            GitHub
          </a>
        </header>

        <section className="border-y border-[var(--line)] py-7 sm:py-9">
          <h1 className="text-balance text-[clamp(1.55rem,3.35vw,3.1rem)] font-semibold leading-none tracking-[-0.05em] md:whitespace-nowrap">
            A five-minute task should not become a subscription.
          </h1>
        </section>

        <section className="flex-1 py-10 sm:py-14 lg:py-16">
          <div className="grid gap-6 md:grid-cols-2">
            <article className="flex max-w-2xl flex-col rounded-[2rem] border border-[var(--line)] bg-[var(--panel)] p-6 shadow-[0_20px_60px_rgba(27,24,19,0.07)] sm:p-8">
              <span className="grid size-14 place-items-center rounded-2xl bg-[#f1ded7] text-[var(--accent)]">
                <ImageSquareIcon aria-hidden="true" size={28} weight="regular" />
              </span>
              <h2 className="mt-8 text-3xl font-semibold tracking-[-0.04em]">
                {firstTool.name}
              </h2>
              <p className="mt-4 leading-7 text-[var(--muted)]">{firstTool.summary}</p>
              <Link
                className="group mt-10 inline-flex min-h-12 w-full items-center justify-between rounded-full bg-[var(--accent)] px-5 text-sm font-semibold text-white transition-[background-color,transform] duration-300 ease-out hover:-translate-y-0.5 hover:bg-[#963522] active:translate-y-px active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                href={firstToolHref}
              >
                Resize an image
                <ArrowRightIcon
                  aria-hidden="true"
                  className="transition-transform duration-300 ease-out group-hover:translate-x-1"
                  size={18}
                  weight="bold"
                />
              </Link>
            </article>
          </div>
        </section>

        <footer className="grid gap-4 border-t border-[var(--line)] py-6 text-sm text-[var(--muted)] sm:grid-cols-3">
          <p>No subscriptions.</p>
          <p className="sm:text-center">Open source.</p>
          <p className="sm:text-right">Your data stays yours.</p>
        </footer>
      </div>
    </main>
  );
}
