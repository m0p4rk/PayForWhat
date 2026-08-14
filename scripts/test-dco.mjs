/*
 * SPDX-FileCopyrightText: 2026 m0p4rk
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const checkerPath = resolve(import.meta.dirname, "check-dco.mjs");
const testRepository = mkdtempSync(join(tmpdir(), "payforwhat-dco-"));

function run(command, arguments_, expectedStatus = 0) {
  const result = spawnSync(command, arguments_, {
    cwd: testRepository,
    encoding: "utf8",
  });

  assert.equal(
    result.status,
    expectedStatus,
    [
      `Unexpected status for ${command} ${arguments_.join(" ")}`,
      result.stdout,
      result.stderr,
    ].join("\n"),
  );

  return result.stdout.trim();
}

function git(...arguments_) {
  return run("git", arguments_);
}

function checkRange(baseRevision, headRevision, expectedStatus) {
  return run("node", [checkerPath, baseRevision, headRevision], expectedStatus);
}

try {
  git("init", "--initial-branch=main", "--quiet");
  git("config", "user.name", "DCO Test Author");
  git("config", "user.email", "dco-test@example.com");
  git("config", "commit.gpgsign", "false");
  git("commit", "--allow-empty", "-m", "chore: establish base");
  const baseRevision = git("rev-parse", "HEAD");

  git("commit", "--allow-empty", "--signoff", "-m", "feat: signed change");
  const signedRevision = git("rev-parse", "HEAD");
  checkRange(baseRevision, signedRevision, 0);

  git("commit", "--allow-empty", "-m", "fix: unsigned change");
  const unsignedRevision = git("rev-parse", "HEAD");
  checkRange(signedRevision, unsignedRevision, 1);

  git("checkout", "--quiet", "-B", "fake-trailer", signedRevision);
  git(
    "commit",
    "--allow-empty",
    "-m",
    "test: fake trailer in body",
    "-m",
    "Signed-off-by: DCO Test Author <dco-test@example.com>",
    "-m",
    "This paragraph appears after the fake trailer.",
  );
  checkRange(signedRevision, git("rev-parse", "HEAD"), 1);

  git("checkout", "--quiet", "-B", "wrong-author", signedRevision);
  git(
    "commit",
    "--allow-empty",
    "-m",
    "test: mismatched signer",
    "-m",
    "Signed-off-by: Another Person <another@example.com>",
  );
  checkRange(signedRevision, git("rev-parse", "HEAD"), 1);

  git("checkout", "--quiet", "-B", "merge-base", signedRevision);
  git("checkout", "--quiet", "-b", "merge-topic");
  git("commit", "--allow-empty", "--signoff", "-m", "feat: signed topic");
  git("checkout", "--quiet", "merge-base");
  git("commit", "--allow-empty", "--signoff", "-m", "chore: signed base update");
  git("merge", "--no-ff", "merge-topic", "-m", "merge: unsigned topic");
  checkRange(signedRevision, git("rev-parse", "HEAD"), 1);

  console.log("DCO integration tests passed.");
} finally {
  rmSync(testRepository, { force: true, recursive: true });
}
