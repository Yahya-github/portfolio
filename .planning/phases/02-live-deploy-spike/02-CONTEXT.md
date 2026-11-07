# Phase 2: Live Deploy Spike - Context

**Gathered:** 2026-11-07
**Status:** Ready for planning

<domain>
## Phase Boundary

A minimal Next.js 16 static export (`output: 'export'`) is scaffolded, pushed to a public GitHub repo, and served by Vercel at **https://yahya-hallani.dev** over HTTPS. It proves hosting, domain, self-hosted assets (Instrument Sans, one image, the resume PDF) and the CI merge gate before any real feature work. It also measures the baseline JS size of the empty App Router build. No design system, pages, or features (those are Phase 3+).

Requirements: DEP-01, DEP-02.

</domain>

<decisions>
## Implementation Decisions

### Domain
- **D-01:** The domain is **yahya-hallani.dev**, already bought on Vercel (Vercel Domains). **yahya-h.dev is dropped**: it was never bought and must not appear anywhere.
- **D-02:** Apex `https://yahya-hallani.dev` is the one canonical address. `www.yahya-hallani.dev` redirects to the apex (permanent redirect, set in Vercel domain settings).
- **D-03:** Rename every live reference from yahya-h.dev to yahya-hallani.dev in this phase: `CLAUDE.md`, `.planning/PROJECT.md`, `.planning/ROADMAP.md`, `.planning/REQUIREMENTS.md` (DEP-01), `.planning/STATE.md` (remove the "must be bought" blocker), `.planning/research/*.md`, and `docs/superpowers/specs/2026-11-03-portfolio-design.md`. Completed Phase 1 plans/research stay as historical record (do not rewrite them).
- **D-04:** Because the domain is on Vercel already, there is no waiting-for-DNS fallback: the domain attaches as soon as the Vercel project exists. The phase is done only when https://yahya-hallani.dev serves the build with a valid certificate.

### Repo and merge gate
- **D-05:** Create a **public** GitHub repo `Yahya-github/portfolio` (matches the local folder) and push the existing history. Public keeps branch protection free and Actions minutes unlimited, and the code is itself proof for recruiters.
- **D-06:** Before the first public push, audit the tracked tree and history for anything not public-safe (secrets, private fonts, metadata). Known state: `docs/reference/fonts-private/` is gitignored and was never tracked; the committed fonts are OFL. Resume PDF metadata reads Author/Creator "Yahya Hallani" (fine). Stop and ask Yahya if anything else looks private.
- **D-07:** `main` requires a pull request with passing status checks (lint, type check, unit tests, Playwright on the built export). **Admin bypass is allowed**, so Yahya and GSD doc commits can still go straight to main when needed.
- **D-08:** Vercel Git integration deploys `main` to production automatically on push (success criterion 1).

### Placeholder page
- **D-09:** The placeholder is a **bare test page**, not an on-brand card. Nobody has the link yet, so it only has to prove the pipeline: text in the self-hosted Instrument Sans, one image, a link to the resume PDF. No design polish.
- **D-10:** The test image is the greyscale portrait `docs/material/portrait-devfest-2026-grey.jpg`, copied in an optimised form to `public/` (or static-imported).
- **D-11:** The resume is `docs/material/resume-public.pdf`, copied to `public/` and linked from the page.
- **D-12:** The site is **noindex until launch** (`<meta name="robots" content="noindex">` and/or an `X-Robots-Tag` header). Removing it is a Phase 7 launch task.
- **D-13:** All assets come from yahya-hallani.dev itself: the network panel shows zero third-party requests (success criterion 2). No Google Fonts runtime, no Vercel Analytics/Speed Insights scripts.

### Preview deploys
- **D-14:** Vercel preview deployments for PRs are **public** (Deployment Protection off for previews), so they open on phones and in the LinkedIn in-app browser for Phase 4 device tests. Previews stay noindex.
- **D-15:** Playwright in CI runs **only against the locally built static export** (`next build`, serve `out/`), not the Vercel preview URL.

### Claude's Discretion
- Security headers in `vercel.json` (CSP, HSTS, nosniff, Referrer-Policy, Permissions-Policy) now or deferred, and their exact values. `.dev` is HSTS-preloaded already.
- How the baseline JS size is measured (e.g. gzipped sum of `out/_next/static/chunks` loaded by `/`) and where it is written down (phase SUMMARY plus a line in the design doc or a `docs/` perf note).
- CI workflow layout (one job vs several), caching, Node pin (`.nvmrc` 22, `engines`), `packageManager` pnpm 12.
- Image format and sizing for the test portrait.
- How Vercel is connected (dashboard Git import vs Vercel CLI); Yahya does any dashboard/login steps himself when asked.

