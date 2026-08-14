<!--
SPDX-FileCopyrightText: 2026 m0p4rk
SPDX-License-Identifier: CC-BY-4.0
-->

# Governance

PayForWhat is currently a founder-led open-source project.

## Roles

- **Users** use the tools and report problems.
- **Contributors** submit issues, research, code, design, translations, or
  documentation.
- **Maintainers** review contributions, manage releases, protect security and policy
  boundaries, and decide what becomes part of the official project.
- **The lead maintainer**, currently m0p4rk, has final responsibility for product
  direction, repository access, official releases, infrastructure, advertising
  integration, and use of the PayForWhat identity.

Roles are based on sustained, trustworthy work. Activity alone does not grant
deployment, secret, billing, or brand access.

## Decisions

Small, reversible implementation decisions happen in pull request review. Material
decisions start with a public issue and include:

- A new tool family or product promise
- Network access or server-side processing
- Collection or persistence of user data
- Advertising, analytics, authentication, or payment behavior
- A new runtime, datastore, hosted service, or large dependency
- Changes to licensing, trademarks, governance, or contribution provenance

Maintainers seek evidence and contributor input, but this project does not use vote
counting. The lead maintainer makes the final decision and records the rationale.
Security and abuse details may remain private.

## Protected branches

The live GitHub ruleset protects `master` and `main`. Non-bypassing changes require a
pull request, one approving CODEOWNER review, resolved review threads, and passing
`Verify` and `DCO` checks. Both required contexts are restricted to the GitHub Actions
app. Deletion and non-fast-forward updates are blocked.

The Repository Admin role currently retains an audited bypass because the repository has
no initial remote branch and the project has one maintainer. The bypass is for
bootstrap, recovery, and maintainer-owned changes that cannot receive self-approval; it
must not be used to merge an external contribution that failed review or required
checks.

## Releases

Only maintainers may publish official releases or deploy the official hosted service.
Source availability does not confer permission to use the PayForWhat brand for a fork.
See [TRADEMARKS.md](TRADEMARKS.md).

## Becoming a maintainer

A contributor may be invited after demonstrating sustained work, sound judgment,
respectful review, reliable follow-through, and care for privacy, accessibility,
licensing, and user trust. Maintainer scope may begin with a specific area.

The lead maintainer may remove or narrow access to protect users, credentials, project
continuity, or the community. A public explanation should be provided when doing so
would not create a security, privacy, or legal risk.

## Amendments

Governance changes use the same public proposal process as other material decisions. The
repository history is the authoritative record.
