# Feature Research

**Domain:** Personal developer portfolio for a student software engineer (audience: recruiters, internship leads, engineers who screen candidates). Dark Swiss typographic style, six full-screen pages switched horizontally, the YAHYA letters act as navigation.
**Researched:** 2026-11-06
**Confidence:** MEDIUM. The usability findings on scrolljacking come from Nielsen Norman Group research (HIGH). The Awwwards criteria come from Awwwards' own evaluation page (HIGH). Recruiter-behaviour advice comes from many blogs that agree with each other but are mostly opinion (MEDIUM/LOW). The "six seconds" figure comes from TheLadders' 2012 eye-tracking study of resumes, not portfolios, so treat it as a rough guide (MEDIUM).

## How the two audiences judge a portfolio

| Audience | What they do | What wins | What loses |
|----------|-------------|-----------|------------|
| Recruiter / internship lead | Opens the link from a resume or LinkedIn, often on a phone. Looks for a few seconds, then decides whether to read more. Attention goes to name, current role or school, and recognisable proof (TheLadders found about 80% of gaze time went on basic fields). | Name + role + strongest proof visible right away; a resume one click away; obvious contact | Intros or loaders before the content; vague claims; hidden contact; a broken mobile layout |
| Engineer / hiring manager | Clicks through to a project, then to GitHub or a live demo to check the claims are real | Each project shows the problem, what *he* built, a real outcome or number, and links to code or a demo | Lists of technologies with no context; projects with no links; tutorial clones |
| Award jury (Awwwards / SiteInspire) | Scores Design 40%, Usability 30%, Creativity 20%, Content 10% (Awwwards official) | A clear concept carried through everywhere; good motion; fast; usable | Most sites lose points on usability and performance, not on creativity |

**What this means:** recruiters care about clarity and speed, and award juries also give 30% to usability. The signature design has to sit *on top of* content that loads instantly, can be read in a few seconds and can be linked to directly. It cannot be a gate in front of the content. That is the main constraint for every feature below.

## Feature Landscape

### Table Stakes (Users Expect These)

Missing any of these makes the site look unfinished or makes recruiters leave.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Name, role and strongest proof on the first screen, instantly** | Recruiters decide in seconds and look at name and title first | LOW | The hero already has giant YAHYA. Add a short line on screen at t=0 with role, school and the headline proof (e.g. "Software Engineering @ McGill, CCC 75/75"). The text must be in the server HTML, not faded in after JS loads. |
| **No intro, loader or gate before content** | Several reviewers say they close the tab when a full-screen animation plays before the work. NN/g found task-focused users were the most annoyed. | LOW | Any hero motion must play *while* the content is already readable and must never block input. The letters-to-rail animation only runs when the visitor leaves the hero, which is fine. |
| **Resume / CV link (PDF)** | It is the first thing recruiters ask for, and they pass it around inside their company | LOW | **Missing from PROJECT.md.** Say hi only lists email, LinkedIn and GitHub. Add a "Resume (PDF)" link on Say hi and somewhere always reachable (rail or footer). Self-host the PDF and give it a clear file name (`Yahya-Hallani-Resume.pdf`). |
| **Contact reachable from every page** | Hidden contact is one of the most common complaints | LOW | The rail letter "A, Say hi" is the nav route, but a first-time visitor will not know that A means contact. Also show a visible email or "Say hi" label in the footer or under the rail. Use a plain `mailto:` link that can be copied, not a form (there is no backend anyway). |
| **Project evidence with links** | Engineers check that claims are real: repo, demo, write-up | MEDIUM | For each project: one line on the problem, his role, the stack, one real outcome, and links (GitHub / live / video). Only real facts, as the project already requires. Projects with no public link (e.g. robot firmware) need a photo or short clip. |
| **Works well on phones** | Recruiters often open links on their phones; a broken mobile layout hurts credibility | HIGH | Already planned. NN/g found scrolljacking is *worse* on mobile. On phones, consider normal vertical scrolling inside each page, keeping horizontal swipe only between pages, and make sure page content never needs a second gesture to finish reading (see Anti-Features). |
| **Fast load (good Core Web Vitals)** | Award juries score usability including performance; slow sites lose recruiters | MEDIUM | Static export helps. Keep the hero LCP as text (no image), self-host one variable font subset, and lazy-load the judge animation and any depth-map assets. Target LCP < 2.5s on 4G. |
| **Deep links and a working Back button** | Recruiters send links to colleagues ("look at his projects"); a single-URL site loses that | MEDIUM | Each page needs its own URL (`/#projects` or `/projects` routes in the static export). Changing pages updates history, and Back/Forward and refresh restore the page. Often forgotten on horizontal sites. |
| **SEO basics + content in the HTML** | Googling "Yahya Hallani" should return this site | LOW | Title, meta description, canonical, `Person` JSON-LD with sameAs links to LinkedIn and GitHub. All six pages' text must be in the static HTML, not loaded on demand, so crawlers and Ctrl+F can find it. |
| **Social preview card (Open Graph / Twitter)** | Links shared on LinkedIn, Slack and Discord need a good-looking card | LOW | A 1200x630 static OG image in the Swiss style (giant YAHYA + one line), `og:title`, `og:description`, `twitter:card=summary_large_image`. Make it at build time or by hand. |
| **Favicon, 404 page, HTTPS on the custom domain** | Small signs that the site is finished | LOW | GitHub Pages + yahya-h.dev with HTTPS enforced. Make a Swiss-style 404 page. |
| **Keyboard, focus and reduced motion** | WCAG requirement (already in the constraints); also something award juries look at | MEDIUM | Already planned. Add a skip link, visible focus rings in the accent colour, and screen-reader announcements on page change (`aria-live` with the page title). |
| **Copy that can be read and checked** | Vague claims ("passionate developer") get ignored | LOW (design) / MEDIUM (writing) | Copy is deferred, but the layout must leave room for specifics: numbers, names, dates. Design with real-length placeholder text, not single words. |

