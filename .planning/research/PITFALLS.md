# Pitfalls Research

**Domain:** Personal portfolio built as a Next.js static export on GitHub Pages: six full-screen pages switched horizontally, takeover of wheel, trackpad, key and swipe input, a giant fitted YAHYA wordmark that is the navigation and morphs into a left rail, a dark Swiss theme, and an optional WebGL depth map.
**Researched:** 2026-11-06
**Confidence:** MEDIUM-HIGH. The Next.js and GitHub Pages facts were checked against official docs (HIGH). The trackpad, iOS and screen-reader behaviour comes from known platform behaviour plus community reports (MEDIUM), and each item needs a check on a real device.

The main risk on this project is the input model, not the stack. "One gesture = one page, inertia ignored" sounds simple. It is also the thing horizontal and fullpage sites most often get wrong, and most of the other pitfalls (keyboard, screen reader, zoom, deep links, SEO) follow from the decision to take over scrolling. Prototype the input model and test it on real hardware before building any section content.

---

## Critical Pitfalls

### Pitfall 1: One trackpad flick skips two or three pages (macOS momentum)

**What goes wrong:**
On a MacBook trackpad, one flick sends 40+ `wheel` events over 1 to 3 seconds. The finger-driven events come first, then a long, fading momentum tail. A handler that pages whenever `|deltaY|` crosses a threshold fires again on that tail once the transition lock releases, so the visitor flicks once and moves two pages. A fixed debounce (for example 800 ms) only half-fixes it: slow flicks still double-fire, and a quick deliberate second flick gets ignored.

**Why it happens:**
The browser does not expose the gesture or momentum phase. AppKit has `NSEvent.momentumPhase`, but it never reaches web content. Developers also tend to test with one input device, usually their own mouse or trackpad, and tune the timing to it.

**How to avoid:**
- Classify gestures, not single events. Page on the **first** event of a gesture whose accumulated delta crosses a threshold (about 30 to 50 px). Then **swallow events until the stream goes quiet**, meaning no wheel event for about 120 to 200 ms, rather than until the animation ends.
- Still allow a deliberate new gesture during the tail. If `|delta|` *rises* clearly after it had been falling (the heuristic Lethargy uses), treat it as a new intent. Otherwise fast navigators feel blocked.
- Normalise across devices:
  - Windows notched mouse wheels send large separate deltas (often 100 or 120 per notch, `deltaMode` 0) with gaps between notches. One notch should equal one page.
  - Firefox can report `deltaMode === 1` (lines). Multiply by about 16 to 40.
  - Shift+wheel and horizontal trackpad swipes arrive as `deltaX`. Page on whichever axis dominates.
- Apply `Math.sign` only after the gesture has been classified, never per event.
- Put this in one pure, unit-testable module (`wheelIntent(events) -> 'next' | 'prev' | null`). Test it against recorded event traces from a Mac trackpad, a Windows mouse, a Magic Mouse and a Linux touchpad.

**Warning signs:**
- A single flick moves the page counter by 2 during desk testing.
- A magic-number debounce constant has been re-tuned more than twice.
- Chrome behaves, but Safari or Firefox double-fire (each browser sends events at a different rate).

**Phase to address:** The interaction-model prototype phase, which is the first build phase after the design doc is approved. Do it before section content, and record real traces into test fixtures.

---

### Pitfall 2: `preventDefault()` silently fails because the wheel listener is passive

**What goes wrong:**
Native scrolling happens alongside the custom paging, or Mac Chrome's swipe-to-go-back fires, or the document rubber-bands. The console shows "Unable to preventDefault inside passive event listener".

**Why it happens:**
Chrome treats `wheel` and `touchmove` listeners on window, document or body as passive by default. React's `onWheel` prop offers no way to pass `{ passive: false }` (React issue #22794).

**How to avoid:**
- Attach `wheel` and `touchmove` manually in a `useEffect` using `addEventListener(..., { passive: false })`, and remove them on cleanup.
- Add `overscroll-behavior: none` on `html, body`. This stops Chrome's two-finger horizontal history swipe and the rubber-band effect.
- Do not call `preventDefault` when the event target is inside a section that can still scroll internally in that direction (see Pitfall 5).

**Warning signs:** The passive-listener console warning appears, or a horizontal trackpad swipe on Mac Chrome navigates away from the site.

**Phase to address:** Interaction-model prototype.

---

### Pitfall 3: iOS Safari fights the swipe (edge-back gesture, address bar, 100vh, rubber-band)

**What goes wrong:**
- A swipe that starts at the left edge triggers Safari's **system back gesture**, and the page cannot stop it. The left letter rail sits exactly in that zone.
- `height: 100vh` is taller than the visible area while the address bar is showing, so the footer pager and "Next" control end up hidden under the toolbar.
- `100dvh` fixes that but changes as the bar collapses and expands, so the fitted giant type re-fits and jumps in the middle of a gesture.
- Vertical rubber-banding on the body drags the whole fixed stage. Horizontal swipes that drift slightly vertical get taken by native scrolling.
- `user-scalable=no` is ignored by iOS anyway, and disabling zoom fails WCAG.

**Why it happens:** Developers test in desktop responsive mode, which has no address bar, no edge gesture and no rubber-band.

