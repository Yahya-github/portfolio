---
phase: 03-static-design-system-and-pages
plan: 03
subsystem: content
tags: [content, typescript, metadata, fact-guards, tdd]
requires: []
provides:
  - "content/types.ts: Slug, Route, Letter, Section, Site and per-page content interfaces"
  - "content/site.ts: site object and the six sections in order"
  - "content/{index,achievements,projects,experience,about,say-hi}.ts: all page copy"
  - "lib/sections.ts: sectionBySlug, indexOfSlug, nextLink, counterLabel, headerLabel, letterSections"
  - "lib/metadata.ts: rootMetadata (noindex) and pageMetadata(slug)"
affects: [03-04, 03-05, 03-06, 03-07, 03-08]
tech-stack:
  added: []
  patterns:
    - "as const satisfies <Interface> for every content export"
    - "content/ uses relative imports only (Playwright-safe), never images"
    - "JSON.stringify fact-guard test over all content exports"
key-files:
  created:
    - content/types.ts
    - content/site.ts
    - content/index.ts
    - content/achievements.ts
    - content/projects.ts
    - content/experience.ts
    - content/about.ts
    - content/say-hi.ts
    - lib/sections.ts
    - lib/metadata.ts
    - tests/sections.test.ts
    - tests/metadata.test.ts
    - tests/content.test.ts
  modified: []
key-decisions:
  - "Section helpers derive say-hi wrap-around from 'no next section' rather than a slug special case"
  - "metadataBase asserted via String(URL) because Next types it as string | URL"
requirements-completed: [CONT-09, CONT-01]
duration: 5min
completed: 2026-11-08
---

# Phase 3 Plan 03: Typed Content and Section Helpers Summary

**All copy for the six pages, the frame and the metadata now lives as typed data (`as const satisfies`). Pure helpers produce the next link, the 0N / 05 counter, the header label and trailing-slash canonical metadata. A fact-guard test blocks unverified claims.**

## Performance

- Duration: about 5 minutes
- Tasks: 2/2
- Files created: 13

## Accomplishments

- `content/types.ts` holds the interfaces exactly as the plan specifies. `content/site.ts` holds the site object (origin, role line, labels, footer, contact) and the six sections with UI-SPEC titles and descriptions copied verbatim.
- The six page content files were copied verbatim from the UI-SPEC Copywriting Contract. "Pokémon" keeps its accent, there are no em dashes, and the proof URLs match `docs/material/links.md`.
- `lib/sections.ts` holds the pure helpers. `lib/metadata.ts` holds `rootMetadata`, which keeps the Phase 2 D-12 noindex, and `pageMetadata(slug)`, which gives a relative canonical that metadataBase turns into an absolute one.
- `tests/content.test.ts` contains the fact guards (T-03-07, T-03-08, T-03-09). It bans "top 1", em dashes, "platform", line counts and phone numbers. Ended roles must show a range, and every href must start with https://, mailto: or /.

## Task Commits

1. Task 1 RED: `3e062e0` test(03-03): add failing tests for section helpers and metadata
2. Task 1 GREEN: `f6db482` feat(03-03): add typed site data, section helpers and per-route metadata
3. Task 2 RED: `7b10478` test(03-03): add failing fact-guard test for page content
4. Task 2 GREEN: `e5f6d30` feat(03-03): add typed copy for the six pages

## Verification

- `pnpm test`: 5 files, 83 tests pass
- `pnpm typecheck`, `pnpm lint`, `pnpm format:check`: clean
- Acceptance greps: 6 slugs; 8 `as const satisfies`; no em dash, "top 1" or "platform" in content/; no `@/` or image imports in content/; "Jun 2026 to Oct 2026" and "Pokémon" present

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] metadataBase type in the test**
- Found during: Task 1
- Issue: `rootMetadata.metadataBase?.href` fails tsc because Next types metadataBase as `string | URL`.
- Fix: assert `toBeInstanceOf(URL)` and compare `String(metadataBase)`.
- Commit: 3e062e0

**2. [Rule 3 - Blocking] href type guard on a literal union**
- Found during: Task 2
- Issue: the `(h): h is string` filter over `as const` literal hrefs did not typecheck.
- Fix: annotate the list as `readonly (string | null)[]` before filtering.
- Commit: e5f6d30

### Process notes

- The worktree base was a descendant of HEAD, so it was fast-forwarded (`git merge --ff-only`) instead of `git reset --hard`. The result is the same base, 30f9ac7.
- A user hook blocks `git commit --no-verify`, so commits ran with the normal git hooks.
- Each RED commit was made from the test files alone, before its implementation was staged.

## TDD Gate Compliance

Both tasks have a `test(...)` commit followed by a `feat(...)` commit. RED was confirmed each time: the tests failed with unresolved modules before the implementation existed.

## Known Stubs

None. `site.resume.href` (`/yahya-hallani-resume.pdf`) points to a file that later plans add to `public/`.

## Self-Check: PASSED

- All 13 created files exist
- Commits 3e062e0, f6db482, 7b10478 and e5f6d30 are in git log