### Differentiators (Competitive Advantage)

These match the Core Value (a design people remember). Pick a few and do them well. Do not try to stand out everywhere.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Name-as-navigation (YAHYA letters → left rail)** | One signature idea that makes the site memorable and is also the nav. Award juries reward one concept carried through the whole site. | HIGH | The hard parts are the shared-element transition (FLIP) from hero to rail, keeping it smooth on mid-range phones, and making the meaning of the letters clear: the numbered captions on the hero must stay visible as labels next to the rail letters on hover/focus, at least the first time. |
| **Competition record shown with emotion (75-test judge animation ending on 75/75)** | Turns a dry line ("perfect CCC score") into a moment visitors feel. Strongest "that kid is cracked" signal. Most student portfolios just list awards. | MEDIUM | Must be (a) short (about 2-3s), (b) skippable, or the final state readable immediately, (c) fine if missed: the static "75/75" and the four first places are readable without watching. Reduced-motion version shows the final state. Play it once when the page enters the viewport, not on every visit. |
| **Project deep dives** | Engineers want depth; a short case study per project (problem → approach → result → links) beats a tile grid | MEDIUM-HIGH | Fits the format as an overlay or sub-page per project (`/projects/facturo`) with normal vertical scrolling inside. Start with 1-2 deep dives for the strongest projects (Showdown AI, Facturo) rather than five thin ones. |
| **Horizontal full-screen paging done right** | Feels like flipping through a Swiss poster series; it stands out from the usual vertical one-page portfolio | HIGH | Only stands out if it never feels broken. See "Horizontal paging" below for what makes it work. |
| **Visible progress and position (00 / 05 pager, progress bar, Next)** | Fixes the main NN/g problem (disorientation, "is the page broken?", "is this the end?") | LOW | Already planned. The page count shows how big the site is, which encourages exploring all six pages. |
| **Deliberate depth-map visual (e.g. portrait depth map on About)** | Shows real work with images instead of illustrations, as Swiss style prefers; makes About personal | MEDIUM-HIGH | Keep it to one place. Lazy-load it. Provide a static image fallback and alt text. Decide where it goes before building About. |
| **Typographic restraint as a signal** | One family, a strict grid and no ornament stand out against template portfolios; it shows taste | LOW (to build) / HIGH (to get right) | Already the design system. This is a differentiator only if it is executed precisely (grid alignment, type scale). |
| **Small "how this site was built" note / source link** | Engineers like seeing the craft; turns the site itself into a project | LOW | A line on About or in the footer linking to the repo. Optional. |
| **Keyboard shortcut hints** | Rewards power users (engineers) who try arrow keys | LOW | A small hint at first visit ("← → or scroll"). Must not break the no-noise approach; one line, fades after the first page change. |

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| **Intro animation / loading screen / "enter site" gate** | Looks impressive on award sites | Recruiters close the tab before content appears; LCP suffers | Content is readable on the first frame; motion plays over content that is already shown |
| **Long scrolljacked sequences with text to read** | Scrollytelling looks premium | NN/g: changing scroll *direction* combined with text to read caused the worst problems; users thought the page had ended or was broken | One gesture = one page (already planned) and **content inside a page never needs extra wheel input to reveal**. If a page overflows (e.g. Experience on a small laptop), let it scroll vertically and naturally inside the page, and only move to the next page at the edge. |
| **Wheel inertia that skips several pages** | Side effect of naive wheel handling | Trackpad momentum skips pages; users lose their place | Debounce/lock per gesture, ignore inertia tail (already planned); test on macOS trackpad and Magic Mouse specifically |
| **Hiding the meaning of the letter nav** | "Pure" minimalism | A first-time visitor cannot tell that "H" means Experience; looks like mystery-meat navigation | Keep the numbered captions; reveal the section name next to each rail letter on hover/focus; the current section name is always shown somewhere (pager or header) |
| **Contact form** | Feels professional | No backend; third-party form services add tracking and spam; recruiters prefer copying an email | `mailto:` + a copy-to-clipboard button + LinkedIn |
| **Skill bars / percentage meters / logo walls of technologies** | Common in templates | Means nothing ("Python 80%"), looks like a template, breaks the "only real facts" rule | Name technologies inside project descriptions, where they come with evidence |
| **Invented metrics, testimonials, company logos** | Social proof | Already out of scope; one fake claim spoils every real one | Only real numbers (75/75, placements, dates) |
| **Custom cursor that replaces the system cursor** | Common on award sites | Hurts usability and accessibility, does nothing on touch, and adds noise to a Swiss design | Keep the system cursor; use designed hover states instead |
| **Background music / autoplay sound** | Immersion | Universally disliked; recruiters often browse at work | None |
| **Heavy WebGL / 3D everywhere** | Award-site trend | Load cost, battery, mobile jank; competes with the typography | Keep any 3D/depth-map to one deliberate place, lazy-loaded |
| **Blog / CMS / dark-light toggle at launch** | "Complete" portfolio | Blog and CMS are out of scope; a light theme would double the design work against a dark Swiss identity | Ship dark only; add writing later as project deep dives |
| **Making pages `inert` without thinking about find-in-page and crawlers** | Accessibility of hidden pages | Inactive pages being `inert` is correct for focus, but `display:none` or text that isn't rendered breaks Ctrl+F, SEO and sharing a text quote | Keep all text in the DOM (inert, not removed); optionally move to the page that matches a URL hash on load |

