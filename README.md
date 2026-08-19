<!--
SPDX-FileCopyrightText: 2026 m0p4rk
SPDX-License-Identifier: CC-BY-4.0
-->

# PayForWhat

**English** · [한국어](README.ko.md)

> **Solve the task. Skip the subscription.**

A five-minute task should not turn into a subscription you forget for months or years.

It hurts to see a student, a parent, or anyone else reach for a credit card just to
export a resume, resize an image, clean up text, create a QR code, send an invitation,
or solve one small problem. Too often, the task ends in minutes while the charge
continues long after it has been forgotten.

PayForWhat is being built for those moments.

We plan to fund the official hosted service with clearly separated advertising. We will
make money from ads, not from your forgetfulness. Advertisers can cover the bill. **You
keep your money.**

## Why this is built with other people

A first working version of a small tool comes together quickly now. The distance from
"it runs" to something worth handing a stranger — edge cases, tests, accessibility,
verification — is the actual work, and it is where most solo attempts quietly die. Work
in this project has been deleted rather than shipped for exactly that reason, most
recently a PDF editor that took two months.

So the catalog is open rather than closed. Build a tool and bring it: hosting costs you
nothing, the review is done with you, and your name goes on it and stays there. For some
people that is a portfolio piece with a live URL; for others it is the pull-request and
review experience that is hard to get on your own.

[How to add a tool](docs/contributing/add-a-tool.md) walks the whole path, and
[good first issues](https://github.com/m0p4rk/PayForWhat/labels/good%20first%20issue)
are smaller ways in.

## The promise

These are the rules we are building toward:

- **No subscriptions.** A one-time problem should not create a recurring bill.
- **No account for a simple task.** Use the tool and get on with your day.
- **No watermarks or artificial degradation.** The useful result is the free result.
- **Local first.** Work should stay on your device whenever the browser can do it safely
  and reliably.
- **Honest server processing.** If a tool must send data to a server, we will say so
  before it happens and explain how the data is handled.
- **Open source.** The code behind the tools will be available to inspect, improve, and
  self-host.
- **Accessible by default.** The tools should work for students, parents, older adults,
  and anyone who just wants a clear answer without learning a new system.
- **Advertising with boundaries.** Ads must be clearly identifiable and kept away from
  inputs, results, and action controls.

## Why advertising

Running a public service costs money. We would rather charge advertising budgets than
household budgets.

The official hosted service is intended to use advertising to pay for infrastructure and
continued development. It will never ask users to click an ad, disguise an ad as part of
a tool, or place ads where they could be mistaken for an action button.

## How we intend to build it

- Perform work in the browser whenever practical.
- Keep task data and processing code isolated from advertising and analytics code.
- Use servers only for operations that cannot be delivered well on the user's device.
- Publish the source corresponding to the version running on the official service.
- Document privacy boundaries, limitations, and failure cases instead of hiding them.
- Build a small number of reliable tools before expanding the catalog.

## What belongs in PayForWhat

PayForWhat is not organized around one format, industry, or age group. It is organized
around a moment: someone has one small digital task and should not need to start a
recurring payment to finish it.

That can mean:

- Preparing a resume, application, form, or letter
- Editing, converting, compressing, or cleaning up content
- Creating a QR code, barcode, card, invitation, label, or template
- Formatting, comparing, validating, or transforming text and data
- Calculating an answer and understanding how it was reached
- Handling an occasional image, audio, or video task
- Replacing needlessly complicated software with a focused tool

A tool belongs here when it solves a clear problem, can provide a trustworthy result,
and does not need to become a subscription business to survive.

## Project status

PayForWhat is at the beginning of development. The platform scaffold is now being built
around a browser-first tool contract.

The first accepted product is an [Image Resizer](docs/product/first-tool.md): a local
tool that resizes, compresses, and converts an image for declared upload requirements,
then validates the result again before download. It is not released yet. The
implementation must meet the published accuracy, privacy, and quality gates before it is
made indexable.

A detailed, no-subscription [local resume builder](docs/product/resume-builder.md)
remains planned as a later product. Its useful core does not depend on generative AI.
Hosted AI is excluded from its initial scope because recurring inference cost and the
privacy of resume data require a separate product and infrastructure decision, not
because every tool needs a novel feature to deserve release.

The [technology decision](docs/architecture/stack.md) uses one Next.js application on
Vercel and defers databases, authentication, and server compute until a tool genuinely
requires them.

The site is deployed at [payforwhat.tech](https://payforwhat.tech) so the work is
visible while it is built. Nothing there is released yet: tool pages stay out of search
until they meet the accuracy, privacy, and quality gates above.

## Contributing

PayForWhat uses a founder-led, curated collaboration model. Read
[CONTRIBUTING.md](CONTRIBUTING.md), [GOVERNANCE.md](GOVERNANCE.md), and the
[Code of Conduct](CODE_OF_CONDUCT.md) before proposing work. Vulnerabilities must follow
the private process in [SECURITY.md](SECURITY.md).

Building a tool is the most direct way in:
[docs/contributing/add-a-tool.md](docs/contributing/add-a-tool.md) covers the path from
manifest to pull request.

Two things are true for anyone who builds one:

- **We host it, at no cost to you.** A tool that runs in the browser adds a page, not a
  server bill, so there is nothing to pass on. Tools that need server compute are a
  separate conversation about who pays for it, held in the issue before the work starts.
- **Your name stays on it.** The catalog records an `owner` for every tool, and that
  credit belongs to whoever built it.

## Open-source policy

Application code, tests, and build tooling are licensed under
[`AGPL-3.0-only`](LICENSE). Documentation is licensed under
[`CC-BY-4.0`](LICENSES/CC-BY-4.0.txt) unless a file says otherwise.

The PayForWhat name, logo, and official service identity are not licensed with the code.
Forks are welcome, but they must not present themselves as the official project. See the
[license policy](LICENSE_POLICY.md) and [trademark policy](TRADEMARKS.md) for the exact
boundaries.

---

**Free to use. Open to inspect. Yours to host.**