**How to avoid:**
- Size the stage with **`100svh`** (the small viewport height, which stays stable), with `100vh` as a fallback. Use `dvh` only for elements that must hug the bottom edge, and never as an input to the type-fitting maths.
- Set `overscroll-behavior: none` on html and body. Make the stage `position: fixed; inset: 0` with `overflow: hidden`.
- On the stage, set `touch-action: pan-y` so vertical scrolling inside a section stays native, and handle horizontal swipes yourself. Commit to a swipe only after about 10 px of clearly horizontal movement (`|dx| > |dy| * 1.5`), then lock to that axis for the rest of the gesture.
- Ignore touchstarts within about 20 px of the left screen edge for paging, and keep the tappable rail letters inset from the edge.
- Page on swipe velocity as well as distance, so a short, fast flick pages. Add rubber-band resistance at page 0 and page 5.
- Keep pinch-zoom enabled.

**Warning signs:** On an iPhone, the footer is hidden on first load, the giant type twitches while scrolling, or swiping from the rail leaves the site.

**Phase to address:** Interaction-model prototype (the touch half) and the mobile layout phase. Test on a real iPhone, because simulators do not reproduce these gesture conflicts faithfully.

---

### Pitfall 4: Offscreen pages are reachable by Tab and screen readers, or nothing is reachable at all

**What goes wrong:**
- **Variant A, nothing inert.** Tab moves focus into a link on page 4, which is off to the right, so the focus ring is invisible. The browser then calls `scrollIntoView` on the overflow container and shifts the whole stage sideways. A VoiceOver user swipes through all six pages as one long document while the screen keeps showing the hero.
- **Variant B, everything inert or `display: none`.** Screen-reader users and find-in-page (Ctrl+F) cannot reach the other sections, and the only way across is a custom gesture they cannot perform.
- After a page switch, focus stays on the clicked letter or falls back to `body`, and nothing is announced.

**Why it happens:** The visual paging and the accessibility tree are designed separately, and `inert` gets bolted on late.

**How to avoid:**
- Mark inactive pages `inert`. It has been Baseline since 2023 and is safe to use. Keep those pages in the DOM and in the server HTML.
- Make the **nav (rail letters, pager, Next) a real `<nav>` of links that is never inert**, so every page is always one Tab or one VoiceOver rotor jump away.
- When the page changes because of a nav click, a key or a hash, move focus to the new page's heading (`tabIndex={-1}`, `focus({ preventScroll: true })`) and update `document.title`. Add a polite live region ("Projects, page 3 of 6") only if moving focus is not enough.
- Never move focus on wheel or swipe paging. Moving it would steal the focus position from pointer users, and leaving it causes no harm. Do update the live region in those cases.
- Always pass `preventScroll: true`, keep the stage's `scrollLeft` fixed at 0, and position pages with transforms, so focus can never drag the stage.
- Add a "Skip to content" link. Make sure the design still works when someone uses Ctrl+F. Find-in-page cannot see inert content, which is an acceptable trade-off as long as the nav is obvious.

**Warning signs:** Focus disappears after about 10 Tab presses from the hero. The VoiceOver rotor's headings list shows six h1s. The stage shifts sideways after tabbing.

**Phase to address:** Interaction-model prototype (the state machine owns `inert` and focus) and an accessibility audit before launch (VoiceOver on macOS and iOS, NVDA with Firefox).

---

### Pitfall 5: Full-screen pages clip content (short laptops, 200% zoom, landscape phones, long Projects list)

**What goes wrong:**
Each page is designed as a 1440x900 poster. On a 1366x768 laptop, at 200% browser zoom (WCAG 1.4.4), at 400% reflow (1.4.10), or on a landscape phone, Projects (five items) and Experience run past the bottom edge. Because scrolling is taken over for paging, the overflow cannot be reached at all.

**Why it happens:** "Full-screen pages" gets read as "fixed height, overflow hidden", and the design is reviewed only at desktop sizes.

**How to avoid:**
- Make each page its own vertical scroll container (`overflow-y: auto; overscroll-behavior: contain`).
- The wheel handler pages only when the page is **at its scroll boundary in the gesture's direction**. Add a short boundary dwell so that a scroll which reaches the bottom does not also flip the page in the same gesture.
- Define a fallback breakpoint (for example, viewport height under about 560 px, or a large zoom level) where the site becomes a plain vertical document with anchor nav. This is the same layout as the reduced-motion and no-JS fallback, so it costs little.
- Fit the type to `min(width, height)`, not width alone, or YAHYA overflows short, wide windows.

**Warning signs:** Projects is the first section where someone says "we'll fit it". Content disappears at 200% zoom in Chrome.

**Phase to address:** The layout and design-system phase (grid and container rules). Verify in each section-build phase at 1366x768 and at 200% zoom.

---

### Pitfall 6: Deep links and the Back button betray the visitor

**What goes wrong:**
- The only URL is `/`. A recruiter cannot send a "look at his Projects" link, and a refresh always returns to the hero.
- The opposite failure: every page change calls `pushState`. After browsing all six pages, the visitor has to press Back six times to leave, or Back from a LinkedIn click lands on a different section instead of returning to LinkedIn.
- Opening `/#projects` plays the full hero intro and then animates across five pages.

