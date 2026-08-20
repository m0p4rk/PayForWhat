/*
 * SPDX-FileCopyrightText: 2026 m0p4rk
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { Route } from "next";
import Link from "next/link";
import { GithubLogoIcon } from "@phosphor-icons/react/ssr";

import { selectLocale } from "@/lib/i18n/actions";
import { LOCALES, LOCALE_LABELS, type Locale } from "@/lib/i18n/locales";
import { getMessages } from "@/lib/i18n/messages";
import { getSourceUrl } from "@/lib/source";

export interface SiteHeaderProps {
  /** Draws the rule under the header. Tool pages use it; the home page does not. */
  readonly bordered?: boolean;
  readonly locale: Locale;
  /** Path after the locale segment, so switching language stays on this page. */
  readonly path?: string;
}

const SHORT_LABEL: Readonly<Record<Locale, string>> = { en: "EN", ko: "한" };

export function SiteHeader({ bordered = false, locale, path = "" }: SiteHeaderProps) {
  const messages = getMessages(locale);

  return (
    <header
      className={`flex items-center justify-between pb-5${
        bordered ? " border-b border-[var(--line)]" : ""
      }`}
    >
      <Link
        className="text-sm font-bold tracking-[-0.02em]"
        href={`/${locale}` as Route}
      >
        PayForWhat
      </Link>

      <nav className="flex items-center gap-5">
        <Link
          className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)] transition-colors hover:text-[var(--ink)]"
          href={`/${locale}/contribute` as Route}
        >
          {messages.common.contribute}
        </Link>

        <form
          action={selectLocale}
          aria-label={messages.common.switchLanguage}
          className="flex items-center gap-1.5"
        >
          <input name="path" type="hidden" value={path} />
          {LOCALES.map((option, index) => (
            <span className="flex items-center gap-1.5" key={option}>
              {index > 0 ? (
                <span aria-hidden="true" className="text-[var(--line)]">
                  /
                </span>
              ) : null}
              <button
                aria-current={option === locale ? "true" : undefined}
                className={`text-xs font-semibold uppercase tracking-[0.16em] transition-colors ${
                  option === locale
                    ? "text-[var(--ink)]"
                    : "text-[var(--muted)] hover:text-[var(--ink)]"
                }`}
                name="locale"
                type="submit"
                value={option}
              >
                <span aria-hidden="true">{SHORT_LABEL[option]}</span>
                <span className="sr-only">{LOCALE_LABELS[option]}</span>
              </button>
            </span>
          ))}
        </form>

        <a
          aria-label={messages.common.sourceOnGitHub}
          className="text-[var(--muted)] transition-colors hover:text-[var(--ink)]"
          href={getSourceUrl()}
          rel="noreferrer"
          target="_blank"
          title="GitHub"
        >
          <GithubLogoIcon aria-hidden="true" size={20} weight="fill" />
        </a>
      </nav>
    </header>
  );
}