## Horizontal paging and custom navigation: how they're received and what makes them work

**Evidence (NN/g "Scrolljacking 101", HIGH confidence):** most test participants were at least mildly disoriented by scrolljacking. Some refreshed the page or left. Problems were worst when (1) the scroll direction changed, (2) there was text to read during the hijacked motion, (3) a long sequence was needed before anything visibly changed, (4) on mobile, and (5) there was no sticky navigation to get out. Tolerance was better when each scroll action produced an immediate visible change, the content was mainly visual, users were exploring rather than doing a task, and navigation stayed sticky.

The design is mostly on the good side of this already: discrete pages, one gesture = one page, persistent rail, pager. The remaining risks and the fixes that make it work:

1. **Immediate response:** one gesture moves exactly one page, with feedback within about 100ms. Never require several wheel notches.
2. **Always show where you are:** the current letter in the accent colour + `0N / 05` + progress bar + the page title. The visitor should never wonder "is this the end?". The last page should clearly read as the end (e.g. Next turns into "Back to start").
3. **Several ways to navigate:** wheel, keys, swipe, rail letters, Next button, URL. Clicking a letter is the main route for task-focused recruiters; gestures are a bonus.
4. **The page direction matches the gesture:** wheel down = next page (moving right) is the established convention on horizontal sites. Swipe left = next on touch. Do not invert.
5. **Text pages are never scrolljacked inside:** a page's own content must be fully readable without extra wheel input, or it scrolls normally inside the page.
6. **A first-visit hint:** a quiet "scroll or → to continue" on the hero, gone after the first page change.
7. **Mobile is designed separately:** smaller rail, swipe between pages, natural vertical scroll inside a page, with a fallback where possible. Test on real iOS Safari (rubber-banding and the address bar resizing the viewport).
8. **Deep links + history:** without them, horizontal sites feel like a trap and cannot be shared.
9. **Reduced motion:** page changes become instant cuts or quick fades, the letters jump to the rail, and the judge animation shows its final state.

