# Portfolio — project brief for Claude

Personal freelance portfolio of a web developer based in Morocco (websites, web apps, CRMs).
Clients come from friends' referrals. Awwwards-level motion, but it must stay fast and usable on mid-range Android phones.

Design reference canvas: https://claude.ai/artifact/3bQyVR8fsEcASw37sBVkUE
Chosen artboards: "Type system" · "Hero v2" (new fonts + two inks; same progress ring + pencil sound button as "Hero — FINAL controls") · "Pencil · Hero thumbnails" (what sits at the bottom of the hero paper) · LD1 (loader) · Rip storyboard · Work (wheel) · S5 v2 (services brief) · I4 (about card) · C1 (contact). Everything else on the canvas is an unused option. There is **no project page**: project cards open the live site in a new tab.

## Stack
- Next.js (App Router, TypeScript), Tailwind CSS
- GSAP + ScrollTrigger (all GSAP plugins are free now, DrawSVG included)
- Lenis smooth scroll, synced to ScrollTrigger (`lenis.on('scroll', ScrollTrigger.update)`, GSAP ticker drives `lenis.raf`)
- next-intl for EN / FR / AR (see "Languages" below).
- No React Three Fiber for now: the hero and work wheel are DOM/SVG/CSS transforms.

## Design tokens
- Paper texture: a 28px grid at `rgba(0,0,0,0.07)`, crumple highlights and SVG feTurbulence grain.
- **Colour system: "two inks".** The page stays calm, and **red appears only on things you can click**, so red always means "act here". Blue pen carries the personality.
  | Token | Hex | Use |
  |---|---|---|
  | `paper` | `#EDEDE9` | Light backgrounds |
  | `ink` | `#141414` | Main text on paper (15.7:1) |
  | `graphite` | `#4A4A4A` | Secondary text, pencil drawings, sound icon (7.6:1) |
  | `pen` | `#2450F0` | Blue pen: handwriting, hand-drawn arrows, notes, text links on paper (5.1:1) |
  | `pen-light` | `#7FA0FF` | Blue pen on dark sections (7.6:1) |
  | **`action`** | **`#D4231A`** | **Only on clickable things:** CTA pills (text `#FFF6F2`, 4.9:1), the progress-ring arc, the active Work chip, the selected state in pickers. Never decorative. |
  | `night` | `#0B1110` → `#050606` | Dark sections |
  | `bone` | `#EDEBE6` | Text on dark (16:1) |
  | `amber` | `#F2A81D` | Only as a soft glow in dark backgrounds (`rgba(242,168,29,.35)`), next to a deep-blue glow `rgba(36,80,240,.35)` (replaces the old teal glow) |
- Light only, no dark mode: `color-scheme: only light`, so phone browsers don't auto-darken the page.
- Rules:
  - One `action` element per screen where possible.
  - Hover on action: darken to `#B81D15` and lift 2px.
  - Focus ring: 2px `pen` outline with a 3px offset.
  - The old red `#E0281E` / `#F07A72` are retired: replace them with `action` (clickable) or `pen` / `pen-light` (handwriting).
- Dark site: `night` with a deep-blue glow `rgba(36,80,240,.35)` and an amber glow `rgba(242,168,29,.35)`.

- **Type system: 4 roles, one font per role, used the same way in every section** (canvas artboard "Type system"). Load everything with `next/font/google`, `display: swap`, and subset Latin (+ Arabic for the AR fonts).
  | Role | Font | Use |
  |---|---|---|
  | **Display** | **Big Shoulders Display** 800–900, uppercase, letter-spacing 0, line-height 0.82–0.9 | The name in the hero, section titles, "LET'S TALK", project names (Work list + cards), the name on the access card, big numbers (loader %, Work numbers). It's condensed, so set it bigger than before: hero name `clamp(120px, 16vw, 250px)`. |
  | **Text** | **Schibsted Grotesk** 400 / 600 (700 for small emphasis) | Paragraphs (17–19px, line-height 1.6), **buttons** (600, sentence case, 15–16px), Services brief options, form fields, footer links. |
  | **Labels** | **IBM Plex Mono** 400 / 500, uppercase, letter-spacing .12–.16em, 10–13px | Section labels ("02 — Selected work"), details tables, receipts, the progress % in the ring, tech stacks, card fields. |
  | **Hand** | **Nanum Pen Script** (fallback), later **the owner's own handwriting** as a custom font (make it with Calligraphr from a scanned sheet; export WOFF2; load it with `next/font/local`) | Notes, captions, the "ok, scroll and rip it" note, loader messages, sound label. Always in `pen` blue. It renders small, so use 1.3–1.4× the size you'd give Caveat (min 26px). |
  | Arabic display | **Lalezar** | Same places as Display in the AR version |
  | Arabic text | **IBM Plex Sans Arabic** 400 / 600 | Paragraphs, buttons, labels in AR |
  | Arabic hand | **Aref Ruqaa** | Handwritten notes in AR |
