# Material and links (Phase 1, public-safe)

Collected 2026-11-07 (plan 01-04). Every URL below was fetched once on 2026-11-07; the result is in the "Checked" column. Article claims are not restated here: the links are the proof, the facts come from the resume and `portfolio-voice-and-facts`.

## Contact

- Email: yahya.hallani.email@gmail.com (confirmed public by Yahya, 2026-11-07)
- LinkedIn: https://www.linkedin.com/in/yahya-hallani
- GitHub: https://github.com/Yahya-github
- Resume (PDF): docs/material/resume-public.pdf
- Phone: not published (Yahya's decision)

## Projects

| Project | Link | GitHub policy | Checked |
|---------|------|---------------|---------|
| Facturo demo (fictional data) | https://github.com/Yahya-github/facturo-demo | Public demo repo (sanitized snapshot of a private client project) | 200 |
| MAME Tool Rental (tool and machine rental with an admin dashboard, for the McGill Association of Mechanical Engineers; built for MAME, in use at MAME) | Live: https://mame-tool-rental.vercel.app/ (added 2026-11-07, change round 6; the site currently shows a "Demo: extended lab hours" banner and demo student data) | Repo `Yahya-github/mame-tool-rental` is private (no repo link on the site) | 200 |
| Atlantis (Godot 4 game, fork of `plastikup/atlantis`) | https://github.com/Yahya-github/atlantis | Public | 200 |
| CRC 2026 robot (control firmware) | CAD: https://cad.onshape.com/documents/abedb5644d206f1966ceab07/w/16e1ac37475a79f8f8a83c91/e/fa98af52c3491c90afc18920 | Code is private (no repo link on the site). The Onshape document opens by link without login (anonymous access, not listed publicly). | 200 |
| AG robotics team site | https://agisback.crcrobotics.com/fr/ | n/a | 200 |
| DIRO hackathon 2026 project | none | No repo: the code had to stay private during the competition | n/a |
| CRC problems | none | No public link (problems for CRC 2027; the contest platform is not mentioned) | n/a |
| Showdown AI (an agent that plays ranked Pokémon Showdown battles; Yahya's description, 2026-11-07, change round 7) | none | In progress, nothing built yet | n/a |

Facturo deep dive route on the site: /projects/facturo/

MAME Tool Rental proof: the live site (its footer reads "Built by Yahya Hallani for the McGill Association of Mechanical Engineers."). Facts from the private repo (read with gh, 2026-11-07): FastAPI and SQLite backend on Render, Next.js frontend on Vercel; GitHub Actions deploys only after every test passes, then runs a smoke test; 22 API pytest files, 47 web Vitest files and Playwright end-to-end specs for the main flows; 63 commits from 2026-11-05 to 2026-11-07. Status (Yahya, 2026-11-07): "Built for MAME, in use at MAME." Experience (Yahya, 2026-11-07, change round 7: "mame-experience: Developper Nov 2026"): Work row "Developer", since Nov 2026, with the MAME mark (`logos/mame-mark.png`, `mame-mark-mono.png`).

## Proof links (competitions)

| Result | Source | Checked |
|--------|--------|---------|
| Intercollegiate video game creation competition 2026 (Atlantis) | https://www.neomedia.com/vaudreuil-soulanges/actualites/education/657299/l-intercollegial-de-creation-de-jeux-video-au-cegep-de-valleyfield | 200 |
| Intercollegiate video game creation competition 2026 (Atlantis) | https://www.cegepvalleyfield.ca/le-college-andre-grasset-grand-gagnant-de-la-10e-edition-de-licjv/ | 200 |
| DIRO hackathon 2026 | https://diro.umontreal.ca/departement/nouvelles/nouvelle/news/detail/News/une-participation-remarquable-au-hackathon-2026-du-diro/ | 200 |
| DIRO hackathon 2026 | https://www.addiroum.org/nouvelles/hackathon-du-diro-edition-2026 | 200 |
| DIRO hackathon 2026 (LinkedIn post) | https://lnkd.in/p/gTbbxFTJ | 200 after 1 redirect to a linkedin.com/posts/ URL |
| CRC 2026, robot competition (Club of the Year photo) | https://www.instagram.com/p/DYPS2bGOAQy/ (supplied by Yahya, 2026-11-07, change round 2) | 200, no redirect (plain request; Instagram serves its login-gated shell to scripts, so the post content itself was not read) |
| CRC programming (trophies photo) | https://www.instagram.com/p/DWmZr18kTA3/ (supplied by Yahya as `...?img_index=1`; the query only picks the first image of the post and is dropped) | 200, no redirect (same note) |
| CCC 2026 perfect score 75/75 | No public proof link; resume line only | n/a |

Instagram blocks scripted reads of post content; a 200, 302, 429 or a login redirect from a script is normal for Instagram and not a broken link. The two posts open in a browser.

The LinkedIn profile URL answers 999 to scripted requests (LinkedIn's bot wall). That is normal for LinkedIn and not a broken link; it opens in a browser.

## Inventory

| File | What | Source | Treatment |
|------|------|--------|-----------|
| portrait-devfest-2026-grey.jpg | Portrait master (plan 01-01) | DevFest 2026 photo | Cropped above banner, greyscale, stripped |
| portrait-devfest-2026-color.jpg | True-colour twin of the portrait master, shown on hover in About (plan 01-07) | DevFest 2026 photo | Same crop as the grey master (1512x1240+0+0), colour kept, all metadata stripped |
| resume-public.pdf | Public resume, 1 page | Re-rendered from the JobOps resume JSON with the same Typst 0.14.2 ultra-compact theme (read-only DB copy; nothing written to JobOps) | Phone and contest-platform bullet removed; Author "Yahya Hallani"; no tenant or id metadata |
| photos/diro-hackathon-2026-award.jpg | DIRO hackathon 2026 winners with certificates | Image pasted by Yahya, 2026-11-07 | Metadata stripped |
| photos/diro-hackathon-2026-award-grey.jpg | Greyscale derivative | same | Greyscale, stripped |
| photos/game-competition-2026-team.jpg | Intercollegiate video game competition team photo (Valleyfield) | Image pasted by Yahya, 2026-11-07 | Metadata stripped |
| photos/game-competition-2026-team-grey.jpg | Greyscale derivative | same | Greyscale, stripped |
| photos/crc-2026-trophies.jpg | CRC 2026 team with all its trophies | Image pasted by Yahya, 2026-11-07 | Metadata stripped |
| photos/crc-2026-trophies-grey.jpg | Greyscale derivative | same | Greyscale, stripped |
| photos/club-of-the-year-award.jpg | Club of the Year award on stage (Collège André-Grasset) | Image pasted by Yahya, 2026-11-07 | Metadata stripped |
| photos/club-of-the-year-award-grey.jpg | Greyscale derivative | same | Greyscale, stripped |
| photos/robot-cad-01.png | Onshape thumbnail of the robot CAD (600x340) | Onshape thumbnail API, anonymous link access | Metadata stripped |
| photos/robot-cad-01-grey.png | Greyscale derivative | same | Greyscale, stripped |
| screenshots/facturo-01-accueil.png | Facturo home (dashboard) | facturo-demo README, `docs/screenshots/01-accueil.webp` | Converted to PNG, stripped |
| screenshots/facturo-01-accueil-grey.png | Greyscale derivative | same | Greyscale, stripped |
| screenshots/facturo-02-historique.png | Facturo history | README `02-historique.webp` | Converted to PNG, stripped |
| screenshots/facturo-02-historique-grey.png | Greyscale derivative | same | Greyscale, stripped |
| screenshots/facturo-03-nouvelle-facture.png | Facturo new invoice | README `03-nouvelle-facture.webp` | Converted to PNG, stripped |
| screenshots/facturo-03-nouvelle-facture-grey.png | Greyscale derivative | same | Greyscale, stripped |
| screenshots/facturo-04-paiements.png | Facturo payments | README `04-paiements.webp` | Converted to PNG, stripped |
| screenshots/facturo-04-paiements-grey.png | Greyscale derivative | same | Greyscale, stripped |
| screenshots/facturo-05-parametres.png | Facturo settings | README `05-parametres.webp` | Converted to PNG, stripped |
| screenshots/facturo-05-parametres-grey.png | Greyscale derivative | same | Greyscale, stripped |
| screenshots/facturo-06-palette.png | Facturo command palette | README `06-palette.webp` | Converted to PNG, stripped |
| screenshots/facturo-06-palette-grey.png | Greyscale derivative | same | Greyscale, stripped |
| screenshots/facturo-07-accueil-sombre.png | Facturo home, dark theme | README `07-accueil-sombre.webp` | Converted to PNG, stripped |
| screenshots/facturo-07-accueil-sombre-grey.png | Greyscale derivative | same | Greyscale, stripped |
| screenshots/facturo-08-menu-reduit.png | Facturo collapsed sidebar | README `08-menu-reduit.webp` | Converted to PNG, stripped |
| screenshots/facturo-08-menu-reduit-grey.png | Greyscale derivative | same | Greyscale, stripped |
| screenshots/facturo-09-mobile.png | Facturo mobile (390 px) | README `09-mobile.webp` | Converted to PNG, stripped |
| screenshots/facturo-09-mobile-grey.png | Greyscale derivative | same | Greyscale, stripped |
| screenshots/facturo-10-clients.png | Facturo clients | README `10-clients.webp` | Converted to PNG, stripped |
| screenshots/facturo-10-clients-grey.png | Greyscale derivative | same | Greyscale, stripped |
| screenshots/mame-01-home.jpg | MAME Tool Rental home (student side) | Live site https://mame-tool-rental.vercel.app/, captured 2026-11-07 (signed in as admin for 05-08), fictional demo data | JPEG kept, all metadata stripped (ICC included) |
| screenshots/mame-01-home-grey.jpg | Greyscale derivative | same | Greyscale, stripped |
| screenshots/mame-02-rent-tools.jpg | Rent tools form | Live site https://mame-tool-rental.vercel.app/, captured 2026-11-07 (signed in as admin for 05-08), fictional demo data | JPEG kept, all metadata stripped (ICC included) |
| screenshots/mame-02-rent-tools-grey.jpg | Greyscale derivative | same | Greyscale, stripped |
| screenshots/mame-03-book-machine.jpg | Book machine time (Tormach CNC, Tormach Lathe), drawings attached | Live site https://mame-tool-rental.vercel.app/, captured 2026-11-07 (signed in as admin for 05-08), fictional demo data | JPEG kept, all metadata stripped (ICC included) |
| screenshots/mame-03-book-machine-grey.jpg | Greyscale derivative | same | Greyscale, stripped |
| screenshots/mame-04-track.jpg | Track a request (reference code and email) | Live site https://mame-tool-rental.vercel.app/, captured 2026-11-07 (signed in as admin for 05-08), fictional demo data | JPEG kept, all metadata stripped (ICC included) |
| screenshots/mame-04-track-grey.jpg | Greyscale derivative | same | Greyscale, stripped |
| screenshots/mame-05-admin-overview.jpg | Admin overview: KPI cards, rentals per week, purpose breakdown, most-rented tools, machine usage (the Projects preview) | Live site https://mame-tool-rental.vercel.app/, captured 2026-11-07 (signed in as admin for 05-08), fictional demo data | JPEG kept, all metadata stripped (ICC included) |
| screenshots/mame-05-admin-overview-grey.jpg | Greyscale derivative | same | Greyscale, stripped |
| screenshots/mame-06-admin-tool-rentals.jpg | Admin tool rentals | Live site https://mame-tool-rental.vercel.app/, captured 2026-11-07 (signed in as admin for 05-08), fictional demo data | JPEG kept, all metadata stripped (ICC included) |
| screenshots/mame-06-admin-tool-rentals-grey.jpg | Greyscale derivative | same | Greyscale, stripped |
| screenshots/mame-07-admin-machine-bookings.jpg | Admin machine bookings | Live site https://mame-tool-rental.vercel.app/, captured 2026-11-07 (signed in as admin for 05-08), fictional demo data | JPEG kept, all metadata stripped (ICC included) |
| screenshots/mame-07-admin-machine-bookings-grey.jpg | Greyscale derivative | same | Greyscale, stripped |
| screenshots/mame-08-admin-catalog.jpg | Admin catalogue | Live site https://mame-tool-rental.vercel.app/, captured 2026-11-07 (signed in as admin for 05-08), fictional demo data | JPEG kept, all metadata stripped (ICC included) |
| screenshots/mame-08-admin-catalog-grey.jpg | Greyscale derivative | same | Greyscale, stripped |
| logos/mcgill-robotics.png | McGill Robotics lockup (source) | Image pasted by Yahya, 2026-11-07 (plan 01-08) | Dark ground made transparent, trimmed, max 1200px, stripped |
| logos/mcgill-robotics-mark.png | McGill Robotics robot-arm "M" mark, brand colours (white) | same | Cropped from the lockup, 96px tall, stripped |
| logos/mcgill-robotics-mark-mono.png | Mono twin of the mark | same | Single colour #8e8e8e (dim), same alpha |
| logos/gdg.png | Google Developer Groups lockup (source) | Image pasted by Yahya, 2026-11-07 (plan 01-08) | White ground made transparent, trimmed, stripped |
| logos/gdg-mark.png | GDG chevron mark, brand colours | same | Cropped from the source; alpha from colour saturation, so the white ground, the grey edge fringe and the black outline drop out on the dark ground; stripped |
| logos/gdg-mark-mono.png | Mono twin of the mark | same | Single colour #8e8e8e, same alpha |
| logos/icpc.png | ICPC lockup (source) | Image pasted by Yahya, 2026-11-07 (plan 01-08) | Trimmed, max 1200px, stripped |
| logos/icpc-mark.png | ICPC three-square mark (cloud, bulb, balloon), brand colours | same | Cropped from the lockup above the "icpc.foundation" line, 96px tall, stripped |
| logos/icpc-mark-mono.png | Mono twin of the mark | same | Single colour #8e8e8e; the white line drawings are knocked out so the squares keep their detail |
| logos/mercor.png | Mercor lockup (source) | Image pasted by Yahya, 2026-11-07 (plan 01-08) | Trimmed, max 1200px, stripped |
| logos/mercor-mark.png | Mercor "M" ribbon mark, brand colours | same | Cropped from the lockup, 96px tall, stripped |
| logos/mercor-mark-mono.png | Mono twin of the mark | same | Single colour #8e8e8e, same alpha |
| logos/mame.png | MAME lockup (source: blueprint "M", MAME wordmark and shield) | Logo file supplied for change round 6 (2026-11-07) | Trimmed, max 1200px, stripped |
| logos/mame-mark.png | MAME shield mark, brand red with the white "M" | same | Cropped from the source (the shield only), 96px tall, stripped |
| logos/mame-mark-mono.png | Mono twin of the mark | same | Single colour #8e8e8e; alpha scaled by the red, so the white "M" and details are knocked out and the shield keeps its detail |
| logos/crc-mark.svg | Canadian Robotics Competition gear-and-bolt mark, brand colours | https://robo-crc.ca/crc-mark-poly.svg (fetched 2026-11-07, 200) | Inspected: no script, link, import, url() or event attribute; viewBox tightened to the artwork, layer id removed |
| logos/crc-mark-mono.svg | Mono twin of the mark | same | Every fill and stroke set to #8e8e8e, a 3-unit stroke closes the polygon seams |
| logos/facturo.svg | Facturo lockup (source) | https://github.com/Yahya-github/facturo-demo, `facturo/web/static/img/logo.svg` (raw.githubusercontent.com, 2026-11-07, 200) | Unchanged copy; inspected, no script or external reference |
| logos/facturo-mark.svg | Facturo "F" mark, brand colours | same repo, `favicon.svg` geometry | The repo's dark-scheme colours fixed in (#4ea672 F, #d4a853 fold and dot), no media query, no text |
| logos/facturo-mark-mono.svg | Mono twin of the mark | same | Single colour #8e8e8e; the fold is cut out with a mask so the mark keeps its corner |

Notes:
- The four event photos are group photos that include teammates. They are already public through the articles and the LinkedIn post listed above.
- Logos (plan 01-08, Yahya asked for them next to the Experience entries): only the marks are shown on the site, small, in the mono twin; the brand colours fade in on hover. The full lockups are kept as sources. Organisation logos are used to identify the organisations Yahya worked or took part with, not as endorsements.
- MAME Tool Rental screenshots: demo data only (fictional students and requests). The colour originals are shown only in the hover preview; at rest and on phones the grey twin shows. The MAME mark is shown on the Projects row only (there is no MAME entry on Experience).
- Facturo screenshots: every one was checked by eye. They show the "Demo Transport Inc." workspace with the seeded fictional clients; the repo README states that all data in it is fictional. No real client data.

## Still missing

- Atlantis screenshots: to capture (2-3 greyscale gameplay screenshots from the Godot project; Godot is not installed on this machine, so none were captured in plan 01-04). A short muted loop clip later.
- Robot: no photo of the physical robot; a higher-resolution CAD capture (the Onshape thumbnail is 600x340) is to capture; robot CAD file itself (Phase 8).
- CRC 2026: no article link; the two Instagram posts above are the proof links.
- CCC 2026: no public proof link.
- Higher-resolution original portrait: none yet.
- Waiver: atlantis material not supplied in Phase 1 (Yahya replied "atlantis: there's the Godot game on the repo, so you tell me if we do screenshots or something else", 2026-11-07); to be accepted at the design approval (01-08)

## Decisions recorded at intake

- Resume contest-platform bullet: removed (Yahya, 2026-11-07)
- Resume phone: removed from the public copy only; the JobOps source keeps it for applications (Yahya, 2026-11-07)
- PDF author metadata: Yahya Hallani
- Public email confirmed: yes, 2026-11-07
- AG team logo: not used (Claude recommendation: noise, the team identity already shows on the shirts in the CRC photo; Yahya may override at 01-07)
- Atlantis media: 2-3 greyscale screenshots plus the public repo link, later a short muted loop clip; no in-page playable embed, at most a "Play" link later (Claude recommendation; Yahya may override at 01-07)
- CCC 75/75: a regular line, not the giant poster number, because it has no public proof link; this leans toward Achievements variant (b) (Claude recommendation; Yahya may override at 01-07; the design doc is not changed here)
- GitHub per project: robot private, DIRO hackathon no repo, Atlantis public, Facturo demo public (Yahya, 2026-11-07)
