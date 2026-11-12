---
phase: 03-static-design-system-and-pages
reviewed: 2026-11-08T00:00:00Z
depth: standard
files_reviewed: 73
files_reviewed_list:
  - .github/workflows/ci.yml
  - app/about/page.tsx
  - app/achievements/page.tsx
  - app/experience/page.tsx
  - app/fonts.ts
  - app/layout.tsx
  - app/page.tsx
  - app/projects/page.tsx
  - app/say-hi/page.tsx
  - components/frame/Footer.tsx
  - components/frame/Header.tsx
  - components/frame/SkipLink.tsx
  - components/frame/frame.module.css
  - components/letters/LetterNav.tsx
  - components/letters/letters.module.css
  - components/media/Photo.tsx
  - components/pages/AboutPage.tsx
  - components/pages/AchievementsPage.tsx
  - components/pages/ExperiencePage.tsx
  - components/pages/Heading.tsx
  - components/pages/IndexPage.tsx
  - components/pages/ProjectsPage.tsx
  - components/pages/SayHiPage.tsx
  - components/pages/about-page.module.css
  - components/pages/achievements-page.module.css
  - components/pages/experience-page.module.css
  - components/pages/index-page.module.css
  - components/pages/projects-page.module.css
  - components/pages/say-hi-page.module.css
  - components/pages/types.ts
  - components/shell/Shell.tsx
  - components/shell/Track.tsx
  - components/shell/shell.module.css
  - content/about.ts
  - content/achievements.ts
  - content/experience.ts
  - content/index.ts
  - content/projects.ts
  - content/say-hi.ts
  - content/site.ts
  - content/types.ts
  - e2e/a11y.spec.ts
  - e2e/assets.spec.ts
  - e2e/csp.spec.ts
  - e2e/focus.spec.ts
  - e2e/font-shift.spec.ts
  - e2e/layout.spec.ts
  - e2e/routes.spec.ts
  - e2e/visual.spec.ts
  - lib/display-fit.ts
  - lib/metadata.ts
  - lib/sections.ts
  - next.config.ts
  - playwright.config.ts
  - styles/base.css
  - styles/tokens.css
  - tests/content.test.ts
  - tests/contrast.test.ts
  - tests/css-guard.test.ts
  - tests/display-fit.test.ts
  - tests/frame.test.tsx
  - tests/heading.test.tsx
  - tests/letters.test.tsx
  - tests/metadata.test.ts
  - tests/pages-about.test.tsx
  - tests/pages-experience-sayhi.test.tsx
  - tests/pages-index-achievements.test.tsx
  - tests/pages-projects.test.tsx
  - tests/photo.test.tsx
  - tests/sections.test.ts
  - tests/shell.test.tsx
  - tests/source-guard.test.ts
  - vitest.config.mts
findings:
  critical: 0
  warning: 3
  info: 7
  total: 10
status: issues_found
---

# Phase 3: Code Review Report

**Reviewed:** 2026-11-08
**Depth:** standard
**Files Reviewed:** 73
**Status:** issues_found

## Summary

I reviewed the static shell (Shell/Track/LetterNav/Header/Footer), the six page components, the content modules, `lib/*`, the global token and base styles, the CSS Modules, the CI workflow, the Playwright and Vitest configs, and all unit and e2e specs.

Overall quality is high. All components are server components. Content is typed with `as const satisfies`. External links consistently use `noopener noreferrer`, and there are no secrets, `dangerouslySetInnerHTML` or client-only APIs. The CSP is exercised end to end, including a negative control. Heading levels and `aria-labelledby` ids line up across the six sections, and inactive pages are `inert` and hidden, so JS-off visitors see one page.

I found no critical issues. The three warnings are:

1. On phones with coarse pointers, the 44px rail hit area spills 16px into the content column.
2. Two Label-size inline links (Projects row links, the Say hi address) lack the 44x44 coarse-pointer hit area that UI-SPEC requires for "every link".
3. Several display font sizes depend on CSS Module rules beating the global `.t-display` purely by stylesheet order. The codebase already defends against this exact risk once, with `.header.header`.

The info items are small maintainability points: magic counts that duplicate content length, a duplicated fit constant, a tautological unit test, loose typing on `PageTitle.slug`, and two guard gaps.

