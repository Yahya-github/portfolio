---
phase: 2
slug: live-deploy-spike
status: planned
nyquist_compliant: true
wave_0_complete: false
created: 2026-11-07
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Source: `02-RESEARCH.md` §Validation Architecture.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 5.1.0 (jsdom 31) + Playwright 1.65.0 (Chromium) + @axe-core/playwright 4.14.0 |
| **Config file** | `vitest.config.mts` (02-02-T1), `playwright.config.ts` (02-03-T2) |
| **Quick run command** | `pnpm lint && pnpm typecheck && pnpm test` |
| **Full suite command** | `pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm measure:js -- --max-gzip-kb 150 && pnpm test:e2e` |
| **Filtered unit run** | `pnpm exec vitest run <filter>` (do not rely on `pnpm test -- <filter>` forwarding) |
| **Estimated runtime** | ~90 seconds (full, local) |

---

## Sampling Rate

- **After every task commit:** run `pnpm lint && pnpm typecheck && pnpm test`, once the scaffold exists (from 02-02-T1 on)
- **After every plan wave:** run the full suite command
- **Before `/gsd-verify-work`:** the full suite is green in CI on main, and every live check below passes
- **Max feedback latency:** 120 seconds

---

## Per-Task Verification Map

Task IDs use `{phase}-{plan}-T{n}`.

| Task ID | Req / SC | Behavior | Test Type | Automated Command | File Exists | Status |
|---------|----------|----------|-----------|-------------------|-------------|--------|
| 02-01-T1 | D-03 | Old domain gone from live docs (except CLAUDE.md/STACK.md, handled in T2); ARCHITECTURE "not bought" row fixed | grep | `! git grep -n "yahya-h\.dev" -- ':!.planning/phases/' ':!CLAUDE.md' ':!.planning/research/STACK.md'` | — | ⬜ pending |
| 02-01-T2 | D-03 / folded todo | Old domain gone everywhere outside `.planning/phases/`; CLAUDE.md stack has no Pages/basePath/CNAME prescriptions | grep | `! git grep -n "yahya-h\.dev" -- ':!.planning/phases/' && ! grep -nEi "configure-pages\|withBase\|CNAME\|PAGES_BASE_PATH" CLAUDE.md` | — | ⬜ pending |
| 02-02-T1 | DEP-02 (toolchain) | Pins and configs are in place, with export config and no basePath | script | `node -e` package.json pin check + `grep -q 'output: "export"' next.config.ts` | ❌ W0 configs | ⬜ pending |
| 02-02-T2 | SC1 redeploy proof | `shortSha()` returns the 7-char SHA or "local" | unit | `pnpm exec vitest run build-info` | ❌ W0 `tests/build-info.test.ts` | ⬜ pending |
| 02-02-T2 | DEP-02 / SC2 | Built HTML has no `http(s)://` asset URLs; font, webp and PDF are emitted; noindex meta present (D-12) | smoke | `pnpm build && ! grep -Eo '(src\|href)="https?://' out/index.html && grep -q 'content="noindex, nofollow"' out/index.html` | — | ⬜ pending |
| 02-03-T1 | D-12 / D-13 | vercel.json has X-Robots-Tag noindex, CSP `default-src 'self'`, HSTS, nosniff, DENY; no outputDirectory | unit | `pnpm exec vitest run vercel-config` | ❌ W0 `tests/vercel-config.test.ts` | ⬜ pending |
| 02-03-T1 | SC4 | Baseline JS is measured; the gate fails above the limit (negative control at 100) | script | `pnpm measure:js -- --max-gzip-kb 150 && ! pnpm measure:js -- --max-gzip-kb 100` | ❌ W0 `scripts/measure-js.mjs` | ⬜ pending |
| 02-03-T2 | DEP-02 / SC2, D-12 | Zero non-origin requests on `/`; Instrument Sans loads; img decodes; PDF returns 200 `application/pdf`; meta noindex | e2e | `pnpm test:e2e -g "first-party"` | ❌ W0 `e2e/assets.spec.ts` | ⬜ pending |
| 02-03-T2 | D-13 | Page runs under the production CSP with zero violations; the strict negative control reports violations | e2e | `pnpm test:e2e -g "CSP"` | ❌ W0 `e2e/csp.spec.ts` | ⬜ pending |
| 02-03-T2 | A11y baseline | axe finds no WCAG A/AA violations on `/` | e2e | `pnpm test:e2e -g "axe"` | ❌ W0 `e2e/a11y.spec.ts` | ⬜ pending |
| 02-03-T3 | SC3 (CI shape) | Four jobs named lint, typecheck, unit, e2e; no paths filters, no pull_request_target, no secrets | script | `python3 -c` YAML job-name check + `! grep -nE "paths:\|pull_request_target\|secrets\." .github/workflows/ci.yml` | ❌ W0 `.github/workflows/ci.yml` | ⬜ pending |
| 02-04-T1 | D-06 | No secret-like tracked files; single commit identity; nothing pushed before sign-off | script | `test -z "$(git remote)" && ! git ls-files \| grep -iE '\.(env\|pem\|key)$\|client_secret\|fonts-private'` + gitleaks git/dir scans | — | ⬜ pending |
| 02-04-T2 | D-06 | Yahya signs off on publishing, including `.planning/` and `docs/` | manual | checkpoint:human-action ("public ok") | — | ⬜ pending |
| 02-04-T3 | D-05 / SC3 | Repo is public, main is pushed, first CI run on main is green | API | `gh run list -R Yahya-github/portfolio --workflow CI --branch main --limit 1 --json conclusion --jq '.[0].conclusion'` = `success` | — | ⬜ pending |
| 02-05-T1 | SC3 / D-07 | Protection requires lint, typecheck, unit, e2e; admins not enforced; 0 approvals | API | `gh api repos/Yahya-github/portfolio/branches/main/protection --jq ...` = `e2e,lint,typecheck,unit false 0` | — | ⬜ pending |
| 02-05-T2 | SC3 | A failing check blocks the merge | scripted PR | throwaway PR with a failing unit test → `unit=FAILURE`, `mergeStateStatus` = `BLOCKED`, non-admin merge refused; PR closed and branch deleted | — | ⬜ pending |
| 02-06-T1 | DEP-01, D-02, D-08, D-14 | Vercel import, Corepack env var, domains + www 308, previews unprotected, system env vars exposed | manual | checkpoint:human-action; then `curl -sSfI https://yahya-hallani.dev/` | — | ⬜ pending |
| 02-06-T2 | DEP-01 / SC1 | HTTPS 200 with a valid cert | live | `curl -sSfI https://yahya-hallani.dev/ \| head -1` + `openssl s_client ... \| openssl x509 -noout -issuer -enddate` | — | ⬜ pending |
| 02-06-T2 | D-02 | www → apex 308 | live | `curl -sI https://www.yahya-hallani.dev/ \| grep -Ei '^(HTTP\|location)'` | — | ⬜ pending |
| 02-06-T2 | D-12 live | Headers present on the HTML and the PDF | live | `curl -sI https://yahya-hallani.dev/yahya-hallani-resume.pdf \| grep -i x-robots-tag` | — | ⬜ pending |
| 02-06-T2 | DEP-02 live | Live page makes only first-party requests | live (local run) | `BASE_URL=https://yahya-hallani.dev pnpm test:e2e -g "first-party"` | — | ⬜ pending |
| 02-06-T2 | SC1 | Deployed SHA matches origin/main | live | `curl -s https://yahya-hallani.dev/ \| grep -o "build [0-9a-f]\{7\}"` == `git rev-parse --short=7 origin/main` | — | ⬜ pending |
| 02-06-T3 | D-14 | Preview URL opens without a login | live | `curl -s -o /dev/null -w '%{http_code}' <preview-url>` = 200 | — | ⬜ pending |
| 02-06-T3 | SC1 | Push to main redeploys (the SHA changes after the gated merge) | live | poll `curl -s https://yahya-hallani.dev/ \| grep -o "build [0-9a-f]\{7\}"` == new `git rev-parse --short=7 origin/main` | — | ⬜ pending |
| 02-06-T3 | SC4 | Baseline is written down and linked from the design doc | grep | `grep -q "Live brotli transfer" docs/reference/perf-baseline.md && grep -q perf-baseline.md docs/superpowers/specs/2026-11-03-portfolio-design.md` | ❌ `docs/reference/perf-baseline.md` | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

