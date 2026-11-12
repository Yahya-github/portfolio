---
phase: 07-copy-sharing-and-launch
plan: 06
subsystem: content
tags: [copy, resume, fact-check, metadata, about]
requires: [07-01, 07-02]
provides:
  - Yahya's final About copy with Pokemon Showdown and Minecraft links
  - Re-exported public resume (F-1, F-3, F-5) pinned by a new SHA-256
  - 50-160 description guard with an explicit Achievements exception
affects: [07-07]
key-files:
  created: []
  modified:
    - content/about.ts
    - content/site.ts
    - content/types.ts
    - components/pages/AboutPage.tsx
    - components/pages/about-page.module.css
    - tests/metadata.test.ts
    - tests/pages-about.test.tsx
    - tests/shell.test.tsx
    - tests/resume-facts.test.ts
    - docs/material/resume-public.pdf
    - docs/material/resume-public.txt
    - public/yahya-hallani-resume.pdf
    - .planning/phases/07-copy-sharing-and-launch/07-FACT-CHECK.md
decisions:
  - Achievements description stays at 184 characters (Yahya), listed as the only over-160 exception in tests/metadata.test.ts
  - About big title mapped to titleRows and the heading name, "Strategy and automations" mapped to lead
metrics:
  completed: 2026-11-12
---

# Phase 7 Plan 06: Final copy, resume re-export and fit Summary

Yahya's About copy is placed verbatim with two inline game links, the public resume is re-rendered with the approved F-1/F-3/F-5 changes and a new pinned hash, and every page still fits the contract viewports.

## Commits

- 3609cd6 feat(07-06): re-export public resume with Facturo end, MAME entry, no Atlantis line counts
- 90ad7c4 feat(07-06): place Yahya's final About copy with game links and description guard
- 123085b docs(07-06): resolve fact-check rows and fit phone About title to PASS row

## What changed

**Resume (D-02).** Phase 1 method, scratch copy only: the live JobOps resume JSON was read with `mode=ro`, edited in the scratchpad and rendered inside the `job-ops` container under `/tmp/portfolio-public` with the `ultra-compact` Typst theme (nothing written under `/home/atlas/services/jobops`). Edits: phone removed, CRC "contest platform" bullet removed, Facturo "Jun 2026 - Oct 2026" (F-1), MAME Tool Rental added "Nov 2026 - Present" (F-3), Atlantis line counts dropped (F-5). One page, Author "Yahya Hallani". New SHA-256 `5943fdad1f8295afe2e43f3be353b710ef4c1befb6135740a30488cbe6674ee5`. Copied to `docs/material/resume-public.pdf` and `public/yahya-hallani-resume.pdf`; `.txt` regenerated. `tests/resume-facts.test.ts` gained the hash, "Jun 2026 - Oct 2026", "MAME Tool Rental", "Nov 2026 - Present" and a no-line-count check; the phone check passes.

**About.** `title` "Two passions" (heading accessible name, matches the visible big letters), `titleRows` `["TWO","PASS","IONS"]`, `lead` "Strategy and automations", `paragraph` Yahya's text verbatim (double space collapsed, "Pokemon" without accent, straight apostrophe). Mapping judgement: the file has no separate "Title" field beyond the heading name and the lead, so BIG TITLE became titleRows plus the heading name and his "Title" became the lead. Row split PASS/IONS was my choice (keeps 3 rows, as before).

