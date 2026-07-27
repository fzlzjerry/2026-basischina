# DESIGN.md — BASIS-China iGEM 2026 Wiki

Tokens live in `src/styles/main.css` (`@theme`); `scripts/audit-theme.ts` enforces
the rules below in `check-all`.

## Color

- Surfaces: page `#f8f8f0`, surface `#f7f3df`, surface-2 `#f9f7f0`.
- Ink: `#794f27` (headings), ink-soft `#725d42` (body).
- **Two-teal rule (audit-enforced):** bright `--color-primary #19c8b9` is
  DECORATION ONLY (trail dots, collar button, divider accents); the literal hex
  may not appear outside its token line, and bare `text-primary` is banned.
  ALL text/buttons/links use `--color-primary-deep #0d6f63`.
- Category accents (`app-teal/blue/purple/green/peach/pink`) come in three
  strengths: base (chips/borders), `-ink` (text on base), `-soft` (solid pastel
  tile fills, ink text ≥7:1).
- Scene tokens: room (`room-wall/floor/floor-deep/frame`) and sunset
  (`sunset-sky`, `sunset` — both text-safe with ink; `sunset-deep` decoration
  ONLY, fails AA under body text).
- Footer drenched brown `#794f27` with cream text.
- **HEAL register accent (homepage):** `--color-app-orange #f0a868` (sticker
  fill), `-soft` (hover tint), `-ink #9c5a1f` (orange-as-text, AA on cream).
  `--color-sticker-ink #2f2417` is the bold cutout outline + label colour
  (≥7:1 on cream and on orange). `--color-grid-line #aebfcb` is the notebook
  grid; `--color-grid-line-major #a5b7c4` is the heavier printed rule every 5
  cells. Orange is a NEW token, so it never collides with the two-teal rule.

## Page rhythm (homepage)

Cream notebook hero (the washi-taped HEAL banner) → mint `primary-soft` band →
cream `page` → drenched sunset band → brown scalloped footer. Adjacent sections interlock via
`SectionDivider` (SVG edge, fill = NEXT section's bg token, fixed h-10/h-14 so
no CLS) — EXCEPT the mint→cream seam, which is a flush straight edge
(user-requested 2026-07-02: the ungridded cream wave read as a foreign blank
strip there). Since 2026-07-02 both divider paths are HAND-CUT: baked, seeded
meanders (varied segment lengths, jittered amplitude, no repeating period), so
each section reads as a strip of coloured paper cut with scissors — never a
smooth wave or a perfect scallop repeat. (A warm `room-wall` molecule-viewer
beat sat between the cream and sunset bands until 2026-06-18, when the homepage
molecule display was removed; the `room-*` scene tokens remain for content use.)

**HEAL overlay (homepage, §20):** the homepage adopts a hand-drawn lab-notebook
register over that colour rhythm. Every section pairs its bg token with
`.heal-grid` (a faint blue-grey graph-paper grid + a heavier major rule every 5
cells + a whisper of warm paper grain at ~3% alpha, all `multiply` blend, so it
layers onto any tint and keeps the rhythm). `.heal-grid` sets ONLY the
background images — always pair it with a `bg-*` utility on the same element.

## Typography

- `--font-display`: Nunito first — self-hosted woff2 (latin + latin-ext,
  weights 400/500/600/700/900, ~26KB each) live in `src/assets/fonts/` and are
  bundled by Vite. Fallbacks: ui-rounded / SF Pro Rounded / Hiragino Maru
  Gothic / Yuanti SC. "Noto Sans SC" stays name-only (system CJK covers stray
  Chinese; full CJK woff2 are multi-MB, do not self-host them).
