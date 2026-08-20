/*
 * SPDX-FileCopyrightText: 2026 m0p4rk
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import Link from "next/link";
import { GithubLogoIcon } from "@phosphor-icons/react/ssr";

import { getSourceUrl } from "@/lib/source";

export interface SiteHeaderProps {
  /** Draws the rule under the header. Tool pages use it; the home page does not. */
  readonly bordered?: boolean;
}

export function SiteHeader({ bordered = false }: SiteHeaderProps) {
  return (
    <header
      className={`flex items-center justify-between pb-5${
        bordered ? " border-b border-[var(--line)]" : ""
      }`}
    >
      <Link className="text-sm font-bold tracking-[-0.02em]" href="/">
        PayForWhat
      </Link>

      <nav className="flex items-center gap-5">
        <Link
          className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)] transition-colors hover:text-[var(--ink)]"
          href="/en/contribute"
        >
          Contribute
        </Link>
        <a
          aria-label="PayForWhat source code on GitHub"
          className="text-[var(--muted)] transition-colors hover:text-[var(--ink)]"
          href={getSourceUrl()}
          rel="noreferrer"
          target="_blank"
          title="Source on GitHub"
        >
          <GithubLogoIcon aria-hidden="true" size={20} weight="fill" />
        </a>
      </nav>
    </header>
  );
}