- **Retired:** Archivo (expanded), Caveat, JetBrains Mono. Replace every use.
- Never mix more than these roles on one screen, and never use a role outside its job (e.g. no Display font for paragraphs, no Mono for buttons).
- **No decorative ornaments anywhere:** the ✸ ✦ ♣ symbols and any ✦ in copy or buttons are removed.

## Page structure (chapters)
00 Loader · 01 Hero · 02 Work · 03 Services + prices · 04 About + process · 05 Contact (WhatsApp)
**Lab is hidden for now** (designs exist on the canvas; keep it out of the page and out of the progress ring). The ring has 5 chapter dots.

## Build order (do these first, in order)
1. Scaffold: tokens, fonts, Lenis provider, paper background component, grain overlay.
2. **Loader (LD1)**: see the "00 Loader" section below.
3. **Hero (static)**
   - Small line "DEVELOPER / BUILDER … 2026" above the name.
   - The name is huge in the Display font (Big Shoulders Display 900). The **O is replaced by an inline SVG ink portrait** sized at about 1.08em.
   - Under it: a blue-pen (`pen`) handwritten Hand font note "ok, scroll and rip it" with a hand-drawn arrow, (no ornaments under it).
   - The bottom of the paper has a torn edge (clip-path polygon). The dark cinematic layer sits underneath, with a big "WEBSITES" word.
   - **Bottom of the paper: pencil thumbnail sketches of this hero** (canvas artboard "Pencil · Hero thumbnails"). This replaces the old project polaroids; nothing here refers to the projects.
     - Four tiny wireframes of the hero, drawn in **graphite pencil** (`graphite` #57534D-ish, 1.8px strokes with a light SVG `feTurbulence` + `feDisplacementMap` grain so they look like real pencil, not vector lines). Each one shows: a box, a short line for the name, 2 thick lines for text, and a zig-zag torn edge near its bottom.
     - v1, v2, v3 sit in a loose row, each **crossed out with a big X**, labelled in the Hand font: "v1", "v2", "v3 — too busy".
     - v4 is slightly bigger, **circled with a loopy `pen`-blue scribble** and labelled in blue: "v4 ✓ make the name BIG".
     - A pencil arrow curves down toward the torn edge with the note "rip here?".
     - All of it sits between the name block and the torn edge, never overlapping the name.
     - **Motion:** right after the loader's face lands in the O, the sketches **draw themselves** one by one (DrawSVG, ~0.25s per thumbnail, slightly irregular timing), then the crosses, then the blue circle and labels. Play the `pencil` sound while they draw (only if sound is on). They're drawn on the paper, so during the rip they tear and fly away with the paper halves (the split line runs through them).
   - Use the placeholder portrait SVG until the real stroke-based SVG arrives.
   - There is **no top navigation**. The page opens on the paper and the name.
4. **Navigation = a round progress ring + a pencil sound button** (canvas artboard "Hero — FINAL controls")
   - Hide the native scrollbar (`scrollbar-width: none` + `::-webkit-scrollbar { display: none }`). There is no menu.
   - **Progress ring:** fixed in the **bottom-right corner** (28px from the edges).
     - A 76px dark circle `rgba(12,12,12,.88)` with a soft shadow, so it reads on both the paper and the dark sections.
     - Inside it, a **thick** SVG ring (r 30, stroke 8): a faint track `rgba(237,235,230,.18)` and an **`action` red arc** (`#D4231A`, round caps) that fills clockwise from 12 o'clock as you scroll. Use `stroke-dasharray = 2πr` and `stroke-dashoffset = 2πr × (1 − progress)`, driven by Lenis progress through `gsap.quickSetter`.
     - **The percentage sits in the center** (IBM Plex Mono 13px 500, bone), e.g. "37%".
     - 5 small dots (r 3, with a 1.5px dark outline so they stay visible on the red arc) sit on the ring at the start of each chapter. Dots already passed turn `action` red. No section names are shown.
     - **Click** = smooth-scroll to the next chapter. At 100% the icon becomes ↑ and a click rewinds to the top.
     - On hover the ring scales to 1.08 and the % changes to "next ↓".
     - The `tick` sound plays on click.
     - It stays hidden during the loader and fades and scales in when the hero appears.
     - **Accessibility:** it's a real `<button>` whose `aria-label` updates ("Scroll progress 37%. Go to next part" / "Back to top"). Add a visible-on-focus "Skip to contact" link.
   - **Sound button:** in the **hero's top-right corner**, positioned `absolute` inside the hero (**not fixed**: it scrolls away with the hero and doesn't follow the page). A 64px **hand-drawn pencil speaker** in graphite grey `#4A4A4A`, drawn with a double sketchy stroke.
     - **On:** 3 sound-wave arcs.
     - **Off (default):** the waves are replaced by a scribbled ✕ in `pen` blue.
     - **Click:** the new state draws itself with DrawSVG (~0.35s), with a tiny pencil-scratch sound when turning on.
     - A small Hand font label underneath: "sound off" (`pen` blue) / "sound on" (`graphite`).
     - The choice is saved in `localStorage`.
     - It is a `<button aria-pressed>` with the label "Turn sound on" / "Mute sound".
     - It lives on the paper, so it always uses the paper colours.
   - **Language switcher:** right next to the sound button, to its left, also `absolute` inside the hero (not fixed). Canvas artboards "Hero v2" (EN), "Hero v2 — FR" and "Hero v2 — AR".
     - `EN · FR · ع`: IBM Plex Mono 13px for EN/FR, Lalezar 18px for ع, separated by `·` in graphite.
     - The current language is in `ink`, weight 600, with a hand-drawn `pen`-blue underline. The others are in `graphite`.
     - Each one is a real link (`<a href="/fr" hreflang="fr">`) with `aria-current="true"` on the active one, a 44px tap target, and the nav labelled "Language".
     - In Arabic, the switcher and the sound button move to the **top-left** corner (mirrored).
