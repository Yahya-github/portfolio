# Phase 1: Design Gate - Context

**Gathered:** 2026-11-06
**Status:** Ready for planning

<domain>
## Phase Boundary

No product code. This phase delivers:
- `docs/superpowers/specs/2026-11-03-portfolio-design.md` rewritten for the dark Swiss horizontal direction and marked approved by Yahya
- A final sans family, chosen after a side-by-side trial on the giant YAHYA, with its self-hosting licence confirmed
- Written, distinct compositions for all six pages on the 12-column grid, plus a throwaway v7 HTML sketch to judge them by eye
- Real material collected in `docs/material/`
- The v6 sketch saved under `docs/reference/`, with research Decisions 1-6 recorded (already accepted in PROJECT.md Key Decisions) and Vercel as the host

</domain>

<decisions>
## Implementation Decisions

### Font trial
- **D-01:** Candidates come from four buckets: Inter Tight (current placeholder), Sofia Sans Extra Condensed, free Neue Haas-style grotesques (e.g. Schibsted Grotesk, Hanken Grotesk, Instrument Sans), and paid foundry Swiss grotesques. Claude shortlists about 6-8 faces in total.
- **D-02:** Paid web licence budget is up to about $300. Confirm that each face allows self-hosted web use (DEP-02).
- **D-03:** The winner is judged on how the giant YAHYA looks. Body text must still read well.
- **D-04:** Format is one throwaway HTML side-by-side page on a black ground, saved in `docs/reference/`. Each candidate shows the giant YAHYA (edge to edge, fitted to the grid margins), the small rail-size YAHYA stacked vertically, and a body paragraph. Numerals appear at a medium size for reference only.
- **D-05:** YAHYA is set in caps with tight, negative tracking. No italics anywhere on the site.
- **D-06:** One family, strictly. No monospace; counters use the sans's tabular figures. A variable file is self-hosted and the site uses 2-3 weights.
- **D-07:** English glyphs only for now. Latin-Extended coverage is not a selection criterion.
- **D-08:** If nothing wins, run a second round with 3 new faces chosen from the feedback. Maximum 2 rounds.

### Page compositions
- **D-09:** Approval artifacts: the design doc gives a written spec per page (column spans, scale, dominant element), and a throwaway v7 HTML sketch shows all six pages. Both go to Yahya.
- **D-10:** Each page borrows one Swiss poster device so no two layouts match (DSGN-03). Claude proposes, Yahya picks.
- **D-11:** Achievements: v7 shows two variants. In (a), 75/75 dominates but is smaller than YAHYA, with the four first places beside it. In (b), 75/75 has equal weight in a typographic list of the results. Yahya is unsure whether 75/75 should be giant; CONT-02 says "giant", so if he picks (b), CONT-02 must be updated.
- **D-12:** Projects: Facturo spans about 8 columns. The other four (Atlantis, CRC problems, robot firmware, Showdown AI) stack in the remaining 4 columns as compact rows (problem, role, result, links). The Facturo deep dive stays a separate route.
- **D-13:** Experience: a ruled two-column table, with Work on the left and Involvement on the right. Hairline rules, years and roles flush left.
- **D-14:** Say hi: three giant type lines for Email (copies the address on click), LinkedIn and GitHub, plus Resume as a fourth line.
- **D-15:** About: text in Yahya's voice plus an image slot for a **real, recognisable portrait**, because recruiters should see his face. Plain greyscale, no effect (see D-26).
- **D-16:** Desktop compositions are approved now. Each page gets only a one-line note on its phone portrait intent; full phone layouts come in Phase 6.

### Old doc leftovers (rewrite = revision 5, in place)
- **D-17:** Rewrite the doc in place at the same path as revision 5. Retired light-design decisions go to a short "Retired" appendix with the reason and date.
- **D-18:** **Custom cursor stays in v1** (this reverses the REQUIREMENTS out-of-scope "custom cursor" line; add a requirement and remove the anti-feature line). Its job is to feel crafted and to guide navigation. The Sableye pink/green meaning is dropped, and so is the viscous bubble. The only hard rule is **1:1 tracking**: the cursor always sits exactly on the pointer, with no lag or spring, though its shape may change. The native cursor may be hidden. Touch devices get no custom cursor. Under reduced motion, shape changes are instant.
- **D-19:** Cursor form is not decided. v7 includes 3 toggleable variants, for example (a) an exact square that snaps around letters and links and shows the section name, (b) a fine crosshair or registration mark in the accent, (c) the native cursor plus a context label over the YAHYA letters. Yahya picks by feel.
- **D-20:** Dropped: the folder-stack projects, medal icons (rank is set as type: "1st", "2nd"), the EN/FR switch and `/en` `/fr` prefixes (English-only routes such as `/achievements/`; French is v2 and the data files keep it cheap), and the credits page (no third-party art remains). Pixel stickers and Icons8 were already dropped.

