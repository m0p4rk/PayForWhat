<!--
SPDX-FileCopyrightText: 2026 m0p4rk
SPDX-License-Identifier: CC-BY-4.0
-->

# Security Policy

## Reporting a vulnerability

Do not open a public issue for a suspected vulnerability. Use
[GitHub's private vulnerability report](https://github.com/m0p4rk/PayForWhat/security/advisories/new).

Include:

- Affected revision, route, or component
- Reproduction steps or a minimal proof of concept
- Expected and observed behavior
- Potential user or data impact
- Any known mitigation

Do not access data that is not yours, disrupt the service, degrade availability, or use
automated scanning that creates material load. Stop once there is enough evidence to
explain the issue.

The project will acknowledge a usable report when maintainer availability allows,
investigate it privately, and coordinate disclosure after a fix or mitigation is
available. No bounty or fixed response-time commitment exists at this stage.

## Supported versions

Before the first public release, only the current default branch is supported. After
releases begin, this section will list the supported release lines.

## Sensitive data

Never include secrets, credentials, resume contents, personal files, or other private
user data in issues, pull requests, logs, fixtures, or screenshots. Tests must use
synthetic data.
