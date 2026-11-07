# Phase 1: Design Gate - Research

**Researched:** 2026-11-06
**Domain:** Design-approval gate (docs, throwaway HTML sketches, font licensing, asset preparation). No product code.
**Confidence:** MEDIUM-HIGH (font facts and asset facts measured on real files; paid-font prices could not be read and stay open)

## Summary

Phase 1 produces documents and throwaway HTML only. Five things ship: (1) design doc revision 5 at the existing path, approved by a `Status: APPROVED by Yahya, <date>` commit; (2) a font trial page `docs/reference/font-trial.html` and a recorded winner with its licence; (3) six written page compositions plus the throwaway `docs/reference/swiss-horizontal-v7.html`; (4) `docs/material/` with public-safe portrait, screenshots, resume and a links file; (5) the v6 sketch committed and research Decisions 1-6 recorded with Vercel as host. Most of the work is gated on Yahya. The plan must be built around three human checkpoints (font pick, v7 picks, final approval), not around code.

Measuring the six free candidates' font files changed several assumptions in the UI-SPEC. **Hanken Grotesk has no `tnum` feature, but its default figures are already tabular** (all ten digits 560 units wide), so the UI-SPEC rule "a true `tnum` feature exists, otherwise fail" needs a wording fix. **Instrument Sans tops out at weight 700** (no 800) and has a `wdth` 75-100 axis, so it alone can give a condensed YAHYA and normal body from one variable file. **The Sofia Sans route needs two files** (Sofia Sans Extra Condensed plus Sofia Sans), which strains D-06 "a variable file". The width checks are more serious: at the Display role, **"Involvement" overflows cols 7-12 at 1366px for every normal-width candidate, and "Achievements" at 64px overflows the 390px phone frame for every candidate except Sofia Sans Extra Condensed**. The design doc must settle those cases before approval. For the condensed face the reverse happens: a width-fitted YAHYA at 1366x768 is about 505px of em box, which runs into the vertical budget, so "edge to edge" will be height-capped on laptops. The trial must show 1366x768 as well as 1440x900.

Paid faces: Klim (Söhne) allows self-hosting its own WOFF2 files on a domain you own, perpetually, priced by monthly page views or unique users. Söhne has `tnum`, but **its variable font comes only with the full-family purchase**, which is almost certainly over the $300 budget, so the realistic paid option is 2 static weights. Test fonts (Klim and Swiss Typefaces) are evaluation-only and **must never be committed**, because the repo will likely be public. No paid price could be read (the pricing pages render client-side), so prices stay out of the doc until a human reads them off the foundry site, as the UI-SPEC already requires.

**Primary recommendation:** Structure the phase as prep waves (commit v6, `.gitignore` for private fonts, material intake, font trial), then a font checkpoint, then the v7 sketch, then a picks checkpoint (Achievements a/b, cursor a/b/c), then rev 5 plus the REQUIREMENTS/PROJECT updates, then the approval checkpoint. Verify everything with grep, pdftotext and exiftool checks. No test framework is needed.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Font trial
- **D-01:** Candidates come from four buckets: Inter Tight (current placeholder), Sofia Sans Extra Condensed, free Neue Haas-style grotesques (e.g. Schibsted Grotesk, Hanken Grotesk, Instrument Sans), and paid foundry Swiss grotesques. Claude shortlists about 6-8 faces in total.
- **D-02:** Paid web licence budget is up to about $300. Confirm that each face allows self-hosted web use (DEP-02).
- **D-03:** The winner is judged on how the giant YAHYA looks. Body text must still read well.
- **D-04:** Format is one throwaway HTML side-by-side page on a black ground, saved in `docs/reference/`. Each candidate shows the giant YAHYA (edge to edge, fitted to the grid margins), the small rail-size YAHYA stacked vertically, and a body paragraph. Numerals appear at a medium size for reference only.
- **D-05:** YAHYA is set in caps with tight, negative tracking. No italics anywhere on the site.
- **D-06:** One family, strictly. No monospace; counters use the sans's tabular figures. A variable file is self-hosted and the site uses 2-3 weights.
- **D-07:** English glyphs only for now. Latin-Extended coverage is not a selection criterion.
- **D-08:** If nothing wins, run a second round with 3 new faces chosen from the feedback. Maximum 2 rounds.

#### Page compositions
- **D-09:** Approval artifacts: the design doc gives a written spec per page (column spans, scale, dominant element), and a throwaway v7 HTML sketch shows all six pages. Both go to Yahya.
- **D-10:** Each page borrows one Swiss poster device so no two layouts match (DSGN-03). Claude proposes, Yahya picks.
- **D-11:** Achievements: v7 shows two variants. In (a), 75/75 dominates but is smaller than YAHYA, with the four first places beside it. In (b), 75/75 has equal weight in a typographic list of the results. Yahya is unsure whether 75/75 should be giant; CONT-02 says "giant", so if he picks (b), CONT-02 must be updated.
- **D-12:** Projects: Facturo spans about 8 columns. The other four (Atlantis, CRC problems, robot firmware, Showdown AI) stack in the remaining 4 columns as compact rows (problem, role, result, links). The Facturo deep dive stays a separate route.
- **D-13:** Experience: a ruled two-column table, with Work on the left and Involvement on the right. Hairline rules, years and roles flush left.
- **D-14:** Say hi: three giant type lines for Email (copies the address on click), LinkedIn and GitHub, plus Resume as a fourth line.
- **D-15:** About: text in Yahya's voice plus an image slot for a **real, recognisable portrait**, because recruiters should see his face. Plain greyscale, no effect (see D-26).
- **D-16:** Desktop compositions are approved now. Each page gets only a one-line note on its phone portrait intent; full phone layouts come in Phase 6.

#### Old doc leftovers (rewrite = revision 5, in place)
- **D-17:** Rewrite the doc in place at the same path as revision 5. Retired light-design decisions go to a short "Retired" appendix with the reason and date.
- **D-18:** **Custom cursor stays in v1** (this reverses the REQUIREMENTS out-of-scope "custom cursor" line; add a requirement and remove the anti-feature line). Its job is to feel crafted and to guide navigation. The Sableye pink/green meaning is dropped, and so is the viscous bubble. The only hard rule is **1:1 tracking**: the cursor always sits exactly on the pointer, with no lag or spring, though its shape may change. The native cursor may be hidden. Touch devices get no custom cursor. Under reduced motion, shape changes are instant.
- **D-19:** Cursor form is not decided. v7 includes 3 toggleable variants, for example (a) an exact square that snaps around letters and links and shows the section name, (b) a fine crosshair or registration mark in the accent, (c) the native cursor plus a context label over the YAHYA letters. Yahya picks by feel.
- **D-20:** Dropped: the folder-stack projects, medal icons (rank is set as type: "1st", "2nd"), the EN/FR switch and `/en` `/fr` prefixes (English-only routes such as `/achievements/`; French is v2 and the data files keep it cheap), and the credits page (no third-party art remains). Pixel stickers and Icons8 were already dropped.