5. **Rip transition** (storyboard: canvas row "Paper rip", frames 1–4)
   - Scrubbed by scroll, never a one-shot, and fully reversible. The hero pins for about 120vh while the rip plays.
   - Build: render the paper layer **twice**. Clip each copy along the same jagged rip line (left half / right half, `clip-path: polygon`; rip runs from bottom to top around x ≈ 60%). Add a 6–7px white rough stroke along the rip (SVG polyline) for the paper fibers; each half shows its side of it. `transform-origin` sits at the top of the rip line; add a drop-shadow on both halves.
   - Timeline (one GSAP timeline, `scrub: 1`):
     - **0–10% build-up:** the halves lift by −6px, the shadow grows, the "rip it" note and the "rip here?" arrow wiggle.
     - **10–35% tear starts:** the halves rotate −2° / +1.6° around the top of the rip, so a wedge opens from the bottom.
     - **35–65% split:** left half translate(−150px, −40px) rotate(−8°), right half translate(150px, −40px) rotate(6°). "WEBSITES" scales 1.12 → 1.0 and the blue/amber glows brighten.
     - **65–100% fly-off + handoff:** left half translate(−980px, −260px) rotate(−22°), right half translate(980px, −220px) rotate(18°), plus a small flutter (rotation wobble). The **Work wheel cards swing in along their arc** from below-left (staggered 60ms, ease-out), so the wheel is assembled by the time the paper is gone. The progress ring passes the Work dot.
   - Phones / upright tablets: a light 2D rip, not pinned: the tear runs up the rip line (fibres drawn as it goes), then the halves part sideways and drift up. No 3D tilt, no throw physics, no re-assembly. Reduced motion: no rip.

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
- Off by default; turned on with the hand-drawn pencil speaker button in the top-right corner. Start the audio context only after that click (browser autoplay rules). Mute when `document.hidden`. Project videos are always muted.
- One audio sprite (webm + mp3 fallback), under 200 KB, low master volume (~0.35).
- Sounds:
  - `pencil`: also used while the hero's thumbnail sketches draw themselves
  - `rip1` / `rip2` / `rip3`: rip progress 25% / 45% / 65%, **scrolling down only**; volume scales with Lenis velocity (clamp 0.3–1)
  - `rustle`: crossing 25% while scrolling up (the paper re-assembles)
  - `whoosh`: 75%, the halves fly off
  - `pencil`: during the loader, while the pencil draws the portrait (loop, synced to drawing speed)
  - `tick`: clicking the progress ring
  - `click`: each Work-wheel snap to a new card
  - `hum` (optional): very quiet projector loop while sound is on
