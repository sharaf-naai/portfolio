# Portfolio — project brief for Claude

Personal freelance portfolio of a web developer based in Morocco (websites, web apps, CRMs).
Clients come from friends' referrals. Awwwards-level motion, but it must stay fast and usable on mid-range Android phones.

Design reference (canvas, 2 artboards: Hero, Work): https://claude.ai/artifact/3bQyVR8fsEcASw37sBVkUE

## Stack
- Next.js (App Router, TypeScript), Tailwind CSS
- GSAP + ScrollTrigger (all GSAP plugins are free now, DrawSVG included)
- Lenis smooth scroll, synced to ScrollTrigger (`lenis.on('scroll', ScrollTrigger.update)`, GSAP ticker drives `lenis.raf`)
- next-intl later (EN first, then FR, then AR in RTL). Write all copy in a `messages/en.json` from day one.
- No React Three Fiber for now: the hero and work wheel are DOM/SVG/CSS transforms.

## Design tokens
- Paper `#EDEDE9` (with a 28px grid at `rgba(0,0,0,0.07)`, crumple highlights, SVG feTurbulence grain)
- Ink `#141414`
- Red accent `#E0281E` (light red on dark: `#F07A72`)
- Bone `#EDEBE6`
- Dark site: `#0B1110` → `#050606` with a teal glow `rgba(47,183,168,.5)` and an amber glow `rgba(242,168,29,.4)`
- Fonts (next/font/google):
  - Archivo, variable `wdth` 62–125 and `wght` 400–900. Headlines use `font-stretch: 125%; font-weight: 900`, uppercase.
  - Caveat for handwritten notes.
  - JetBrains Mono for labels and counters (uppercase, letter-spacing 0.08–0.14em).

## Page structure (chapters)
00 Loader · 01 Hero · 02 Work · 03 Services + prices · 04 About + process · 05 Lab · 06 Contact (WhatsApp)

## Build order (do these first, in order)
1. Scaffold: tokens, fonts, Lenis provider, paper background component, grain overlay.
2. **Hero (static)**
   - Small line "DEVELOPER / BUILDER … 2026" above the name.
   - The name is huge in Archivo 900 expanded. The **O is replaced by an inline SVG ink portrait** sized at about 1.08em.
   - Under it: a red handwritten Caveat note "ok, scroll and rip it" with a hand-drawn arrow, then the ornaments ✸ ✦ ♣.
   - The bottom of the paper has a torn edge (clip-path polygon). The dark cinematic layer sits underneath, with a big "WEBSITES" word.
   - Three taped polaroids (project screenshots + Caveat captions) overlap the tear.
   - Use the placeholder portrait SVG until the real stroke-based SVG arrives; the real one gets drawn in with DrawSVG on load.
3. **Timeline scrollbar = the navigation**
   - Hide the native scrollbar. A fixed bar at the bottom of the screen (84px, `rgba(10,10,10,.94)`) contains:
     - logo circle (mini ink face)
     - "0X / 06" counter + chapter name and %
     - a track of clips, one per chapter (Hero, Work, Services, About, Lab, Contact), each as wide as its section is tall
     - a red playhead
     - a sound toggle (off by default)
     - a "Book a call" pill
   - The playhead follows Lenis scroll progress. Clips you've passed fill red at 32% opacity; the current clip gets a red border.
   - Dragging the playhead scrubs `lenis.scrollTo`. Clicking a clip scrolls to that section.
   - Keyboard accessible: a range input with `aria-label="Scroll position"`; the clips are buttons.
