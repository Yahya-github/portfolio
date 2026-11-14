---
phase: 07-copy-sharing-and-launch
reviewed: 2026-11-12T00:00:00Z
depth: standard
files_reviewed: 18
files_reviewed_list:
  - app/layout.tsx
  - app/not-found.tsx
  - app/robots.ts
  - app/sitemap.ts
  - components/not-found/NotFoundLetters.tsx
  - components/not-found/NotFoundPage.tsx
  - components/not-found/not-found.module.css
  - components/pages/AboutPage.tsx
  - content/about.ts
  - content/not-found.ts
  - content/site.ts
  - lib/metadata.ts
  - lib/structured-data.ts
  - lighthouserc.json
  - package.json
  - scripts/build-share-card.mjs
  - vercel.json
  - .github/workflows/ci.yml
findings:
  critical: 0
  warning: 1
  info: 7
  total: 8
status: issues_found
---

# Phase 7: Code Review Report

**Reviewed:** 2026-11-12
**Depth:** standard
**Files Reviewed:** 18
**Status:** issues_found

## Summary

The listed files focused on the requested areas are sound. No critical issues.

- JSON-LD: the payload is built from static `content/site.ts` values and escaped with `<` -> `<`, so a `</script>` breakout is not possible. Safe.
- robots/sitemap: the seven routes (index, 5 sections, facturo) use trailing slashes that match the canonicals. The 404 is excluded. `force-static` is set as `output: export` requires.
- vercel.json: no `X-Robots-Tag` or noindex remains. Remaining headers are coherent. Vercel adds noindex to preview deployments on its own.
- Open Graph shallow merge: every builder (`pageMetadata`, `deepDiveMetadata`, `notFoundMetadata`) spreads `OG_BASE`, so the share image survives the merge. The trap is handled. Remaining nuance is in IN-02.
- 404 a11y: single `h1` ("404 Page not found" via a visually-hidden suffix), `main` has an id and `tabIndex -1` for the skip link, nav is labelled, glyphs are `aria-hidden` with the visible caption as the link name, and hit targets are sized. Fine.
- AboutPage links: `target="_blank"` is paired with `rel="noopener noreferrer"`. Good. One latent bug (WR-01).
- CI: least-privilege `permissions`, frozen lockfile, and the Playwright image tag matches `@playwright/test` 1.65.0.

Not reviewed in depth: tests, e2e specs, favicon and glyph scripts, `card.html`, `icon.svg`, `types.ts`, `resume-facts` test. They were in the file list but not read.

## Warnings

### WR-01: AboutPage silently drops a link when its text is not found or is out of order

**File:** `components/pages/AboutPage.tsx:14-15`
**Issue:** `renderParagraph` does `if (at < 0) continue;`. If copy in `content/about.ts` is later edited so that a `paragraphLinks[].text` no longer appears verbatim (for example "Pokemon Showdown" reworded), or the links are listed in a different order than they appear, that link silently disappears. Out of order, the later link's text is searched only in the remainder, so it is skipped. Nothing fails in the build or in CI.
**Fix:** Fail loudly. Throw instead of continuing, so the static build breaks:
```ts
const at = rest.indexOf(link.text);
if (at < 0) {
  throw new Error(`about.paragraphLinks: "${link.text}" not found in order`);
}
```
Alternatively, add a unit test asserting that each link text occurs in `about.paragraph` in the listed order.

## Info

### IN-01: `serialiseJsonLd` escapes only `<`

**File:** `lib/structured-data.ts:17-19`
**Issue:** The escape is sufficient to prevent `</script>` breakout. The parameter is `unknown`, and `JSON.stringify(undefined)` returns `undefined`, so `.replace` would throw. It is also common practice to escape U+2028, U+2029 and `&` for defence in depth. Not exploitable today because the input is static.
**Fix:** Type the parameter as `object` and add `.replace(/ /g, "\\u2028").replace(/ /g, "\\u2029")`.

### IN-02: Twitter card has no title/description, and OG on the 404 lacks a url

**File:** `lib/metadata.ts:22-27, 60-66`
**Issue:** Root `twitter` sets only card and images. Per-page builders set no `twitter.title` or `twitter.description`. Most scrapers fall back to `og:*`, but not all. If a page later sets `twitter`, it will replace the root one wholesale (same shallow-merge trap, not covered by a shared base). The 404 intentionally omits `og:url`, which is fine.
**Fix:** Introduce a `TWITTER_BASE` spread alongside `OG_BASE`, and add `title` and `description` to it in the page builders.

### IN-03: CSP allows `'unsafe-inline'` for scripts

**File:** `vercel.json:9`
**Issue:** Needed today for the inline flag and opening scripts, so it is a known trade-off. It weakens XSS protection, although the site has no user input or dynamic HTML.
**Fix:** Optional later: hash-based `script-src` (`'sha256-...'`) generated at build time. Note that the `application/ld+json` block is not executed and is not governed by `script-src`.

### IN-04: HSTS `preload` with `includeSubDomains`

**File:** `vercel.json:13`
**Issue:** Preload is effectively irreversible and covers all subdomains of the apex. Fine if intended. Make sure every present and future subdomain serves HTTPS before submitting to the preload list.
**Fix:** Keep as is if deliberate. Otherwise drop `preload` until ready.

### IN-05: External links open in a new tab with no cue

**File:** `components/pages/AboutPage.tsx:18-26`
**Issue:** The inline links use `target="_blank"` with no visual or accessible hint (WCAG G201 is advisory). Not a failure.
**Fix:** Optionally add a visually-hidden " (opens in a new tab)" span, or drop `target="_blank"` for inline prose links.

### IN-06: CI actions pinned by major tag, and concurrency cancels main runs

**File:** `.github/workflows/ci.yml:10-12, 18-21`
**Issue:** Third-party actions (`pnpm/action-setup`, `actions/*`) are pinned to mutable major tags rather than commit SHAs. `cancel-in-progress: true` also cancels an in-flight push-to-main run when another push lands, which can leave a main commit with no completed check.
**Fix:** Pin to SHAs (Dependabot can maintain them). Use `cancel-in-progress: ${{ github.event_name == 'pull_request' }}`.

### IN-07: share-card script leaves a bad file and gives poor errors

**File:** `scripts/build-share-card.mjs:37-46, 59, 72-73`
**Issue:** If `.yahya` or `.row` is missing from the template, `querySelector(...)` returns null and the error is an opaque TypeError. The screenshot is written to `public/share-card.png` before the size checks, so a failed check leaves an oversized file in `public/`. Paths are cwd-relative. Local-only tool, low impact.
**Fix:** Screenshot to a temp path, validate, then rename. Guard the selectors with explicit `fail("missing .yahya")`. Resolve paths from `import.meta.url`.

---

_Reviewed: 2026-11-12_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
