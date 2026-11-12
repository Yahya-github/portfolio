# Phase 7 Fact Check

Sources: public/yahya-hallani-resume.pdf (sha256 b7b7bf90a32d40d4df12f83c4f052d641f8ecf1740dfa2c6d01cb313efa6dbfa), docs/material/links.md, portfolio-voice-and-facts skill. Created 2026-11-12.

Status key: consistent (site and source agree), MISMATCH (site and source disagree), omission (source has it, other side lacks it), needs-confirmation (number or fact Yahya must confirm, D-03), unsourced (no written source found).

## Claims

| ID | Claim (verbatim) | Where | Source | Status | Confirmed by Yahya |
|----|------------------|-------|--------|--------|--------------------|
| C-01 | 75/75, Canadian Computing Competition, perfect score, 2026 | content/achievements.ts lines[0] | Resume: "Perfect Score - 75/75, Canadian Computing Competition, University of Waterloo ... 2026" | needs-confirmation | |
| C-02 | 1st of 18 teams from 9 CEGEPs, $2,500 team scholarship, 2026 (DIRO Hackathon, Université de Montréal) | content/achievements.ts lines[1] | Resume: "1st Place - DIRO Hackathon, Université de Montréal (1st of 18 teams from 9 CEGEPs; $2,500 team scholarship) 2026" | needs-confirmation | |
| C-03 | DIRO article link and photo caption "The winners with their certificates" | content/achievements.ts lines[1].href, preview | Skill fact (DIRO win); article URL not in resume | unsourced | |
| C-04 | 1st, Intercollegiate Video Game Creation Competition, with Atlantis, a 2D game in Godot 4, 2026 | content/achievements.ts lines[2] | Resume: "1st Place - Intercollegiate Video Game Creation Competition (Atlantis, 2D game built in Godot 4) 2026" | consistent | |
| C-05 | 1st, Canadian Robotics Competition, robot competition, 2026 | content/achievements.ts lines[3] | Skill: CRC robot 1st in 2026 (confirmed by Yahya). Resume: "CRC 2026 Competition Robot ... 1st Place" | consistent | |
| C-06 | Photo caption "Our school's Club of the Year" | content/achievements.ts lines[3].preview | Instagram post link only; no written source | unsourced | |
| C-07 | 1st in Programming in 2025, 2nd in Senior Programming in 2026 | content/achievements.ts lines[4] | Resume: "1st Place - Canadian Robotics Competition, Programming (lead programmer); 2nd Place the next year ... 2025, 2026". Skill: confirmed by Yahya | consistent | |
| C-08 | Facturo: "more than 700 tests" | content/projects.ts flagship.lines[1]; content/facturo.ts metaDescription, sections[2]; content/site.ts sections[2].description | Resume: "backed by 700+ tests (pytest, Playwright e2e, ...)" | needs-confirmation | |
| C-09 | Facturo, Developer, "Jun 2026 to Oct 2026", ended | content/experience.ts work[2]; content/facturo.ts meta[1] | Resume: "Facturo - Local-First Invoicing App ... Jun 2026 - Present" | MISMATCH | |
| C-10 | Facturo is "for a Quebec trucking company", local-first, TPS/TVQ, Excel/PDF, reconciles supplier payments | content/projects.ts flagship; content/facturo.ts sections | Resume Facturo bullet 1 | consistent | |
| C-11 | Local vision model reads handwritten tickets, misreads snapped by edit distance, uncertain fields left blank | content/facturo.ts sections[1] | Resume Facturo bullet 2 (Ollama) | consistent | |
| C-12 | GitHub Actions and PyInstaller releases, SHA-256-verified in-app updates, rollback | content/facturo.ts sections[1] | Resume Facturo bullet 3 | consistent | |
| C-13 | Facturo demo repo https://github.com/Yahya-github/facturo-demo, fictional data | content/facturo.ts links.items[0] | Skill fact; docs/material/links.md | needs-confirmation | |
| C-14 | MAME Tool Rental: tool and machine rental, admin dashboard, FastAPI and Next.js, deployed only after every test passes, "Built for MAME, in use at MAME" | content/projects.ts rows[0] | Skill fact only; not on the resume | unsourced | |
| C-15 | MAME Tool Rental, Developer, "Since Nov 2026", McGill Association of Mechanical Engineers | content/experience.ts work[0] | Skill fact; resume has no MAME entry | omission | |
| C-16 | MAME live site https://mame-tool-rental.vercel.app/ | content/projects.ts rows[0].link | Skill fact; docs/material/links.md | needs-confirmation | |
| C-17 | Atlantis: 2D game in Godot 4, built with a team | content/projects.ts rows[1].lines[0] | Resume Atlantis entry; skill | consistent | |
| C-18 | Atlantis: "Architected 6 gameplay systems" | content/projects.ts rows[1].lines[1] | Resume: "Architected 6 gameplay systems" | needs-confirmation | |
| C-19 | Atlantis: 1st place, Intercollegiate Video Game Creation Competition 2026 | content/projects.ts rows[1].lines[2] | Resume: "Atlantis ... 1st Place | Jan 2026" | consistent | |
| C-20 | CRC problems: 12 algorithmic problems for CRC 2027 | content/projects.ts rows[2].lines[0] | Resume: "Authored 12 algorithmic problems ... CRC 2027" | needs-confirmation | |
| C-21 | CRC problems: author, volunteer since February 2026 | content/projects.ts rows[2].lines[1]; content/experience.ts work[3] ("Since Feb 2026") | Resume: "Feb 2026 - Present ... (Volunteer)" | consistent | |
| C-22 | CRC problems: reference solutions and 20+ edge-case tests each, in C++ and Python | content/projects.ts rows[2].lines[2] | Resume: "20+ edge-case tests per problem in C++ and Python" | needs-confirmation | |
| C-23 | Robot firmware: CRC 2026 robot, embedded state machine in C/C++, PID tuning, 1st place, 2026 | content/projects.ts rows[3] | Resume: "CRC 2026 Competition Robot ... 1st Place | Sep 2025 - Feb 2026" | consistent | |
| C-24 | Team site https://agisback.crcrobotics.com/fr/ | content/projects.ts rows[3].link | Skill fact; docs/material/links.md | needs-confirmation | |
| C-25 | Showdown AI: "In progress, nothing built yet" | content/projects.ts rows[4] | Skill fact (planned on Metamon, never shown as built) | consistent | |
| C-26 | Mercor, Coding agent evaluator, "Since Sep 2026", contractor | content/experience.ts work[1] | Resume: "Mercor ... Sep 2026 - Present, Coding Agent Evaluator (Contractor)" | consistent | |
| C-27 | Freelance developer, "Since 2025" | content/experience.ts work[4].date | Resume: "Self-Employed ... May 2025 - Present". Skill note "May 2023" is stale | consistent | |
| C-28 | Freelance: "12 projects for 9 clients" | content/experience.ts work[4].organisation | Resume: "Delivered 12 projects for 9 clients" | needs-confirmation | |
| C-29 | Involvement: Software, McGill Robotics; Full-stack, GDG at McGill (subteam project); Competitor, McGill Compete, ICPC NENA | content/experience.ts involvement | Skill fact (ICPC NENA confirmed); not on the resume | unsourced | |
| C-30 | Software Engineering at McGill (role line) | content/site.ts roleLine | Resume: "Bachelor of Engineering, Software Engineering (Co-op)", McGill, May 2026 - May 2030 | consistent | |
| C-31 | Contact: yahya.hallani.email@gmail.com, linkedin.com/in/yahya-hallani, github.com/Yahya-github | content/site.ts contact | Resume header line | consistent | |
| C-32 | Competitive Pokémon is like chess with more variables; Minecraft automation packs SkyFactory and StoneBlock | content/about.ts paragraph | Skill: Yahya's own words, 2026-11-03 session | consistent | |
| C-33 | "I decide fast under pressure, and I build things that run themselves." | content/about.ts lead; content/site.ts sections[4].description | Skill: placeholder from design doc, Yahya's to rewrite | needs-confirmation | |
| C-34 | Portrait alt "Yahya Hallani at DevFest Montreal 2026" | content/about.ts portraitAlt | docs/material/portrait-devfest-2026-*.jpg filenames | needs-confirmation | |
| C-35 | Resume PDF (public download) shows Atlantis "about 770 of 1,900 lines" of GDScript | public/yahya-hallani-resume.pdf, Atlantis bullet | Skill rule: no Atlantis line counts on the site | MISMATCH | |
| C-36 | Resume PDF (public download) shows "Montreal, QC" and email only, no phone | public/yahya-hallani-resume.pdf header | tests/resume-facts.test.ts phone check | consistent | |