4. **Rip transition** (storyboard: canvas row "Paper rip", frames 1–4)
   - Scrubbed by scroll, never a one-shot, and fully reversible. The hero pins for about 120vh while the rip plays.
   - Build: render the paper layer **twice**. Clip each copy along the same jagged rip line (left half / right half, `clip-path: polygon`; rip runs from bottom to top around x ≈ 60%). Add a 6–7px white rough stroke along the rip (SVG polyline) for the paper fibers; each half shows its side of it. `transform-origin` sits at the top of the rip line; add a drop-shadow on both halves.
   - Timeline (one GSAP timeline, `scrub: 1`):
     - **0–10% build-up:** the halves lift by −6px, the shadow grows, the polaroids lift (bigger shadow, y −14…−18, small rotation), the "rip it" note wiggles.
     - **10–35% tear starts:** the halves rotate −2° / +1.6° around the top of the rip, so a wedge opens from the bottom.
     - **35–65% split:** left half translate(−150px, −40px) rotate(−8°), right half translate(150px, −40px) rotate(6°). "WEBSITES" scales 1.12 → 1.0 and the teal/amber glows brighten.
     - **65–100% fly-off + handoff:** left half translate(−980px, −260px) rotate(−22°), right half translate(980px, −220px) rotate(18°), plus a small flutter (rotation wobble). The three polaroids move (Flip plugin or measured transforms) onto their arc positions and **become the Work wheel cards**. The timeline playhead enters "02 Work".
   - Mobile / reduced motion: one torn sheet slides up and away, no split.

   **Make it feel like real paper, not cardboard (required):**
   - **The tear grows, it doesn't just appear.** The rip line is revealed progressively from bottom to top: animate how far the cut has travelled, and keep the two halves joined above that point. Real tearing is stick-slip: short fast jumps with tiny pauses. Map scroll progress through a stepped easing (e.g. `CustomEase` with 4–5 small plateaus) instead of a linear one, and line the `rip1/2/3` sounds up with the jumps.
   - **Depth, not flat 2D.** Put `perspective: 1200px` on the hero. Each half also gets `rotateY` (±10–25°) and a small `rotateX`, so it tilts away from the viewer as it leaves. Shadows grow and blur as the pieces rise.
   - **The fly-off is physics, not scrub.** The build-up and the tear (0–60%) are scrubbed by scroll. Once the tear completes (~60%), the fly-off is **released as a one-shot animation**:
     - Initial velocity comes from the current Lenis scroll velocity: a fast scroll throws them harder.
     - Path: horizontal movement eases out (air drag), vertical movement accelerates (gravity), so each half follows an arc.
     - Spin starts fast and decays.
     - Flutter: a damped sine on `rotateX`/`rotateZ` (2–3 wobbles), like a sheet catching air.
     - The two halves are slightly different (one 60–120ms later, different spin and arc), never mirrored.
   - **Reverse:** scrolling back above ~55% plays a quick (~0.6s) re-assembly animation, the halves flying back and snapping together with a small overshoot. After that the tear becomes scrubbed again.
   - **Paper bend (upgrade path):** if the DOM version still looks stiff, swap the paper layer for a React Three Fiber plane (paper rendered to a texture, mesh subdivided ~40×40) and curl the corners and edges in a vertex shader as the halves fly, so the paper bends instead of staying flat. Keep the paper layer behind one `<RipPaper>` component so this swap doesn't touch the rest of the page.

### Sound (Howler.js)
- Off by default; turned on with the speaker button in the timeline bar. Start the audio context only after that click (browser autoplay rules). Mute when `document.hidden`. Project videos are always muted.
- One audio sprite (webm + mp3 fallback), under 200 KB, low master volume (~0.35).
- Sounds:
  - `tapePeel`: rip progress 5%, the polaroids lift
  - `rip1` / `rip2` / `rip3`: rip progress 25% / 45% / 65%, **scrolling down only**; volume scales with Lenis velocity (clamp 0.3–1)
  - `rustle`: crossing 25% while scrolling up (the paper re-assembles)
  - `whoosh`: 75%, the halves fly off
  - `pencil`: on load while the signature and portrait draw in
  - `tick`: timeline clip click / playhead snap
  - `click`: each Work-wheel snap to a new card
  - `hum` (optional): very quiet projector loop while sound is on
