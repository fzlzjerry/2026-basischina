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

## Page rhythm (homepage)

Golden-hour room hero → mint `primary-soft` band → cream `page` → warm cream
`surface` → drenched sunset band → brown scalloped footer. Adjacent sections
interlock via `SectionDivider` (wave/scallop SVG, fill = NEXT section's bg
token, fixed h-10/h-14 so no CLS).

## Typography

- `--font-display`: Nunito first (activates when woff2 uploaded to
  static.igem.wiki), then ui-rounded / SF Pro Rounded / Hiragino Maru Gothic /
  Yuanti SC. Windows degrades to default sans.
- Homepage headers: big left-aligned display (`HomeSectionHeader`), weight 900,
  `clamp()` scales. NO eyebrow labels except the hero's single one; NO ribbon
  on the homepage (ribbon `Title` stays for content pages).
- Hero h1 `clamp(2.55rem → 5.25rem)`.

## Illustration register

- Inline SVG only (iGEM forbids binary media). Warm outlines (`#7a5230` cat,
  `#27695a` dog), round chibi shapes, big readable faces.
- Scenes are EDGELESS: transparent SVG backgrounds over CSS-painted
  architecture (hero floor bands), gradients fade to transparent. No framed
  boxes around scenes.
- Mascot cameos: `Peekers.tsx` (PeekingCat, PawCorner, PeekingDog),
  `SunsetDuo.tsx` (back-view duo), `StepSpots.tsx` (step illustrations).

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

- Buttons: pill, 3D press rail (`shadow-btn-3d*`), primary deep teal.
- Icons: Phosphor, named imports only (audit-enforced), duotone default.
- No emoji anywhere (audit-enforced). PawPrint replaces arrow glyphs.