**How to avoid:**
- Give each section a URL hash (`/#projects`). Hashes are free on static GitHub Pages and need no 404 tricks. Skip separate `/projects/` routes unless per-section SEO matters, which it does not for a portfolio people find by searching his name.
- Call **`history.replaceState`** on every page change (wheel, key, swipe, letter click). Back then leaves the site as visitors expect, refresh keeps the position, and the URL stays shareable.
- On load, read the hash and **jump to that page with no animation**, with the letters already in their rail state. Listen for `hashchange` so edited URLs and in-page anchors work.
- Send invalid hashes to the hero silently.
- Keep the Next.js router out of section switching entirely. Router transitions in a static export fetch RSC payloads and re-render, which adds cost and risk for no benefit.

**Warning signs:** Back steps through the site's own sections. Pasting `/#about` into a fresh tab shows the hero.

**Phase to address:** Interaction-model prototype. The URL belongs in the state machine from day one, because adding it later means rewiring the init order.

---

### Pitfall 7: The name is invisible to search engines and screen readers ("link Y, link A, link H...")

**What goes wrong:**
- The h1 is five separate letter links, so Google and screen readers get "Y A H Y A" or "link Y, link A". The page title is still "Create Next App". Searching "Yahya Hallani" finds his LinkedIn but not the portfolio.
- Sections that mount only when active (client-only rendering) are missing from the static HTML, so crawlers and link previews see an empty shell.
- Shared links on LinkedIn or iMessage show no preview image.

**How to avoid:**
- Add a visually hidden **`<h1>Yahya Hallani, Software Engineering student at McGill</h1>`**. Make the giant letters a `<nav aria-label="Sections">` whose links are named for their sections. Keep the visible caption text inside each accessible name, for example "Y, 01 Achievements", to satisfy WCAG 2.5.3 Label in Name. Only mark the decorative glyph spans `aria-hidden` if the label still contains the visible text.
- Render **all six sections into the exported HTML** as server components, and keep only the motion layer client-side. Content offset by a transform is still indexed.
- Use the Metadata API: a real `title`, `description` and `openGraph`, plus a static OG image (a 1200x630 PNG in `public/`, or a statically generated `opengraph-image`). Add `sitemap.ts` and `robots.ts`, which both export statically, and JSON-LD `Person` with `sameAs` links to LinkedIn and GitHub.
- Set `metadataBase` to `https://yahya-hallani.dev` so OG URLs are absolute.

**Warning signs:** `curl https://yahya-hallani.dev | grep Projects` returns nothing. LinkedIn Post Inspector shows no image.

**Phase to address:** Foundation phase (metadata and semantic skeleton) and the pre-launch phase (validate previews and Search Console).

---

### Pitfall 8: Fitted giant type flashes, re-fits and causes layout shift

**What goes wrong:**
YAHYA is sized to fill the page width. The first paint uses a fallback font with Arial-like widths. When Inter Tight loads, the letters change width, so either the word overflows or a JS fitter re-measures and the hero visibly pops. Measuring before fonts load, on every resize and on iOS address-bar changes means the fit never settles. CLS spikes, and the first impression, which is the thing the site is selling, looks broken. Changing the font later (the final font is still undecided) silently breaks every fit constant.

**How to avoid:**
- Self-host with **`next/font`**. `next/font/google` downloads the font at build time and serves it from your own origin, which meets the self-host constraint. It also generates a metric-adjusted fallback (`size-adjust`). That reduces the shift but does **not** remove it for one particular word set at 30vw.
- Preload only the weight used for YAHYA, and subset to Latin.
- Fit with **pure CSS**, not JS measurement. Compute once per font: `font-size = containerWidth / (advance width of "YAHYA" in em)`, and express it as `calc(100cqi / K)` using container query units (or `vw`/`svh` with `min()`). Keep `K` in one token file next to the font choice, so changing the font means changing one constant and re-checking.
- Hide only the hero word until the font is ready (`document.fonts.load()` with a short timeout of about 300 ms, then show it regardless), or use `font-display: block` for that face only. This prevents a 400 px tall fallback-to-real-font swap.
- Never animate `font-size` for the hero-to-rail morph (see Pitfall 10).

**Warning signs:** Lighthouse CLS above 0.05 on the home page. A visible jump on a hard reload with "Disable cache" on. Code calling `getBoundingClientRect` on text inside a resize handler.

**Phase to address:** Foundation and design-system phase (font pipeline and fit tokens). Re-check when the final font is chosen.

---

### Pitfall 9: Recruiters bounce before understanding who he is

**What goes wrong:**
The hero is a beautiful giant "YAHYA" with no statement of what he does. The 75/75 judge animation takes eight seconds to land. The content sits five gestures deep behind an unfamiliar sideways interaction. A recruiter opens the link from LinkedIn on a phone, inside LinkedIn's in-app browser, spends 30 to 60 seconds, never sees "McGill SWE, CCC perfect score, looking for internships", and leaves. An unfamiliar navigation model also makes some visitors assume the page is broken because nothing scrolls.

