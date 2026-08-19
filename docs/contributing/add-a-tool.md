<!--
SPDX-FileCopyrightText: 2026 m0p4rk
SPDX-License-Identifier: CC-BY-4.0
-->

# Add a tool

This walks through adding a tool to PayForWhat end to end. It takes about fifteen
minutes for a simple, local-only tool.

Read [CONTRIBUTING.md](../../CONTRIBUTING.md) first for the rules that apply to every
change. This page is the practical path through them.

## Before you write code

Open a
[tool proposal](https://github.com/m0p4rk/PayForWhat/issues/new?template=feature_request.yml)
and get agreement on the problem. A proposal is not a title — it answers:

- Which task does someone finish with this, and what do they do today instead?
- What is the free result? (If the useful output needs a paywall, it does not belong.)
- Where does the work happen: the browser, or a server?
- What is the worst thing in the data someone will paste in?
- How do we know the result is correct?

Agreement on an issue means we agree on the problem and the constraints. It is not a
promise to merge a specific implementation.

## Set up

```sh
corepack enable
pnpm install
pnpm dev
```

The app runs at `http://localhost:3000`. Node 24 is required.

## 1. Declare the tool in the catalog

Every tool starts as a manifest entry in
[`apps/web/src/lib/tools/catalog.ts`](../../apps/web/src/lib/tools/catalog.ts). The
manifest is a contract, not metadata: it states in public what the tool does with
someone's data.

```ts
{
  id: "color-contrast-checker",
  name: "Color Contrast Checker",
  summary: "Check whether two colors meet WCAG contrast requirements.",
  status: "building",
  slug: "color-contrast-checker",
  owner: "your-github-handle",
  supportedLocales: ["en"],
  processingMode: "local",
  networkAccess: false,
  dataSensitivity: "none",
  serverCostClass: "none",
  outputLabel: "Contrast report",
}
```

Field notes:

| Field             | What it means                                                                                   |
| ----------------- | ----------------------------------------------------------------------------------------------- |
| `owner`           | Your GitHub handle. You keep the credit for what you build.                                     |
| `status`          | `planned` → `building` → `published`. Nothing is `published` until it passes its quality gates. |
| `processingMode`  | `local` means the data never leaves the device. Prefer it.                                      |
| `dataSensitivity` | Judge by the worst realistic input, not the demo input. A resume is `sensitive`.                |
| `serverCostClass` | `none` for local tools. Anything else needs a cost discussion in the issue.                     |

The schema enforces the promise: a `local` tool cannot declare `networkAccess` or a
server cost. If you find yourself fighting that rule, the design changed — say so in the
issue rather than relaxing the manifest.

## 2. Write the logic as plain functions

Put the actual work in `apps/web/src/lib/<tool-name>/`, as functions that take input and
return output. No React, no DOM, no globals.

```
apps/web/src/lib/color-contrast/
  contrast.ts        # pure functions
  contrast.test.ts   # tests next to the code
  types.ts
  index.ts           # the public surface of the module
```

This is the part that gets tested, and it is where correctness lives. See
[`apps/web/src/lib/image-tools/`](../../apps/web/src/lib/image-tools) for a worked
example: geometry, byte solving, and inspection are separate files, each with its own
test file.

Heavy work belongs in a worker (`apps/web/src/workers/`) so the interface never freezes.
Look at `image-processor.worker.ts` before writing one.

## 3. Test the behavior, not the implementation

Tests sit beside the code as `*.test.ts` and run with Vitest.

```sh
pnpm --dir apps/web test
```

Cover the real edges: the empty input, the enormous input, the wrong file type, the
value that lands exactly on a boundary. A test that only proves the happy path does not
tell us the tool is trustworthy.

## 4. Build the interface

The component goes in `apps/web/src/components/<tool-name>/`, and the route is a page
under `apps/web/src/app/en/tools/<slug>/page.tsx`.

Copy the shape of
[`image-resizer/page.tsx`](../../apps/web/src/app/en/tools/image-resizer/page.tsx): a
header linking home and to the source, an `h1`, and the tool component. Unreleased tools
set `robots: { index: false, follow: false }` in their metadata until they pass their
gates.

Interface rules that are not negotiable:

- Say where the data goes, on the page, before someone uses the tool.
- The useful result is the free result — no watermark, no artificial degradation.
- It must work from the keyboard, and it must survive a screen reader.
- Never place an ad near an input, a result, or an action control.

## 5. Verify

```sh
npm run verify
```

That runs formatting, the DCO check, lint, typecheck, tests, build, and the license
check. Do not work around a failure — if it cannot be reproduced locally, explain it in
the pull request.

## 6. Open the pull request

Work on a branch and open a pull request. `main` is the deployed production branch and
does not take direct pushes — every change lands through review.

```sh
git checkout -b tool/color-contrast-checker
git commit -s -m "feat(color-contrast): add contrast checker"
git push origin tool/color-contrast-checker
```

If you do not have write access — which is everyone except the maintainers — fork the
repository first, push the branch to your fork, and open the pull request from there.
GitHub's "Fork" button and then `gh repo fork --clone` both work.

The `-s` is required: it adds the `Signed-off-by` trailer certifying the
[Developer Certificate of Origin](https://developercertificate.org/). A check rejects
commits without it. It certifies where the code came from; it does not assign copyright.

Keep one coherent change per pull request. If a review asks for a smaller scope, that is
usually a sign the tool is doing two jobs.

## What gets a tool declined

Being technically correct is not sufficient. A tool is declined when it:

- needs a subscription, an account, or a watermark to make sense
- sends data to a server for work the browser can do
- produces a result we cannot verify is correct
- carries a maintenance or policy cost the project cannot sustain

These are product decisions, not judgments about the code. They are explained in the
issue or the pull request.

## Smaller ways in

Adding a whole tool is not the only useful contribution:

- a failing edge case as a test
- an accessibility fix on an existing tool
- clearer copy where an interface is ambiguous about privacy
- documentation that was wrong or missing

Issues labeled `good first issue` are scoped so they can be finished in one sitting.