#### Material & approval
- **D-21:** Raw material lives in `docs/material/` in the repo, public-safe files only. Later phases copy optimised versions to `public/`.
- **D-22:** Portrait source is `/home/atlas/Downloads/DEVFEST 2026.jpeg`. Crop out the DevFest Montreal banner at the bottom and frame from head to mid-chest with the lanyard visible. **Keep the Google Developer Group backdrop**, which counts as proof of GDG involvement, and convert the image to greyscale so the multicolour logos do not fight the green accent.
- **D-23:** Public resume PDF: freelance date fixed to "2025 – Present" and the phone number removed. Yahya edits it in JobOps Resume Studio and re-exports it.
- **D-24:** Yahya already has the resume, Facturo screenshots, robot and Atlantis images, and his email, LinkedIn and GitHub URLs. They only need to be moved into `docs/material/`. He may add more (see Specific Ideas).
- **D-25:** Approval: the doc header changes to `Status: APPROVED by Yahya, <date>` in a commit. The gate passes on that commit.

#### Visual "wow" direction (decided after the first context write)
- **D-26:** **No depth map and no background visuals.** Depth map, nature simulations and procedural terrain were each tried and rejected: borrowed aesthetics, not Yahya's interests, and trying to look "cracked" is forced. The wow comes from (1) the YAHYA letter navigation, (2) craft (paging feel, giant Swiss type, precise cursor), (3) real interactive proof (playable Atlantis, rotatable robot model; Phase 8). All photos are plain greyscale with hard crops on the grid (DSGN-05 rewritten).
- **D-27:** Green keeps "nature (as grandeur) and code" as private inspiration only; nature is never a visible theme.
- **D-28:** Yahya's real interests outside code are competitive games and building machines/systems. They show up as content (wins, projects, the two habits in About), not as decoration.
- **D-29:** The v7 sketch tests no background visuals; it judges the pages on type, grid and plain photos.

### Claude's Discretion
- The exact font shortlist inside the four buckets
- The poster device for Index, About and Achievements variant (a), beyond what is captured here
- The three cursor variant designs in v7
- The exact crop box for the portrait
- Doc section structure for revision 5

### Deferred Ideas (OUT OF SCOPE)
- Viscous goo cursor and the Sableye pink/green hint: dropped, not deferred
- French version and `/fr` routes: v2
- Full phone portrait layouts: Phase 6
- Depth-map treatment: dropped (D-26), not deferred. Phase 8 is now Interactive Proof
- Requirements updates applied 2026-11-06: DSGN-05 rewritten, PROOF-01/02 added. Still pending: a custom cursor requirement plus removing the anti-feature line (D-18); possibly CONT-02 (D-11)
</user_constraints>

<phase_requirements>
## Phase Requirements

No requirement IDs are mapped to Phase 1 (ROADMAP: "design gate; it enables every later phase"). The phase is judged by ROADMAP success criteria SC-1 to SC-5:

| ID | Description | Research Support |
|----|-------------|------------------|
| SC-1 | Design doc describes dark Swiss horizontal design, marked approved | §Design Doc Rev 5 skeleton (Pattern 4); §Validation (grep for `Status: APPROVED`, retired terms confined to appendix) |
| SC-2 | Final sans chosen after side-by-side trial, licence confirmed | §Fonts shortlist (measured), Patterns 1-3, Pitfalls 1-6 |
| SC-3 | Six pages each have a written, distinct composition on 12 columns | UI-SPEC Page Compositions (already signed off) + Pitfall 2 (Display word overflow must be resolved in the doc) |
| SC-4 | Real material in repo: photos/screenshots, redacted resume, links | §Asset Inventory, §Portrait processing, §Resume redaction checks |
| SC-5 | v6 saved under `docs/reference/`; Decisions 1-6 recorded; Vercel host | v6 already present but **untracked**; Pattern 4 item 4 |

Requirement-file edits this phase must make (from D-11, D-18): add a custom-cursor requirement, remove "custom cursor" from Out of Scope (the FEATURES/PITFALLS anti-feature mention is superseded), and rewrite CONT-02 only if Achievements variant (b) wins.
</phase_requirements>

## Project Constraints (from CLAUDE.md)

- Next.js static export on **Vercel** (switched from GitHub Pages 2026-11-06). Note: the CLAUDE.md TL;DR and `.planning/research/STACK.md` still describe the GitHub Pages workflow, `basePath`, `withBase()` and CNAME. Those parts are **stale**. Rev 5 must state Vercel and must not copy the Pages instructions.
- Domain yahya-h.dev (not bought yet).
- **Only verified, real facts; no invented numbers.** Facts come from `portfolio-voice-and-facts` and the resume.
- **Self-host fonts and media; no hotlinked assets in production.** Throwaway sketches may hotlink, but the v7 contract says to remove the Google Fonts link once self-hosted trial files exist.
- **No product code until the design doc is approved** (brainstorming gate). Throwaway HTML in `docs/reference/` is the established approval medium (v1-v44 light, v1-v6 dark), so it does not break the gate.
- Accessibility: WCAG contrast, keyboard, reduced motion.
- GSD workflow enforcement: file changes go through GSD commands. Commit messages follow `<type>: <description>` (`docs:` for this phase).
- No Tailwind; CSS Modules plus tokens later. This does not affect the sketches, but they should already use the UI-SPEC token names so Phase 3 can lift the values.

## Architectural Responsibility Map

No runtime tiers in this phase. Responsibility is split among artefacts and people:

