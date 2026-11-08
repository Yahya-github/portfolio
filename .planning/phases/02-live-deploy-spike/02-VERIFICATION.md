---
phase: 02-live-deploy-spike
verified: 2026-11-08T04:20:00Z
status: passed
score: 4/4 roadmap success criteria verified (plus 6/6 plan 06 truths)
overrides_applied: 0
re_verification: false
gaps: []
deferred: []
human_verification: []
---

# Phase 2: Live Deploy Spike Verification Report

**Phase Goal:** A minimal build is live at yahya-hallani.dev on Vercel, which proves the hosting, domain, assets and CI before any real feature work.
**Verified:** 2026-11-08 (live site and GitHub state checked read-only at about 04:12 UTC)
**Status:** passed
**Re-verification:** No, initial verification

## Goal Achievement

### Observable Truths (ROADMAP success criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | https://yahya-hallani.dev shows the placeholder over HTTPS with no certificate warning, and a push to main redeploys on Vercel | VERIFIED | `curl -sSI https://yahya-hallani.dev/` (no `-k`) returns `HTTP/2 200`, `server: Vercel`, HSTS `max-age=63072000; includeSubDomains; preload`. The page body is the placeholder and ends with `build f930b62`, which equals `git rev-parse --short=7 origin/main`. `www` returns `HTTP/2 308` with `location: https://yahya-hallani.dev/`. PR #2 was merged at 04:03:59Z (squash `f930b62e...`), it had a green `Vercel` status check, and the index `last-modified` is 04:04:22Z, about 23 s after the merge. The SHA moved from `5d42303` (recorded in 02-06-SUMMARY) to `f930b62`, so push-to-main redeploy is shown. The Let's Encrypt certificate (CN=*.yahya-hallani.dev, valid to 2027-02-06) comes from the 02-06 summary. The live curl success without `-k` is consistent with it. |
| 2 | The placeholder renders the chosen font, one image and a resume PDF link, all served from yahya-hallani.dev with no third-party requests | VERIFIED | The live HTML references only root-relative paths (`/_next/static/immutable/media/...woff2`, `.../portrait-800...webp`, `/yahya-hallani-resume.pdf`) and has no `http(s)://` src or href. All three fetch with 200 and the right type: `font/woff2` (88,676 B), `image/webp` (37,758 B), `application/pdf` (62,790 B). The live CSS `@font-face` uses `instrumentSans` with that woff2, and the `--font-sans` stack leads with it. `<h1>YAHYA</h1>` uses the weight/stretch axes, `<img alt="Yahya Hallani, greyscale portrait">` is present, and `<a href="/yahya-hallani-resume.pdf">Resume (PDF)</a>` is present. The CSP is `default-src 'self'` with no external origins. 02-06 also records `BASE_URL=https://yahya-hallani.dev pnpm test:e2e -g "first-party"` passing. |
| 3 | A PR runs lint, type check, unit tests and Playwright against the built export, and a failure blocks the merge | VERIFIED | `.github/workflows/ci.yml` has jobs lint, typecheck, unit and e2e (e2e builds `out/` and serves it). On PR #2 all four checks report SUCCESS. Branch protection on `main` (read via `gh api`) requires contexts lint, typecheck, unit and e2e (all `app_id` 15368) plus a pull request. Gate proof: PR #1 (deliberately failing unit test) showed `unit=FAILURE` and `mergeStateStatus=BLOCKED`. It is now CLOSED and unmerged, and `tests/gate-proof.test.ts` is not on main. `enforce_admins=false` is the intended D-07 admin bypass, not a gap. |
| 4 | The baseline JS size of the empty App Router build is measured and written down | VERIFIED | `docs/reference/perf-baseline.md` exists on main with the method, a results table (5 files, 447 kB raw, 132.1 kB gzip, 112.5 kB brotli q11), the live brotli transfer and the headroom. The design doc line 33 links to it. I independently fetched the 5 live chunks with `Accept-Encoding: br`: 50630 + 73244 + 4089 + 3649 + 6279 = 137,891 B = 134.7 KiB, which matches the written live figure. The gate `pnpm measure:js -- --max-gzip-kb 150` is in CI. |

**Score:** 4/4 truths verified

### Plan 06 truths (must_haves, extra detail)

