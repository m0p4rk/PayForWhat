<!--
SPDX-FileCopyrightText: 2026 m0p4rk
SPDX-License-Identifier: CC-BY-4.0
-->

# PayForWhat License Policy

PayForWhat separates software, documentation, and brand identity so each can be reused
under clear terms.

## Software: AGPL-3.0-only

Unless a file carries a different license notice, software authored for this project is
licensed under the [GNU Affero General Public License version 3 only](LICENSE). This
includes:

- Application and library source code
- Browser, worker, server, and command-line code
- Tests, fixtures, scripts, and developer tooling
- Build and deployment configuration
- Reusable UI implementation and infrastructure definitions

The “-only” suffix is intentional. It means version 3 of the GNU Affero General Public
License, not an automatic upgrade to a later license version.

Commercial use is allowed. The license does not prohibit charging for a copy, hosting a
fork, or offering services. It does require compliance with its copyleft terms. In
particular, a modified version made available to users over a network must prominently
offer those users access to the Corresponding Source for the version they are using.

The official hosted service should provide a visible **Source** link to the repository
revision, tag, or archive corresponding to the deployed version.

## Documentation: CC BY 4.0

Unless a file carries a different license notice, README.md, project-authored policy and
community Markdown, material under docs/, and contributor-facing issue or pull-request
templates carrying a CC-BY-4.0 SPDX notice are licensed under the
[Creative Commons Attribution 4.0 International license](LICENSES/CC-BY-4.0.txt).

When reusing that material, use an attribution substantially like:

> PayForWhat by m0p4rk and contributors — https://github.com/m0p4rk/PayForWhat

Include a link to CC BY 4.0 and indicate whether changes were made. The license applies
to PayForWhat's original selection and expression. It does not create ownership of
public facts or grant rights in third-party names, marks, or materials cited by the
documentation.

## Brand identity is separate

The software and documentation licenses do not grant permission to use the PayForWhat
name, logos, official-service presentation, or other source identifiers in a way that
implies an official or endorsed distribution. See [TRADEMARKS.md](TRADEMARKS.md).

This separation does not prevent truthful statements such as “based on PayForWhat,”
provided the statement is not misleading.

## Material not automatically licensed

The following are not covered merely because they relate to PayForWhat:

- Secrets, credentials, private configuration, and security or anti-abuse data
- User data, analytics exports, operational logs, and incident records
- Third-party code, fonts, models, datasets, media, and other dependencies
- Future brand assets or production editorial content that carry their own notice

Third-party material remains subject to its own terms. Required notices must be recorded
in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) when such material is added.

## File-level notices

New project-authored source files should use the SPDX identifier AGPL-3.0-only. New
project-authored documentation should use CC-BY-4.0. Use the comment syntax appropriate
for the file type.

Preserve existing copyright, SPDX, attribution, and third-party notices.

## Contributions

Contributors retain copyright in their contributions. Unless explicitly agreed otherwise
before submission, a contribution is offered under the license that applies to the
target file or directory. Contributions require a `Signed-off-by` trailer under the
Developer Certificate of Origin 1.1. See [CONTRIBUTING.md](CONTRIBUTING.md) for the
process.

## No legal advice

This file documents the project's licensing intent. It is not legal advice and does not
replace review by counsel for a specific use, jurisdiction, or dependency combination.
