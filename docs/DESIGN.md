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
  grid. Orange is a NEW token, so it never collides with the two-teal rule.

## Page rhythm (homepage)

Golden-hour room hero → mint `primary-soft` band → cream `page` → drenched
sunset band → brown scalloped footer. Adjacent sections interlock via
`SectionDivider` (wave/scallop SVG, fill = NEXT section's bg token, fixed
h-10/h-14 so no CLS). (A warm `room-wall` molecule-viewer beat sat between the
cream and sunset bands until 2026-06-18, when the homepage molecule display was
removed; the `room-*` scene tokens remain for content use.)

**HEAL overlay (homepage, §20):** the homepage adopts a hand-drawn lab-notebook
register over that colour rhythm. Every section pairs its bg token with
`.heal-grid` (a faint blue-grey graph-paper grid, `multiply` blend, so it layers
onto any tint and keeps the rhythm). `.heal-grid` sets ONLY the grid image —
always pair it with a `bg-*` utility on the same element.

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

- Inline SVG only (iGEM forbids binary media). Warm outlines (`#7a5230` cat,
  `#27695a` dog), round chibi shapes, big readable faces.
- Scenes are EDGELESS on content surfaces: transparent SVG over CSS-painted
  architecture, gradients fade to transparent. EXCEPTION (homepage HEAL): the
  hero room scene sits inside a `.heal-frame` panel (a pasted-in illustration on
  the notebook) with its own internal floor band.
- Mascot cameos: `Peekers.tsx` (PeekingCat, PawCorner), `SunsetDuo.tsx`
  (back-view duo), `StepSpots.tsx` (step illustrations).

## Motion (GSAP, see `src/shared/motion/gsap.ts`)

- ALL motion inside `gsap.matchMedia("(prefers-reduced-motion: no-preference)")`
  with `mm.revert()` cleanup; `js-*` class sentinels are the targets.
- Above-the-fold entrances are transform-only (prerendered HTML paints
  visible; no opacity flash). Below-fold reveals may fade, but the hidden
  state is set client-side only (never in markup/CSS).
- GSAP owns transforms on animated nodes (no Tailwind transforms there);
  static art may use Tailwind transforms.
- Idle life: head bob, tail sway (bbox-percentage transformOrigin, never
  svgOrigin in nested scaled groups), blink (`js-*-eye` scaleY), pupil
  cursor-tracking (`js-*-pupil` x/y via quickTo, `(pointer: fine)` only).
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
- Icons: Phosphor, named imports only (audit-enforced), duotone default.
- No emoji anywhere (audit-enforced). PawPrint replaces arrow glyphs.