| Capability | Primary owner | Secondary | Rationale |
|------------|--------------|-----------|-----------|
| Font candidate files, licence facts | Claude (trial page, licence table) | Yahya (buys, or downloads test fonts that need his account) | Paid test fonts need a foundry account and EULA acceptance |
| Font choice, Achievements a/b, cursor a/b/c, final approval | Yahya (checkpoint) | — | D-03, D-11, D-19, D-25 |
| Page compositions (written) | Design doc rev 5 | v7 sketch (visual proof) | D-09 |
| Resume redaction | Yahya (JobOps Resume Studio re-export) | Claude (verifies with pdftotext/pdfinfo) | D-23: the DB is not writable by Claude |
| Portrait crop + greyscale | Claude (ImageMagick) | Yahya (confirms crop in v7) | D-22; crop box is Claude's discretion |
| Screenshots, robot/Atlantis photos | Yahya (supplies location) | Claude (copies, strips metadata) | Location of these files is unknown to research |
| Decisions 1-6 record | Design doc rev 5 (copied from PROJECT.md Key Decisions) | — | Already accepted in PROJECT.md |

## Standard Stack (for throwaway artefacts only)

### Core
| Tool | Version | Purpose | Why |
|------|---------|---------|-----|
| Plain HTML/CSS/JS single file | — | font-trial.html, swiss-horizontal-v7.html | Matches v1-v6 sketch practice; no build, opens from disk; nothing kept |
| ImageMagick | 7.1.2-34 [VERIFIED: local `magick --version`] | Portrait crop, greyscale, metadata strip | Installed; one command |
| exiftool | 13.50 [VERIFIED: local] | Verify no GPS/metadata in material | Installed |
| poppler `pdftotext` / `pdfinfo` | installed [VERIFIED: local] | Verify resume redaction and metadata | Installed |
| fontTools (+brotli) | pip, scratchpad venv [VERIFIED: installed this session] | Convert OFL TTF to WOFF2 for the trial; inspect `tnum`, axes | Not installed system-wide; `python3 -m venv` + `pip install fonttools brotli` works |

### Fonts: shortlist with measured facts

All OFL files are from `github.com/google/fonts/ofl/*` (downloaded and inspected 2026-11-06 with fontTools and HarfBuzz). [VERIFIED: font files]

| # | Face | Licence | Axes | Tabular figures | YAHYA advance at wght 700, kern on, no tracking | Cap height | Notes |
|---|------|---------|------|-----------------|---------------------------------|-----------|-------|
| 1 | Inter Tight 3.004 | SIL OFL 1.1 | wght 100-900 | `tnum` yes | 3.378em (800: 3.492) | 0.728em | Anti-vibe flag ("Inter by default"). Can win only on the trial, with a one-sentence reason (UI-SPEC) |
| 2 | Sofia Sans Extra Condensed 4.101 | SIL OFL 1.1 | wght 1-1000 | `tnum` yes | 1.940em (900: 2.186) | 0.655em | Body needs a **second file** (Sofia Sans 4.101, same superfamily, `tnum` yes). See Pitfall 3 |
| 3 | Schibsted Grotesk 1.100 | SIL OFL 1.1 | wght 400-900 | `tnum` yes | 3.351em | 0.703em | No stylistic sets |
| 4 | Hanken Grotesk 3.013 | SIL OFL 1.1 | wght 100-900 | **no `tnum` feature, but default figures are tabular** (all digits 560 units) | 3.101em | 0.697em | Passes D-06 in practice. The UI-SPEC criterion wording must allow this (Pitfall 4) |
| 5 | Instrument Sans 1.000 | SIL OFL 1.1 | **wdth 75-100**, wght **400-700** | `tnum` yes | 3.360em (no 800) | 0.720em | Can't use the 700-800 display range. The `wdth` axis gives a condensed YAHYA from the same single file |
| 6 | Söhne (Klim) | Klim web EULA: self-host Klim WOFF2 on an owned domain, perpetual, tiered by monthly page views or unique users [CITED: klim.co.nz/licences/web-fonts] | Variable wght 200-900 **only with full-family purchase** [CITED: klim.co.nz/fonts/soehne] | `tnum` yes [CITED: same] | measure in trial | — | Price not readable (JS-rendered). Under $300 likely means 2 static weights (Buch 400 + Dreiviertelfett 700 or Fett 800) [ASSUMED] |
| 7 | Suisse Int'l (Swiss Typefaces) | Webfont included with purchase [CITED: swisstypefaces.com/advantages via search]; trial files need account + signed Test EULA, partial character set [CITED: swisstypefaces.com/support/trial-fonts via search] | unknown | unknown | measure in trial | — | Price unknown. The trial charset may lack figures or punctuation: check before judging |
| 8 | Neue Haas Grotesk Display (Monotype/Linotype) | MyFonts sells self-hosted web licences in page-view tiers (Bloomberg CSS shows "Licensed pageviews: 1,000,000") [CITED: search results, MEDIUM-LOW] | unknown | unknown | — | — | Desktop styles from $33.99, family $344.99 on MyFonts [CITED: search snippet, LOW]. Web price unverified |

Fitted giant size (grid width / (advance - 5 × 0.04 tracking)) at 1440 wide (grid 1392px): Inter Tight 700 ≈ 438px (cap ≈ 319px), Schibsted ≈ 442px, Hanken ≈ 480px, Instrument ≈ 440px, **Sofia Sans Extra Condensed 900 ≈ 701px (cap ≈ 459px), at 700 ≈ 800px**. [VERIFIED: computed from measured advances; the layout-width inputs come from the UI-SPEC grid]

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Plain-HTML trial page | Figma or a design tool | Yahya judges in the browser on his screen; type renders differently there. HTML matches the sketch habit |
| Hanken / Schibsted / Instrument | Other OFL grotesques for round 2 (e.g. Familjen Grotesk, Funnel Display, Geologica, already in `fonts-novel-v1.html`) | Use only in round 2 (D-08), picked from feedback |

**Installation (scratchpad only, never the repo):**
```bash
python3 -m venv "$SCRATCH/venv" && "$SCRATCH/venv/bin/pip" install fonttools brotli
"$SCRATCH/venv/bin/python" -I -m fontTools.ttLib.woff2 compress "InterTight[wght].ttf"   # -> .woff2
```

## Architecture Patterns

### Flow of the phase (data and decisions)

