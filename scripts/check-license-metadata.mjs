/*
 * SPDX-FileCopyrightText: 2026 m0p4rk
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { relative, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const repositoryRoot = resolve(import.meta.dirname, "..");
const noticePath = resolve(repositoryRoot, "THIRD_PARTY_NOTICES.md");
const compiledPath = resolve(
  repositoryRoot,
  "apps/web/node_modules/next/dist/compiled",
);
const nextOutputPath = resolve(repositoryRoot, "apps/web/.next");
const sharpBaselinePath = resolve(
  repositoryRoot,
  "docs/legal/sharp-libvips-components.json",
);
const expectedProductionGraphHash =
  "40583256090772094b8f28a101a34dfc64db79330125ff8ef2af8de1a1138787";
const expectedNextNoticeCount = 130;
const expectedNextNoticeHash =
  "246c2efd036d91495cbcec5b546f6984f2c12182a961498fc397aa87177943f1";

function collectFiles(directory, predicate) {
  const results = [];

  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const entryPath = resolve(directory, entry.name);

    if (entry.isDirectory()) {
      results.push(...collectFiles(entryPath, predicate));
    } else if (predicate(entry.name)) {
      results.push(entryPath);
    }
  }

  return results;
}

function digestFiles(root, files) {
  const digest = createHash("sha256");

  for (const filePath of [...files].sort()) {
    digest.update(relative(root, filePath));
    digest.update("\0");
    digest.update(readFileSync(filePath));
    digest.update("\0");
  }

  return digest.digest("hex");
}

function normalizePlatformPackage(packageName) {
  return packageName
    .replace(/^@img\/sharp-libvips-.+$/, "@img/sharp-libvips-<platform>")
    .replace(/^@img\/sharp-.+$/, "@img/sharp-<platform>")
    .replace(/^@next\/swc-.+$/, "@next/swc-<platform>");
}

const licenseCommand = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
const inventoryResult = spawnSync(
  licenseCommand,
  ["licenses", "list", "--prod", "--json"],
  { cwd: repositoryRoot, encoding: "utf8" },
);

if (inventoryResult.status !== 0) {
  console.error(
    inventoryResult.stderr.trim() || "Unable to inspect production licenses.",
  );
  process.exit(inventoryResult.status ?? 1);
}

const inventory = JSON.parse(inventoryResult.stdout);
const normalizedPackages = Object.entries(inventory)
  .flatMap(([license, packages]) =>
    packages.map((package_) => ({
      name: normalizePlatformPackage(package_.name),
      versions: [...package_.versions].sort(),
      license,
    })),
  )
  .sort(
    (left, right) =>
      left.name.localeCompare(right.name) || left.license.localeCompare(right.license),
  );
const productionGraphHash = createHash("sha256")
  .update(JSON.stringify(normalizedPackages))
  .digest("hex");

if (productionGraphHash !== expectedProductionGraphHash) {
  console.error(
    "The production dependency graph changed. Review licenses, notices, and the checked baseline.",
  );
  process.exit(1);
}

const nextNoticeFiles = collectFiles(compiledPath, (fileName) =>
  /^(copying|licen[cs]e|notice)/i.test(fileName),
);
const nextNoticeHash = digestFiles(compiledPath, nextNoticeFiles);

if (
  nextNoticeFiles.length !== expectedNextNoticeCount ||
  nextNoticeHash !== expectedNextNoticeHash
) {
  console.error(
    "The vendored Next.js notice set changed. Review the complete set before updating its baseline.",
  );
  process.exit(1);
}

const sharpBaseline = JSON.parse(readFileSync(sharpBaselinePath, "utf8"));
const sharpPlatformPackages = Object.values(inventory)
  .flat()
  .filter((package_) => package_.name.startsWith("@img/sharp-libvips-"));

if (sharpPlatformPackages.length === 0) {
  console.error("No installed sharp-libvips platform package was found.");
  process.exit(1);
}

for (const package_ of sharpPlatformPackages) {
  const directoryPath = package_.paths[0];

  if (!directoryPath) {
    console.error(`${package_.name} does not expose an installed package path.`);
    process.exit(1);
  }

  const packageMetadata = JSON.parse(
    readFileSync(resolve(directoryPath, "package.json"), "utf8"),
  );
  const bundledComponents = JSON.parse(
    readFileSync(resolve(directoryPath, "versions.json"), "utf8"),
  );

  if (
    packageMetadata.version !== sharpBaseline.packageVersion ||
    JSON.stringify(bundledComponents) !== JSON.stringify(sharpBaseline.components)
  ) {
    console.error(
      `${package_.name} changed its bundled component inventory. Complete a license review before updating the baseline.`,
    );
    process.exit(1);
  }
}

const buildFiles = collectFiles(nextOutputPath, (fileName) =>
  /\.(?:cjs|js|mjs)$/.test(fileName),
);
let containsCoreJs = false;
let containsReviewedCoreJsVersion = false;

for (const buildFile of buildFiles) {
  const source = readFileSync(buildFile, "utf8");
  containsCoreJs ||= source.includes("core-js");
  containsReviewedCoreJsVersion ||= source.includes("3.38.1");
}

if (!containsCoreJs || !containsReviewedCoreJsVersion) {
  console.error(
    "The generated Next.js output no longer matches the reviewed core-js baseline.",
  );
  process.exit(1);
}

const notice = readFileSync(noticePath, "utf8");
const requiredNoticeMarkers = [
  "not yet a complete distributable notices artifact",
  "0.35.3 binaries under Apache-2.0, excluding",
  "`@img/sharp-libvips-*` 1.3.2",
  "`lightningcss` and platform binaries 1.32.0 and 1.33.0",
  "`caniuse-lite` 1.0.30001809",
  "Vendored code in Next.js",
  "`core-js` 3.38.1",
  "release license checklist",
  "sharp-libvips component inventory",
  "`LICENSES/Geist-OFL-1.1.txt`",
  "Phosphor Icons",
  "fflate",
];
const missingMarkers = requiredNoticeMarkers.filter(
  (marker) => !notice.includes(marker),
);

if (missingMarkers.length > 0) {
  console.error(`Third-party notice markers are missing: ${missingMarkers.join(", ")}`);
  process.exit(1);
}

console.log(
  `License metadata baselines passed for ${normalizedPackages.length} production package(s), ${nextNoticeFiles.length} Next.js vendored notice file(s), and ${Object.keys(sharpBaseline.components).length} sharp-libvips component(s).`,
);
console.log("This metadata check is not the release notices artifact.");