- **HEAL hand-lettered faces (display + page chrome only).** `--font-script`:
  Caveat (flowing script) — the wordmark + hero h1 + every `HomeSectionHeader`
  h2 + closing h2, AND every content-page title (MarkdownArticle h1, TeamPage
  h1/h2, the 404 "404" + heading). `--font-hand`: Gochi Hand (marker print) —
  nav sticker pills, sticker CTAs, step titles, badges, the article category
  chip, TOC toggle, team member names, 404 suggestion pills. Self-hosted woff2
  (latin + latin-ext) extracted from the HEAL reference bundle (OFL),
  `font-display: swap`. Both are LATIN-ONLY: they fall back through the Nunito
  stack so CJK and body copy stay on `--font-body`. All page titles in the
  registry are English, so Caveat renders them; member names fall back per-glyph
  for any CJK. NO eyebrow labels except the hero's single one; NO ribbon
  (`Title` / `ac-ribbon` is retired from shipped pages but kept available). The
  Markdown PROSE body never adopts the hand faces: it stays on the readable
  `markdown.css` register (Nunito/system) so dense technical copy stays legible.
- Hero h1 `font-script clamp(3rem → 5.75rem)`; section h2 `font-script
  clamp(2.6rem → 4.25rem)`. Script headings need `pb-1` + `leading-[1.04]` for
  descender clearance.

## Illustration register

- Concrete homepage illustrations are GPT Image redraws committed as local,
  transparent WebP assets in `src/assets/brand/illustrations/`. Their visual
  reference is `heal-banner.webp`: colored-pencil and wax-crayon fill, dry
  charcoal texture, irregular doubled outlines, and visible hand pressure.
  Functional strokes that must scale or draw in (section dividers, arrows,
  swashes, paw trails) stay inline SVG.
- Project, Wet Lab, Dry Lab, Engagement, and Team share a native 2:1 cover
  series in `public/assets/`: the peach cat and teal dog interact with each
  category's real tools on layered graph paper. The artwork reserves a quiet
  left zone; `CategoryCover` supplies the live category label and real page h1
  so wording stays exact, accessible, reusable across routes, and collision-free
  on mobile.
- Scenes are EDGELESS on content surfaces: transparent raster art over
  CSS-painted architecture and gradients. (The old hero room scene and its
  `HeroRoom`/`Mascots` components were deleted 2026-07-02; the homepage hero is
  the washi-taped HEAL banner image on the notebook page.)
- Mascot cameos: `Peekers.tsx` (PeekingCat, PawCorner), `SunsetDuo.tsx`
  (back-view duo), `StepSpots.tsx` (step illustrations), and `HeroDoodles.tsx`
  (flask/paw margin vignette).

## Motion (GSAP, see `src/shared/motion/gsap.ts`)

- **Content never translates (audit rule g).** No `x`/`y`/`xPercent`/`yPercent`
  on any content node in entrances or reveals — displacement entrances were
  user-rejected twice as gimmicky ("突然往上拱一下"). Content either paints in
  place or fades in place. Mascot idle loops and the scroll-progress scrub are
  life, not entrances, and are exempt.
- **First load animates the annotation layer only.** Navbar, banner, tagline,
  and CTAs paint static from the very first frame and are never animation
  targets. Only the hero's aria-hidden decorations (`.heal-paste-in`: washi
  tape, handwritten note, arrow) paste in (~0.9s: autoAlpha + sub-100% scale
  press + DrawSVG stroke).
- **Markup-baked hidden states** are allowed ONLY for aria-hidden decoration,
  ONLY via the `html.js .heal-paste-in` rule wrapped in
  `@media (prefers-reduced-motion: no-preference)` (the `js` class comes from
  the inline bootstrap in `index.html`), so no-JS and reduced-motion visitors
  get the complete page at first paint. NEVER `clearProps` opacity/visibility
  on those nodes — the CSS hide would re-apply.
- **Below-fold reveals are opacity-only fades (`scrollFadeIn`) or hand-drawn
  strokes (`drawIn`)**, both `once: true` with shared timings from `MOTION`;
  both skip entirely when the section already intersects the viewport at init
  (`inViewAtInit`) — a refresh never hides or moves anything on screen.