```
 /tmp v6 (already copied) ──► docs/reference/swiss-horizontal-v6.html ──(git add; untracked now)──┐
                                                                                                │
 google/fonts OFL TTFs ──► woff2 ──► docs/reference/fonts/ (+ OFL.txt) ─┐                         │
 paid test fonts (Yahya's account) ──► installed locally, NOT in git ───┼─► font-trial.html ──► [CHECKPOINT 1: Yahya picks font | round 2 max]
                                                                        │                         │
 DEVFEST 2026.jpeg ──► crop above banner, greyscale, strip ──► docs/material/portrait…jpg ──┐    │
 Resume Studio re-export (Yahya) ──► pdftotext/pdfinfo checks ──► docs/material/resume.pdf  │    │
 Yahya's screenshots/photos (location TBD) ──► strip metadata ──► docs/material/…           │    │
 resume header ──► docs/material/links.md (email, LinkedIn, GitHub, project links)          │    │
                                                                                            ▼    ▼
                                            swiss-horizontal-v7.html (winning font, real content, toggles)
                                                                   │
                                            [CHECKPOINT 2: Achievements a/b, cursor a/b/c, portrait crop]
                                                                   │
              design doc rev 5 + REQUIREMENTS (cursor req, CONT-02?) + PROJECT Key Decisions (font row)
                                                                   │
                                            [CHECKPOINT 3: Yahya approves] ──► commit "Status: APPROVED by Yahya, <date>"
```

### Recommended file layout
```
docs/
├── superpowers/specs/2026-11-03-portfolio-design.md   # rev 5, rewritten in place (D-17)
├── reference/
│   ├── swiss-horizontal-v6.html     # exists, untracked: commit first
│   ├── font-trial.html              # throwaway (D-04)
│   ├── swiss-horizontal-v7.html     # throwaway (D-09)
│   └── fonts/                       # OFL woff2 + OFL.txt only (redistribution allowed)
└── material/
    ├── portrait-devfest-2026-grey.jpg
    ├── resume-public.pdf
    ├── links.md                     # email, LinkedIn, GitHub, per-project links, AG site
    ├── screenshots/facturo-*.png
    └── photos/{robot,atlantis}-*.jpg
.gitignore                           # docs/reference/fonts-private/, *.otf/*.woff2 of paid faces
```

### Pattern 1: Trial page that loads fonts without breaking any licence
**What:** OFL faces are committed as WOFF2 next to their `OFL.txt` (OFL permits redistribution with the licence). Paid test fonts are either installed system-wide by Yahya and referenced with `local()`, or placed in a git-ignored `docs/reference/fonts-private/`. **Never committed.**
**Example:**
```css
/* OFL: committed */
@font-face { font-family: "T-InterTight"; src: url("fonts/InterTight-wght.woff2") format("woff2"); font-weight: 100 900; }
@font-face { font-family: "T-Instrument"; src: url("fonts/InstrumentSans-wdth-wght.woff2") format("woff2"); font-weight: 400 700; font-stretch: 75% 100%; }
/* Paid test fonts: installed locally or in the git-ignored folder; the block shows "not installed" if missing */
@font-face { font-family: "T-Sohne"; src: local("Söhne Dreiviertelfett"), url("fonts-private/soehne-dreiviertelfett.woff2") format("woff2"); font-weight: 700; }
```

### Pattern 2: Measure `--yahya-fit` in the trial instead of guessing
**What:** For each block, wait for the face, measure the word at 100px with the trial tracking applied, and derive the fit constant the doc records. Detect a missing face so a fallback face is never judged by mistake.
```js
// Source: pattern from v6 fit() (docs/reference/swiss-horizontal-v6.html line 226) plus the CSS Font Loading API
async function measure(block, family, weight, trackEm) {
  const ok = await document.fonts.load(`${weight} 100px "${family}"`, "YAHYA");
  if (!ok.length) { block.dataset.missing = "true"; return null; }   // face not loaded: say so on the page
  const probe = Object.assign(document.createElement("span"), { textContent: "YAHYA" });
  probe.style.cssText = `font:${weight} 100px/1 "${family}";letter-spacing:${trackEm}em;position:absolute;visibility:hidden;white-space:nowrap`;
  document.body.append(probe);
  const fit = probe.getBoundingClientRect().width / 100;  // em units: --yahya-fit
  probe.remove();
  return fit;
}
// giant size = min(gridWidth / fit, heightBudget / 0.76)  <- show which bound won
```

### Pattern 3: Show two viewports in one trial page
Render each candidate's giant YAHYA inside fixed frames at **1440x900 and 1366x768** (scaled with `transform: scale()` to fit the screen), and print which bound won: width or height. Condensed faces lose "edge to edge" at 1366x768 (Pitfall 1), and Yahya should see that before he picks.

### Pattern 4: Design doc rev 5 skeleton (Claude's discretion; this is what unblocks Phases 2-8)
1. Header: title, `Status: DRAFT for Yahya's approval (revision 5: dark Swiss horizontal)`, date, owner, domain, host Vercel. This line later becomes `Status: APPROVED by Yahya, <date>`.
2. Intent and the "wow" sources (D-26 to D-28), anti-goals, the meaning test.
3. Constraints: Next.js static export on **Vercel** (custom headers through `vercel.json` `headers` are available [CITED: vercel.com/docs/project-configuration/vercel-json], unlike GitHub Pages), self-hosting, performance budget, accessibility, facts-only.
4. Decisions 1-6 table: each with Accepted/Overruled, the date, and a one-line note. Decision 6 note: "accepted; on Vercel the basePath risk disappears, the domain is still bought before the first deploy".
5. Visual system: link to UI-SPEC values (palette, grid, type roles, motion tokens) rather than restating them inconsistently. Restate only the final font, its licence, `--yahya-fit`, display weight, tracking and the fit-check results.
6. Navigation and paging model (hero letters, rail, pager, URLs, keys, swipe, reduced motion).
7. Six page compositions: one subsection each, with poster device, column spans, dominant element, Display group and the one-line phone intent (from UI-SPEC, updated with Checkpoint 2 picks).
8. Cursor: chosen variant, the 1:1 rule, touch/reduced-motion/forced-colours behaviour.
9. Material: what is in `docs/material/` and what is still missing.
10. Open items only Yahya can settle (CCC "top 1" scope, Atlantis line counts, Showdown AI status, domain purchase, font purchase).
11. Appendix "Retired" (D-17): light paper palette, Sofia-only rule, viscous bubble cursor and Sableye hint, folder stack, medals, EN/FR, credits page, stickers, 75-dot judge, scroll-driven header nav, Lenis, GitHub Pages/CNAME. Each with its reason and date.