**How to avoid:**
- The first screen must answer **who, what, proof and contact** within 5 seconds and without any interaction: name, a one-line role (SWE student at McGill), one proof line (CCC 75/75, or four first places), and direct links to email, LinkedIn, GitHub and the résumé. In a Swiss layout this is a small flush-left text block on the grid. It counts as content, not ornament.
- Show the judge animation's outcome first, or quickly. The final 75/75 should be readable within about 1.5 s, or shown statically with the animation as a replay. Never gate a fact behind an animation.
- Make the navigation discoverable on first visit: the "Next" control and the "00 / 05" pager visible in the first viewport, plus a subtle first-visit hint such as an arrow that nudges once. Every page must also be reachable by plain clicks.
- Offer a self-hosted résumé PDF as the escape hatch for skimmers.
- Test inside the LinkedIn and Gmail in-app browsers on iOS and Android. They have their own toolbars, sometimes ignore `prefers-reduced-motion`, and always start with a cold cache.

**Warning signs:** A 10-second test with a non-designer friend ("who is this and what does he do?") fails. Analytics, if added, show most sessions never leave page 0.

**Phase to address:** The content and IA phase, where the hero info block is a design requirement now even though final copy comes later, plus a pre-launch usability check with 3 to 5 people.

---

### Pitfall 10: Letter-to-rail morph and page slides jank on low-end phones

**What goes wrong:**
Animating `font-size`, `width`, `left` or `top` on five 30vw glyphs forces layout and repaint on every frame, so a mid-range Android drops to around 15 fps. Promoting everything permanently with `will-change` creates GPU memory pressure on iOS (six full-viewport layers plus huge text layers), which shows up as flicker or tab reloads. Scaling text *up* from a small raster with `transform: scale()` looks blurry in Safari until the animation ends.

**How to avoid:**
- Use FLIP with transforms only: measure the hero and rail positions, then animate `transform: translate() scale()` and `opacity`.
- Keep each letter laid out at its **large** size and scale it *down* into the rail. Downscaling a large raster stays sharp, while upscaling a small one blurs. Alternatively, cross-fade at the end to real rail letters laid out at rail size.
- Move pages with a single `transform: translate3d(-N * 100%, 0, 0)` on one track element, not six separately animated pages.
- Apply `will-change: transform` only during a transition and remove it afterwards.
- Use the Web Animations API or CSS transitions, which run on the compositor. A JS rAF tween library is only worth it for interruptible spring physics. Either way, make transitions interruptible: new input mid-transition should retarget the animation, not queue another one.
- Keep durations between 450 and 700 ms. Longer page slides start to feel heavy by the third use, which breaks the "never tiring" requirement.
- Set a performance budget. Test on a real low-end Android, or in Chrome DevTools with 6x CPU slowdown, and target 60 fps on page change. Keep landing-route JS under 150 KB gzipped.

**Warning signs:** Purple "Layout" bars in the Performance panel during transitions. Soft-looking letters at the end of the morph in Safari. The iOS tab reloading after a few minutes.

**Phase to address:** Interaction-model prototype (the track and FLIP architecture) and a performance pass before launch.

---

### Pitfall 11: The WebGL depth map ruins load time, battery and stability

**What goes wrong:**
Three.js plus a depth texture adds 150 to 600 KB to the first load, even though the effect only appears on About (page 5). The render loop keeps running while the page is offscreen or the tab is hidden, so phones heat up. A shader at DPR 3 on an iPhone draws about 9x the pixels. Under memory pressure iOS kills the WebGL context (`webglcontextlost`), leaving a black rectangle. The effect also adds motion that reduced-motion users did not ask for.

**How to avoid:**
- Treat WebGL as **progressive enhancement**. Ship a static, self-hosted depth-map image (AVIF or WebP) as the default. Upgrade to WebGL only after the browser is idle, only when About is close (active page index 4 or 5), only when `prefers-reduced-motion: no-preference`, and only if a cheap capability check passes.
- Load it with a dynamic `import()`. For a single textured plane with depth displacement, prefer a raw WebGL or OGL fragment shader (a few KB) over full three.js.
- Cap DPR at 1.5. Pause the rAF loop when the page is inert or `document.hidden` is true. Handle `webglcontextlost` and `webglcontextrestored` by falling back to the image.
- Keep it decorative: put `aria-hidden` on the canvas and keep the meaningful content in the HTML.

**Warning signs:** The bundle analyser shows `three` in the main chunk. The GPU is still busy while you are on Projects. The canvas turns black after switching apps on iOS.

**Phase to address:** A late, optional depth-map phase of its own, after the core site ships. Its placement is still undecided, so it must not block launch.

---

### Pitfall 12: GitHub Pages and static export deployment gotchas