## Feature Dependencies

```
Design system (tokens, grid, type scale)
    └──required by──> Every page layout
                          └──required by──> Hero / Achievements / Projects / Experience / About / Say hi

Page model (six pages in DOM, one active, others inert)
    └──required by──> Paging input (wheel/keys/swipe)
    └──required by──> URL per page + history (deep links, Back)
    └──required by──> Pager / progress bar / Next
    └──required by──> Screen-reader page announcements

Paging input + URL state
    └──required by──> Letter rail navigation (rail clicks = navigate to page)

Hero YAHYA layout
    └──required by──> Letters-to-rail transition (FLIP needs both end states defined)

Reduced-motion system (global flag)
    └──required by──> Letters-to-rail, judge animation, page transitions, depth map

Real content (facts, project links, resume PDF)
    └──required by──> Project deep dives, Achievements, OG card text, JSON-LD

Judge animation ──enhances──> Achievements (static 75/75 must exist without it)
Depth map ──enhances──> About (static portrait/fallback must exist without it)
Project deep dives ──enhances──> Projects page (summary tiles must stand alone)

Page-level scrolljacking of inner content ──conflicts──> Readable text pages
Intro/loader ──conflicts──> Instant first-screen proof
display:none for inactive pages ──conflicts──> SEO, find-in-page, deep links
```

### Dependency Notes

- **Page model comes before navigation:** the rail, pager, keys and URL are all views of one "current page" state. Build that state (and its URL sync) first, then attach inputs. Otherwise each input ends up with its own copy of the state and they drift apart.
- **Letters-to-rail needs both layouts finished:** the hero layout and the rail layout must be locked before building the transition between them, or it gets rebuilt every time either one changes.
- **Enhancements must degrade gracefully:** the judge animation, depth map and deep dives all sit on top of a static version that is readable without them. Build the static version first. This also gives the reduced-motion and no-JS versions for free.
- **Copy is deferred, but its shape is not:** the layout has to work with real-length text and real links. Collect the facts and links early (resume PDF, repo URLs) even if the final wording comes later.

## MVP Definition

### Launch With (v1)

- [ ] Design system and six-page model with all text in the static HTML: the base everything depends on
- [ ] Hero with name, role and headline proof readable instantly: passes the few-second recruiter scan
- [ ] Paging via wheel/keys/swipe/rail/Next with URL per page and working Back: navigation that never feels broken
- [ ] YAHYA → rail transition with section labels on hover/focus: the signature
- [ ] Achievements with the 75/75 judge animation (skippable, reduced-motion final state) + four first places: the strongest proof
- [ ] Projects with problem/role/outcome/links per project: evidence engineers check
- [ ] Experience, About, Say hi with email + LinkedIn + GitHub + **Resume PDF**: required by recruiters
- [ ] Pager, progress, first-visit hint: orientation
- [ ] Mobile layout (swipe, scaled rail, inner vertical scroll): recruiters on phones
- [ ] SEO meta, JSON-LD Person, OG card, favicon, 404, HTTPS on custom domain: sharing and findability
- [ ] Accessibility: focus, skip link, inert pages, live region, reduced motion: a stated constraint

### Add After Validation (v1.x)

- [ ] Project deep-dive pages for 1-2 flagship projects: once real write-ups exist
- [ ] Depth-map portrait on About: once its placement is decided and a real depth map is made
- [ ] "How this site was built" note + repo link: once the code is clean enough to show
- [ ] Privacy-friendly analytics (e.g. GoatCounter / Plausible-style, no cookies): when he wants to know which pages recruiters visit

### Future Consideration (v2+)

