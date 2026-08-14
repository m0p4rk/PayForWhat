/*
 * SPDX-FileCopyrightText: 2026 m0p4rk
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { existsSync } from "node:fs";
import { resolve } from "node:path";

const repositoryRoot = resolve(import.meta.dirname, "..");
const requiredReleaseArtifacts = [
  "release/legal/THIRD_PARTY_LICENSES.txt",
  "release/legal/inventory.json",
];
const missingArtifacts = requiredReleaseArtifacts.filter(
  (artifact) => !existsSync(resolve(repositoryRoot, artifact)),
);

if (missingArtifacts.length > 0) {
  console.error("Release blocked: complete legal artifacts have not been generated.");
  for (const artifact of missingArtifacts) {
    console.error(`- ${artifact}`);
  }
  console.error("Complete docs/legal/release-license-checklist.md before deployment.");
  process.exit(1);
}

console.error(
  "Release blocked: artifact integrity verification must be implemented with the first release pipeline.",
);
process.exit(1);