### Anti-Patterns to Avoid
- **Committing paid or test font files.** This breaks the Klim test-font EULA ("must not distribute") and the web EULA (only on the licensed domain) [CITED: klim.co.nz/licences/test-fonts, /web-fonts].
- **Copying anything from `~/Downloads` by glob.** That folder also holds a passport scan, a transcript screenshot, an OAuth `client_secret_*.json` and an ICPC ID PDF [VERIFIED: `ls ~/Downloads`]. Copy named files only.
- **Restating UI-SPEC values in the doc with different numbers.** Pick one source of truth (UI-SPEC for tokens; the doc links to it and records only the trial results).
- **Writing paid font prices from memory.** The UI-SPEC forbids unverified numbers.
- **Building v7 with the old v6 behaviours left in** (the 75-dot judge, the `.big` overshoot curve, weights 200/500/600/800, `translateY` reveal, `you@example.com`). The v7 contract removes them [VERIFIED: grep of v6].

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| TTF to WOFF2 | Custom script | `fontTools.ttLib.woff2 compress` | Correct table transforms |
| Checking `tnum`/axes/advances | Eyeballing specimen pages | fontTools / HarfBuzz on the real file (this research did it) | Specimen pages hide missing features (Hanken) |
| Greyscale + crop + metadata strip | Canvas script | `magick … -crop … -colorspace Gray -strip` | One deterministic command |
| Resume redaction | Editing the PDF by hand or blacking out text | Re-export from JobOps Resume Studio (D-23) | Black boxes leave the text layer readable; re-export removes it |

## Asset Inventory (verified on disk 2026-11-06)

| Item | Location now | State | Action |
|------|-------------|-------|--------|
| v6 sketch | `docs/reference/swiss-horizontal-v6.html` | Present, **byte-identical** to the /tmp source, **untracked** (`?? docs/`) [VERIFIED: cmp, git status] | `git add` and commit first (SC-5) |
| Earlier explorations (v4, v5, hero-swiss-depth v1-3, fonts-novel-v1) | `/tmp/claude-1000/-home-atlas-Vault-…/content/` | In /tmp, may vanish [VERIFIED: ls] | Optional copy to `docs/reference/` (fonts-novel-v1 is useful for round 2) |
| Portrait | `/home/atlas/Downloads/DEVFEST 2026.jpeg` | 1512×1512, already a processed iOS export ("Fiesta" app), **no GPS** in EXIF; DevFest banner occupies **x ≥ 550, y ≥ 1244** [VERIFIED: exiftool, pixel scan] | Crop above y=1244, greyscale, strip |
| Resume | `/home/atlas/Downloads/Yahya_Hallani_Resume.pdf` (Sep 30) | **Old version**: still "May 2023 - Present", includes a phone number, PDF metadata `Author: M K` [VERIFIED: pdftotext, pdfinfo] | Yahya re-exports (D-23). Verify the new file (see Validation) |
| Email, LinkedIn, GitHub | Resume header | `yahya.hallani.email@gmail.com`, `linkedin.com/in/yahya-hallani`, `github.com/Yahya-github` [VERIFIED: pdftotext] | Write to `docs/material/links.md`; Yahya confirms the email is the public one |
| Facturo demo link | Resume + facts skill | `github.com/Yahya-github/facturo-demo` [VERIFIED: resume] | links.md |
| AG robotics site | CONTEXT | `https://agisback.crcrobotics.com/fr/` | links.md (optional) |
| AG logo | `~/Downloads/AG Logos Mø-Duel 2026/…/AG_svg_files/` | Optional, white single-colour SVG only | Copy only if used |
| Facturo screenshots, robot and Atlantis images | **Unknown location** (D-24 says Yahya has them) | Not found by research | Human-action step: Yahya names the paths |

### Portrait processing (Claude's discretion on crop)
Slot math (UI-SPEC grid): cols 1-4 at 1440x900 ≈ 448×772 CSS px (aspect ≈ 0.58); at 1366x768 ≈ 423×640 (≈ 0.66). The usable source height above the banner is 1243px, so the slot gets about **1.6 device pixels per CSS pixel at most**. It will be slightly soft on 2x displays. Ask Yahya for the original iPhone photo if one exists [VERIFIED: computed].

Recommended: commit one banner-free greyscale master and let v7 test `object-position` per viewport. Pre-cropping per breakpoint is Phase 6 work.
```bash
magick "/home/atlas/Downloads/DEVFEST 2026.jpeg" -auto-orient -crop 1512x1240+0+0 +repage \
  -colorspace Gray -strip -quality 90 docs/material/portrait-devfest-2026-grey.jpg
# suggested focus for object-position: face centre ≈ x 780 / 1512 (≈ 52%), head top ≈ y 215; head-to-mid-chest ≈ y 120-1000
```
Check after crop: the badge text at the bottom of the lanyard is small but could be legible. Yahya should confirm he is fine with what it shows.

### Resume redaction checks (D-23)
- No phone pattern: `pdftotext resume-public.pdf - | grep -E '\(?[0-9]{3}\)?[ .-]?[0-9]{3}[ .-][0-9]{4}'` returns nothing.
- `2025` appears on the freelance line, and `May 2023` is absent.
- `pdfinfo` metadata: the current file has `Author: M K`. Ask Yahya whether that should be blank or "Yahya Hallani". Strip it with `exiftool -Author= -Creator= -Producer= file.pdf` if he agrees. Exiftool PDF edits are incremental and reversible, so use `-overwrite_original` and recheck. [ASSUMED behaviour detail, verify on run]
- **Conflict to raise:** the resume lists "Built 6 full-stack features for the contest platform", but the site rule is "the CRC contest platform is not mentioned anywhere" [VERIFIED: resume text vs `portfolio-voice-and-facts`]. A public resume linked from the site would mention it. Yahya decides: remove the bullet in the public PDF, or accept that the resume and the site differ.
- The resume's CRC line reads "1st Place ... Programming; 2nd Place the next year (2025, 2026)", and the robot project line says "1st Place". It does not list "CRC robot 1st 2026" as a separate award, but the facts skill does. This does not block, but note it for Phase 7 copy.

## Common Pitfalls

### Pitfall 1: "Edge to edge" is not possible for a condensed face on a 1366x768 laptop
**What goes wrong:** Sofia Sans Extra Condensed 900 fitted to 1318px is about 664px font size (em box at line-height 0.76 ≈ 505px). The vertical budget is roughly 768 − 72 header − 56 footer − 96 hero gap − role lines ≈ 450-500px. The UI-SPEC `min()` cap then wins and the word stops short of the right margin.
**How to avoid:** The trial shows both viewports and reports which bound won (Pattern 3). If the condensed face wins, the doc must accept a height-bound word on short screens, or allow a lighter or less condensed weight.
**Warning sign:** The trial looks great only on a 1440x900 or larger screen.