**What goes wrong (each item confirmed in official docs or a widely repeated issue):**
- **`_next/` assets return 404.** GitHub Pages runs Jekyll, which ignores folders whose names start with `_`. Fix: add an empty `.nojekyll` to `public/`, or deploy with the official `actions/deploy-pages` workflow (artifact upload, no Jekyll).
- **`basePath` mismatch.** While the site lives at `user.github.io/portfolio`, it needs `basePath: '/portfolio'`. Once `yahya-hallani.dev` points at it, it needs `''`. The value is inlined at build time. `next/link` adds the prefix automatically, but **`next/image` `src` strings, plain `<a href>`, CSS `url()`, and font and PDF paths do not** (per the Next.js basePath docs). Getting it wrong produces a site with no styles and broken images. Fix: make basePath an env var (`NEXT_PUBLIC_BASE_PATH`). Better, **skip the subpath stage**: buy the domain first, or name the repo `<user>.github.io`.
- **Image Optimization does not work** with the default loader under `output: 'export'`. Set `images: { unoptimized: true }` and pre-optimise images yourself: AVIF and WebP at the right sizes, explicit width and height, or a build-time tool. Otherwise the 4 MB source portrait ships as-is.
- **CNAME is ignored with Actions deploys.** When publishing through a custom Actions workflow, "no CNAME file is created and any existing CNAME file is ignored". The domain must be set in repo Settings > Pages. A `public/CNAME` does no harm, but it is not what makes the domain work.
- **Domain takeover risk.** Verify `yahya-hallani.dev` in the GitHub account's Pages settings **before** pointing DNS at it, and never use wildcard DNS records. Apex A records go to 185.199.108.153, 185.199.109.153, 185.199.110.153 and 185.199.111.153. Add a `www` CNAME pointing to `<user>.github.io`.
- **`.dev` is HSTS-preloaded,** so every browser requires HTTPS for it. The site is unreachable until GitHub provisions the certificate (which can take up to 24 hours after DNS is correct) and "Enforce HTTPS" is ticked. Treat the domain cutover as a planned event, not a last-minute step.
- **Trailing slashes.** With `trailingSlash: false`, the export emits `about.html`. Pages usually serves that at `/about`, but hosts differ. A hash-based single page sidesteps the issue almost entirely. If routes are added later, set `trailingSlash: true`, which emits `about/index.html`, the most portable form.
- **404.** The export emits `404.html`, and GitHub Pages serves it automatically for unknown paths. Make it an on-brand page with a link home that does not depend on the paging JS.
- **No headers, redirects or rewrites** in a static export, because they are unsupported features. That means no CSP header from `next.config`. If you want a CSP, use `<meta http-equiv="Content-Security-Policy">`, keeping in mind that Next's inline scripts need `'unsafe-inline'` or hashes. You cannot set cache headers either. Pages sets roughly a 10-minute `max-age`, which is fine for the hashed `_next/static` assets, but expect stale HTML for a short while after each deploy.
- **Browser APIs during prerender.** Reading `window` or `matchMedia` at module top level breaks `next build`. Gate those reads behind `useEffect`, and design the server HTML as the reduced-motion, hero-state baseline so that hydration does not flash.

**Warning signs:** The deployed site has no styles while `localhost` looks fine. Images work locally but 404 on Pages. The custom domain field in Settings > Pages is blank after a deploy.

**Phase to address:** Foundation phase. Run a deploy-pipeline spike in week one: a "hello" page live on Pages with the final basePath strategy, one image, the font and the 404 page.

---

## Moderate Pitfalls

### Dark theme contrast with grey text and green accent

