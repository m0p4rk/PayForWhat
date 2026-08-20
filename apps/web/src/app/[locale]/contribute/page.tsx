/*
 * SPDX-FileCopyrightText: 2026 m0p4rk
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { Metadata } from "next";
import {
  GitPullRequestIcon,
  LockSimpleIcon,
  SignatureIcon,
  WrenchIcon,
} from "@phosphor-icons/react/ssr";

import { SiteHeader } from "@/components/site/site-header";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n/locales";
import { getMessages } from "@/lib/i18n/messages";
import { getSourceUrl } from "@/lib/source";

export const metadata: Metadata = {
  title: "Contribute",
  description:
    "Build a browser-local tool, keep your name on it, and let PayForWhat host it at no cost to you.",
  robots: { follow: false, index: false },
};

const repository = "https://github.com/m0p4rk/PayForWhat";

const issues = [
  { number: 1, title: "Show who built each tool on its page" },
  { number: 2, title: "Write down the browser support floor" },
  { number: 3, title: "Add a copy-to-clipboard control to the resized result" },
  { number: 4, title: "Show how much smaller the file got" },
];

export default async function ContributePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const messages = getMessages(locale).contribute;
  const icons = [LockSimpleIcon, SignatureIcon, GitPullRequestIcon];

  return (
    <main className="min-h-[100dvh] bg-[var(--canvas)] text-[var(--ink)]">
      <div className="mx-auto w-full max-w-3xl px-5 py-5 sm:px-10">
        <SiteHeader bordered locale={locale} path="/contribute" />

        <section className="py-9 sm:py-12">
          <h1 className="text-balance text-[clamp(1.6rem,4vw,2.6rem)] font-semibold leading-tight tracking-[-0.04em]">
            {messages.title}
          </h1>
          <p className="mt-5 max-w-[62ch] leading-7 text-[var(--muted)]">
            {messages.intro}
          </p>
        </section>

        <section className="border-t border-[var(--line)] py-9">
          <h2 className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
            {messages.whatYouGet}
          </h2>
          <ul className="mt-6 grid gap-6 sm:grid-cols-3">
            {messages.offers.map((offer, index) => {
              const Icon = icons[index] ?? LockSimpleIcon;
              return (
                <li key={offer.title}>
                  <Icon
                    aria-hidden="true"
                    className="text-[var(--accent)]"
                    size={22}
                    weight="regular"
                  />
                  <h3 className="mt-3 text-sm font-semibold">{offer.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                    {offer.body}
                  </p>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="border-t border-[var(--line)] py-9">
          <h2 className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
            {messages.howItGoes}
          </h2>
          <ol className="mt-6 flex flex-col gap-6">
            {messages.steps.map((step, index) => (
              <li className="flex gap-4" key={step.title}>
                <span
                  aria-hidden="true"
                  className="mt-0.5 font-mono text-sm font-semibold text-[var(--accent)] tabular-nums"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="text-sm font-semibold">{step.title}</h3>
                  <p className="mt-1.5 max-w-[58ch] text-sm leading-6 text-[var(--muted)]">
                    {step.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-7 text-sm leading-6 text-[var(--muted)]">
            {messages.guideLead}{" "}
            <a
              className="font-medium text-[var(--ink)] underline underline-offset-4"
              href={`${repository}/blob/main/docs/contributing/add-a-tool.md`}
              rel="noreferrer"
              target="_blank"
            >
              docs/contributing/add-a-tool.md
            </a>
            {messages.guideTail}
          </p>
        </section>

        <section className="border-t border-[var(--line)] py-9">
          <h2 className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
            {messages.smallerWaysIn}
          </h2>
          <p className="mt-5 max-w-[62ch] text-sm leading-6 text-[var(--muted)]">
            {messages.smallerWaysInBody}
          </p>
          <ul className="mt-5 flex flex-col divide-y divide-[var(--line)] border-y border-[var(--line)]">
            {issues.map((issue) => (
              <li key={issue.number}>
                <a
                  className="flex items-baseline gap-3 py-3 text-sm transition-colors hover:text-[var(--accent)]"
                  href={`${repository}/issues/${issue.number}`}
                  rel="noreferrer"
                  target="_blank"
                >
                  <span className="font-mono text-xs text-[var(--muted)] tabular-nums">
                    #{issue.number}
                  </span>
                  <span>{issue.title}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section className="border-t border-[var(--line)] py-9">
          <h2 className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
            {messages.whatGetsDeclined}
          </h2>
          <p className="mt-5 max-w-[62ch] text-sm leading-6 text-[var(--muted)]">
            {messages.whatGetsDeclinedBody}
          </p>
        </section>

        <section className="border-t border-[var(--line)] py-9">
          <a
            className="inline-flex items-center gap-2.5 rounded-full bg-[var(--accent)] px-6 py-3.5 text-sm font-semibold text-[var(--canvas)] transition-opacity hover:opacity-90"
            href={getSourceUrl()}
            rel="noreferrer"
            target="_blank"
          >
            <WrenchIcon aria-hidden="true" size={18} weight="regular" />
            {messages.openRepository}
          </a>
          <p className="mt-4 text-sm text-[var(--muted)]">
            {messages.questionsWelcome}
          </p>
        </section>
      </div>
    </main>
  );
}