The known label letter-gap todo and the intended TWO / HAB / ITS heading were not re-reported.

## Warnings

### WR-01: Coarse-pointer rail hit areas overlap the page content column on phones

**File:** `components/letters/letters.module.css:103-112` (with `:135-138`, `components/shell/shell.module.css:14-16`, `styles/tokens.css:60-63`)
**Issue:** At max-width 820px, the rail is fixed at `left: 24px` and `--rail-col` is 36px. Page content therefore starts at `--grid-margin + --rail-col` = 16 + 36 = 52px. Under `(pointer: coarse)`, each rail `::before` gets `min-width: var(--hit-min)` (44px), which overrides `width: calc(36px - 8px)`. The hit area then spans x = 24 to 68px. The rail is `position: fixed; z-index: 4` above the un-stacked `.page`, so the left 16px of any content in the rail's vertical band (about y = 96 to 330px) is untappable: a tap there follows a rail letter instead. This hits the Say hi Display links (Email, LinkedIn, GitHub and Resume start at column 1), the Achievements/Experience/Facturo Display words, and, as the phone document scrolls, any row that passes under the rail. UI-SPEC line 119 requires that the 44x44 areas "never overlap a neighbour".
**Fix:** Keep the 44px hit area but anchor it so it stays left of the content edge (it can grow into the 24px left margin). Alternatively, widen the phone rail column to fit it. For example, raise `--rail-col` under `(max-width: 820px) and (pointer: coarse)` so that `--grid-margin + --rail-col >= 24px + 44px` (that is, `--rail-col: 52px`), then recompute `--phone-inset` and re-check the `DISPLAY_WORD_EM` fit maths:
```css
@media (max-width: 820px) and (pointer: coarse) {
  :root {
    --rail-col: 52px;
    --phone-inset: 84px; /* 2 x 16px margin + 52px rail column */
  }
}
```
Add a Playwright check under coarse/touch emulation: for each rail band y, `document.elementFromPoint(53, y)` must not resolve to a rail link.

### WR-02: Projects row links and the Say hi address have no 44x44 hit area on coarse pointers

**File:** `components/pages/projects-page.module.css:66-69`, `components/pages/say-hi-page.module.css:48-50`
**Issue:** UI-SPEC (line 119) says that under `(pointer: coarse)` "every link, rail letter and header/footer control has a 44x44px minimum hit area". The header, footer (`frame.module.css:71-79`), rail and Index list implement this. The Projects row links ("Live site", "Code", "Team site") and the Say hi address mailto are 12px Label text with a line-height of 1.3, about 16px tall, and have no coarse rule. That is also under the WCAG 2.2 SC 2.5.8 24px minimum, unless spacing alone satisfies the exception, and the Projects links sit tight against the row heading. axe with the configured wcag2a/2aa/21a/21aa tags does not catch this.
**Fix:**
```css
/* projects-page.module.css */
@media (pointer: coarse) {
  .link {
    display: inline-flex;
    align-items: center;
    min-height: var(--hit-min);
    min-width: var(--hit-min);
  }
}

/* say-hi-page.module.css */
@media (pointer: coarse) {
  .addr {
    display: inline-flex;
    align-items: center;
    min-height: var(--hit-min);
  }
}
```

### WR-03: Display sizes rely on CSS Module rules winning over global `.t-display` by source order only

**File:** `components/pages/achievements-page.module.css:10-16,90-92`, `components/pages/experience-page.module.css:30-34,39-41`, `components/pages/say-hi-page.module.css:34-38,57-61`, `components/pages/about-page.module.css:68-72` (cf. `components/frame/frame.module.css:81-82`)
**Issue:** `.t-display` in `styles/base.css:89-96` sets `font-size: var(--text-display)` with specificity (0,1,0). The module rules `.title`, `.head` and `.line` override `font-size` on the same element, also at (0,1,0). Their sizes (fit to six rows, the short-viewport Experience fit, the Say hi `--S` fit, phone `inherit`/TWO fit) apply only if the module stylesheet comes after `base.css`. `frame.module.css:81` already doubles a class, `.header.header`, because that order was judged unreliable. Next does not guarantee identical CSS ordering between dev and production, or across chunking changes. The desktop fit e2e tests would catch a regression in production, but the phone size paths (`font-size: inherit` on `.title`/`.head`) and dev mode are unguarded, and the defence is inconsistent.
**Fix:** Use the same defence as the header for each override, so the result no longer depends on order:
```css
/* achievements-page.module.css */
.title:global(.t-display) { font-size: min(/* unchanged */); }
/* experience-page.module.css */
.head:global(.t-display) { font-size: max(/* unchanged */); }
/* say-hi-page.module.css */
.line:global(.t-display) { font-size: min(/* unchanged */); }
/* about-page.module.css (phone) */
.title:global(.t-display) { font-size: min(/* unchanged */); }
```
Alternatively, wrap the `base.css` utilities in `@layer base` and leave the module rules unlayered, so modules always win.

