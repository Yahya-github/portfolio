# Phase 7: Copy, Sharing and Launch - Context

**Gathered:** 2026-11-12
**Status:** Ready for planning

<domain>
## Phase Boundary

The site speaks in Yahya's final voice, every fact is checked against a real source, sharing the link looks branded, and the launch checks pass. Requirements: CONT-06, SEO-01, SEO-02. Includes: final copy in the `content/` data files, per-page title/description/canonical, Person structured data, LinkedIn share card, favicon, on-brand 404, and the launch gate that finally lifts `noindex`.

Not in this phase: playable Atlantis and the rotatable robot model (Phase 8), French version and any new pages (v2).

</domain>

<decisions>
## Implementation Decisions

### Copy handoff (CONT-06)
- **D-01:** **Yahya edits, Claude verifies.** Yahya rewrites About and any other lines directly in `content/*.ts` (or pastes them for Claude to place). Claude does not draft replacement voice. A fact-check file lists every claim on the site with its source (resume, `docs/material/links.md`, `portfolio-voice-and-facts`) and flags mismatches.
- **D-02:** **Freelance date mismatch: fix the resume too.** The site says "since 2025"; Yahya re-exports the public resume so the PDF tells the same story. The plan adds a blocking check that the shipped `public/yahya-hallani-resume.pdf` agrees with the site facts (month of the 2025 start is still unknown and is Yahya's to supply).
- **D-03:** **Numbers (700+ tests, 12 projects for 9 clients, etc.): Yahya confirms, Claude records.** Each number is listed with its source and Yahya confirms or corrects it; the confirmation date is stored in the fact-check file. No automated counting of private repos.
- Never-on-the-site list from `portfolio-voice-and-facts` still binds all copy (no top-1 wording, no phone number, no CRC platform, no Atlantis line counts, no "since" on an ended role, Showdown AI never shown as built).

### LinkedIn share card (SEO-02)
- **D-04:** **Look:** dark ground, giant white YAHYA in Instrument Sans flush left, the role line "Software Engineering at McGill" below, `yahya-hallani.dev` in Label. Matches the Index poster. No accent, no photo, no proof line.
- **D-05:** **One card for all routes**, a single static 1200x630 PNG referenced from root metadata (`openGraph` and `twitter` summary_large_image), with absolute URL via `metadataBase`.
- **D-06:** **Produced by a dev-only script, committed PNG.** An HTML template in the repo is rendered with Playwright to the PNG using the self-hosted font (same pattern as the WebP script). No runtime code, no new dependency, no CSP change.

### Favicon and 404 (SEO-02)
- **D-07:** **Favicon: a white letter Y on the dark ground**, SVG favicon plus a 180px apple-touch PNG. No accent colour (accent is reserved for its four approved uses).
- **D-08:** **404: giant "404" Display, one plain line ("That page doesn't exist"), then the five hero letter links (Y A H Y A) with their numbered captions plus "Back to the start".** Static page outside the pager (like the Facturo deep dive: no counter, progress bar or pager input), keeps the header and skip link. Text in `content/`.

### Per-page SEO (SEO-01)
- **D-09:** Each page keeps its own title, description and relative canonical (already in `lib/metadata.ts` / `content/site.ts`); Yahya's final copy updates the descriptions where the wording changes. Person JSON-LD (name, role, McGill, sameAs for LinkedIn and GitHub, url) is added in root layout. Exact fields are Claude's discretion; only verified facts, no phone or home details.

### Launch gate
- **D-10:** **Indexable only in the last plan, after all checks pass.** That plan removes `noindex` from `vercel.json` (`X-Robots-Tag`) and `rootMetadata.robots`, adds `robots.txt` and `sitemap.xml` (seven routes: six pages plus Facturo; 404 excluded), and runs only once the gates below are green. Yahya pushes it deliberately.
- **D-11:** **Lighthouse CI against built `out/`, on every route** (six pages, Facturo, 404): performance 95, accessibility 100, SEO 100, best practices 95 on mobile; failure blocks the PR. Existing 150 kB initial JS and 12 kB per-chunk gates stay.
- **D-12:** **Human launch checks are optional and non-blocking** (Yahya's call, amending ROADMAP success criterion 4): the plan still writes a short checklist and a `07-HUMAN-UAT.md` (five-second test with someone new: who is he, one proof point, how to contact; VoiceOver or NVDA walk-through), but launch does not wait on it. Blocking gates are automated: axe on every route, Lighthouse CI, Playwright keyboard and reduced-motion runs, and the PDF-vs-site fact check.

### Claude's Discretion
- Card template layout details, font-size fitting, the exact favicon construction, sitemap/robots format, JSON-LD field set, and the 404 copy line wording (within D-04..D-09).
- Lighthouse CI configuration and how routes are served from `out/`.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design contract
- `docs/superpowers/specs/2026-11-03-portfolio-design.md` — approved rev 5: section 4 (type, accent rules: four approved accent uses), section 6 (navigation/chrome), section 7 (page copy), budgets (Lighthouse performance 95 on mobile).
- `.planning/phases/01-design-gate/01-UI-SPEC.md` — token values.
- `.planning/REQUIREMENTS.md` — CONT-06, SEO-01, SEO-02.
- `.planning/ROADMAP.md` section Phase 7 — goal and success criteria (criterion 4's human parts amended by D-12).

### Prior phase context
- `.planning/phases/02-live-deploy-spike/02-CONTEXT.md` — D-12 noindex until launch, Vercel headers in `vercel.json`, CSP.
- `.planning/phases/06-page-compositions-and-content/06-CONTEXT.md` — typed content files, lazy chunks and the JS budget gates, Facturo standalone-route pattern (reuse for 404).

### Facts and material
- `~/.claude/skills/portfolio-voice-and-facts/SKILL.md` — voice rules, verified facts, never-on-the-site list, "check before publishing" items.
- `docs/material/links.md` — contact, project and proof links.
- `docs/material/resume-public.pdf` and `public/yahya-hallani-resume.pdf` — must match site facts (D-02).
- `app/fonts/InstrumentSans-wdth-wght.woff2` — font for the card and favicon.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `lib/metadata.ts` (`rootMetadata`, `pageMetadata`, `deepDiveMetadata`) with `content/site.ts` section titles and descriptions: extend for openGraph/twitter, icons and JSON-LD.
- `content/*.ts` typed data (`about`, `site`, `facturo`, ...): where Yahya's final copy goes; new `content/not-found.ts` for the 404.
- Hero letter components under `components/letters/` and the Facturo standalone route (`app/projects/facturo/`): templates for the 404 composition outside the pager.
- Existing scripts (sharp WebP converter, `scripts/measure-js.mjs`) as the pattern for a dev-only card renderer.
- `vercel.json` headers (X-Robots-Tag, CSP) and existing Playwright, axe and Vitest setup.

### Established Patterns
- CSS Modules plus `tokens.css`, server components carry content, no runtime image code, only verified facts, self-hosted assets (CSP `img-src 'self' data:`).

### Integration Points
- `app/layout.tsx` (metadata export, head) for icons, OG tags and JSON-LD; `app/not-found.tsx` and `public/` for the new static assets; CI workflow for Lighthouse CI.

</code_context>

<specifics>
## Specific Ideas

- The share card should be the Index poster in miniature so the click lands on what the card promised.
- Launch is a deliberate final act: the `noindex` flip is its own last plan.

</specifics>

<deferred>
## Deferred Ideas

None. Discussion stayed within phase scope. (Per-page share cards and a coloured favicon were considered and rejected for v1.)

### Reviewed Todos (not folded)
None. No pending todos matched this phase.

</deferred>

---

*Phase: 07-copy-sharing-and-launch*
*Context gathered: 2026-11-12*
