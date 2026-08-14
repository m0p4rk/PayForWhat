<!--
SPDX-FileCopyrightText: 2026 m0p4rk
SPDX-License-Identifier: CC-BY-4.0
-->

# Release License Checklist

Status: Required before the first public deployment or distributable artifact  
Last reviewed: 2026-08-14

`THIRD_PARTY_NOTICES.md` is a source-repository summary, not the final notices bundle.
Every release owner must complete this checklist against the exact locked revision and
the actual output being shipped.

## Inventory

1. Install with `pnpm install --frozen-lockfile` on every packaged target platform.
2. Export both `pnpm licenses list --prod --json` and `pnpm licenses list --dev --json`;
   classify which development packages enter the build output.
3. Scan `next/dist/compiled` and any other vendored dependency directory for license,
   notice, copyright, and source-offer files.
4. Inspect generated browser, server, worker, native, and WASM artifacts for copied or
   vendored packages that are not independent pnpm nodes. This currently includes
   `core-js` code bundled by Next.js.
5. Record fonts, models, datasets, fixtures, icons, images, and other non-package
   assets.

## Obligations

1. Produce an immutable, versioned notices bundle containing every required license and
   copyright notice; a link to transient `node_modules` is not sufficient.
2. Include the notices bundle with every container, archive, downloadable build, and
   other distributed artifact, and expose it from the official hosted service where
   appropriate.
3. Confirm source-availability and relinking obligations for LGPL, MPL, GPL, or AGPL
   components in the form actually shipped.
4. Preserve Apache NOTICE material and attribution requirements such as CC BY.
5. Point the hosted application's Source link to the exact deployed tag or commit, not
   the moving default branch.
6. Obtain legal review before releasing if a component's license, linking model, asset
   provenance, or compatibility is uncertain.

## Gate

`npm run verify` is the development acceptance check. It detects changes against the
reviewed dependency, Next.js vendored-notice, generated `core-js`, and sharp-libvips
component baselines, but it does not claim that a release notices artifact exists.

`npm run release:verify` is the deployment gate. It deliberately fails in the current
pre-release repository because the immutable notices bundle, inventory, and artifact
integrity verification do not exist yet. Implement the release generator and make that
command pass before creating a public deployment. Do not release when the dependency
graph, vendored-code scan, bundle inspection, notices bundle, and deployed source
revision disagree.