### Folded Todos
- **Regenerate the CLAUDE.md stack section for Vercel** (`.planning/todos/pending/2026-11-07-regenerate-claude-md-stack-for-vercel.md`): the stack section still prescribes GitHub Pages (Pages workflow, configure-pages basePath, `withBase()`, CNAME). Phase 2 sets up Vercel, so rewrite it here: drop the Pages workflow, basePath and CNAME notes, keep the library and test choices, note headers are possible via `vercel.json`, and use yahya-hallani.dev (D-03).
- **Carry v7 review warnings into the build** (`.planning/todos/pending/2026-11-07-carry-v7-review-warnings-into-build.md`): Yahya folded it here. Its fixes are pager/cursor behaviour for Phases 3-5, so Phase 2 builds none of them. In Phase 2 it means: the test scaffold (Vitest + Playwright) is set up so those behaviours (WR-04 Space on focused controls, WR-05 no (0,0) pointer, WR-06 focus hand-off, WR-07 cursor class set by script, WR-08 live reduced-motion, IN-01 wheel accumulator reset) can be tested later, and the todo stays referenced from Phases 3-5 planning. Do not close the todo in Phase 2.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase scope and requirements
- `.planning/ROADMAP.md` §Phase 2 — goal and the four success criteria
- `.planning/REQUIREMENTS.md` §Deployment (DEP-01, DEP-02)
- `.planning/PROJECT.md` §Constraints, §Key Decisions — Vercel host, self-hosted assets, no basePath

### Stack and design
- `CLAUDE.md` §Technology Stack — versions and tooling (Next 16.4, TS ~6.0.3, Vitest 5, Playwright 1.65, ESLint 10 flat, pnpm 12). Its GitHub Pages parts are stale; see Folded Todos.
- `docs/superpowers/specs/2026-11-03-portfolio-design.md` — approved rev 5: stack line, performance budget (landing JS < ~150 kB gzipped, CSS < 30 kB, LCP < 2.5 s, CLS < 0.1), font choice
- `docs/reference/font-metrics.md` — Instrument Sans axes and metrics
- `.planning/research/STACK.md`, `.planning/research/PITFALLS.md` — stack research (GitHub Pages notes superseded by Vercel)

### Assets
- `docs/reference/fonts/InstrumentSans-wdth-wght.woff2` + `docs/reference/fonts/OFL-InstrumentSans.txt` — the font file and its licence
- `docs/material/portrait-devfest-2026-grey.jpg` — test image
- `docs/material/resume-public.pdf` — public resume
- `docs/material/links.md` — email, LinkedIn, GitHub

### Folded todos
- `.planning/todos/pending/2026-11-07-regenerate-claude-md-stack-for-vercel.md`
- `.planning/todos/pending/2026-11-07-carry-v7-review-warnings-into-build.md`

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- No application code exists yet. The repo holds planning docs, `docs/reference/` sketches (v6, v7, font trial) and `docs/material/` media.
- Instrument Sans variable WOFF2 (wdth + wght axes) is already committed with its OFL licence: use it with `next/font/local`.

### Established Patterns
- `.gitignore` guards `docs/reference/fonts-private/` and `*client_secret*.json`; extend it for `node_modules/`, `.next/`, `out/`, `.vercel/`, Playwright reports.
- `.planning/phases/01-design-gate/check.sh` exists as a Phase 1 doc checker (not app CI).

### Integration Points
- No git remote yet; `gh` is logged in as Yahya-github. Vercel CLI is not installed. Node 22.22 and pnpm 12.11 are local.
- Vercel project must link to the GitHub repo and attach yahya-hallani.dev (already in Yahya's Vercel account).

</code_context>

<specifics>
## Specific Ideas

- "Nothing, no one has the link so we don't mind" — the placeholder needs no design effort.
- Preview URLs public specifically so Phase 4 can test on a real iPhone (Safari + LinkedIn in-app browser) and Android without logging in.

</specifics>

<deferred>
## Deferred Ideas

- Remove `noindex` at launch — Phase 7.
- Smoke-testing the live Vercel preview in CI (headers, hosting differences) — not now; revisit if a hosting-only bug appears.

### Reviewed Todos (not folded)
- `2026-11-07-update-portfolio-skills-to-design-rev-5.md` — tooling outside the repo; not matched to this phase.

</deferred>

---

*Phase: 02-live-deploy-spike*
*Context gathered: 2026-11-07*