- ALL motion inside `gsap.matchMedia("(prefers-reduced-motion: no-preference)")`
  with `mm.revert()` cleanup; `js-*` class sentinels are the targets.
- **No overshoot eases, ever (user-rejected 2026-07-02 as gimmicky).** No
  `back.*`, `elastic.*`, `bounce.*`; power family only. Buttons/tiles/badges
  never animate `scale` at all; decorative scale-ins (tape press, paw stamps)
  may grow toward 100% but never past it.
- GSAP owns transforms on animated nodes (no Tailwind transforms there);
  static art may use Tailwind transforms. Sticker tweens that touch transform
  end with `clearProps:"transform"` (restores the `--rot` tilt + hover lift);
  SVG groups placed via the transform ATTRIBUTE never use clearProps (it wipes
  the attribute and collapses the art).
- Idle life: the nap-cat breathes and the peeking cat bobs. The generated
  raster artwork remains otherwise intact; each loop is paused off-screen via
  a ScrollTrigger visibility toggle.
- NO scroll pinning/hijack.

## Components

- Buttons (content pages): pill, 3D press rail (`shadow-btn-3d*`), primary deep
  teal (`Button.tsx`).
- **HEAL sticker family.** `.heal-sticker`: 2.5px `--color-sticker-ink` outline +
  hard offset `--shadow-sticker` (no blur) + per-element wonky radius and tilt
  via `--rot`, WITH hover-lift / press feedback (interactive: nav pills, CTAs,
  tiles, 404 suggestion pills). `.heal-cutout`: the same outline + shadow + tilt
  but NO hover/press, for static reading surfaces and labels (the article prose
  page, the TOC aside, the category chip, team roster cards, empty states) so
  they do not imply a false click affordance. `.heal-frame`: solid outline +
  dashed inner matte. `.heal-grid`: the notebook grid; content pages wrap their
  whole area in `min-h-screen bg-page heal-grid` so short pages show no grid
  seam. Helpers (tilt/radius cycling, `ctaClasses`, `stickerStyle`,
  `stickerStyleRaw`) live in `src/shared/styles/heal.ts`. Resting tilt + hover
  lift on GSAP-animated stickers require `clearProps:"transform"` so the inline
  tween transform does not pin them.
- **Hand-ruled lines (no machine rules in HEAL chrome).** `.heal-rule` (solid
  wobbly stroke) and `.heal-rule-dash` (drifting baseline, irregular dashes)
  are alpha MASKS — pair with a `bg-*` utility + a height (e.g.
  `heal-rule-dash h-2 bg-sticker-ink/40` under page headers,
  `heal-rule h-2 bg-footer-divider` in the footer). Markdown prose keeps its
  own self-contained versions: the h2 underline and `hr` are wobbly data-URI
  strokes in `markdown.css`, and blockquotes wear a full soft ink outline with
  wonky corners (never a side-stripe rail).
- **Washi tape (`WashiTape.tsx` + `.heal-tape`).** Translucent striped strip
  with torn short edges (clip-path); tint from `bg-app-orange/55` or
  `bg-app-teal/55`. Recurs so the paste-up conceit stays a system: hero
  banner, team roster cards (alternating tone/tilt), the TOC aside. Always
  aria-hidden; the caller positions it straddling a cutout's top edge.
- **Marker swash.** `HomeSectionHeader` underlines its Caveat headline with a
  hand-drawn orange stroke (`js-swash`); section timelines draw it in with
  DrawSVG on reveal, and reduced-motion/no-JS get the complete stroke.
- Footer column headers are Gochi Hand (normal case), never uppercase tracked
  labels.
- Icons: Phosphor, named imports only (audit-enforced), duotone default.
- No emoji anywhere (audit-enforced). PawPrint replaces arrow glyphs.
