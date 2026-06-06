# Storytelling Hero — "From Companion to Cure" (design spec)

**Date:** 2026-06-07
**Branch:** `feat/cats-dogs-theme`
**Status:** approved, ready for implementation plan
**Supersedes:** the current `HeroSection` (static two-column hero with scattered
floating paws — the visitor called the first screen "猎奇" / gimmicky).

## 1. Goal

Replace the first screen with a **cinematic, scroll-driven (scrollytelling)
hero** that genuinely shows off GSAP, while staying cozy and on-brand. The
visitor scrolls through one **pinned stage** whose four beats are scrubbed off a
**single master timeline**: a resting cat + dog → a push-in to an unseen inner
world → an engineered construct that draws itself in → a healthy "bloom" payoff
that hands off to the rest of the page.

Restraint is the thesis: the wow comes from a few **earned** signature moments
(masked headline reveal, two `DrawSVG` draw-ons, one continuous camera push-in),
NOT a pile of effects. The previous hero failed for being gimmicky; the explicit
anti-patterns in §8 are non-negotiable.

Decisions locked with the visitor:
- **Intensity:** bigger / more cinematic — 4 beats, a longer pin (~2 screen-heights).
- **Assets:** schematic — reuse the existing Phosphor `Cat`/`Dog` duotone icons +
  clean SVG shapes (heartbeat, iris panel, construct stroke). No custom-art
  dependency; custom illustration is a later, drop-in upgrade.
