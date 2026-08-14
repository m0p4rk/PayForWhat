<!--
SPDX-FileCopyrightText: 2026 m0p4rk
SPDX-License-Identifier: CC-BY-4.0
-->

# Planned Tool: Local Resume Builder

Status: Planned; not scheduled for the first release  
Last reviewed: 2026-08-14

## Product statement

> Create and export an ATS-friendly resume. No account. No watermark. No subscription.
> Your data stays in your browser.

The planned product is a local-first resume builder with unlimited PDF export. It is not
the first PayForWhat release because a reliable document editor, pagination engine,
multiscript font pipeline, and browser PDF exporter have a materially larger validation
surface than the first image workflow.

Deferral is not a conclusion that a resume builder must invent a novel differentiator or
include generative AI to be useful. The core user outcome is a clear, editable resume
and a trustworthy export without a subscription. That outcome can stand on its own if
user research confirms demand.

## AI boundary

Hosted generative AI is excluded from the initial product scope because it introduces
variable inference cost, sends sensitive career data to another processing boundary,
adds latency and abuse controls, and creates output-quality and disclosure obligations.
Those are operating and privacy decisions, not a requirement to manufacture novelty.

The product must not market "AI-free" as a competitive claim or imply that AI-assisted
services lack value. If hosted, bring-your-own-key, or on-device assistance is proposed
later, it requires separate evidence that the feature helps the intended audience and a
review of cost, privacy, consent, accessibility, safety, and fallback behavior. The
editor and export path must remain fully useful without it.

## Why keep it planned

- Export paywalls and recurring plans can still obstruct a one-time document task.
- The audience spans students, first-time applicants, career changers, returning
  workers, and older adults.
- Resume data is sensitive, so local editing and export provide a meaningful privacy
  benefit.
- The complete core can run without authentication, a database, AI, or server compute.
- It can establish a reusable document foundation for letters and other occasional
  personal documents.

The market evidence is recorded in
[Recurring Subscriptions for One-Time Utility Tasks](../research/recurring-utility-subscriptions.md).
Before scheduling implementation, research must confirm that the no-account local
workflow solves a real unmet task for the intended users; competitor feature parity
alone is not evidence.

The planned route is `/en/tools/resume-builder`.

## Initial scope

The initial release would include:

- Contact, summary, experience, education, skills, and projects
- Add, remove, duplicate, and reorder sections
- Three ATS-safe visual templates
- A4 and US Letter page sizes
- Live preview with predictable multipage layout
- Unlimited PDF export
- Selectable and searchable PDF text
- Working email, phone, and URL links
- English and Korean text without broken glyphs
- Versioned browser autosave
- JSON backup and restore
- Delete-all-local-data control
- Usable editor and export flow on mobile

The initial release would exclude:

- Accounts and cloud synchronization
- Public share links
- Hosted, bring-your-own-key, or on-device AI writing and rewriting
- DOCX export
- Applicant tracking or job application management

## Product guarantees

- No signup, login, payment, watermark, or PayForWhat branding in the export
- No artificial export count or quality limit
- Resume contents do not leave the browser during editing, preview, storage, backup,
  restore, or PDF generation
- User data is never included in analytics, telemetry, URLs, logs, or error reports
- A clear control deletes all locally stored resume data

These statements may be presented to users only after automated and manual verification
proves them for the released build.

## Advertising boundary

The editor route contains sensitive personal information and must not load AdSense,
third-party analytics, session replay, or third-party support widgets.

Advertising may appear on independent public pages such as resume guides, template
explanations, examples, and the tool landing page. Those pages must provide real
standalone value. Ads must remain visually and spatially separate from the editor entry
point and all task controls.

## Acceptance criteria

### Functional

- A user creates a complete resume without an account.
- Section operations preserve data and update the preview immediately.
- Page breaks do not orphan headings or split short entries needlessly.
- PDF export has no watermark, branding, or ads.
- Exported text is selectable and searchable rather than rasterized.
- Links remain interactive in the PDF.
- Mixed English and Korean input renders correctly.
- Local autosave survives a browser restart.
- JSON export and import round-trip without data loss.
- Delete-all removes every project-owned local record.
- No resume value is sent in a network request.

### Quality

- A representative three-page resume exports in under three seconds on the documented
  mid-range reference device.
- The release target is Lighthouse Performance 90 or higher and Accessibility 95 or
  higher on mobile.
- The page targets LCP at or below 2.5 seconds and CLS at or below 0.1.
- The current and previous major versions of Chrome, Edge, Firefox, and Safari pass the
  core flow.
- Print regression coverage includes A4, US Letter, multiple pages, long URLs, long
  experience entries, and mixed-script content.
- User text is rendered as text, never inserted as trusted HTML.
- The core editor works after the initial page load when the network is unavailable.
- Stored data has an explicit schema version and tested migrations.

## Release-blocking gates

The product must not be scheduled for public release until user research validates the
non-AI core outcome and a technical spike proves all of the following:

- Selectable-text PDF output is consistent across the supported browser matrix.
- English and Korean font embedding is legally distributable and visually reliable.
- Multipage layout does not silently omit or overlap user content.
- Resume data remains local and the editor loads no prohibited third-party scripts.
- Mobile editing and export remain usable for a representative multi-page document.

## Implementation sequence

1. Validate the no-account editing and export workflow with intended users.
2. Define and test the versioned resume schema.
3. Build one plain ATS-safe template and print regression fixtures.
4. Implement editing, section ordering, local persistence, and deletion.
5. Implement selectable-text PDF export for A4 and US Letter.
6. Add JSON backup and restore.
7. Add two additional templates without changing the document schema.
8. Add locale infrastructure and Korean UI messages.
9. Complete browser, accessibility, network, and privacy verification.

The route remains non-indexed and absent from the sitemap until the complete core flow
meets the acceptance criteria. AI remains a separate future decision and is not a
prerequisite for releasing a useful core product.