**Links in the paragraph (exactly what changed).** Added an optional-in-practice `paragraphLinks: readonly {text, href}[]` to `AboutContent` (content/types.ts) and `about.ts` ("Pokemon Showdown" to https://pokemonshowdown.com, "Minecraft" to https://www.minecraft.net). `components/pages/AboutPage.tsx` got a small `renderParagraph()` that splits `about.paragraph` on each link text in order and renders `<a className="ulink" target="_blank" rel="noopener noreferrer">`, the same convention as ProjectsPage and AchievementsPage. No new component, no CSS, no CSP change (links are plain anchors). `paragraph` stays a single plain string, so text pins and FORBIDDEN scans still work.

**Metadata.** `content/site.ts` About description changed because it quoted the old "Two habits" line. See Needs confirmation.

**Description guard.** `tests/metadata.test.ts` checks every section description is at least 50 characters and at most 160, with `achievements` as a commented explicit exception (capped at 200 so it cannot grow unnoticed), and the Facturo description 50-160. The other pages keep the full bound.

**Phone fit.** The new widest title row is PASS at 1.63em (measured). The phone `.title` divisor in `about-page.module.css` went from 1.49 to 1.64 (layout only, no new token, `styles/tokens.css` untouched).

## Deviations from Plan

**1. [Accepted, user decision] Achievements description is 184 characters.** Yahya says the current text is fine, so it ships unchanged. This deviates from D-09 / UI-SPEC Surface 4 (<=160); search snippets may truncate it. Recorded as the only exception in the length test and in 07-FACT-CHECK.md (F-4).

**2. [Rule 3 - Blocking] Base reset replaced by fast-forward.** A hook blocked `git reset --hard`; HEAD was a clean ancestor of the base, so `git merge --ff-only 0595056` reached the identical commit.

**3. [Rule 2/3] About description and phone title divisor** (above) were not in the plan but were required for correctness (stale "Two habits" quote; PASS row wider than TWO).

**4. Resume built from the live JSON with drift reverted.** The live JobOps JSON had drifted since Phase 1 (header website, an Involvement section, the Grasset entry hidden, the freelance "(90% + faster)" clause removed, MAME already present, Atlantis hidden). To keep the PDF change limited to what Yahya approved, the scratch copy reverted the header, Involvement, Grasset and freelance drift, and un-hid Atlantis. The text diff against the previous PDF is exactly the F-1, F-3 and F-5 changes. The MAME entry text and "1,300+ tests" come from Yahya's own JSON (C-39).

## Verification

- `pnpm test` 712 passed, `pnpm typecheck` and `pnpm lint` clean, `pnpm build` ok, no em dashes in `content/`.
- `pnpm format:check` fails on 5 pre-existing files this plan did not touch (proof-preview.module.css, lib/features/types.ts, scripts/measure-js.mjs, tests/decode-images.test.ts, tests/use-features.test.tsx); none of my files are listed. Out of scope, not fixed.
- E2E against `out/` served on port 4176: chromium (no-scrollbar, layout, pager-overflow, a11y) and chromium-phone (phone) all passed, 143 tests after the final build.
- Fit, About page: 1440x900 and 1366x768 no vertical scroll and no horizontal overflow (also 1280x720 passes); 390x844 and 320x640 no horizontal overflow, phone title fits. Other five pages: unchanged copy, layout/no-scrollbar specs pass at 1440x900, 1366x768 and 390x844 (Facturo deep dive unchanged). Desktop About screenshot checked: text sits bottom-aligned with about 60px clearance under the rings.
- Resume: no phone number, `cmp` public vs docs identical, hash pinned.

## Needs confirmation (Yahya)

- C-38: the new About meta description, "Two passions, strategy and automations: competitive Pokemon, Chess and Minecraft automation modpacks." It is derived from his words, not his own wording; replace if he prefers.
- Resume now says "Booking Platform" and "rental platform" in the MAME entry (Yahya's own JobOps text). The site-side ban on "platform" covers `content/` only; flag if he wants those reworded.
- The live JobOps resume has drifted from the public PDF (see deviation 4). Say if the public PDF should also carry the website header, Involvement, Grasset and the freelance clause removal.

## Known Stubs

None.

## Threat Flags

None. The two new anchors are external links with `rel="noopener noreferrer"`; no new endpoints or CSP origins (links are navigations, not loaded resources).

## Self-Check: PASSED

Commits 3609cd6, 90ad7c4, 123085b exist; public and docs resume PDFs identical; tests, typecheck, lint and build pass.