- **Content:** placeholder copy is fine (the team's science is not finalized).
  Keep every scientific claim **generic and honest at the synbio level** and
  isolated to single editable copy lines. No fabricated specific mechanism.

## 2. Narrative & motion (the four beats)

All beat content beyond Beat 0 is **decorative narrative**, not essential
information — the core message lives in Beat 0's headline + subhead + CTA, which
is the only thing the static/reduced-motion/no-JS view shows (§5).

### Beat 0 — Rest (the companion) · on-load, no scroll
- **Scene:** Phosphor `Cat` (app-peach) + `Dog` (app-teal) seated on a low,
  rounded parchment "island" shelf; a thin mint heartbeat/EKG `<path>` resting
  beneath; headline + subhead + the two existing pill CTAs.
- **Entrance (not scrubbed — a normal `useGSAP` timeline):**
  - Headline: `SplitText.create('.js-hero-h1', { type: 'lines', mask: 'lines', aria: 'auto' })`
    then `tl.from(split.lines, { yPercent: 120, stagger: 0.08, duration: 0.7, ease: 'power3.out' })`,
    `clearProps: 'transform'` on complete.
  - Heartbeat: `DrawSVG` `from('.js-hero-ekg', { drawSVG: '0% 0%', duration: 1.1, ease: 'power2.inOut' })`.
  - Subhead + CTA: transform-only rise (opacity stays 1 — above the fold, so the
    prerendered paint already matches the end state; mirrors the existing
    FOUC-safe hero convention).
- **Wow:** alive on first paint — headline lines rise out of an invisible mask in
  cadence while a single mint heartbeat draws itself across the island. No scroll
  required, no scattered paws.

### Beat 1 — Look closer (the unseen) · pin ~0–35 %
- Scene `.js-hero-scene` scales up (`scale: 1 → 1.3`) and drifts slightly (camera
  push-in). A dimming **veil** `.js-hero-veil` fades up (`autoAlpha: 0 → 0.45`) —
  an opacity cross-fade, **never** an animated `filter`. A rounded "inner world"
  panel `.js-hero-panel` irises open via `clipPath: inset(0 50% 0 50% round 28px) → inset(0 0% 0 0% round 28px)`.
- Caption #1 reveals (SplitText words, opacity). Calm line, e.g. *"Health begins
  where you can't see."*

### Beat 2 — The imbalance (the problem) · pin ~35–55 %
- Inside the panel, a **small fixed cluster** `.js-hero-cell` sits dim (muted
  accent). It is revealed by the iris (Beat 1), not by a per-dot stagger.
- Caption #2, e.g. *"Sometimes the smallest things fall out of balance."*

### Beat 3 — Engineer + bloom (intervention + payoff) · pin ~55–100 %
- A single clean engineered-DNA construct stroke `.js-hero-construct`
  (primary-deep teal) draws itself in: `to('.js-hero-construct', { drawSVG: '0% 100%', ease: 'none' })`.
- The cluster brightens **as a group** (single opacity/scale cross-fade to the
  bright palette — no center-out confetti). The veil clears (`autoAlpha → 0`).
- Scene scales back (`scale → 1`), heartbeat steadies, the CTA group settles
  (`from('.js-hero-cta > *', { yPercent: 30, opacity: 0, stagger: 0.06, ease: 'none' })`),
  and the **pin releases exactly as the CTA lands** (CTA tween ends at timeline
  progress 1).
- Caption #3, e.g. *"We engineer biology to help them thrive."*

### Pacing aid
A thin left-edge progress hairline `.js-hero-progress` (`scaleY` via the
ScrollTrigger `onUpdate`, transform-origin top) tracks pin progress so the ~2
screen-heights read as intentional pacing, never "stuck."

## 3. Architecture

- **`HeroSection.tsx`** — owns the markup only: the Beat 0 scene (always
  visible/legible) plus the cinematic layers (veil, panel, cluster, construct,
  captions, progress hairline), which ship **inline-hidden** (`opacity:0;
  visibility:hidden` or `aria-hidden`) so they never paint for no-JS / reduced
  motion. Uses `js-*` sentinel classes (repo convention).
- **`useHeroCinema.ts`** (new hook, `src/features/home/`) — owns ALL the GSAP:
  the Beat 0 entrance timeline AND the pinned scrubbed master timeline. Keeps
  `HeroSection` declarative and the choreography testable/isolated. Takes the
  root ref; called from `HeroSection`.
- **`src/shared/motion/gsap.ts`** — extend `registerGsap()` to also register
  `SplitText` and `DrawSVGPlugin`; re-export them. Still client-only/idempotent.
- **Plugins:** `ScrollTrigger` (already), `SplitText`, `DrawSVGPlugin` — all free
  in GSAP 3.13+ (we run 3.15). `@gsap/react` `useGSAP` (already) keeps everything
  client-only and auto-reverting.

### Master timeline shape (inside `useHeroCinema`, no-preference + fine-pointer branch)
```
const tl = gsap.timeline({
  defaults: { ease: 'none' },
  scrollTrigger: {
    trigger: root, start: 'top top', end: '+=200%',
    pin: true, scrub: 0.5, anticipatePin: 1,
    onUpdate: (self) => gsap.set('.js-hero-progress', { scaleY: self.progress }),
  },
});
// Beat 1 → push-in + veil + iris ; Beat 2 → caption ; Beat 3 → construct draw,
// cluster brighten, veil clear, scale back, CTA settle. Single timeline; only
// CHILDREN of the pinned trigger are animated, never the pinned element itself.
```
The Beat 0 entrance is a **separate, non-scrubbed** `useGSAP` timeline (so it
plays once on mount and is not tied to scroll).

## 4. Plugin registration (gsap.ts)

```ts
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
// registerGsap(): gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText, DrawSVGPlugin)
```
Verify these import paths resolve in the installed `gsap@3.15` package at
implementation time; if `DrawSVGPlugin`/`SplitText` are not in the public
package build, fall back (see §8 fallback note) rather than block the build.

## 5. Fallbacks (each a verified deliverable, not a freebie)

- **SSG prerender / no-JS:** the markup's Beat 0 IS a complete, legible hero
  (headline + subhead carrying the core message + real `<Link>` CTAs + the
  resting scene). The cinematic layers are inline-hidden, so a no-JS visitor sees
  a clean static hero — never an unreadable stacked pile. **No `.pin-spacer` is
  in the prerendered HTML** (GSAP runs only post-hydration), so no FOUC/CLS on
  first paint.
- **`prefers-reduced-motion: reduce`:** the no-preference branch never runs → no
  pin, no scrub, no SplitText split, no draw-on. The static Beat 0 hero stays as
  the prerendered markup at full opacity. Identical to the no-JS view.
- **Mobile / `(pointer: coarse)`:** `gsap.matchMedia` swaps the pin for plain
  non-pinned scroll-reveals (each beat `ScrollTrigger { start: 'top 75%', once: true }`),
  to dodge mobile address-bar resize jank and touch-momentum vs scrub conflicts.
- **Refresh:** call `ScrollTrigger.refresh()` after `document.fonts.ready` and
  after the SplitText split so pin start/end are measured against the hydrated,
  font-loaded layout.

## 6. Performance

Transforms / opacity / clip-path / drawSVG only — compositor-safe, 60 fps floor
on low-end phones. NO animated `filter`, width/height/top/left, box-shadow.
`ease: 'none'` on every scrubbed tween (1:1 scroll mapping). One ScrollTrigger
for the pin (no batch storm). `will-change` promoted only during active tweens
and cleared after (repo convention). Animate only the pinned element's children.

## 7. Accessibility

A pinned scrub is scroll-coupling, mitigated by: the reduced-motion no-pin branch
(§5) and a bounded pin (~2 vh, not endless). SplitText uses `aria` so assistive
tech reads the original headline string, not per-line spans. CTAs stay real
`<Link>` elements in DOM flow (the pin never `display:none`s them) and reachable
by Tab/Enter. Verify keyboard traversal end-to-end: tabbing to a CTA inside the
pin must not strand the user mid-beat (test; if it does, the CTA focus path may
need the pin to settle to a beat). No scroll-hijacking, no smooth-scroll library.

## 8. Explicit anti-patterns (the 猎奇 / over-engineering traps — do NOT add)

- No Cat↔Dog (or any) MorphSVG species-swap — the single most gimmicky move.
- No `filter: saturate/blur` animation — replaced by the opacity dimming veil.
- No per-dot "confetti" stagger (center-out brighten) — the cluster brightens as
  one group; this is the exact effect the visitor already rejected.
- No canvas image-sequence / flipbook, no WebGL/3D (3D stays in MoleculeSection).
- No ScrollSmoother / Lenis / momentum-scroll (keyboard + SR hazard).
- No second pin anywhere on the page; pin ≤ ~+=200 %.
- No scattered floating paws / idle character wobble (the old gimmick).
- No reduced-motion fallback that blanks essential content.
- No `DrawSVG` use that doesn't earn a beat — exactly two (heartbeat, construct).
- **Plugin-availability fallback:** if `SplitText` or `DrawSVGPlugin` are not
  importable from the installed package, degrade gracefully — approximate the
  headline mask with a CSS `overflow:clip` line wrapper, and the heartbeat/
  construct draw with a `clip-path` / `scaleX` wipe. Never block the build on a
  plugin import.

## 9. Verification gates

`bun run check-all` (validate:pages, type-check, audit:theme, lint:check,
format:check) + `bun run build` must stay green. Static-output checks:
- `dist/index.html` Beat 0 content (headline, subhead, CTA) present and visible.
- NO `.pin-spacer` and NO inline `opacity:0` on Beat 0 content in the prerender.
- Cinematic layers present but inline-hidden.
Manual (visitor): cinematic feel on desktop; reduced-motion = clean static hero;
mobile scroll-reveals; keyboard traversal of the pinned CTA.

## 10. Coordination notes

- Coexists with the existing GSAP layers: navbar scroll-progress bar + route
  curtain (`PageTransition`) + the section reveals below the hero. The route
  curtain covers the hero on navigation to home; the Beat 0 entrance plays after
  it lifts; the pin engages on scroll. `useGSAP` reverts the hero pin on
  navigation away. The navbar already calls `ScrollTrigger.refresh()` on route
  change.
- The `useHomeScrollProgress` hook and the existing hero float/entrance code are
  superseded for the hero; remove what the rewrite replaces (no dead code).
- All editable copy lines (headline, subhead, 3 captions) are placeholders to be
  replaced when the team's science is finalized; keep them generic + honest.