## Info

### IN-01: About phone title hard-codes the TWO width instead of using `--word-em`

**File:** `components/pages/about-page.module.css:66-72`
**Issue:** `calc((100vw - var(--phone-inset)) / 1.49)` duplicates `DISPLAY_WORD_EM.TWO` in `lib/display-fit.ts:20`, which is otherwise used only by a test. If the font or tracking is re-measured, the two values can drift apart.
**Fix:** Set `style={displayFitStyle(about.titleRows[0]) as CSSProperties}` on the title, and use `/ var(--word-em)` in the CSS, as the other pages do.

### IN-02: Magic counts duplicate content length

**File:** `components/frame/frame.module.css:66`, `components/pages/achievements-page.module.css:13-14`
**Issue:** `width: calc(100% / 6)` assumes six sections, and `/ 6 / 0.82` assumes six title rows. Adding a section or changing `titleRows` silently breaks the progress bar or the title fit.
**Fix:** Pass `--page-count: sections.length` next to `--page-index` in `Footer.tsx`, and `--rows: achievements.titleRows.length` on the title, then divide by `var(--page-count)` / `var(--rows)`.

### IN-03: Tautological unit test in display-fit

**File:** `tests/display-fit.test.ts:29-33`
**Issue:** `min(64, 252 / em) * em <= 252` holds for any positive `em`, so the test cannot fail and gives false assurance that Achievements fits at 320px.
**Fix:** Assert something that can fail, for example `expect(DISPLAY_WORD_EM.Achievements * 64).toBeGreaterThan(252)` (so the clamp really is active at 320px), or drop it and rely on the e2e overflow check at 320x640.

### IN-04: `PageTitle.slug` is typed `string`, so section label ids can drift

**File:** `components/pages/Heading.tsx:24`
**Issue:** `Track.tsx:47` points `aria-labelledby` at `title-${s.slug}` with a typed `Slug`. Each page passes a hand-written string literal to `PageTitle`, so a typo would leave a section unlabelled without any type error. Only the shell unit test would catch it.
**Fix:** `readonly slug: Slug;` (import from `@/content/types`). Update `tests/heading.test.tsx:47`, which uses `"work"`, to use a real slug.

### IN-05: `Photo` throws on an empty `sources` array

**File:** `components/media/Photo.tsx:12`
**Issue:** `reduce` without an initial value throws `TypeError` on `[]`, and the prop type `readonly StaticImageData[]` allows an empty array.
**Fix:** Type it as non-empty, `readonly [StaticImageData, ...StaticImageData[]]`, or seed the reduce with `sources[0]` after a guard.

### IN-06: Content href guard accepts protocol-relative URLs

**File:** `tests/content.test.ts:30`
**Issue:** `/^(https:\/\/|mailto:|\/)/` also matches `//host/path`, which would let an off-site link pass the "root path" branch. Such a link would also open without `rel`, because only `external: true` lines get `noopener noreferrer`.
**Fix:** `const SAFE_HREF = /^(https:\/\/|mailto:|\/(?!\/))/;`

### IN-07: Hero wordmark stacks above the fixed header and footer

**File:** `components/letters/letters.module.css:33` (vs `components/frame/frame.module.css:21,46`)
**Issue:** The hero nav is `z-index: 6` and the header and footer are `z-index: 5`. The comment at line 31 says the phone document can scroll. If the index page ever does scroll on a phone, the absolute wordmark paints over the fixed frame instead of passing under it.
**Fix:** Give the hero `z-index: 4` (the same as the rail), unless it is meant to cover the frame. If so, add a comment saying so.

---

_Reviewed: 2026-11-08_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