## Mismatches and open decisions

| ID | Item | Detail | Options |
|----|------|--------|---------|
| F-1 | Facturo end date | Site: "Jun 2026 to Oct 2026", ended. Resume: "Jun 2026 - Present" (also in the resume title block). | (a) Re-export the resume with "Jun 2026 - Oct 2026" and keep the site. (b) The role is ongoing; change the site to "Since Jun 2026" and set `ended` to false. |
| F-2 | Freelance start | Resume: "May 2025 - Present". Site: "Since 2025". The skill's note that the resume reads "May 2023" is stale; the PDF reads May 2025. | (a) Keep "Since 2025". (b) Change to "Since May 2025". |
| F-3 | MAME Tool Rental missing from the resume | Site lists it in Experience and Projects; the resume has no entry. | (a) Add it on the re-export. (b) Accept the omission. |
| F-4 | Achievements meta description is 184 characters | Limit is 160 (UI-SPEC). Current text is in content/site.ts sections[1].description. Yahya supplies the shorter line (D-01). | Yahya writes a line of 160 characters or fewer. |
| F-5 | Atlantis line counts on the resume | The public PDF says "about 770 of 1,900 lines". The never-on-the-site rule bans line counts, and the PDF is downloadable from the site. | (a) Remove the counts on the re-export. (b) Keep them and relax the rule. |
| F-6 | Claims with no written source | C-03, C-06, C-14, C-29 and the link targets in C-13, C-16, C-24 rest on the skill or links.md only. | Yahya confirms each is accurate and current. |