- Each trigger fires once per crossing (keep a last-direction + last-threshold guard so it doesn't machine-gun).
- Source: the owner's own recordings (real paper tear, tape peel) or CC0 sounds; note the license next to every file in `/public/sounds/CREDITS.md`.
5. **Work: pinned project wheel**
   - The section pins for the length of all the cards.
   - The cards (520×330, radius 14) sit on an arc whose center is off-screen to the left (center ≈ x −260, y 50% of the screen; radius ≈ 1110px). Neighbouring cards are about 17° apart, and each card is rotated by its angle.
   - Scroll rotates the wheel: one card per step, with snapping.
   - The active card (closest to 0°): full brightness, 3px bone outline, red "▶ PLAYING" chip, autoplaying muted looped `<video>` with a thin progress line. The other cards: `brightness(.62)`, video paused. Hovering any card plays its video.
   - Card colors rotate between paper, ink and red. Each card has a browser chrome bar, a big number, the name, "kind · year", and the video.
   - Left panel shows the active project: section label, a big outlined number, the title, one sentence, a details table, an "Open project →" pill (later opens the full-screen project viewer), and the project list with the active one marked in red.
   - Projects: 01 Restaurant site (concept) · 02 Hanabaly (real client: appointment platform for doctors and psychologists) · 03 Booking / WhatsApp engine (concept) · 04 Car rental CRM (concept) · 05 "Your project" (an empty dashed card, the call to action).
   - After card 05 the pin releases and the page scrolls on normally.
6. **Mobile + accessibility**
   - Under 768px the wheel becomes a vertical stack of cards, and videos play when in view (IntersectionObserver).
   - `prefers-reduced-motion`: no pinning or rotation, plain scroll; Lenis is off.
   - Videos: `muted playsinline loop preload="metadata"`, with a poster image. Load only the active ±1.

## 03 Services: "Build your brief" (no public prices)
Design: canvas artboard "S5 v2 · Project brief". Paper background. Left column has 4 steps; on the right is a receipt-style **project brief** with a "Send on WhatsApp" pill.

1. **What do you need?** Pills: Website · Web app · CRM · Automation.
2. **Add-ons** (checkboxes, no prices): Extra language · Booking system · WhatsApp automation · Edit it yourself (CMS) · SEO setup · Monthly care.
3. **Your budget:** 4 ranges + "Not sure yet", plus a currency dropdown.
4. **When do you need it?** ASAP · 1–2 months · No rush.

The receipt and the WhatsApp message update live. Example message:
`Hi! I'd like a website + booking system + extra language. Budget: 1,800–3,500 GBP. Timeline: 1–2 months. [GB]`
The button opens `https://wa.me/<OWNER_NUMBER>?text=<encoded message>`.

### Budget ranges: decided by COUNTRY, never by currency
- Detect the visitor's country:
  1. `x-vercel-ip-country` header, read in middleware and stored in a `country` cookie. Detection is used only for display; don't store it anywhere else.
  2. Fallback: `Intl.DateTimeFormat().resolvedOptions().timeZone` mapped to a country.
  3. Fallback: `OTHER`.
- The **country picks the ranges and the default currency**. The currency dropdown only **converts those same ranges** into another currency. Example: a Moroccan visitor who switches to EUR still sees Moroccan ranges, just shown in euros. Switching currency must never move a visitor into another country's ranges.
- Conversion: EUR-based daily rates from a free exchange-rate API (one that includes MAD, XOF, AED, SAR, QAR, KWD), cached 24h, with static fallback rates in config. Round converted values to 2 significant figures ("nice" numbers).
- The dropdown lists the currencies of the 20 countries below + USD. Label: "In: Dirham · MAD ▾", with a small Caveat note "auto-detected: Morocco".
- Never show tier names or the word "tier" to visitors. Add the country code at the end of the WhatsApp message so the owner knows which ranges were shown.
- Ranges below are for a **Website**. Multiply them for other needs, then round to 2 significant figures: **Automation ×0.6 · CRM ×2.5 · Web app ×3**. Add-ons don't change the ranges.
- Band format: `Under A` · `A – B` · `B – C` · `C+` · `Not sure yet`.

Starting values. **The owner reviews and adjusts these before launch.** Put them in `lib/pricing.ts`, one object per country: `{ currency, a, b, c }`.

| Country | Code | Currency | A | B | C |
|---|---|---|---|---|---|
| Morocco | MA | MAD | 8,000 | 15,000 | 30,000 |
| Senegal | SN | XOF | 500,000 | 1,000,000 | 2,000,000 |
| Côte d'Ivoire | CI | XOF | 600,000 | 1,200,000 | 2,400,000 |
| Portugal | PT | EUR | 1,200 | 2,500 | 5,000 |
| Spain | ES | EUR | 1,500 | 3,000 | 6,000 |
| Italy | IT | EUR | 1,500 | 3,000 | 6,000 |
| France | FR | EUR | 2,000 | 4,000 | 8,000 |
| Belgium | BE | EUR | 2,000 | 4,000 | 8,000 |
| Germany | DE | EUR | 2,500 | 5,000 | 10,000 |
| Netherlands | NL | EUR | 2,500 | 5,000 | 10,000 |
| Ireland | IE | EUR | 2,500 | 5,000 | 10,000 |
| United Kingdom | GB | GBP | 1,800 | 3,500 | 7,000 |
| Canada | CA | CAD | 3,000 | 6,000 | 12,000 |
| United Arab Emirates | AE | AED | 8,000 | 16,000 | 32,000 |
| Saudi Arabia | SA | SAR | 8,000 | 16,000 | 32,000 |
| Qatar | QA | QAR | 8,000 | 16,000 | 32,000 |
| Kuwait | KW | KWD | 700 | 1,400 | 2,800 |
| United States | US | USD | 3,000 | 6,000 | 12,000 |
| Switzerland | CH | CHF | 3,000 | 6,000 | 12,000 |
| Luxembourg | LU | EUR | 3,000 | 6,000 | 12,000 |
| Any other country | OTHER | USD | 2,500 | 5,000 | 10,000 |

Why these levels (2026 market checks for a small business website built by a freelancer): France freelance showcase sites ~€1,500–5,000; UK freelancer ~£800–3,000; US freelancer median ~$3–5k; Dubai small business sites ~AED 8–25k; Casablanca freelancer ~22k MAD for a mid-size site; Abidjan showcase sites 350k–1.5M FCFA. The ranges are the client's budget brackets, not a price list.

- Optional line under the receipt: "Projects usually start around [X]". The owner decides whether to show it; it's off by default.
- The receipt footer reads: "I reply with a quote that fits your budget".

## 04 About: dark access card (swipe to flip)
Design: canvas artboard "I4 · Dark access card". This **replaces** the passport and the boarding pass; the process steps now live on the back of the card. Dark site background (teal/amber glow). Label "04 — About & process", heading "Access card.".

**Card:** 760×480 desktop (ratio ≈1.585, like a real ID card), radius 24, centered-left. A big soft shadow sits under the card. It is **not** styled as a bank card: no card numbers, no expiry date, no payment-network logos.

**Front**
- Matte black: `radial-gradient(80% 90% at 20% 10%, #23262B, #0B0C0E)`, plus a very subtle grain.
- Top row: "DEV ACCESS" (Archivo 900 expanded) on the left, a contactless icon on the right.
- A gold chip (CSS gradient `#E5C67A → #9C7A35` with contact lines), next to a hologram strip. The hologram's gradient angle and position follow the pointer (desktop) or the device tilt (mobile, if permitted) so it "catches the light".
- Black-and-white photo 150×180 (radius 10), top-right.
- Name in raised lettering: Archivo 900 expanded, `#D9D6CF`, `text-shadow: 0 1px 0 #ffffff33, 0 -1px 0 #00000088`.
- Under it: "WEB DEVELOPER · MOROCCO · EN/FR/AR" (mono).
- **Swipe-to-flip control** at the bottom: a pill track (`#1C1E22`, 1px `#33363C` border) with a round bone knob "↻" and the label "SLIDE TO FLIP →".

**Back**
- Same black: a full-width black stripe near the top, then two columns.
  - Left: Experience [YEARS] · Real client Hanabaly · Stack Next.js/React/GSAP · Studies [SCHOOL].
  - Right: a 120px QR code that opens WhatsApp (generate a real QR from the `wa.me` link at build time).
- The 4 process steps in a row: 01 Call · 02 Design · 03 Build · 04 Launch.
- Bottom: a bone **"Request access"** pill (WhatsApp icon) → opens WhatsApp with the message prefilled: "Hi! I'd like to request access 👋 (from your portfolio)". Next to it, an outline "↻ flip back" pill that slides the knob back.

**Swipe-to-flip behaviour (the key interaction)**
- The knob is draggable along the track (pointer events; works with mouse and touch). The label fades as the knob moves.
- Tie the card's `rotateY` to the drag: 0–60% of the track → the card tilts up to 25°, so it feels connected to your finger.
- Release past 60% → the knob snaps to the end, and the card completes the flip with a spring: GSAP, ~0.9s, slight overshoot, card lifted toward the viewer (`translateZ`) mid-flip. Plays the `cardFlip` sound.
- Release before 60% → the knob springs back and the card settles at 0°.
- Faces: `transform-style: preserve-3d`; both faces `backface-visibility: hidden`; the back is pre-rotated 180°.
- **Accessibility:** the knob is a real `<button aria-label="Flip the card">`. Enter/Space flips it, and the arrow keys move the knob. `aria-live` announces "Back of card" / "Front of card". With `prefers-reduced-motion`, flipping is a simple cross-fade.

**Scroll motion (pinned ~80vh)**
- The card rises from below, rotating from `rotateX(25deg)` to flat, and the hologram shimmer sweeps once.
- The name's raised letters light up left to right.
- Halfway through the pin, if the visitor hasn't swiped yet, the knob nudges right by 12px twice as a hint.

**Mobile:** card width 92vw with the same ratio. The swipe works with the thumb. The back's two columns stack (details, then QR).
**Sounds:** add `cardFlip` (a short card whoosh + soft click) to the sprite; the `stamp` sound is no longer needed.

## Rules
- Never invent testimonials, awards or client numbers. Leave placeholders like [YEAR], [STACK], [PRICE] until the owner gives real values.
- No fake review quotes for the concept projects.
- Keep each animation in its own hook or component so it can be tuned without touching the layout.
- Target: Lighthouse performance ≥ 90 on mobile.