- Each trigger fires once per crossing (keep a last-direction + last-threshold guard so it doesn't machine-gun).
- Source: the owner's own recordings (real paper tear, tape peel) or CC0 sounds; note the license next to every file in `/public/sounds/CREDITS.md`.
6. **Work: pinned project wheel**
   - The section pins for the length of all the cards.
   - The cards (520×330, radius 14) sit on an arc whose center is off-screen to the left (center ≈ x −260, y 50% of the screen; radius ≈ 1110px). Neighbouring cards are about 17° apart, and each card is rotated by its angle.
   - Scroll rotates the wheel: one card per step, with snapping.
   - The active card (closest to 0°): full brightness, 3px bone outline, `action` red "▶ PLAYING" chip, autoplaying muted looped `<video>` with a thin progress line. The other cards: `brightness(.62)`, video paused. Hovering any card plays its video.
   - Card colors rotate between paper, ink and blue pen (`pen`); red stays reserved for the PLAYING chip. Each card has a browser chrome bar, a big number, the name, "kind · year", and the video.
   - Left panel shows the active project: section label, a big outlined number, the title, one sentence, a details table, a **"Visit site ↗"** pill, and the project list with the active one marked in `pen` blue.
   - Projects: 01 Restaurant site (concept) · 02 Hanabaly (real client: appointment platform for doctors and psychologists) · 03 Booking / WhatsApp engine (concept) · 04 Car rental CRM (concept) · 05 "Your project" (an empty dashed card, the call to action).
   - After card 05 the pin releases and the page scrolls on normally.
   - **Clicking a card (or "Visit site ↗") opens that project's live site in a new tab.** Use `target="_blank" rel="noopener noreferrer"`. The custom cursor over a card reads "Visit ↗". There is no in-site project page. Each project's URL lives in `lib/projects.ts`.
   - A project without a live link yet (e.g. a concept not deployed): the card isn't clickable, and its chip says "Coming soon" instead of "▶ PLAYING".
   - The "Your project" card (05) opens WhatsApp instead.
7. **Mobile + accessibility**
   - Under 768px the wheel becomes a vertical stack of cards, and videos play when in view (IntersectionObserver).
   - `prefers-reduced-motion`: no pinning or rotation, plain scroll; Lenis is off.
   - Videos: `muted playsinline loop preload="metadata"`, with a poster image. Load only the active ±1.

## 03 Services: "Build your brief" (no public prices)
Design: canvas artboard "S5 v2 · Project brief". Paper background. Left column has 4 steps; on the right is a receipt-style **project brief** with a "Send on WhatsApp" pill.

1. **What do you need?** Pills: Website · Web app · CRM · Automation.
2. **Add-ons** (checkboxes, no prices): Extra language · Booking system · WhatsApp automation · Edit it yourself (CMS) · SEO setup · Monthly care.
3. **Your budget:** a currency dropdown + an amount the client types themselves (optional; empty = "Not sure yet"). No suggested ranges.
4. **When do you need it?** ASAP · 1–2 months · No rush.

The receipt and the WhatsApp message update live. Example message:
`Hi! I'd like a website + booking system + extra language. Budget: 15,000 MAD. Timeline: 1–2 months.`
The button opens `https://wa.me/212681679598?text=<encoded message>`.

### Budget: the client types it (owner decision, Nov 2026)
- **No prices anywhere:** no suggested ranges, no "projects start around" line, no exchange rates. Pricing stays private.
- The visitor's country (`x-vercel-ip-country` cookie → timezone → `OTHER`) only picks the **default currency** of the budget field (`lib/pricing.ts`). The dropdown lists the 11 currencies; the choice is kept across language switches.
- Typed amounts are formatted with the locale's grouping and Western digits ("15,000 MAD").
- The receipt footer reads: "I reply with a quote that fits your budget".

## 04 About: dark access card (swipe to flip)
Design: canvas artboard "I4 · Dark access card". This **replaces** the passport and the boarding pass; the process steps now live on the back of the card. Dark site background (blue/amber glow). Label "04 — About & process", heading "Access card.".

**Card:** 760×480 desktop (ratio ≈1.585, like a real ID card), radius 24, centered-left. A big soft shadow sits under the card. It is **not** styled as a bank card: no card numbers, no expiry date, no payment-network logos.

**Front**
- Matte black: `radial-gradient(80% 90% at 20% 10%, #23262B, #0B0C0E)`, plus a very subtle grain.
- Top row: "DEV ACCESS" (Display font) on the left, a contactless icon on the right.
- A gold chip (CSS gradient `#E5C67A → #9C7A35` with contact lines), next to a hologram strip. The hologram's gradient angle and position follow the pointer (desktop) or the device tilt (mobile, if permitted) so it "catches the light".
- Black-and-white photo 150×180 (radius 10), top-right.
- Name in raised lettering: Big Shoulders Display 900, `#D9D6CF`, `text-shadow: 0 1px 0 #ffffff33, 0 -1px 0 #00000088`.
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

## 00 Loader: the ink face draws itself (LD1)
Design: canvas artboard "LD1 · Ink face draws itself".
- Full screen, paper background (same grid, crumple and grain as the hero), nothing else on screen.
- The ink-portrait SVG is drawn **stroke by stroke** with DrawSVG, in a natural order: face outline → ears → hair curls → eyebrows → eyes → nose → moustache → mouth → neck. A faint 12%-opacity "ghost" of the finished face sits underneath as a guide.
- **A very realistic pencil does the drawing:**
  - Asset: either a cut-out photo of a real yellow HB pencil (WebP with alpha, ~700px long, shot by the owner or CC0) or a detailed SVG. The SVG version needs:
    - a hexagonal yellow body with 3 visible facets (light / mid / dark bands)
    - a printed brand line in small dark-green type ("YOUR NAME · HB")
    - a silver ferrule with ridges and a pink eraser
    - a sharpened wood cone with visible grain and shavings edges
    - a dark graphite tip with a tiny highlight
  - Its tip follows the exact point being drawn: `path.getPointAtLength(progress × length)` on the current stroke. It is tilted ~30°, wobbles very slightly (±1.5° noise), and lifts 6–10px between strokes, moving in an arc to the next stroke's start point.
  - A soft contact shadow sits under the tip (blurred ellipse), plus a long soft shadow of the whole pencil on the paper, offset down-right.
  - The `pencil` sound loops while a stroke is being drawn and pauses during lifts. Like all sound, it only plays if the visitor already turned sound on in an earlier visit (saved preference). Never autoplay.
- **Counter:** a big "63%" bottom-left (Big Shoulders Display 900, ~180px, the "%" smaller). Bottom-right, a blue-pen Hand font note that rotates through: "sharpening pencils…" → "drawing your host…" → "almost there".
- **Progress** is real: fonts, hero images, the sound sprite metadata and the first video poster. It lasts at least 1.6s and at most 4s. The drawing speed is mapped to progress, so the face is complete exactly at 100%.
- **Exit (the magic part):** at 100% the pencil lifts and slides off-screen. The drawn face then shrinks and moves (Flip plugin) into the **O of the name in the hero**, and the rest of the hero fades in around it. The loader face *becomes* the hero's O.
- Repeat visits in the same session (`sessionStorage`): a short 0.6s version, with no pencil and the face drawn fast.
- `prefers-reduced-motion`: show the finished face + counter, then fade into the hero.

## 05 Contact: the paper comes back (C1)
Design: canvas artboard "C1 · The paper comes back".
- **Transition in:** the page goes back to the paper background. As a bookend to the hero rip, the two torn paper halves fly back in from the sides and join, with a small overshoot and the `rustle` sound, then a strip of tape lands across the seam.
- Label "05 — Contact" (mono, `pen` blue). A huge **"LET'S TALK"** (Big Shoulders Display 900, ~240px, centered, one line on desktop, 2 lines on mobile).
- Below it, the ink-portrait SVG (~150px), and next to it a blue-pen Hand font note: "the paper is back, say hi".
- Buttons, centered:
  - an `action` red pill **"Message me on WhatsApp"** (WhatsApp icon), opening `wa.me` with the prefilled "Hi! I saw your portfolio and…"
  - an outline pill with the email address (`mailto:`)
- Under the buttons (mono, small): "Usually replies within [X] hours · it's [HH:MM] in Morocco". Compute the time live with `Intl.DateTimeFormat` and `timeZone: 'Africa/Casablanca'`; never hard-code the UTC offset.
- **Footer** (one line, mono 11px, a top border at 25% ink): © 2026 Your Name · Made in Morocco · EN · FR · AR · Instagram · LinkedIn · GitHub · **"Rewind to top ↑"**. Rewind scrolls back to the top with Lenis (~1.6s). The progress ring's arc visibly unwinds, and the paper rip re-assembles as you pass the hero.
- The progress ring reaches 100% here: all dots are `action` red and its icon becomes ↑ (back to top).

## Languages: EN · FR · AR
- **next-intl** with locales `en` (default), `fr`, `ar`. Routes: `/en`, `/fr`, `/ar`; `/` redirects.
- Locale: always `en` by default. `/` goes to the saved `NEXT_LOCALE` cookie (set when the visitor clicks the language switcher), else `/en`. Never use `Accept-Language`, never guess the language from the visitor's country; the country only decides the budget ranges in Services.
- All copy lives in `messages/en.json`, `messages/fr.json`, `messages/ar.json` (provided, with the same keys in all three). Placeholders in `[BRACKETS]` are still to be filled by the owner, in every language.
- Switching language: keep the scroll position (scroll to the same section in the new locale), the sound preference and the currency choice.
- **Fonts per locale:** EN/FR use Big Shoulders Display / Schibsted Grotesk / IBM Plex Mono / the Hand font. AR uses Lalezar / IBM Plex Sans Arabic / Aref Ruqaa (labels stay in IBM Plex Mono when they are Latin, e.g. "2026", "%").
- **Arabic = right to left:** `<html lang="ar" dir="rtl">`. Use logical CSS everywhere (`ms-*`/`me-*`, `ps-*`/`pe-*`, `start-*`/`end-*`, `inset-inline-*`) plus Tailwind `rtl:` variants where needed.
  - **Mirror:**
    - hero controls (top-left)
    - the progress ring (bottom-left)
    - the Work wheel (arc centre off-screen on the **right**, cards rotate the other way, the panel on the right)
    - text alignment, arrows (→ becomes ←)
    - the swipe-to-flip knob (slides right → left)
    - the Services receipt (on the left)
    - the order of the passport-style fields on the card
  - **Don't mirror:** the ink portrait, photos, videos and screenshots, numbers, brand names (Hanabaly, WhatsApp, Next.js), the paper texture, the direction the paper rips.
  - **Hero name in Arabic:** there is no "O" to replace, so the ink portrait sits right before the name, at the same height ("[face] اسمك"). The loader's face still flies into that spot.
  - Use Western digits (0–9) in every language, including prices, % and time.
- WhatsApp prefilled messages come from the messages files, so a French visitor sends a French message.
- SEO: localized `<title>` and description per locale (`meta` in the messages files), `hreflang` alternates for en/fr/ar plus `x-default`, and a localized Open Graph image.

## Rules
- Never invent testimonials, awards or client numbers. Leave placeholders like [YEAR], [STACK], [PRICE] until the owner gives real values.
- No fake review quotes for the concept projects.
- Keep each animation in its own hook or component so it can be tuned without touching the layout.
- Target: Lighthouse performance ≥ 90 on mobile.