## Never-on-the-site check

Run over `content/` on 2026-11-12.

| Rule | Command | Result |
|------|---------|--------|
| No "top 1" or CCC rank wording, no medal icons | `grep -rniE "top 1\|top-1\|top one\|medal" content/` | pass (no matches; the `rank` hits are the field name and "1st"/"75/75" values) |
| No phone number | `grep -rnE "\(?[0-9]{3}\)?[ .-][0-9]{3}[ .-][0-9]{4}" content/` | pass (no matches) |
| No CRC contest platform | `grep -rniE "dmoj\|codeforces\|contest platform" content/` | pass (no matches) |
| No Atlantis line counts | `grep -rniE "1,900\|770\|LOC" content/` | pass for content/; FAIL in the resume PDF (see F-5, C-35) |
| No "since" on an ended role | `grep -n "Since" content/experience.ts` | pass (Facturo uses "Jun 2026 to Oct 2026", `ended: true`; all "Since" rows have `ended: false`) |
| Showdown AI never shown as built | `grep -n "Showdown" content/projects.ts` | pass (reads "In progress, nothing built yet") |
| No home details | `grep -rniE "street\|avenue\|rue \|\bapt\b" content/` | pass (no matches; resume shows city only) |

## Confirmations

| Item | Yahya's answer | Date |
|------|----------------|------|
