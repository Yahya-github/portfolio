---
phase: 02-live-deploy-spike
reviewed: 2026-11-07T00:00:00Z
depth: standard
files_reviewed: 25
files_reviewed_list:
  - .github/workflows/ci.yml
  - .gitignore
  - .nvmrc
  - .prettierignore
  - .prettierrc
  - app/fonts.ts
  - app/globals.css
  - app/layout.tsx
  - app/page.tsx
  - e2e/a11y.spec.ts
  - e2e/assets.spec.ts
  - e2e/csp.spec.ts
  - eslint.config.mjs
  - lib/build-info.ts
  - next.config.ts
  - package.json
  - playwright.config.ts
  - pnpm-workspace.yaml
  - scripts/measure-js.mjs
  - tests/build-info.test.ts
  - tests/setup.ts
  - tests/vercel-config.test.ts
  - tsconfig.json
  - vercel.json
  - vitest.config.mts
findings:
  critical: 0
  warning: 2
  info: 5
  total: 7
status: issues_found
---

# Phase 2: Code Review Report

**Reviewed:** 2026-11-07
**Depth:** standard
**Files Reviewed:** 25
**Status:** issues_found

## Summary

I reviewed the Phase 2 deploy spike: the Next.js 16.4.5 static export scaffold, the placeholder page, the Vercel header config, the CI workflow, the JS-budget script, and the Vitest and Playwright suites. The code is small and tidy. No secrets are present. The CSP is first-party only, and `'unsafe-inline'` for scripts is a documented static-export trade-off. Assets are self-hosted: I checked the built `out/` and the font is served from `/_next/static/media`. The referenced assets exist (`assets/portrait-800.webp`, `public/yahya-hallani-resume.pdf`, `app/fonts/InstrumentSans-wdth-wght.woff2`).

I found no critical issues. Two warnings are about gates that can pass when they should fail:
- The font-loaded e2e assertion also matches the generated fallback face.
- The JS budget gate passes at 0 kB if its HTML scraping matches no scripts.

The info items are small hardening suggestions.

## Warnings

### WR-01: Font-loaded assertion also matches the generated "instrumentSans Fallback" face

**File:** `e2e/assets.spec.ts:18-24`
**Issue:** `next/font/local` writes two `@font-face` rules (I checked them in the built CSS):
- `font-family: instrumentSans` (the real WOFF2)
- `font-family: instrumentSans Fallback` with `src: local(Arial)`

The test checks `f.family.includes("instrumentSans")`, so a loaded fallback face also satisfies it. If the self-hosted WOFF2 fails to load (404, wrong MIME, CSP `font-src` regression), the test can still pass on any runner where `local(Arial)` resolves. That defeats the DEP-02 self-hosted-font proof this test exists for.
**Fix:** Match the exact family and drop quotes before comparing:
```ts
const fontLoaded = await page.evaluate(async () => {
  await document.fonts.ready;
  return [...document.fonts].some(
    (f) =>
      f.status === "loaded" &&
      f.family.replace(/["']/g, "") === "instrumentSans",
  );
});
```
You could also assert that a request to `/_next/static/media/*.woff2` returned 200 (`page.waitForResponse`).

### WR-02: JS budget gate passes at 0 kB if no scripts are matched

**File:** `scripts/measure-js.mjs:24-36, 64-69`
**Issue:** The script finds chunks by regex-scraping `out/index.html`, using `src="...\.js"` and preload `href="...\.js"`. Several changes would make it match nothing:
- Next changes its markup or attribute quoting.
- Asset URLs gain a query string (`.js?dpl=...` from Vercel skew protection or a deployment ID).
- An `assetPrefix` makes `src` absolute.

In each case `files` is empty, totals are 0, and the `--max-gzip-kb 150` gate in CI (`.github/workflows/ci.yml:59`) passes silently. A budget gate should fail closed.
**Fix:** Fail when nothing was measured, and allow a query string in the match:
```js
/<script\b[^>]*\bsrc="([^"?]+\.js)(?:\?[^"]*)?"[^>]*>/g
// ...
if (files.size === 0) {
  console.error(`No JS chunks found in ${join(outDir, "index.html")}; refusing to report 0 kB`);
  process.exit(2);
}
```

## Info

### IN-01: First-party origin check uses a string prefix

**File:** `e2e/assets.spec.ts:11-12`
**Issue:** `u.startsWith(origin)` also accepts origins that only share the prefix. For example, `http://localhost:41730` passes for `http://localhost:4173`. When `BASE_URL=https://yahya-hallani.dev` is set, `https://yahya-hallani.dev.evil.com` also passes. The impact is low, but this is the D-13 "zero third-party requests" proof.
**Fix:** `if (!u.startsWith("data:") && new URL(u).origin !== origin) foreign.push(u);`

### IN-02: CSP header lookup is case-sensitive in e2e but case-insensitive in the unit test

**File:** `e2e/csp.spec.ts:12-13` (compare `tests/vercel-config.test.ts:23`)
**Issue:** If someone writes the key in `vercel.json` with different casing, `productionCsp` becomes `""`. The guard at line 56 then fails with a confusing message, while the unit test still passes.
**Fix:** Compare with `h.key.toLowerCase() === "content-security-policy"`. Better, move the loader and type into one shared helper (for example `lib/vercel-config.ts`) that both tests import. That also removes the duplicated `HeaderEntry` and `VercelConfig` types.

### IN-03: ESLint ignores omit `coverage/` and `.vercel/`

**File:** `eslint.config.mjs:8-17`
**Issue:** Flat config does not read `.gitignore`. Running `vitest --coverage` writes `coverage/lcov-report/*.js`, and running `vercel build` writes `.vercel/output/**`. A later `pnpm lint` (`--max-warnings 0`) would then lint generated JS and fail locally.
**Fix:** Add `"coverage/**"` and `".vercel/**"` to `globalIgnores`.

### IN-04: `.env*` also ignores a future `.env.example`

**File:** `.gitignore:18`
**Issue:** The broad glob blocks committing a documented env template later.
**Fix:** Add `!.env.example` after the `.env*` line when one is needed.

### IN-05: `e2e` can run against a missing or stale `out/` locally

**File:** `playwright.config.ts:15-21`
**Issue:** `serve out` starts even when `out/` is missing or stale, and `reuseExistingServer: !process.env.CI` attaches to whatever is already listening on port 4173. A local `pnpm test:e2e` without a fresh `pnpm build` can then fail or pass in misleading ways. CI is not affected, because it builds first.
**Fix:** Add a `pretest:e2e` script that checks for `out/index.html`, or document that `pnpm build` must run first. Port 4173 is shared with `vite preview`, so pick a less common port.

---

_Reviewed: 2026-11-07_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
