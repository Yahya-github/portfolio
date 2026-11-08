---
phase: 02-live-deploy-spike
plan: 06
subsystem: deploy
tags: [vercel, domain, https, headers, perf-baseline, preview]
requires: [02-05]
provides:
  - live production site at https://yahya-hallani.dev (Vercel, push-to-main deploys)
  - www.yahya-hallani.dev 308 to the apex
  - live proof of vercel.json headers (CSP, noindex, HSTS, nosniff) on / and the PDF
  - docs/reference/perf-baseline.md (SC4) linked from the design doc's performance budget
affects: [Phase 3 (Next exported 404 is what Vercel serves), Phase 4/5 (JS headroom ~18 kB gzip; gzip-vs-brotli budget question)]
tech-stack:
  added: [Vercel (hosting, Git integration)]
  patterns: [live checks via curl/openssl + BASE_URL Playwright run, live brotli transfer loop]
key-files:
  created: [docs/reference/perf-baseline.md]
  modified: [docs/superpowers/specs/2026-11-03-portfolio-design.md]
decisions:
  - "Vercel build uses pnpm 12.11.2 via ENABLE_EXPERIMENTAL_COREPACK=1 and Node 22.x from engines.node"
  - "Vercel serves the same JS bytes as the local build but at a lower brotli level than q11: live brotli transfer is 134.7 kB, not 112.6 kB"
metrics:
  duration: multi-session
  completed: 2026-11-07
---

# Phase 02 Plan 06: Vercel connection, live checks and baseline JS write-up Summary

https://yahya-hallani.dev is live on Vercel over HTTPS with a valid Let's Encrypt certificate. www redirects 308 to the apex, and every response carries the vercel.json CSP, noindex and security headers. The live page shows the build SHA of origin/main and loads only first-party assets. The baseline JS write-up is in `docs/reference/perf-baseline.md`, and the design doc links to it. It lands through a gated PR, which also proves the public preview and the redeploy on push.

## Tasks

| Task | Name | Commit | Result |
| ---- | ---- | ------ | ------ |
| 1 | Yahya connects Vercel (import, Corepack, domains, previews public) | none (dashboard) | Done by Yahya |
| 2 | Live checks | none (command output below) | PASS, all 7 checks |
| 3 | Baseline write-up via gated PR | 314c51d (branch `docs/perf-baseline`) | PR opened; merge by Yahya pending |

## Task 1: Vercel setup (Yahya)

- Imported `Yahya-github/portfolio` with the Next.js preset and default build settings (no Output Directory override).
- `ENABLE_EXPERIMENTAL_COREPACK=1` set for Production and Preview.
- Domains `yahya-hallani.dev` (primary) and `www.yahya-hallani.dev` (308 to the apex) attached.
- Deployment Protection (Vercel Authentication) disabled. System environment variables exposed. Toolbar off for previews.
- Build log (production deploy of `5d42303`, iad1, Vercel CLI 65.11.0):
  - **pnpm = 12.11.2**: `Detected ENABLE_EXPERIMENTAL_COREPACK=1 and "pnpm@12.11.2" in package.json`, then `Done in 29ms using pnpm v12.11.2`.
  - **node = 22.x**: the log does not print the Node version. The value comes from `package.json` `engines.node: "22.x"` (plus `.nvmrc` 22), which Vercel honours.
  - `Detected Next.js version: 16.4.5`, and both routes are static.

## Task 2: Live checks (2026-11-08 03:58 UTC)

1. **HTTPS and certificate:** `curl -sSfI https://yahya-hallani.dev/` → `HTTP/2 200` (no `-k`). Certificate: `subject=CN=*.yahya-hallani.dev`, `issuer=C=US, O=Let's Encrypt, CN=YR2`, `notAfter=Feb  6 01:48:23 2027 GMT`, SAN `DNS:*.yahya-hallani.dev, DNS:yahya-hallani.dev`.
2. **www:** `HTTP/2 308`, `location: https://yahya-hallani.dev/`.
3. **Headers (assumption A1 holds):** `/` carries `x-robots-tag: noindex, nofollow`, `content-security-policy: default-src 'self'; ...` (exactly the vercel.json value), `strict-transport-security: max-age=63072000; includeSubDomains; preload`, `x-content-type-options: nosniff`, `x-frame-options: DENY`, `referrer-policy` and `permissions-policy`. `/yahya-hallani-resume.pdf` → `200`, `content-type: application/pdf`, `x-robots-tag: noindex, nofollow`, same CSP.
4. **404:** `/nope` → `404`. The body is Next's exported 404 (`<title>404: This page could not be found.</title>`; `grep -c 404` = 1). Phase 3 can rely on `out/404.html` being served (Pitfall 9).
5. **Deployed SHA:** live `build 5d42303` == `git rev-parse --short=7 origin/main` (`5d42303`).
6. **First-party only:** `BASE_URL=https://yahya-hallani.dev pnpm test:e2e -g "first-party"` → 1 passed. The HTML contains no absolute `http(s)://` src or href.
7. **Live brotli transfer: 134.7 kB** (5 files, `Accept-Encoding: br`, `content-encoding: br` confirmed). Live gzip transfer: 133.4 kB.

Extra findings:

- **Cache rule covers Vercel's asset path.** Vercel serves hashed assets under `/_next/static/immutable/...`. The vercel.json rule `/_next/static/(.*)` matches those paths: `/_next/static/immutable/chunks/1cq02bvkjj-yy.js` → `cache-control: public,max-age=31536000,immutable`. vercel.json needs no change.
- **Vercel's brotli level is below q11.** The 5 live chunks are byte-for-byte the local baseline (re-compressed: 447.4 kB raw, 132.3 kB gzip -9, 112.7 kB brotli q11), but Vercel sends 134.7 kB of brotli. The q11 figure of about 112.6 kB is therefore not what visitors download. The gzip-vs-brotli question in perf-baseline.md records this.

## Task 3: Baseline PR

- Step 0: local `main` == `origin/main` == `5d42303` before branching, so no push was needed.
- `docs/reference/perf-baseline.md` records the method, a results table (placeholder 5 / 447 / 132.1 / 112.5, spike empty page 5 / 447 / 132.1 / 112.6, `next/image` variant 6 / 462 / 137.8 / 117.7), the live brotli transfer of 134.7 kB, about 18 kB of gzip headroom, and the gzip-vs-brotli open question.
- Design doc line 33 gained: `Baseline (Phase 2, 2026-11-07): the empty App Router build loads 132.1 kB gzip / 112.5 kB brotli of JS on \`/\`; see \`docs/reference/perf-baseline.md\`.`
- The PR, its checks and its public preview are recorded in the executor's checkpoint return. **Pending (Yahya):** merge the PR without `--admin`, after which production must show `build <squash sha>` == `origin/main` and differ from `5d42303`.

## Deviations from Plan

- **Merge is done by Yahya, not the executor** (orchestrator instruction). Task 3 steps 7-9 (merge, local reset, redeploy proof, branch cleanup) are deferred to after his merge.
- **Live brotli is higher than the q11 baseline** (134.7 kB vs 112.6 kB). This is a measurement finding, not a code change. It is documented in perf-baseline.md.

## Self-Check: PASSED

- FOUND: docs/reference/perf-baseline.md
- FOUND: commit 314c51d on docs/perf-baseline
- FOUND: `perf-baseline.md` in docs/superpowers/specs/2026-11-03-portfolio-design.md