### Material & approval
- **D-21:** Raw material lives in `docs/material/` in the repo, public-safe files only. Later phases copy optimised versions to `public/`.
- **D-22:** Portrait source is `/home/atlas/Downloads/DEVFEST 2026.jpeg`. Crop out the DevFest Montreal banner at the bottom and frame from head to mid-chest with the lanyard visible. **Keep the Google Developer Group backdrop**, which counts as proof of GDG involvement, and convert the image to greyscale so the multicolour logos do not fight the green accent.
- **D-23:** Public resume PDF: freelance date fixed to "2025 – Present" and the phone number removed. Yahya edits it in JobOps Resume Studio and re-exports it.
- **D-24:** Yahya already has the resume, Facturo screenshots, robot and Atlantis images, and his email, LinkedIn and GitHub URLs. They only need to be moved into `docs/material/`. He may add more (see Specific Ideas).
- **D-25:** Approval: the doc header changes to `Status: APPROVED by Yahya, <date>` in a commit. The gate passes on that commit.

### Visual "wow" direction (decided after the first context write)
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

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project scope and decisions
- `.planning/PROJECT.md`: vision, constraints, Key Decisions table (research Decisions 1-6 already recorded there)
- `.planning/REQUIREMENTS.md`: v1 requirements; DSGN-05 rewritten and PROOF-01/02 added (D-26); CONT-02 ("giant" 75/75) and the "custom cursor" out-of-scope line are still affected by D-11 and D-18
- `.planning/ROADMAP.md` §Phase 1: success criteria 1-5

### Design
- `docs/superpowers/specs/2026-11-03-portfolio-design.md`: the doc to rewrite (revision 4, light paper design, now outdated)
- `/tmp/claude-1000/-home-atlas-Vault-03---Resources-Productivity/86bf6a2b-4393-4eb6-8b75-ceb5892cd0f7/scratchpad/portfolio-mockups/.superpowers/brainstorm/3124024-1793925886/content/swiss-horizontal-v6.html`: current reference sketch; copy it to `docs/reference/` (it sits in /tmp and may disappear, so do this first). It still holds the retired 75-dot judge.
- Same folder: `hero-swiss-depth-v1..v3.html`, `swiss-horizontal-v4/v5.html`, `fonts-novel-v1.html`: earlier explorations, useful for the font trial

### Research
- `.planning/research/SUMMARY.md`: Decisions 1-6 and pitfalls (font-load shift, fitted type)
- `.planning/research/FEATURES.md`, `.planning/research/PITFALLS.md`: anti-features list (custom cursor; D-18 overrides it)

### Skills
- `portfolio-design`, `portfolio-voice-and-facts` (verified facts), `anti-vibe-design`

### Material
- `/home/atlas/Downloads/DEVFEST 2026.jpeg`: portrait source (D-22)
- `https://agisback.crcrobotics.com/fr/`: AG robotics team website (CRC). Optional. Use it as the outbound link on the robot firmware project and as a fact source for the CRC results.
- `/home/atlas/Downloads/AG Logos Mø-Duel 2026/AG Logos Mø-Duel 2026/AG Files 2025-2026/AG_svg_files/`: team logo (SVG, black and white versions; PNGs in the sibling `AG_png_files/`). Optional. If used, only the single-colour white SVG, small, next to the robot project as attribution, never as decoration (DSGN-06). Skip `AG Online` (social banners) and the `__MACOSX` junk.
- Robot 3D model: may arrive later; not needed for Phase 1. It feeds Phase 8 (PROOF-02).

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- None. The repo holds only planning docs and the draft design doc. This is expected, since the gate forbids product code.
- The v6 sketch contains a working wheel accumulator, key map, swipe handler and letter fit logic. They are a behaviour reference only, not code to keep.

### Established Patterns
- Throwaway HTML sketches have been the approval medium (v1-v44 light, v1-v6 dark). Continue with v7 plus the font trial page.

### Integration Points
- `docs/reference/` (new): v6 sketch, font trial, v7 sketch
- `docs/material/` (new): portrait, screenshots, resume, links file

</code_context>

<specifics>
## Specific Ideas

- Yahya's "that kid is cracked" goal: the GDG backdrop in the portrait counts as quiet proof.
- Assets Yahya may add (all real): proof sources for every claim (CCC 2026 result, DIRO hackathon, video game competition, CRC 2025/2026 results), more real event or robot photos, Showdown AI material or confirmation that it is "in progress" only, GitHub repo links per project, the robot CAD file (later), and any font licence he already owns.

</specifics>

<deferred>
## Deferred Ideas

- Viscous goo cursor and the Sableye pink/green hint: dropped, not deferred
- French version and `/fr` routes: v2
- Full phone portrait layouts: Phase 6
- Depth-map treatment: dropped (D-26), not deferred. Phase 8 is now Interactive Proof
- Requirements updates applied 2026-11-06: DSGN-05 rewritten, PROOF-01/02 added. Still pending: a custom cursor requirement plus removing the anti-feature line (D-18); possibly CONT-02 (D-11)

</deferred>

---

*Phase: 01-design-gate*
*Context gathered: 2026-11-06*
