/*
 * SPDX-FileCopyrightText: 2026 m0p4rk
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { spawnSync } from "node:child_process";

const [baseRevision, headRevision] = process.argv.slice(2);
const revisionPattern = /^[a-f0-9]{40}$/i;

function runGit(arguments_, options = {}) {
  const result = spawnSync("git", arguments_, {
    encoding: "utf8",
    ...options,
  });

  if (result.status !== 0) {
    throw new Error(result.stderr.trim() || `Git failed: ${arguments_.join(" ")}`);
  }

  return result.stdout;
}

if (
  !baseRevision ||
  !headRevision ||
  !revisionPattern.test(baseRevision) ||
  !revisionPattern.test(headRevision)
) {
  console.error("Usage: node scripts/check-dco.mjs <base-sha> <head-sha>");
  process.exit(2);
}

let commitHashes;

try {
  commitHashes = runGit(["rev-list", "--reverse", `${baseRevision}..${headRevision}`])
    .trim()
    .split("\n")
    .filter(Boolean);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}

if (commitHashes.length === 0) {
  console.error("No commits were found in the pull request range.");
  process.exit(1);
}

const unsignedCommits = [];

for (const commitHash of commitHashes) {
  try {
    const metadata = runGit([
      "show",
      "--no-patch",
      "--format=%an%x00%ae%x00%B",
      commitHash,
    ]);
    const [authorName, authorEmail, ...messageParts] = metadata.split("\x00");
    const message = messageParts.join("\x00");
    const trailers = runGit(["interpret-trailers", "--parse"], { input: message });
    const expectedSignOff = `${authorName.trim()} <${authorEmail.trim()}>`;
    const hasAuthorSignOff = trailers
      .split("\n")
      .map((trailer) => trailer.match(/^Signed-off-by:\s*(.+)$/i)?.[1]?.trim())
      .filter(Boolean)
      .some(
        (signOff) =>
          signOff?.localeCompare(expectedSignOff, undefined, {
            sensitivity: "accent",
          }) === 0,
      );

    if (!hasAuthorSignOff) {
      unsignedCommits.push(commitHash);
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

if (unsignedCommits.length > 0) {
  console.error(
    "Every pull request commit, including merge commits, must end with a DCO sign-off matching its author:",
  );
  for (const commitHash of unsignedCommits) {
    console.error(`- ${commitHash}`);
  }
  console.error("Create commits with `git commit -s` or amend the listed commits.");
  process.exit(1);
}

console.log(`DCO sign-off verified for ${commitHashes.length} commit(s).`);
