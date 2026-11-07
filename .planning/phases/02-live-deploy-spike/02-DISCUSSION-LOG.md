# Phase 2: Live Deploy Spike - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-11-07
**Phase:** 02-live-deploy-spike
**Areas discussed:** Domain setup, Repo + merge gate, Placeholder page, Preview deploys

---

## Todos

| Option | Description | Selected |
|--------|-------------|----------|
| Regenerate CLAUDE.md stack | Stack section still describes GitHub Pages | ✓ |
| Carry v7 review warnings | Pager/cursor bugs for Phases 3-5 | ✓ |

**Notes:** v7 warnings have no Phase 2 build work; recorded as test-scaffold readiness, todo stays open.

---

## Domain setup

| Option | Description | Selected |
|--------|-------------|----------|
| Cloudflare | At-cost registrar, DNS pointed at Vercel | |
| Vercel Domains | Buy in Vercel, DNS automatic | |
| Porkbun | Cheap registrar, manual records | |
| Already bought | | ✓ "Already bought from Vercel" |

Main URL: user answered "yahya-hallani.dev" (options were yahya-h.dev apex / www.yahya-h.dev).
Follow-up "Which domain(s) did you buy on Vercel?" → **Only yahya-hallani.dev** (vs both / only yahya-h.dev).
Follow-up "www redirects to apex?" → **Yes, apex is main** (vs no www).
Fallback "domain not ready" → "Already have a domain".

**Notes:** yahya-h.dev dropped; rename across live docs.

---

## Repo + merge gate

| Option | Description | Selected |
|--------|-------------|----------|
| Public | Free branch protection, code as proof | ✓ |
| Private | Protection not enforced on free personal plan | |

| Option | Description | Selected |
|--------|-------------|----------|
| PR required, admin can bypass | | ✓ |
| PR required, no bypass | | |
| Checks only, push allowed | | |

| Option | Description | Selected |
|--------|-------------|----------|
| portfolio | Matches local folder | ✓ |
| yahya-hallani.dev | Named after domain | |

---

## Placeholder page

| Option | Description | Selected |
|--------|-------------|----------|
| Minimal on-brand card | YAHYA, role, portrait, resume, contact | |
| Bare test page | Font, image, resume link | |
| Other | | ✓ "Nothing, no one has the link so we don't mind" |

| Option | Description | Selected |
|--------|-------------|----------|
| noindex until launch | | ✓ |
| Index it | | |

| Option | Description | Selected |
|--------|-------------|----------|
| Greyscale portrait | | ✓ |
| Facturo screenshot | | |

**Notes:** interpreted as bare pipeline-proof page, no design effort.

---

## Preview deploys

| Option | Description | Selected |
|--------|-------------|----------|
| Public | Opens on phones / LinkedIn in-app browser | ✓ |
| Vercel login required | | |

| Option | Description | Selected |
|--------|-------------|----------|
| Local export only | Playwright on built out/ | ✓ |
| Both | Also smoke-test the preview URL | |

---

## Claude's Discretion

- Security headers in vercel.json, JS-size measurement method, CI layout, Node pin, image format, Vercel connection method.

## Deferred Ideas

- Remove noindex at launch (Phase 7).
- CI smoke test against live preview.