- Pure white (#fff) body text on pure black (#000) causes halation for readers with astigmatism and feels harsh over long passages. The giant type can stay pure white if the design calls for it, but use an off-white (about #e8e8e8 to #f0f0f0) for paragraphs.
- Swiss layouts lean on small grey captions: the numbered letter captions, "00 / 05", meta lines. Contrast against #000:

  | Grey | Ratio on #000 | Use |
  |------|---------------|-----|
  | #666 | about 3.7:1 | Fails for body text. Never use it for real information |
  | #767676 | about 4.6:1 | Barely passes AA for small text |
  | #8a8a8a | about 6.1:1 | **Minimum token for small grey text** |

  Grey on a near-black ground such as #0a0a0a or #111 has lower ratios, so recompute whenever the ground colour changes.
- The green accent needs 4.5:1 when used as text, and 3:1 when used as a UI or state indicator. Most saturated greens pass easily on black, but check the final hex.
- **Do not show the current section with colour alone** (WCAG 1.4.1). Pair the accent with `aria-current="page"` and a non-colour cue such as weight, an index marker or position.
- Focus rings: use a 2 px white or green outline with an offset. Never set `outline: none` without a replacement, because the default focus ring is almost invisible on black in some browsers.

**Phase:** Design-system phase, with tokens and their computed contrast checked in a test. Run axe on every section.

### Reduced motion treated as an afterthought

- Full-viewport horizontal slides are a classic vestibular trigger (WCAG 2.3.3). Under `prefers-reduced-motion: reduce`:
  - page changes become an instant swap or a 150 ms opacity cross-fade;
  - the letter-to-rail morph becomes a cross-fade;
  - the judge animation shows 75/75 directly;
  - WebGL stays static.
- **Paging must still work.** Reduced motion means less motion, not less function.
- The setting can change mid-session, so read the media query live. Express it in CSS first (`@media`) and have JS read the same source.
- An in-page "reduce motion" toggle is optional, only if the design has room. Respecting the OS setting is the requirement.

**Phase:** Every animation phase. "Has a reduced-motion variant" belongs in each animation's definition of done, not in a final cleanup pass.

### Keyboard model conflicts

- Space, Page Up/Down and the arrow keys are taken over for paging. They must **not** page when focus is in an input, on a button (Space activates it), in a `contenteditable`, or inside a section that scrolls internally and has not reached its boundary.
- Home and End go to the first and last page. Ignore modified keys such as Cmd+Arrow and Alt+Arrow (browser back and forward on some platforms) and Ctrl+Home.
- Check `event.repeat`, or rate-limit to one page per transition, so a held key cannot race through all six pages.

**Phase:** Interaction-model prototype.

### Input state machine sprawl

- Wheel, keys, swipe, letter clicks, the pager, "Next", hash changes and resize all change the current page. Seven handlers, each with its own flags (`isAnimating`, `lastWheel`, `locked`), produce race bugs: double transitions, a rail stuck in its hero state, a URL out of sync with the page.
- Fix: **one reducer-style controller**, `goTo(index, { source, animate })`, that is the only writer of the page index, URL, focus, `inert` and animation. Input adapters only translate raw events into intents. This also keeps the logic testable.

**Phase:** Interaction-model prototype. This is an architectural decision; see ARCHITECTURE.md.

### Hydration flash and no-JS state

- The server HTML lays all pages out somewhere. If the client then jumps to the hash page or switches the letters to the rail state, the visitor sees a flash of the wrong page. Fix:
  - render server HTML that is correct without JS (a stacked vertical fallback, or the hero);
  - set the initial page index from `location.hash` in an inline script that runs before paint, writing a `data-page` attribute on `<html>` so CSS positions the track correctly on the first frame.
- Without JS, the site should degrade to a vertical document with anchor links. This is cheap because it is the same layout as the small-viewport and zoom fallback.

**Phase:** Foundation and interaction-model prototype.

---

## Minor Pitfalls

- **Text selection during swipe or drag.** Dragging the stage with a mouse selects the giant text. Apply `user-select: none` only to the YAHYA glyphs and leave body text selectable, since recruiters copy the email address.
- **Email obfuscation breaks.** An email assembled in JS is missing for no-JS visitors and in link previews. A plain `mailto:` is fine: some spam costs far less than a recruiter who cannot reach him. Add a copy button that confirms the copy.
- **Resize storms.** iOS fires `resize` on address-bar changes. Throttle FLIP re-measurement, and never re-fit type from JS (Pitfall 8).
- **Progress bar and pager desync** from the URL after a `hashchange`. Derive both from the controller state. Never store them separately.
- **Hover-only affordances.** Letter captions or "click me" cues that appear only on hover are never seen by touch users. Show captions by default.
- **Self-hosted media weight.** A 4000 px portrait or depth map is far too heavy. Export at about 2x the rendered size, with explicit dimensions.
- **Analytics.** None is needed at launch. If added later, use a cookieless, lightweight tool, and never load third-party scripts that break the performance budget.
- **Inter Tight is marked "revisit".** Before locking the fit constants, check any candidate font on the actual word "YAHYA" at display size, paying particular attention to the arms of the Y and the apex of the A.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Fixed-timeout wheel debounce | Works on your own trackpad in 10 minutes | Double-skips on other devices, blocks fast navigators, endless re-tuning | Throwaway sketch only, never in the build |
| Off-the-shelf fullpage or carousel library (fullPage.js, Swiper "mousewheel") | Fast start | Licensing (fullPage.js is GPL or commercial), weight, a generic feel, and you still fight its trackpad heuristics and accessibility gaps | Never for the core paging. Reading its source for heuristics is worthwhile |
| JS text fitting (measure, then set font-size) | Exact fit for any font | CLS, re-fit jank on iOS, font-load race | Never. Use CSS-only `cqi`/`vw` with a per-font constant |
| `pushState` per page change | "Back works between sections" | Back-button trap, cluttered history | Never. Use `replaceState` |
| Hardcoding a `/portfolio` basePath | Deploy today on user.github.io/portfolio | Broken assets at domain cutover; plain `<a>` and `next/image` paths need manual edits | Only behind an env var |
| `will-change` on everything | Smooth on a desktop GPU | iOS memory pressure and tab reloads | Never globally. Only during transitions |
| three.js for one shader plane | Familiar API | 150+ KB for one effect | Only if the effect grows into real 3D |
| Skipping the vertical fallback layout | Less CSS | Zoom, landscape-phone, no-JS and reduced-motion failures all at once | Never. It is the base layer |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| GitHub Pages (branch deploy) | `_next` hidden by Jekyll | Add `public/.nojekyll`, or use `actions/deploy-pages` |
| GitHub Pages (Actions deploy) | Relying on `public/CNAME` for the domain | Set the custom domain in Settings > Pages (CNAME is ignored with Actions) |
| Custom domain `yahya-hallani.dev` | Pointing DNS before verifying the domain; using a wildcard record | Verify in account settings first, point A records at the four 185.199.x.153 IPs, add the `www` CNAME, tick Enforce HTTPS |
| `.dev` TLD | Expecting HTTP to work while the certificate provisions | HSTS preload means HTTPS only. Allow up to 24 h for the certificate |
| `next/image` in export | Default loader, or a string `src` without the basePath prefix | `images.unoptimized: true`, pre-optimised assets, and a manual basePath prefix (or no basePath at all) |
| `next/font` | A Google Fonts `<link>` (hotlinked, breaks the self-host constraint) | `next/font/google` or `next/font/local`, served from your own origin |
| LinkedIn / iMessage previews | Missing OG tags, relative OG URLs | `metadataBase` plus a static 1200x630 OG image. Verify with LinkedIn Post Inspector |
| React event props | `onWheel` with `preventDefault` | Native `addEventListener` with `{ passive: false }` |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Animating layout properties on giant glyphs | Jank on page change, purple Layout bars | Transforms and opacity only (FLIP) | Mid-range Android, or any test at 4x CPU throttle |
| Six full-viewport layers promoted permanently | Flicker or tab reloads on iOS | One moving track; `will-change` only during motion | iPhones with 3 to 4 GB RAM, after a few minutes |
| WebGL loop running offscreen | Battery drain, warm phone | Pause when inert or hidden; cap DPR at 1.5 | Any phone, within a minute |
| WebGL or three.js in the main bundle | Slow first load from LinkedIn | Dynamic import near About, with an image fallback | Cold load on slow 4G |
| Unoptimised portrait or depth images | Multi-MB first load | Pre-sized AVIF/WebP, explicit dimensions, lazy-load anything below page 0 | Mobile data |
| Every section hydrated as a client component | High TBT, delayed input readiness | Server components for content, one small client controller | Low-end phones, where input is ignored for 1 to 2 s |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Pointing DNS at Pages before verifying the domain, or using a wildcard record | Subdomain takeover: someone else hosts content on yahya-hallani.dev | Verify the domain first, no wildcards, and remove the DNS records if Pages is ever disabled |
| Hotlinked third-party scripts (fonts, CDN libraries, analytics) | Supply-chain injection on a page recruiters trust | Self-host everything (already a project constraint). Use SRI if a CDN is truly unavoidable |
| `dangerouslySetInnerHTML` for copy or markdown | XSS if the content source ever changes | Plain JSX content, no HTML injection |
| Secrets in Actions workflows (for example an analytics token) | Leaked tokens in a public repo | The site needs no secrets. If one is ever added, store it in repo secrets |
| `target="_blank"` links without `rel="noopener"` | Reverse tabnabbing in older browsers (modern ones default to noopener) | `rel="noopener noreferrer"` on all external links |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| The hero says only "YAHYA" | A recruiter cannot tell who he is or what he does within 5 s | Name, role, proof line and contact links visible on page 0 |
| Navigation is invisible or unfamiliar | "Nothing scrolls, is it broken?" | Visible Next control, pager, captions on the letters, a first-visit hint |
| Slow, long page slides | Tiring by page 3, which contradicts "never tiring" | 450 to 700 ms, interruptible, ease-out |
| The judge animation gates the result | Skimmers miss 75/75 | Final state readable quickly; the animation is a flourish |
| Vertical wheel input moves pages sideways with no explanation | Disorientation, motion sickness | Keep the progress bar and pager in sync. Consider a visual cue that shows the direction |
| Content trapped at high zoom or on short screens | Unreadable for low-vision users and on 768 px laptops | Inner vertical scroll plus a stacked fallback layout |
| Current section shown only in green | Colour-blind users lose their place | Accent colour plus `aria-current` plus a weight or marker cue |
| No résumé link | Recruiters have to piece the information together themselves | Self-hosted PDF linked from the hero and from Say hi |

## "Looks Done But Isn't" Checklist

- [ ] **Wheel paging:** One flick moves exactly one page on a Mac trackpad (Chrome, Safari, Firefox), a Magic Mouse, a Windows notched wheel and a Windows precision touchpad. A deliberate second flick during the momentum tail still pages.
- [ ] **Swipe paging:** Works on a real iPhone (Safari and the LinkedIn in-app browser) and in Android Chrome. A left-edge swipe does not fight the rail. The footer is visible above the address bar.
- [ ] **Keyboard:** Tabbing from the top reaches every page through the nav, and focus is always visible. Arrows, Space, Page Up/Down, Home and End work, and none of them page while focus is on a button or inside a scrollable section.
- [ ] **Screen reader:** VoiceOver reads "Yahya Hallani" as the heading, announces letter links by their section names, and announces page changes. Only the active page is in the accessibility tree.
- [ ] **Deep links:** `/#projects` in a fresh tab opens Projects with no intro animation. Back leaves the site. Refresh keeps the current page.
- [ ] **Zoom and short screens:** Every section shows all its content at 200% zoom and at 1366x768. Landscape phones work.
- [ ] **Reduced motion:** Every animation has a reduced variant, and paging still works.
- [ ] **Contrast:** An automated check confirms every grey token is at least 4.5:1 on the actual ground colour. The accent state has a non-colour cue.
- [ ] **Fonts:** YAHYA does not visibly re-fit on a hard reload with an empty cache, and CLS is below 0.05.
- [ ] **Deploy:** The production build on Pages has styles, images, fonts, the résumé PDF and an on-brand 404. HTTPS is enforced and the domain is verified.
- [ ] **SEO and previews:** A `curl` of production shows all section text. The title and description are real. LinkedIn Post Inspector shows the OG image.
- [ ] **No-JS:** With JS disabled, the content reads as a vertical page.
- [ ] **WebGL (if shipped):** Falls back to the image on context loss and under reduced motion, pauses offscreen, and is not in the main bundle.
- [ ] **Facts:** Every number and claim (75/75, the four first places) is verified and real. No placeholder copy has shipped.

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Trackpad double-skips found after launch | LOW if the gesture logic is one isolated module; HIGH if it is spread across components | Record traces from the failing device, add them as fixtures, adjust the classifier |
| Content clipped at zoom | MEDIUM | Add per-page inner scroll and boundary-aware paging, then the stacked fallback breakpoint |
| Focus or `inert` broken | MEDIUM | Centralise it in the page controller. Retrofitting it into scattered handlers is the expensive part |
| basePath assets broken at domain cutover | LOW | Set basePath to `''`, rebuild, fix any manual path prefixes |
| Domain unreachable (HTTPS not yet provisioned) | LOW (only time) | Check the DNS records, remove and re-add the domain in Pages settings, wait for the certificate |
| CLS from the font swap | LOW to MEDIUM | Switch to the CSS fit constant, preload the display weight, hide the hero word until the font is ready |
| Recruiters bounce | MEDIUM | Add the hero info block, the résumé link and a visible Next control. This is redesign work if the hero was built as a pure poster |
| WebGL instability | LOW | Turn it off and ship the static depth image, which was the fallback anyway |

## Pitfall-to-Phase Mapping

These phase names are suggestions for the roadmapper. The ordering rule is: deploy spike and design tokens first, then the input-model prototype on real devices, then the sections, then polish and the optional WebGL, then the launch audit.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| P12 Pages, export, basePath, domain | Foundation (deploy spike in week one) | A hello page with an image, the font and the 404 live on Pages. Domain verified before DNS |
| P8 Font flash and fitted type | Foundation and design system | CLS below 0.05, no visible re-fit on a cold reload, fit constant stored as a token |
| Dark contrast tokens | Design system | Automated contrast test on every token. No axe contrast violations |
| P7 Semantics, metadata, SEO | Foundation | `curl` shows the content, the h1 is correct, the OG preview validates |
| P1 Trackpad momentum, P2 passive listeners | Interaction-model prototype | Unit tests on recorded traces plus a manual device matrix |
| P3 iOS touch conflicts | Interaction-model prototype plus mobile phase | Real-iPhone test, including the LinkedIn in-app browser |
| P4 Keyboard, screen reader, inert, focus | Interaction-model prototype (controller) and launch audit | VoiceOver, NVDA with Firefox, a keyboard-only run |
| P6 Deep links and Back | Interaction-model prototype | Hash load in a fresh tab; Back leaves the site |
| State-machine sprawl | Interaction-model prototype | A single `goTo` writer, unit tests for every input source |
| P10 Morph and slide performance | Hero and rail morph phase | 60 fps at 6x CPU throttle; letters sharp in Safari at the end state |
| P5 Clipping at zoom and on short screens | Layout phase plus each section phase | Screenshots of every section at 200% zoom and at 1366x768 |
| Reduced motion | Every animation phase (definition of done) | With the OS setting on, every animation has a reduced variant |
| P9 Recruiter skim | Content and IA phase, plus pre-launch usability | A 5-second test with 3 to 5 people |
| P11 WebGL | Optional late phase, after the core site is launch-ready | Bundle check, context-loss test, offscreen pause |

## Sources

- Next.js docs, Static Exports, last updated 2026-08-09. Covers unsupported features (default image loader, headers, redirects, rewrites), `trailingSlash`, 404.html and the GitHub Pages template. https://nextjs.org/docs/app/guides/static-exports (HIGH)
- Next.js docs, basePath. Inlined at build time; `next/link` is prefixed automatically; a `next/image` `src` must be prefixed by hand. https://nextjs.org/docs/app/api-reference/config/next-config-js/basePath (HIGH)
- GitHub Docs, Managing a custom domain for your GitHub Pages site. CNAME is ignored with Actions workflows; apex A records; Enforce HTTPS can take up to 24 h; verify the domain and avoid wildcards to prevent takeover. https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site (HIGH)
- `.nojekyll` and `public/CNAME` patterns: https://rahhuul.github.io/blog/nextjs-static-export-github-pages-guide/ , https://jaketrent.com/post/deploy-nextjs-github-pages , https://github.com/zeit/next.js/issues/3335 (MEDIUM)
- Mac trackpad wheel streams: 40+ events over 2 to 3 s, debounce not enough. https://dev.to/linards_liepenieks/building-custom-scroll-snap-sections-a-journey-through-mac-trackpad-hell-1k2k (MEDIUM)
- Splide report of a trackpad swipe moving two slides: https://lightrun.com/answers/splidejs-splide-swiping-on-apple-mac-trackpad-scrolls-two-slides-and-ignores-flickmaxpages-setting (MEDIUM)
- Apple `NSEvent.momentumPhase` is native-only and not exposed to the web: https://developer.apple.com/documentation/appkit/nsevent/momentumphase (HIGH)
- React non-passive wheel listeners: https://github.com/facebook/react/issues/22794 , https://egghead.io/lessons/javascript-improve-scroll-performance-with-passive-event-listeners (MEDIUM)
- WCAG 2.2 success criteria: 1.4.1 Use of Color, 1.4.3 Contrast, 1.4.4 Resize Text, 1.4.10 Reflow, 2.3.3 Animation from Interactions, 2.5.3 Label in Name (HIGH, from the standard). Contrast ratios for #767676, #8a8a8a and #666 on #000 were computed with the WCAG relative-luminance formula.
- Platform knowledge not re-verified in this session (MEDIUM; confirm on devices):
  - pages cannot prevent the iOS Safari left-edge back swipe;
  - `svh`, `dvh` and `inert` are Baseline;
  - Firefox can report `deltaMode` in line units;
  - `.dev` is on the HSTS preload list;
  - `overscroll-behavior-x` suppresses Chrome's horizontal-overscroll history navigation.

---
*Pitfalls research for: horizontal-paging dark Swiss portfolio, Next.js static export on GitHub Pages*
*Researched: 2026-11-06*