Sampling continuity: no 3 consecutive tasks lack an automated verify. The only manual-only tasks are 02-04-T2 and 02-06-T1, and each is followed directly by an automated task.

---

## Wave 0 Requirements

All of these are created by plans 02-02 and 02-03 before any check depends on them:

- [ ] `vitest.config.mts`, `tests/setup.ts`: framework config (02-02-T1)
- [ ] `playwright.config.ts`: `serve out` webServer with a `BASE_URL` override (02-03-T2)
- [ ] `tests/build-info.test.ts` (02-02-T2), `tests/vercel-config.test.ts` (02-03-T1)
- [ ] `e2e/assets.spec.ts`, `e2e/csp.spec.ts`, `e2e/a11y.spec.ts` (02-03-T2)
- [ ] `scripts/measure-js.mjs` (02-03-T1)
- [ ] `pnpm exec playwright install chromium` locally (02-02-T1); `--with-deps chromium` in CI (02-03-T3)

Folded v7 todo (WR-04..IN-01): scaffold readiness only (jsdom + user-event, Playwright reduced-motion emulation). Phase 2 has no tests for those behaviours.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Vercel import, Corepack env var, domain attach, www redirect, preview protection off, system env vars exposed | DEP-01, D-02, D-08, D-14 | Needs Yahya's Vercel dashboard login | 02-06-T1 checkpoint:human-action; afterwards verified by the live curl checks in 02-06-T2/T3 |
| Public-safety sign-off before the first push (including `.planning/` going public) | D-06 | Human judgement on what is private | 02-04-T2: review the gitleaks scan output and get explicit confirmation from Yahya |
| Merge blocked by a failing check | SC3 | Needs a real PR on GitHub | Scripted throwaway PR in 02-05-T2 |

---

## Validation Sign-Off

- [x] All tasks have an `<automated>` verify or a Wave 0 dependency
- [x] Sampling continuity: no 3 consecutive tasks without an automated verify
- [x] Wave 0 covers every MISSING reference
- [x] No watch-mode flags (`vitest run`, `playwright test`; `gh pr checks --watch` only waits on remote CI)
- [x] Feedback latency < 120s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** plans approved for execution. `wave_0_complete` becomes true once 02-02 and 02-03 have run.
