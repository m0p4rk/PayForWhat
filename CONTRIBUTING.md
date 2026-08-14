<!--
SPDX-FileCopyrightText: 2026 m0p4rk
SPDX-License-Identifier: CC-BY-4.0
-->

# Contributing to PayForWhat

PayForWhat welcomes focused contributions that advance its promise: useful results
without subscriptions, artificial restrictions, or hidden privacy costs.

## Before starting

- Search open issues and pull requests for related work.
- Open an issue before a substantial feature, new dependency, data-handling change, or
  architecture change.
- Do not implement a new tool from its title alone. A proposal must identify the user
  problem, free-result promise, processing boundary, privacy risks, expected server
  cost, and acceptance tests.
- Security reports must follow [SECURITY.md](SECURITY.md), not a public issue.

Maintainer agreement on an issue is not a promise to merge a particular implementation.
It is alignment on the problem and constraints.

## Development

Prerequisites:

- Node.js 24
- Corepack enabled

Install and run the web application:

```sh
corepack enable
pnpm install
pnpm dev
```

Before submitting a pull request, run:

```sh
npm run verify
```

Do not bypass a failed check. Explain platform-specific failures in the pull request if
they cannot be reproduced locally.

## Pull request expectations

- Keep one coherent change per pull request.
- Add tests for behavior and regression risk.
- Keep all code, identifiers, comments, and commit messages in English.
- Add or update user-facing documentation when behavior changes.
- Declare processing, network, sensitivity, and cost behavior in the tool manifest.
- Never add analytics, advertising, or remote requests inside an individual tool without
  prior architecture and privacy approval.
- Do not include generated media, datasets, fonts, or dependencies without documenting
  their license in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
- Use Conventional Commits for commit subjects.

## Developer Certificate of Origin

Contributions require a `Signed-off-by` trailer certifying the
[Developer Certificate of Origin 1.1](https://developercertificate.org/). Sign commits
with:

```sh
git commit -s
```

The sign-off certifies provenance; it is not a copyright assignment. Code is contributed
under the license applying to the target file or directory. Documentation follows the
same rule. A dedicated pull-request check rejects unsigned commits. See
[LICENSE_POLICY.md](LICENSE_POLICY.md).

The sign-off must be a real Git trailer matching the commit author's name and email.
Every pull-request commit, including a merge commit, must carry it. Prefer rebasing over
introducing merge commits solely to update a branch.

## Review and merge

PayForWhat uses a founder-led maintainer model. Maintainers assess correctness, scope,
user value, privacy, accessibility, maintenance cost, and alignment with the project
promise. A technically sound contribution can still be declined if it creates an
unsustainable product or policy obligation.

Maintainers may edit titles, squash commits, request a smaller scope, or close stale
proposals. Decisions and material tradeoffs should be explained in the issue or pull
request.

By participating, you agree to follow the [Code of Conduct](CODE_OF_CONDUCT.md).