- [ ] French version: out of scope at launch
- [ ] Deep dives for the remaining projects: depends on content
- [ ] Writing / notes section: out of scope (no CMS); could later be static MDX

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Instant first-screen proof | HIGH | LOW | P1 |
| Resume PDF link | HIGH | LOW | P1 |
| Visible contact on every page | HIGH | LOW | P1 |
| Page model + URL/history | HIGH | MEDIUM | P1 |
| Multi-input paging (wheel/keys/swipe) | HIGH | HIGH | P1 |
| YAHYA → rail signature | HIGH | HIGH | P1 |
| Judge animation 75/75 | HIGH | MEDIUM | P1 |
| Project cards with links | HIGH | MEDIUM | P1 |
| Mobile layout | HIGH | HIGH | P1 |
| Pager / progress / hint | MEDIUM | LOW | P1 |
| SEO + OG card + JSON-LD | MEDIUM | LOW | P1 |
| Accessibility suite | MEDIUM | MEDIUM | P1 |
| Project deep dives | HIGH | MEDIUM-HIGH | P2 |
| Depth-map About | MEDIUM | MEDIUM-HIGH | P2 |
| Analytics (cookieless) | LOW | LOW | P2 |
| Built-with note | LOW | LOW | P3 |
| French | MEDIUM | MEDIUM | P3 |

## Competitor Feature Analysis

Typical strong developer portfolios, from training knowledge; LOW-MEDIUM confidence on specifics, and they should be checked by visiting the sites:

| Feature | Typical student/dev template (e.g. Brittany Chiang-style one-pager) | Award-style creative portfolio (Awwwards SOTD dev folios) | Our Approach |
|---------|------------------------------|------------------------------|--------------|
| First screen | Name + one-line role + short bio, instant | Often an intro animation or loader, then a big type hero | Big type hero (award feel) with role + proof readable instantly (recruiter feel) |
| Navigation | Sticky top nav or side nav with section names | Custom nav, sometimes hidden menus | The letters are the nav, with labels shown on hover/focus and numbered captions |
| Projects | Cards with stack tags + GitHub/live icons | Big visuals, case-study sub-pages | Swiss list/cards with problem-role-outcome-links; deep dives for the flagship projects |
| Achievements | Rarely a section; buried in the resume | Rare | Its own page with an emotional set piece (judge animation) |
| Resume | Prominent "Resume" button | Often missing | Prominent PDF link in Say hi + always-reachable spot |
| Scrolling | Native vertical | Smooth-scroll libraries, scrolljacking | Discrete horizontal pages, no scrolljacking inside a page |
| Restraint | Template-y colour accents | Lots of effects | One family, one accent, no ornament |

## Sources

- Nielsen Norman Group, "Scrolljacking 101": https://www.nngroup.com/articles/scrolljacking-101/ (HIGH; usability-test findings on disorientation, direction changes, text during hijack, mobile, sticky nav)
- Awwwards evaluation criteria (Design 40 / Usability 30 / Creativity 20 / Content 10): https://awwwards.com/about-evaluation (HIGH)
- Utsubo, "Award-Winning Website Design: What Judges Actually Look For": https://www.utsubo.com/blog/award-winning-website-design-guide (LOW-MEDIUM; usability/CWV as the usual weak point)
- TheLadders Eye-Tracking Study (2012, resumes): https://www.bu.edu/com/files/2018/10/TheLadders-EyeTracking-StudyC2.pdf (MEDIUM; about 6s initial scan, about 80% of gaze on name/title/company/dates; resumes, not portfolios)
- UX Collective, "Only 30 seconds to reject your portfolio": https://uxdesign.cc/only-30-seconds-to-reject-your-portfolio-8cb14ac70674 (LOW-MEDIUM; recruiter closed the tab during a full-screen intro)
- Proxify, "What makes a developer portfolio stand out to recruiters": https://proxify.io/knowledge-base/job-descriptions/what-makes-a-developer-portfolio-stand-out-to-recruiters (LOW)
- scale.jobs, "Portfolio content for tech jobs: what recruiters want": https://scale.jobs/blog/portfolio-content-for-tech-jobs-what-recruiters-want (LOW; problem-solution-result framing, mobile viewing)
- DEV Community, "Hiring managers don't care about your portfolio website": https://dev.to/oseni03/hiring-managers-dont-care-about-your-portfolio-website-heres-what-they-do-care-about-30lf (LOW; GitHub/evidence over decoration)
- standout.work, senior engineer portfolios: https://standout.work/blog/portfolio-for-senior-software-engineers (LOW; heavy animation can signal poor priorities)
- emergent.sh, "Portfolio website mistakes": https://emergent.sh/learn/portfolio-website-mistakes (LOW; loaders, slow stacked animations)
- frontendchecklist.io scrolljacking rule: https://frontendchecklist.io/rules/accessibility/scrolljacking (LOW-MEDIUM; let users opt out of custom scrolling)

---
*Feature research for: student developer portfolio (dark Swiss, horizontal paging)*
*Researched: 2026-11-06*