### Pitfall 2: Display words overflow their columns for most faces
Measured at the Display role (700, −0.05em) [VERIFIED: HarfBuzz; available widths are estimates from the UI-SPEC grid and rail padding]:

| Face | "Achievements" @64px vs phone ≈322px | "Involvement" @1440 (129.6px) vs ≈656px | @1366 (122.9px) vs ≈619px |
|------|------|------|------|
| Inter Tight | 389 ✗ | 669 ✗ | 635 ✗ |
| Sofia Sans Ext. Cond. | 238 ✓ | 418 ✓ | 397 ✓ |
| Sofia Sans | 367 ✗ | 645 ✓ | 612 ✓ (tight) |
| Schibsted Grotesk | 413 ✗ | 734 ✗ | 696 ✗ |
| Hanken Grotesk | 373 ✗ | 655 ≈ | 621 ≈ |
| Instrument Sans (wdth 100) | 403 ✗ | 699 ✗ | 663 ✗ |

**What goes wrong:** The Experience head row ("Work" / "Involvement" in Display, cols 7-12) and the phone Achievements title break or overflow for almost every normal-width face.
**How to avoid:** The UI-SPEC already says to record the fit result and solve it in layout without a new type size. The doc must pick the fix per page *before* approval: Involvement head spans cols 6-12, the head row sits at Heading size, or Experience's Display clamp tops out lower. Otherwise the composition is not "decided". Instrument Sans's `wdth` axis is a further option if it wins.

### Pitfall 3: "One family, one variable file" vs the Sofia superfamily
Sofia Sans Extra Condensed and Sofia Sans are **separate variable files** on Google Fonts [VERIFIED: google/fonts repo]. Extra Condensed at 16px body is a poor reading face [ASSUMED]. If Sofia wins, ship two files (about 345KB each as TTF before subsetting) or use Extra Condensed only for YAHYA and Display. The doc must state how D-06 is read: "one superfamily, two files". Instrument Sans gives the same condensed-plus-normal effect from **one** file.

### Pitfall 4: The UI-SPEC's tnum criterion would wrongly fail Hanken Grotesk
Hanken has no `tnum` GSUB feature, but every digit is 560 units wide by default [VERIFIED: fontTools]. Reword the criterion as "tabular figures available (a `tnum` feature, or tabular by default)". Otherwise a valid candidate is dropped on a technicality.

### Pitfall 5: Weight ranges differ per face
Instrument Sans maxes at 700, and Schibsted starts at 400. The UI-SPEC allows a display weight of 700-800. The trial must render each face at its own valid display weight and print it, so no face is judged on a synthesised bold.

### Pitfall 6: Paid font licence traps
- Klim web licences allow **only Klim's WOFF2**. Converting to other formats is prohibited, and subsetting is allowed but unsupported [CITED: klim.co.nz/licences/web-fonts]. `next/font/local` with the original WOFF2 is compatible. Do not run a subsetter on it without re-reading the EULA.
- Söhne variable comes only with the full family [CITED: klim.co.nz/fonts/soehne]. Under $300, plan on 2 static weights, which still satisfies D-06 "2-3 weights". The UI-SPEC already allows "a variable file (or 2 static weights)".
- Licences are tied to a domain you own. yahya-h.dev is **not bought yet**, so a purchase must name that domain, or the licence moves later with notice to Klim [CITED: klim web EULA].
- Swiss Typefaces trial needs an account and a signed Test EULA, and the trial charset is partial [CITED: swisstypefaces.com/support/trial-fonts via search]. Missing glyphs (figures, punctuation) can make the face look broken in the trial.
- Test fonts must not be used on the live site or distributed [CITED: klim.co.nz/licences/test-fonts].

