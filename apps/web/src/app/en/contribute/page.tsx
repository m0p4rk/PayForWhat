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
import { getSourceUrl } from "@/lib/source";

export const metadata: Metadata = {
  title: "Contribute",
  description:
    "Build a browser-local tool, keep your name on it, and let PayForWhat host it at no cost to you.",
  robots: { follow: false, index: false },
};

const repository = "https://github.com/m0p4rk/PayForWhat";

const offers = [
  {
    body: "A tool that runs in the browser adds a page, not a server bill, so there is nothing to pass on. Tools that need server compute are a separate conversation about who pays, held in the issue before any work starts.",
    icon: LockSimpleIcon,
    title: "Hosting costs you nothing",
  },
  {
    body: "The catalog records an owner for every tool. That credit belongs to whoever built it, and the tool page links back to you.",
    icon: SignatureIcon,
    title: "Your name stays on it",
  },
  {
    body: "Proposal, review, and the pull request are done with you rather than left to you. For some people that is a portfolio piece with a live URL; for others it is review experience that is hard to get alone.",
    icon: GitPullRequestIcon,
    title: "You do not walk it alone",
  },
];

const steps = [
  {
    body: "Open a proposal issue describing the task, the free result, where the work happens, the worst thing someone might paste in, and how we know the output is correct. Agreement on the problem comes before code.",
    title: "Agree on the problem",
  },
  {
    body: "Declare the tool in the catalog manifest: what it does, whether it runs locally, how sensitive the data is. The schema refuses a local tool that also asks for network access, so the promise is enforced rather than assumed.",
    title: "Declare it",
  },
  {
    body: "Write the work as plain functions with tests beside them, then build the interface on top. Heavy work belongs in a worker so the page never freezes.",
    title: "Build and test it",
  },
  {
    body: "Run the verification suite, sign off your commits, and open the pull request from a branch on your fork. Main is the deployed branch and only takes reviewed changes.",
    title: "Open the pull request",
  },
];

const issues = [
  { number: 1, title: "Show who built each tool on its page" },
  { number: 2, title: "Write down the browser support floor" },
  { number: 3, title: "Add a copy-to-clipboard control to the resized result" },
  { number: 4, title: "Show how much smaller the file got" },
];

export default function ContributePage() {
  return (
    <main className="min-h-[100dvh] bg-[var(--canvas)] text-[var(--ink)]">
      <div className="mx-auto w-full max-w-3xl px-5 py-5 sm:px-10">
        <SiteHeader bordered />

        <section className="py-9 sm:py-12">
          <h1 className="text-balance text-[clamp(1.6rem,4vw,2.6rem)] font-semibold leading-tight tracking-[-0.04em]">
            Build a tool. Keep your name on it.
          </h1>
          <p className="mt-5 max-w-[62ch] leading-7 text-[var(--muted)]">
            A first working version of a small tool comes together quickly now. The
            distance from &ldquo;it runs&rdquo; to something worth handing a stranger
            &mdash; edge cases, tests, accessibility, verification &mdash; is the actual
            work, and it is where most solo attempts quietly die. Work here has been
            deleted rather than shipped for exactly that reason. So the catalog is open:
            you walk that distance with review, hosting, and users already in place.
          </p>
        </section>

        <section className="border-t border-[var(--line)] py-9">
          <h2 className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
            What you get
          </h2>
          <ul className="mt-6 grid gap-6 sm:grid-cols-3">
            {offers.map((offer) => (
              <li key={offer.title}>
                <offer.icon
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
            ))}
          </ul>
        </section>

        <section className="border-t border-[var(--line)] py-9">
          <h2 className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
            How it goes
          </h2>
          <ol className="mt-6 flex flex-col gap-6">
            {steps.map((step, index) => (
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
            The full walkthrough, with the commands, lives in{" "}
            <a
              className="font-medium text-[var(--ink)] underline underline-offset-4"
              href={`${repository}/blob/main/docs/contributing/add-a-tool.md`}
              rel="noreferrer"
              target="_blank"
            >
              docs/contributing/add-a-tool.md
            </a>
            . It is about a fifteen-minute read. Getting a tool through its quality
            gates afterwards is the long part &mdash; days to weeks, not minutes.
          </p>
        </section>

        <section className="border-t border-[var(--line)] py-9">
          <h2 className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
            Smaller ways in
          </h2>
          <p className="mt-5 max-w-[62ch] text-sm leading-6 text-[var(--muted)]">
            Adding a whole tool is not the only useful contribution. These are scoped to
            finish in one sitting.
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
            What gets declined
          </h2>
          <p className="mt-5 max-w-[62ch] text-sm leading-6 text-[var(--muted)]">
            Being technically correct is not sufficient. A tool is declined when it
            needs a subscription, an account, or a watermark to make sense; when it
            sends data to a server for work the browser can do; when the result cannot
            be verified; or when it carries a maintenance cost the project cannot
            sustain. These are product decisions, and they are explained in the issue
            rather than left unsaid.
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
            Open the repository
          </a>
          <p className="mt-4 text-sm text-[var(--muted)]">
            Questions are welcome as an issue before any code exists.
          </p>
        </section>
      </div>
    </main>
  );
}
