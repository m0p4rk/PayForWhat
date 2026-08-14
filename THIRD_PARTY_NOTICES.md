<!--
SPDX-FileCopyrightText: 2026 m0p4rk
SPDX-License-Identifier: CC-BY-4.0
-->

# Third-Party Notices

PayForWhat depends on third-party open-source packages. This file is a reviewed source
repository summary; it is **not yet a complete distributable notices artifact**. No
PayForWhat release has been published.

The package manifests and `pnpm-lock.yaml` are authoritative for the resolved pnpm
package graph only. They do not enumerate code that a dependency vendors into its own
package or code copied into a generated browser or server bundle. Installed dependency
license files remain part of their respective packages.

## Direct runtime dependencies

| Package             | Version | License | Upstream                                |
| ------------------- | ------- | ------- | --------------------------------------- |
| Phosphor Icons      | 2.1.10  | MIT     | https://github.com/phosphor-icons/react |
| fflate              | 0.8.3   | MIT     | https://github.com/101arrowz/fflate     |
| Next.js             | 16.3.0  | MIT     | https://github.com/vercel/next.js       |
| React and React DOM | 19.2.8  | MIT     | https://github.com/facebook/react       |
| Zod                 | 4.4.3   | MIT     | https://github.com/colinhacks/zod       |
| Geist               | 1.7.2   | OFL-1.1 | https://github.com/vercel/geist-font    |

## Direct development dependencies

| Package                              | Version | License    | Upstream                                           |
| ------------------------------------ | ------- | ---------- | -------------------------------------------------- |
| Tailwind CSS and PostCSS integration | 4.3.3   | MIT        | https://github.com/tailwindlabs/tailwindcss        |
| TypeScript                           | 6.0.3   | Apache-2.0 | https://github.com/microsoft/TypeScript            |
| ESLint                               | 9.39.5  | MIT        | https://github.com/eslint/eslint                   |
| Next.js ESLint configuration         | 16.3.0  | MIT        | https://github.com/vercel/next.js                  |
| Vitest                               | 4.1.10  | MIT        | https://github.com/vitest-dev/vitest               |
| Turborepo                            | 2.10.9  | MIT        | https://github.com/vercel/turborepo                |
| Prettier                             | 3.9.6   | MIT        | https://github.com/prettier/prettier               |
| `@types/node`                        | 24.13.3 | MIT        | https://github.com/DefinitelyTyped/DefinitelyTyped |
| `@types/react`                       | 19.2.18 | MIT        | https://github.com/DefinitelyTyped/DefinitelyTyped |
| `@types/react-dom`                   | 19.2.4  | MIT        | https://github.com/DefinitelyTyped/DefinitelyTyped |

## Reviewed transitive components

The locked graph currently includes these components whose obligations deserve explicit
release review:

- `sharp` and its `@img/sharp-<platform>` 0.35.3 binaries under Apache-2.0, excluding
  `@img/sharp-libvips-*`.
- `@swc/helpers` 0.5.15 under Apache-2.0.
- `@img/sharp-libvips-*` 1.3.2 under LGPL-3.0-or-later, distributed upstream as libvips
  packages: https://github.com/lovell/sharp-libvips
- `@edge-runtime/primitives` 4.1.0 and `@edge-runtime/vm` 3.2.0 under MPL-2.0:
  https://github.com/vercel/edge-runtime
- `lightningcss` and platform binaries 1.32.0 and 1.33.0 under MPL-2.0:
  https://github.com/parcel-bundler/lightningcss
- `axe-core` 4.13.0 under MPL-2.0: https://github.com/dequelabs/axe-core
- `caniuse-lite` 1.0.30001809 under CC-BY-4.0:
  https://github.com/browserslist/caniuse-lite
- Additional locked packages under MIT, Apache-2.0, BSD-3-Clause, ISC, and 0BSD.

The `@img/sharp-libvips-*` binary also bundles 28 named libraries. Their exact upstream
version identifiers are preserved in the
[sharp-libvips component inventory](docs/legal/sharp-libvips-components.json). The
package does not include a complete LICENSE or NOTICE set for those bundled libraries,
so their individual licenses and required notices remain a mandatory pre-release legal
review item.

Their licenses apply to those components. PayForWhat has not modified them. Preserve
their copyright and license notices and comply with the applicable source-availability
terms when redistributing an artifact that contains them.

## Vendored code in Next.js

Next.js 16.3.0 contains many components under `next/dist/compiled` with their own
license files. This vendored set is not represented as separate entries in pnpm's graph.
Generated Next.js browser code also contains vendored `core-js` 3.38.1 code. A pnpm-only
license report is therefore insufficient for a distributable build.

`pnpm licenses list --prod --json` and `pnpm licenses list --dev --json` remain useful
inputs, but they are not a complete inventory of shipped code. Before any public
release, container, downloadable build, or production deployment, follow the
[release license checklist](docs/legal/release-license-checklist.md) and package the
resulting full notices with the artifact.

Geist Sans and Geist Mono are bundled without modification under the SIL Open Font
License 1.1. The copyright notice and complete license are preserved in
[`LICENSES/Geist-OFL-1.1.txt`](LICENSES/Geist-OFL-1.1.txt).

No third-party model, dataset, or media asset is currently included.

Links and factual references in market-research documents are citations, not bundled
assets. The names and marks referenced there remain the property of their respective
owners. No affiliation, sponsorship, or endorsement is implied.

When another dependency or asset is added, record its name, version, license, upstream
source, required notices, and project modifications here when applicable.