| Truth | Status | Evidence |
|-------|--------|----------|
| apex 200 over HTTPS, valid cert | VERIFIED | Above |
| www 308 to apex | VERIFIED | Above |
| Live `build <sha>` equals origin/main and updates after a merge | VERIFIED | `f930b62` live and on origin/main after the PR #2 merge; was `5d42303` before |
| Live `/` and the PDF carry noindex and the CSP | VERIFIED | `x-robots-tag: noindex, nofollow` and the exact vercel.json CSP on `/`. `x-robots-tag` also on the PDF. The earlier 02-06 curl showed the PDF CSP. |
| PR preview opens without Vercel login | VERIFIED (accepted evidence) | PR #2 has a passing `Vercel` status, and Deployment Protection was disabled per 02-06. I did not fetch the preview URL, so this rests on the executor record. Not required by the roadmap success criteria. |
| Baseline written and referenced | VERIFIED | Above |

### Required Artifacts

| Artifact | Status | Details |
|----------|--------|---------|
| `vercel.json` (headers) | VERIFIED | Header values are live on production and in the unit test |
| `app/page.tsx`, `app/layout.tsx`, `app/fonts.ts`, `app/fonts/InstrumentSans-wdth-wght.woff2` | VERIFIED | Content renders live |
| `assets/portrait-800.webp`, `public/yahya-hallani-resume.pdf` | VERIFIED | Tracked on main and served 200 |
| `eslint.config.mjs` | VERIFIED | The blocker in 02-02-SUMMARY was resolved: the file exists on main and the lint job is green |
| `.github/workflows/ci.yml`, `playwright.config.ts`, `e2e/*.spec.ts`, `scripts/measure-js.mjs`, `tests/*.test.ts` | VERIFIED | Present, wired into CI, green on PR #2 |
| `docs/reference/perf-baseline.md` | VERIFIED | On main, linked from the design doc |

### Key Link Verification

| From | To | Via | Status |
|------|----|-----|--------|
| GitHub main | Vercel production | Vercel GitHub App webhook | WIRED. Merge at 04:03:59Z, production updated at 04:04:22Z with the new SHA |
| Vercel DNS | Vercel project | Domain attached | WIRED (apex 200, www 308) |
| ci.yml job names | branch protection contexts | Required status checks | WIRED, 4 of 4 names match |

### Requirements Coverage

| Requirement | Source Plans | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| DEP-01 | 02-01, 02-04, 02-05, 02-06 | Live on Vercel at yahya-hallani.dev over HTTPS; apex canonical, www redirects to apex | SATISFIED | SC1 evidence |
| DEP-02 | 02-02, 02-03, 02-06 | Fonts, images and the resume are self-hosted (no hotlinked assets) | SATISFIED | SC2 evidence |

REQUIREMENTS.md maps only DEP-01 and DEP-02 to Phase 2, and both are claimed by plans, so there are no orphaned requirements. The unchecked boxes are intentionally left for the orchestrator.

### Review Warnings Assessment

- **WR-01 (font test also matches the Fallback face):** does not undermine SC2. The e2e assertion is weak, but I verified the real font independently on production: the live CSS `@font-face` points at the woff2, the woff2 returns 200 `font/woff2` and is preloaded, and the HTML has zero third-party URLs. The residual risk is a future regression going unnoticed by that test, so carrying the fix into a later phase is worthwhile.
- **WR-02 (measure-js passes at 0 files):** does not undermine SC4. The recorded baseline has 5 files and 447 kB, and my independent live fetch of 5 distinct chunks matches the written 134.7 kB figure. The fail-open gate is a hardening item for later phases, not a defect in the measured number.

### Anti-Patterns Found

| File | Pattern | Severity | Impact |
|------|---------|----------|--------|
| `e2e/assets.spec.ts:21` | Loose font-family match (WR-01) | Warning | Test could pass on the fallback face; live check compensates |
| `scripts/measure-js.mjs` | No guard for zero matched files (WR-02) | Warning | Gate could fail open; the current figure is real |

No blockers. The page content "Deploy pipeline test, Instrument Sans body text." is deliberately a placeholder (D-09), which is the intent of a spike.

### Housekeeping Notes (not gaps)

- 02-06-SUMMARY.md still says Task 3 is pending merge and carries no post-merge SHA. The post-merge evidence is above (merge commit `f930b62`, production serving it). The orchestrator may append it.
- `enforce_admins=false` means an admin can merge past a red check. This is the intended D-07 choice, and the gate was proven to BLOCK a non-admin merge.
- Open question carried forward (not a Phase 2 gap): gzip vs brotli budget, since Vercel's live brotli (134.7 kB) is far above the q11 figure.

### Human Verification Required

None. Everything required by the success criteria was checked programmatically against the live site and GitHub.

### Gaps Summary

No gaps. All four roadmap success criteria and both requirements (DEP-01, DEP-02) are achieved in the actual codebase and on the live site.

---

_Verified: 2026-11-08_
_Verifier: Claude (gsd-verifier)_
