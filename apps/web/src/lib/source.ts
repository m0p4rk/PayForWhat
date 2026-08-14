/*
 * SPDX-FileCopyrightText: 2026 m0p4rk
 * SPDX-License-Identifier: AGPL-3.0-only
 */

const repositoryUrl = "https://github.com/m0p4rk/PayForWhat";
const commitPattern = /^[a-f0-9]{40}$/i;

type SourceEnvironment = Readonly<Record<string, string | undefined>>;

export function getSourceUrl(environment: SourceEnvironment = process.env): string {
  const explicitCommitSha = environment.SOURCE_COMMIT_SHA;
  const vercelCommitSha = environment.VERCEL_GIT_COMMIT_SHA;

  for (const commitSha of [explicitCommitSha, vercelCommitSha]) {
    if (commitSha && !commitPattern.test(commitSha)) {
      throw new Error("Source commit identifiers must be complete 40-character SHAs.");
    }
  }

  if (
    explicitCommitSha &&
    vercelCommitSha &&
    explicitCommitSha.toLowerCase() !== vercelCommitSha.toLowerCase()
  ) {
    throw new Error("SOURCE_COMMIT_SHA does not match VERCEL_GIT_COMMIT_SHA.");
  }

  const commitSha = vercelCommitSha ?? explicitCommitSha;

  if (commitSha && commitPattern.test(commitSha)) {
    return `${repositoryUrl}/tree/${commitSha}`;
  }

  if (environment.VERCEL_ENV === "production") {
    throw new Error(
      "A production build requires SOURCE_COMMIT_SHA or VERCEL_GIT_COMMIT_SHA.",
    );
  }

  return repositoryUrl;
}
