---
phase: 2
slug: live-deploy-spike
status: draft
nyquist_compliant: false
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
| **Config file** | `vitest.config.mts`, `playwright.config.ts` (none yet — Wave 0 installs) |
| **Quick run command** | `pnpm lint && pnpm typecheck && pnpm test` |
| **Full suite command** | `pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm measure:js -- --max-gzip-kb 150 && pnpm test:e2e` |
| **Estimated runtime** | ~90 seconds (full, local) |

---

## Sampling Rate

- **After every task commit:** Run `pnpm lint && pnpm typecheck && pnpm test` (once the scaffold exists)
- **After every plan wave:** Run the full suite command
- **Before `/gsd-verify-work`:** Full suite green in CI on main, plus every live check below
- **Max feedback latency:** 120 seconds

---

## Per-Task Verification Map

Task IDs are filled in by the planner; rows below map each requirement / success criterion to its check.

| Req / SC | Behavior | Test Type | Automated Command | File Exists | Status |
|----------|----------|-----------|-------------------|-------------|--------|
| DEP-02 / SC2 | Zero non-origin requests on `/`; Instrument Sans loads; img decodes; PDF 200 `application/pdf` | e2e | `pnpm test:e2e -g "first-party"` | ❌ W0 `e2e/assets.spec.ts` | ⬜ pending |
| DEP-02 / SC2 | Built HTML has no `http(s)://` asset URLs | smoke | `! grep -Eo '(src\|href)="https?://' out/index.html` | — | ⬜ pending |
| D-12 | meta robots noindex present | e2e | part of `e2e/assets.spec.ts` | ❌ W0 | ⬜ pending |
| D-12 / D-13 | vercel.json has X-Robots-Tag noindex, CSP `default-src 'self'`, HSTS | unit | `pnpm test -- vercel-config` | ❌ W0 `tests/vercel-config.test.ts` | ⬜ pending |
| D-13 | Page runs under production CSP with zero violations | e2e | `pnpm test:e2e -g "CSP"` | ❌ W0 `e2e/csp.spec.ts` | ⬜ pending |
| A11y baseline | axe: no violations on `/` | e2e | `pnpm test:e2e -g "axe"` | ❌ W0 `e2e/a11y.spec.ts` | ⬜ pending |
| SC1 redeploy proof | `shortSha()` returns 7-char SHA or "local" | unit | `pnpm test -- build-info` | ❌ W0 `tests/build-info.test.ts` | ⬜ pending |
| SC4 | Baseline JS measured; CI fails above 150 kB gzip | script | `pnpm measure:js -- --max-gzip-kb 150` | ❌ W0 `scripts/measure-js.mjs` | ⬜ pending |
| SC3 | Protection requires lint, typecheck, unit, e2e; admins not enforced; 0 approvals | API | `gh api repos/Yahya-github/portfolio/branches/main/protection --jq '[.required_status_checks.checks[].context]'` | — | ⬜ pending |
| SC3 | Failing check blocks merge | manual-scripted | throwaway PR with failing unit test → `gh pr view <n> --json mergeStateStatus` = `BLOCKED`; close + delete branch | — | ⬜ pending |
| DEP-01 / SC1 | HTTPS 200 with valid cert | live | `curl -sSfI https://yahya-hallani.dev/ \| head -1` + `openssl s_client ... \| openssl x509 -noout -issuer -enddate` | — | ⬜ pending |
| D-02 | www → apex 308 | live | `curl -sI https://www.yahya-hallani.dev/ \| grep -Ei '^(HTTP\|location)'` | — | ⬜ pending |
| SC1 | Push to main redeploys | live | poll `curl -s https://yahya-hallani.dev/ \| grep -o "build [0-9a-f]\{7\}"` == `git rev-parse --short origin/main` | — | ⬜ pending |
| D-12 live | Headers on HTML and PDF | live | `curl -sI https://yahya-hallani.dev/yahya-hallani-resume.pdf \| grep -i x-robots-tag` | — | ⬜ pending |
| DEP-02 live | Live page first-party only | live (local run) | `BASE_URL=https://yahya-hallani.dev pnpm test:e2e -g "first-party"` | — | ⬜ pending |
| D-14 | Preview URL opens without login | live | `curl -s -o /dev/null -w '%{http_code}' <preview-url>` = 200 | — | ⬜ pending |
| D-03 | Old domain gone from live docs | grep | `! git grep -n "yahya-h\.dev" -- ':!.planning/phases/'` | — | ⬜ pending |
| Folded todo | CLAUDE.md stack has no Pages/basePath/CNAME prescriptions | grep | `! grep -nEi "configure-pages\|withBase\|CNAME\|github pages" CLAUDE.md` (deliberate history/alternative mentions allowed) | — | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `vitest.config.mts`, `tests/setup.ts` — framework config
- [ ] `playwright.config.ts` — `serve out` webServer, `BASE_URL` override
- [ ] `tests/build-info.test.ts`, `tests/vercel-config.test.ts`
- [ ] `e2e/assets.spec.ts`, `e2e/csp.spec.ts`, `e2e/a11y.spec.ts`
- [ ] `scripts/measure-js.mjs`
- [ ] `pnpm exec playwright install chromium` (local), `--with-deps chromium` (CI)

Folded v7 todo (WR-04..IN-01): scaffold readiness only (jsdom + user-event, Playwright reduced-motion emulation). No tests for those behaviours in Phase 2.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Vercel import, Corepack env var, domain attach, www redirect, preview protection off | DEP-01, D-02, D-08, D-14 | Needs Yahya's Vercel dashboard login | checkpoint:human-action steps in plan; verified afterwards by live curl checks above |
| Public-safety sign-off before first push (incl. `.planning/` going public) | D-06 | Human judgement on what is private | gitleaks scan output reviewed + explicit Yahya confirmation |
| Merge blocked by failing check | SC3 | Needs a real PR on GitHub | scripted throwaway PR (see map) |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 120s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