### Pitfall 7: Stale guidance leaks into rev 5
`~/.claude/skills/portfolio-design/SKILL.md` still describes the **light** design (paper palette, Sofia-only, viscous bubble, folders, "no lines, no small labels", Lenis). CLAUDE.md and STACK.md still describe GitHub Pages. `portfolio-voice-and-facts` still says the CCC carries a gold medal icon (medals are dropped, D-20) [VERIFIED: file reads]. Rev 5 must not inherit any of these. Recommend a follow-up (with Yahya's OK, since the skills sit outside the repo) to update both skills after approval. Until then, rev 5 says explicitly that it overrides them.

### Pitfall 8: Private files in Downloads
See Anti-Patterns. Also strip metadata from every image copied into `docs/material/`. The portrait has no GPS, but other phone photos (robot, events) may [ASSUMED].

### Pitfall 9: The gate commit is not reached by automation
D-25 says the gate passes on Yahya's approval commit. Under `mode: yolo` the executor may try to auto-advance. The plan must use explicit `checkpoint:human-verify` / `checkpoint:decision` tasks for the font pick, the v7 picks and the approval. Claude never writes `APPROVED` on its own.

## Code Examples

### Verify a candidate font's features (reusable for round 2)
```python
# Source: written and run in this session (fontTools 4.x)
from fontTools.ttLib import TTFont
f = TTFont(path)
feats = {r.FeatureTag for r in f["GSUB"].table.FeatureList.FeatureRecord}
axes = [(a.axisTag, a.minValue, a.maxValue) for a in f["fvar"].axes] if "fvar" in f else []
cmap, hm = f.getBestCmap(), f["hmtx"]
tabular_default = len({hm[cmap[ord(c)]][0] for c in "0123456789"}) == 1
print("tnum" in feats or tabular_default, axes)
```

## State of the Art

| Old approach (rev 4) | Current (rev 5) | When changed | Impact |
|--------------|------------------|--------------|--------|
| Light paper `#f8f8f8`, green `#2f5d46` | Dark `#0b0b0b`, ink `#f0f0f0`, accent `#5fae84` | 2026-11-05 | Retired appendix |
| Vertical scroll, letters fly to a top header | Horizontal pages, letters FLIP to a left rail (WAAPI, Decision 2) | 2026-11-05/06 | — |
| Viscous bubble cursor, Sableye hint | 1:1 cursor, 3 variants in v7 | 2026-11-06 (D-18/19) | New requirement |
| Folder-stack projects, medals, stickers, credits page, EN/FR | Dropped | 2026-11-06 (D-20) | Retired appendix |
| 75-dot judge | Static typographic 75/75 (a or b) | 2026-11-06 | CONT-02 may change |
| GitHub Pages + CNAME + basePath | Vercel, no basePath | 2026-11-06 | Decision 6 note |
| Depth map | Dropped; Phase 8 = Interactive Proof | 2026-11-06 (D-26) | Retired appendix |

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Söhne under $300 means 2 static weights, not the variable family | Fonts table, Pitfall 6 | Budget decision; check the Klim buy page |
| A2 | Sofia Sans Extra Condensed reads poorly as 16px body | Pitfall 3 | Could allow a true single-file Sofia setup; the trial body paragraph settles it |
| A3 | Other phone photos may carry GPS metadata | Pitfall 8 | Low; the strip step runs anyway |
| A4 | `exiftool` can blank PDF Author cleanly | Resume checks | Fallback: Yahya sets metadata in Resume Studio export |
| A5 | Neue Haas Grotesk web licence is a page-view tier on MyFonts, price unknown | Fonts table | Only matters if Yahya favours it |
| A6 | Instrument Sans is common on 2024-25 startup sites (anti-vibe risk) | Alternatives | Taste call for Yahya |

## Open Questions (RESOLVED)

1. **Paid font prices and which paid face (if any) enters the trial.** Pricing pages render client-side and could not be read. Recommendation: the trial plan includes a human-action step where Yahya (or a browser session) reads the Söhne, Suisse Int'l and Neue Haas web prices for a <10k pageview tier and downloads the test fonts with his account. Paid blocks show "not installed" until then. Don't block the OFL comparison on this. RESOLVED: handled in plan 01-05 (Task 1 checkpoint: Yahya installs test fonts and reads prices; otherwise "price not verified").
2. **Where are the Facturo screenshots and the robot/Atlantis images?** Unknown. Use a human-action task: Yahya lists the paths. RESOLVED: plan 01-04 Task 1 (human-action: Yahya lists exact paths).
3. **Public resume and contest platform bullet** (see Resume checks). Yahya decides. RESOLVED: plan 01-04 Task 1 (Yahya decides removed/kept; recorded in links.md).
4. **Is `yahya.hallani.email@gmail.com` the address for the site?** It comes from the resume, so it is very likely. Confirm in links.md review. RESOLVED: plan 01-04 Task 1 (Yahya confirms the public email).
5. **Update the user-level skills after approval?** They sit outside the repo. Ask Yahya. RESOLVED: plan 01-08 Task 2 (Yahya says yes/no; recorded as a STATE.md todo, not done in Phase 1).
6. **CLAUDE.md stack section is stale (GitHub Pages).** CLAUDE.md is GSD-generated. Recommend regenerating it after approval rather than hand-editing it in this phase. RESOLVED: plan 01-08 Task 2 (Yahya says yes/no; recorded as a STATE.md todo).

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| ImageMagick `magick` | Portrait crop/greyscale | ✓ | 7.1.2-34 | — |
| exiftool | Metadata checks/strip | ✓ | 13.50 | — |
| pdftotext / pdfinfo (poppler) | Resume checks | ✓ | installed | — |
| Python 3 + venv/pip | fontTools for WOFF2 + inspection | ✓ | 3.12.12 | Download WOFF2 from fontsource npm instead |
| fontTools/brotli | WOFF2 conversion | ✗ system / ✓ scratchpad venv | — | `pip install` into a venv |
| Ghostscript | not needed | ✓ | 10.05.1 | — |
| Browser | Yahya views trial/v7 | ✓ (his machine) | — | — |
| Network (GitHub raw) | Fetch OFL fonts | ✓ | — | — |
| Paid test fonts | Trial buckets 6-8 | ✗ (need Yahya's foundry accounts) | — | Trial runs with OFL faces; paid blocks fill in later |
| Facturo/robot/Atlantis images | SC-4 | ✗ (location unknown) | — | Human-action step |
| Re-exported resume | SC-4 | ✗ (only old version exists) | — | Human-action step in JobOps |

## Validation Architecture

No test framework is needed or wanted (no product code). Validation is shell checks runnable in seconds, plus human checkpoints. The commands below are the VALIDATION.md source. Run them from the repo root with `D=docs/superpowers/specs/2026-11-03-portfolio-design.md`.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | none: POSIX shell + grep, git, pdftotext, pdfinfo, exiftool |
| Config file | none |
| Quick run command | the per-criterion commands below |
| Full suite command | all SC-1 to SC-5 commands in sequence (could be wrapped in `.planning/phases/01-design-gate/check.sh`; that file is planning tooling, not product code) |

### Success Criteria → Check Map
| SC | Behavior | Type | Automated command | Exists? |
|----|----------|------|-------------------|---------|
| SC-1a | Doc is rev 5, dark direction | grep | `grep -q 'revision 5' $D && grep -q '#0b0b0b' $D && grep -qi 'horizontal' $D` | ❌ until rewrite |
| SC-1b | Retired terms only in the Retired appendix | awk | `awk '/^## .*Retired/{r=1} !r && /#f8f8f8\|viscous\|folder stack\|Sableye\|GitHub Pages\|CNAME/{print NR": "$0; bad=1} END{exit bad}' $D` | ❌ |
| SC-1c | Approved | grep + git | `grep -Eq '^Status: APPROVED by Yahya, 20[0-9]{2}-[0-9]{2}-[0-9]{2}' $D && git log -1 --format=%s -- $D` | ❌ (human gate) |
| SC-2a | Trial page exists, all shortlisted faces present | grep | `test -f docs/reference/font-trial.html && for f in 'Inter Tight' 'Sofia Sans' Schibsted Hanken Instrument; do grep -q "$f" docs/reference/font-trial.html \|\| echo "missing $f"; done` | ❌ |
| SC-2b | Winner + licence + fit constant recorded | grep | `grep -Eqi 'final (font\|family)' $D && grep -Eqi '(SIL Open Font License\|OFL\|web licen[cs]e)' $D && grep -q -- '--yahya-fit' $D` | ❌ |
| SC-2c | No paid/test font files in git | git | `git ls-files \| grep -Ei '\.(woff2?\|otf\|ttf)$' \| grep -viE 'InterTight\|SofiaSans\|Schibsted\|Hanken\|Instrument' && echo FAIL \|\| echo ok`; plus `git ls-files docs/reference/fonts \| grep -q OFL` | ❌ |
| SC-3a | Six page sections with grid spans | grep | `for p in Index Achievements Projects Experience About 'Say hi'; do grep -Eq "^#{2,4} .*$p" $D \|\| echo "no section $p"; done; grep -c 'cols\? [0-9]' $D` | ❌ |
| SC-3b | Distinct poster devices | grep | `grep -i 'poster device' $D \| sed 's/.*device[^:]*: *//I' \| sort \| uniq -d` prints nothing | ❌ |
| SC-3c | Display-word overflow resolved | grep | `grep -Eqi 'Involvement.*(fits\|cols 6\|Heading)' $D` | ❌ |
| SC-3d | v7 sketch exists, no retired v6 parts | grep | `V=docs/reference/swiss-horizontal-v7.html; test -f $V && ! grep -qE 'example\.com\|1\.56,\|fonts\.googleapis' $V` | ❌ |
| SC-4a | Material folder has portrait, resume, links | ls | `ls docs/material/portrait*.jpg docs/material/*.pdf docs/material/links.md` | ❌ |
| SC-4b | Resume redacted | pdftotext | `! pdftotext docs/material/*.pdf - \| grep -Eq '\(?[0-9]{3}\)?[ .-]?[0-9]{3}[ .-][0-9]{4}' && ! pdftotext docs/material/*.pdf - \| grep -q 'May 2023' && pdftotext docs/material/*.pdf - \| grep -q '2025'` | ❌ |
| SC-4c | Images greyscale, no GPS | exiftool/magick | `exiftool -q -if '$GPSLatitude' -p '$FileName' -r docs/material` prints nothing; `magick identify -format '%[colorspace]\n' docs/material/portrait*.jpg` = `Gray` | ❌ |
| SC-4d | Links file complete | grep | `grep -q 'linkedin.com/in/' docs/material/links.md && grep -q 'github.com/Yahya-github' docs/material/links.md && grep -q '@' docs/material/links.md` | ❌ |
| SC-4e | No private Downloads files leaked | git | `git ls-files \| grep -Ei 'passport\|transcript\|client_secret\|ICPCId' && echo FAIL \|\| echo ok` | ✅ runnable now |
| SC-5a | v6 tracked | git | `git ls-files --error-unmatch docs/reference/swiss-horizontal-v6.html` | ❌ (untracked now) |
| SC-5b | Decisions 1-6 recorded, Vercel host | grep | `for n in 1 2 3 4 5 6; do grep -Eq "Decision $n.*(Accepted\|Overruled)" $D \|\| echo "D$n missing"; done; grep -q Vercel $D` | ❌ |
| REQ edits | Cursor requirement added; anti-feature line fixed | grep | `grep -Eqi '^- \[ \] \*\*[A-Z]+-[0-9]+\*\*:.*cursor' .planning/REQUIREMENTS.md && ! grep -Eq '^- Contact form, custom cursor' .planning/REQUIREMENTS.md` | ❌ |

Manual-only (human checkpoints, cannot be automated): font pick (D-03), Achievements a/b and cursor a/b/c picks (D-11, D-19), portrait crop OK, final approval (D-25). If (b) wins: `grep CONT-02 .planning/REQUIREMENTS.md` no longer says "giant".

### Sampling Rate
- **Per task commit:** the SC rows touched by that task.
- **Per wave merge:** all automated rows that are expected to pass by then.
- **Phase gate:** all rows green plus the approval commit, before `/gsd-verify-work`.

### Wave 0 Gaps
- [ ] `.gitignore` with `docs/reference/fonts-private/` (before any paid test font touches the repo)
- [ ] Commit `docs/reference/swiss-horizontal-v6.html` (SC-5a)
- [ ] Optional `check.sh` wrapping the table above (planning tooling only)

## Security Domain

Security enforcement is enabled by default. This phase has no runtime surface; the relevant controls are privacy and licensing.

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | — |
| V3 Session Management | no | — |
| V4 Access Control | no | — |
| V5 Input Validation | no | — |
| V6 Cryptography | no | — |
| V8 Data Protection (privacy) | **yes** | Redacted resume (no phone), metadata stripped from images and PDF, named-file copies only from `~/Downloads` |
| V14 Configuration (secrets) | **yes** | `client_secret_*.json` in Downloads must never enter the repo; the SC-4e check |

### Known threat patterns for this phase
| Pattern | STRIDE | Mitigation |
|---------|--------|------------|
| Personal data in a public repo (phone, passport, transcript) | Information disclosure | Named copies, pdftotext/git-ls-files checks |
| EXIF GPS or device data in photos | Information disclosure | `magick -strip` / `exiftool -all=`, exiftool check |
| Redaction by overlay leaves the text layer | Information disclosure | Re-export from source (D-23), verify with pdftotext |
| Licence breach by committing paid/test fonts | Legal / repudiation | `.gitignore`, `local()` loading, SC-2c check |

## Sources

### Primary (HIGH confidence)
- google/fonts repo `ofl/{intertight,sofiasansextracondensed,sofiasans,schibstedgrotesk,hankengrotesk,instrumentsans}`: files downloaded and inspected with fontTools/HarfBuzz (licence strings, axes, `tnum`, advances, cap heights)
- https://klim.co.nz/licences/web-fonts/: self-hosting, WOFF2-only, page-view tiers, domain ownership, perpetual
- https://klim.co.nz/licences/test-fonts/: evaluation-only, no distribution, no customer-facing use
- https://klim.co.nz/fonts/soehne/: variable only with full family, `tnum`, weights
- https://vercel.com/docs/project-configuration/vercel-json (updated 2026-08-14): `headers`, `cleanUrls`, `trailingSlash`
- Local files: CONTEXT, UI-SPEC, REQUIREMENTS, ROADMAP, PROJECT, research SUMMARY, design doc rev 4, v6 sketch, skills, resume (pdftotext/pdfinfo), portrait (exiftool, pixel scan), `~/Downloads` listing

### Secondary (MEDIUM confidence)
- swisstypefaces.com trial-fonts and advantages pages (via search snippets): trial needs signed Test EULA, partial charset; webfont included with purchase

### Tertiary (LOW confidence)
- MyFonts Neue Haas Grotesk listing prices and Bloomberg CSS page-view header (search snippets only)

## Metadata

**Confidence breakdown:**
- Free font facts: HIGH (measured on the actual files)
- Paid font licensing: MEDIUM (terms read, prices not readable)
- Asset inventory: HIGH (on-disk checks); screenshots and photos location unknown
- Fit and overflow numbers: MEDIUM-HIGH (shaping exact; available widths derived from UI-SPEC grid assumptions)
- Validation commands: HIGH (standard tools, present locally)

**Research date:** 2026-11-06
**Valid until:** 2026-12-06 (font licence terms and prices may change; re-check before purchase)
