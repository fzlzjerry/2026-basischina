# Storytelling Hero Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the static hero with a cinematic, scroll-driven (pinned + scrubbed) GSAP scrollytelling first screen — "From Companion to Cure" — with verified static / reduced-motion / no-JS / mobile fallbacks.

**Architecture:** `HeroSection` owns markup only (a legible Beat 0 scene that prerenders, plus inline-hidden cinematic layers). A new `useHeroCinema` hook owns ALL GSAP: the on-load Beat 0 entrance timeline and the pinned, scrubbed master timeline (Beats 1–3). Plugins (`SplitText`, `DrawSVGPlugin`) register in the shared client-only `gsap.ts`.

**Tech Stack:** React 18, vite-react-ssg, GSAP 3.15 (`ScrollTrigger`, `SplitText`, `DrawSVGPlugin`), `@gsap/react` `useGSAP`, Tailwind v4, Phosphor icons.

**Verification model:** this repo has NO unit-test runner. Each task is verified by the gate suite (`bun run type-check`, `bun run audit:theme`, `bun run lint:check`, `bun run build`) plus static-output greps on `dist/`. Spec: `docs/superpowers/specs/2026-06-07-storytelling-hero-design.md`.

**Reference (verified at plan time):** `gsap/SplitText` and `gsap/DrawSVGPlugin` resolve in the installed `gsap@3.15.0`.

---

### Task 1: Register SplitText + DrawSVG in the shared GSAP module

**Files:**
- Modify: `src/shared/motion/gsap.ts`

- [ ] **Step 1: Add the imports + registration + re-exports**

Replace the file body with:

```ts
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { useGSAP } from "@gsap/react";

let registered = false;

/**
 * Register GSAP plugins exactly once, on the client only. Call at the top of any
 * `useGSAP` callback (which runs inside a layout effect, so never during the
 * vite-react-ssg prerender). Importing this module is SSR-safe — registration
 * is what touches the DOM, so it must stay inside client lifecycle.
 */
export function registerGsap(): void {
  if (registered || typeof window === "undefined") return;
  registered = true;
  gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText, DrawSVGPlugin);
}

export { gsap, ScrollTrigger, SplitText, DrawSVGPlugin, useGSAP };
```

- [ ] **Step 2: Verify gates**

Run: `bun run type-check && bun run build 2>&1 | tail -3`
Expected: type-check clean; build finishes ("Build finished."). This proves the new plugin imports resolve and stay SSR-safe (no DOM touch during prerender).

- [ ] **Step 3: Commit**

```bash
git add src/shared/motion/gsap.ts
git commit -m "feat: register SplitText + DrawSVG in the shared gsap module"
```

---

### Task 2: Rewrite `HeroSection` markup (Beat 0 + inline-hidden cinematic layers)

No GSAP yet — this task produces a legible static hero that prerenders correctly.

**Files:**
- Modify: `src/features/home/sections/HeroSection.tsx` (full rewrite)

- [ ] **Step 1: Replace the file**

```tsx
import { useRef } from "react";
import { Link } from "react-router-dom";
import { Cat, Dog, PawPrint, UsersThree } from "@phosphor-icons/react";
import { wikiEnv } from "@/config/env";
import { Icon } from "@/shared/components/Icon";
import { buttonClasses } from "@/shared/components/Button";
import { useHeroCinema } from "../useHeroCinema";

/**
 * Homepage hero (§20) — cinematic scrollytelling "From Companion to Cure".
 * This component is markup only: Beat 0 (the legible resting scene + headline +
 * subhead + CTA) is what prerenders and what no-JS / reduced-motion visitors
 * see. The cinematic layers (veil, inner-world panel, captions, progress rail)
 * ship inline-hidden and are activated client-side by `useHeroCinema`.
 */
export function HeroSection() {
  const root = useRef<HTMLElement>(null);
  useHeroCinema(root);

  return (
    <section
      ref={root}
      className="js-hero relative flex min-h-[88vh] items-center overflow-hidden bg-gradient-to-b from-page to-surface"
    >
      {/* Left-edge pin-progress hairline (idle hidden; scaled by scroll). */}
      <span
        aria-hidden="true"
        className="js-hero-progress pointer-events-none absolute left-0 top-0 hidden h-full w-1 origin-top bg-primary/60 lg:block"
        style={{ transform: "scaleY(0)" }}
      />

      {/* Dimming veil over the scene (opacity cross-fade, never a filter). */}
      <div
        aria-hidden="true"
        className="js-hero-veil pointer-events-none absolute inset-0 bg-ink/40"
        style={{ opacity: 0, visibility: "hidden" }}
      />

      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8">
        {/* Text column (z-10 so it stays legible above the veil). */}
        <div className="relative z-10 text-center lg:text-left">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary-deep">
            iGEM {wikiEnv.teamYear}
          </p>
          <h1 className="js-hero-h1 mt-4 text-4xl font-black leading-tight tracking-tight text-ink sm:text-6xl">
            {wikiEnv.teamName}
          </h1>
          <p className="js-hero-sub mx-auto mt-6 max-w-xl text-lg text-ink-soft lg:mx-0">
            Engineering biology for healthier companions.
          </p>

          {/* Scrolly captions: stacked, inline-hidden, cross-faded by beat. */}
          <div className="relative mt-6 h-7" aria-hidden="true">
            <p
              className="js-hero-caption js-hero-caption-1 absolute inset-x-0 text-base font-semibold text-primary-deep"
              style={{ opacity: 0, visibility: "hidden" }}
            >
              Health begins where you can&rsquo;t see.
            </p>
            <p
              className="js-hero-caption js-hero-caption-2 absolute inset-x-0 text-base font-semibold text-primary-deep"
              style={{ opacity: 0, visibility: "hidden" }}
            >
              Sometimes the smallest things fall out of balance.
            </p>
            <p
              className="js-hero-caption js-hero-caption-3 absolute inset-x-0 text-base font-semibold text-primary-deep"
              style={{ opacity: 0, visibility: "hidden" }}
            >
              We engineer biology to help them thrive.
            </p>
          </div>

          <div className="js-hero-cta mt-10 flex flex-wrap justify-center gap-4 lg:justify-start">
            <Link
              to="/description"
              className={buttonClasses("primary", "lg", "group")}
            >
              <Icon as={PawPrint} weight="fill" />
              <span>Explore the project</span>
            </Link>
            <Link to="/team" className={buttonClasses("secondary", "lg")}>
              <Icon as={UsersThree} />
              <span>Meet the team</span>
            </Link>
          </div>
        </div>

        {/* Scene column: cat + dog + island + heartbeat, with the inner-world panel. */}
        <div
          className="relative flex items-center justify-center"
          aria-hidden="true"
        >
          <div className="js-hero-scene relative flex items-end justify-center gap-2">
            <Icon as={Cat} weight="duotone" className="h-40 w-40 text-app-peach" />
            <Icon as={Dog} weight="duotone" className="h-44 w-44 text-app-teal" />

            {/* island shelf */}
            <div className="absolute -bottom-4 h-6 w-72 rounded-pill bg-surface-2 shadow-soft" />

            {/* resting heartbeat line (drawn on in Beat 0) */}
            <svg
              className="absolute -bottom-12 h-10 w-72"
              viewBox="0 0 240 40"
              fill="none"
            >
              <path
                className="js-hero-ekg"
                d="M0 20 H60 l8 -14 l10 28 l8 -14 H140 l8 -10 l8 20 l8 -10 H240"
                stroke="var(--color-primary)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            {/* inner-world panel (irises open during the pin) */}
            <div
              className="js-hero-panel absolute inset-0 flex items-center justify-center rounded-card border-2 border-border bg-surface"
              style={{
                clipPath: "inset(0 50% 0 50% round 28px)",
                visibility: "hidden",
              }}
            >
              <svg viewBox="0 0 200 200" className="h-full w-full p-6" fill="none">
                <g className="js-hero-cell" style={{ opacity: 0.35 }}>
                  <circle cx="70" cy="80" r="7" fill="var(--color-app-green)" />
                  <circle cx="112" cy="70" r="6" fill="var(--color-app-blue)" />
                  <circle cx="132" cy="112" r="8" fill="var(--color-app-teal)" />
                  <circle cx="84" cy="122" r="6" fill="var(--color-app-purple)" />
                  <circle cx="104" cy="100" r="5" fill="var(--color-app-green)" />
                </g>
                <path
                  className="js-hero-construct"
                  d="M30 150 C 60 90, 140 90, 170 150"
                  stroke="var(--color-primary-deep)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Create a temporary no-op hook so this compiles**

Create `src/features/home/useHeroCinema.ts` with a stub (replaced in Task 3):

```ts
import type { RefObject } from "react";

// Stub — real implementation in Task 3.
export function useHeroCinema(_root: RefObject<HTMLElement>): void {}
```

- [ ] **Step 3: Verify gates + static output**

Run:
```bash
bun run type-check && bun run audit:theme && bun run lint:check
bun run build 2>&1 | tail -2
grep -o 'Engineering biology for healthier companions' dist/index.html | head -1
grep -oc 'pin-spacer' dist/index.html
grep -o 'js-hero-panel[^"]*" style="[^"]*"' dist/index.html | head -1
```
Expected: gates clean; build finished; subhead present; `pin-spacer` count `0`; panel ships with inline `clip-path … ; visibility:hidden`. (Confirms Beat 0 legible, cinematic layers hidden, no pin-spacer in prerender.)

- [ ] **Step 4: Commit**

```bash
git add src/features/home/sections/HeroSection.tsx src/features/home/useHeroCinema.ts
git commit -m "feat: rewrite hero markup for cinematic scrollytelling (Beat 0 + hidden layers)"
```

---

### Task 3: `useHeroCinema` — Beat 0 entrance (on-load, not scrubbed)

**Files:**
- Modify: `src/features/home/useHeroCinema.ts`

- [ ] **Step 1: Replace the stub with the entrance**

```ts
import type { RefObject } from "react";
import {
  gsap,
  ScrollTrigger,
  SplitText,
  registerGsap,
  useGSAP,
} from "@/shared/motion/gsap";

/**
 * All hero GSAP lives here so `HeroSection` stays declarative. Two motion
 * branches (gated by `gsap.matchMedia`): a desktop pinned/scrubbed cinema
 * (Task 4) and a touch scroll-reveal (Task 5). Reduced-motion adds NOTHING —
 * the inline-hidden cinematic layers stay hidden and Beat 0 shows as prerendered.
 */
export function useHeroCinema(root: RefObject<HTMLElement>): void {
  useGSAP(
    () => {
      registerGsap();
      const el = root.current;
      if (!el) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference) and (pointer: fine)", () => {
        const split = SplitText.create(".js-hero-h1", {
          type: "lines",
          mask: "lines",
          aria: "auto",
        });

        const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
        intro
          .from(split.lines, {
            yPercent: 120,
            stagger: 0.08,
            duration: 0.7,
            clearProps: "transform",
          })
          .from(
            ".js-hero-ekg",
            { drawSVG: "0% 0%", duration: 1.1, ease: "power2.inOut" },
            "-=0.4",
          )
          .from(
            ".js-hero-sub",
            { y: 16, opacity: 0, duration: 0.6, clearProps: "all" },
            "-=0.7",
          );

        if (document.fonts?.ready) {
          document.fonts.ready.then(() => ScrollTrigger.refresh());
        }

        return () => {
          split.revert();
        };
      });

      return () => mm.revert();
    },
    { scope: root },
  );
}
```

- [ ] **Step 2: Verify gates + static output unchanged**

Run:
```bash
bun run type-check && bun run audit:theme && bun run lint:check
bun run build 2>&1 | tail -2
grep -oc 'pin-spacer' dist/index.html
```
Expected: gates clean; build finished; `pin-spacer` still `0` (entrance is client-only, no pin yet).

- [ ] **Step 3: Browser check (dev)**

Run dev (`bun run dev`), load `/`. Expected: headline lines rise out of a mask, the mint heartbeat draws itself in, subhead fades up. No layout jump. (If SplitText line-mask shows a clipping artifact, confirm the h1 has `leading-tight` and no `overflow-visible` override.)

- [ ] **Step 4: Commit**

```bash
git add src/features/home/useHeroCinema.ts
git commit -m "feat: hero Beat 0 entrance (SplitText line-mask headline + DrawSVG heartbeat)"
```

---

### Task 4: `useHeroCinema` — the pinned, scrubbed master timeline (Beats 1–3)

**Files:**
- Modify: `src/features/home/useHeroCinema.ts`

- [ ] **Step 1: Add the pinned master timeline inside the existing fine-pointer branch**

Inside the `"(prefers-reduced-motion: no-preference) and (pointer: fine)"` callback, AFTER the `intro` timeline and BEFORE the `document.fonts` line, insert:

```ts
        const progress = el.querySelector<HTMLElement>(".js-hero-progress");

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: el,
            start: "top top",
            end: "+=200%",
            pin: true,
            scrub: 0.5,
            anticipatePin: 1,
            onUpdate: (self) => {
              if (progress) gsap.set(progress, { scaleY: self.progress });
            },
          },
        });

        tl
          // Beat 1 — look closer: push in + dim + iris open + caption 1
          .to(".js-hero-scene", { scale: 1.3, duration: 1 })
          .to(".js-hero-veil", { autoAlpha: 0.45, duration: 1 }, "<")
          .set(".js-hero-panel", { visibility: "visible" }, "<")
          .fromTo(
            ".js-hero-panel",
            { clipPath: "inset(0 50% 0 50% round 28px)" },
            { clipPath: "inset(0 0% 0 0% round 28px)", duration: 1, immediateRender: false },
            "<",
          )
          .to(".js-hero-caption-1", { autoAlpha: 1, duration: 0.5 }, "<0.3")
          // Beat 2 — the imbalance: caption 1 out, caption 2 in
          .to(".js-hero-caption-1", { autoAlpha: 0, duration: 0.3 }, ">0.4")
          .to(".js-hero-caption-2", { autoAlpha: 1, duration: 0.5 }, "<")
          // Beat 3 — engineer + bloom
          .to(".js-hero-caption-2", { autoAlpha: 0, duration: 0.3 }, ">0.4")
          .fromTo(
            ".js-hero-construct",
            { drawSVG: "0%" },
            { drawSVG: "100%", duration: 1, immediateRender: false },
            "<",
          )
          .to(".js-hero-cell", { opacity: 1, duration: 0.6 }, "<0.2")
          .to(".js-hero-veil", { autoAlpha: 0, duration: 0.8 }, "<")
          .to(".js-hero-scene", { scale: 1, duration: 0.8 }, "<")
          .to(".js-hero-caption-3", { autoAlpha: 1, duration: 0.5 }, "<0.2");
```

Note: the CTA is deliberately NOT animated by the scrubbed timeline — it must stay visible in Beat 0 (animating it `from` opacity 0 would hide it at scroll 0 via immediateRender). The veil sits below the text column's `z-10`, so captions + CTA stay legible while the scene dims.

- [ ] **Step 2: Verify gates + static output**

Run:
```bash
bun run type-check && bun run audit:theme && bun run lint:check
bun run build 2>&1 | tail -2
grep -oc 'pin-spacer' dist/index.html
```
Expected: gates clean; build finished; `pin-spacer` still `0` (pin is created only client-side post-hydration).

- [ ] **Step 3: Browser tuning (dev) — REQUIRED, this cannot be perfected blind**

Run dev, load `/`, scroll slowly through the hero. Verify and tune:
- The scene pushes in, the veil dims the scene (NOT the text/CTA), the panel irises open from center.
- Captions cross-fade in sequence (1 → 2 → 3), each readable, no overlap flash.
- The construct draws in; the cluster brightens as one group (no per-dot stagger).
- The pin releases cleanly into the Highlights section; the left rail tracks progress.
- Tune `end: '+=200%'`, `scrub`, the `scale` amount, and the `"<0.3"` / `">0.4"` offsets until pacing feels cinematic but not "stuck." Scrub both directions — motion must be symmetric.
- Confirm no console errors and 60fps (DevTools Performance: Composite >> Paint).

- [ ] **Step 4: Commit**

```bash
git add src/features/home/useHeroCinema.ts
git commit -m "feat: hero pinned scrubbed master timeline (push-in, iris, construct, bloom)"
```

---

### Task 5: Touch branch (`pointer: coarse`) + cleanup of superseded code

**Files:**
- Modify: `src/features/home/useHeroCinema.ts`
- Modify: `src/features/home/HomePage.tsx` (only if it imported removed code)
- Delete (if now unused): `src/features/home/useHomeScrollProgress.ts`

- [ ] **Step 1: Add the coarse-pointer branch**

In `useHeroCinema`, after the fine-pointer `mm.add(...)` block and before `return () => mm.revert();`, add:

```ts
      mm.add("(prefers-reduced-motion: no-preference) and (pointer: coarse)", () => {
        // Mobile: a clean entrance only — no pin (pin + address-bar resize is janky).
        const split = SplitText.create(".js-hero-h1", {
          type: "lines",
          mask: "lines",
          aria: "auto",
        });
        const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
        intro
          .from(split.lines, {
            yPercent: 120,
            stagger: 0.08,
            duration: 0.7,
            clearProps: "transform",
          })
          .from(
            ".js-hero-ekg",
            { drawSVG: "0% 0%", duration: 1.1, ease: "power2.inOut" },
            "-=0.4",
          )
          .from(
            ".js-hero-sub",
            { y: 16, opacity: 0, duration: 0.6, clearProps: "all" },
            "-=0.7",
          );
        return () => {
          split.revert();
        };
      });
```

- [ ] **Step 2: Remove superseded code**

Check whether `useHomeScrollProgress` is still referenced:

Run: `grep -rn "useHomeScrollProgress" src/`
- If the only hit is its own file, delete it: `git rm src/features/home/useHomeScrollProgress.ts`
- If `HomePage.tsx` (or any file) imports it, remove that import/usage first, then delete.

(The old hero's floating-paw / float code is already gone via the Task 2 rewrite — confirm no `js-hero-cat` / `js-hero-paw` references remain: `grep -rn "js-hero-cat\|js-hero-paw" src/` should be empty.)

- [ ] **Step 3: Verify gates + static output**

Run:
```bash
bun run check-all 2>&1 | tail -6
bun run build 2>&1 | tail -2
grep -oc 'pin-spacer' dist/index.html
grep -o 'Engineering biology for healthier companions' dist/index.html | head -1
```
Expected: `check-all` green (only the known pre-existing `Button.tsx` fast-refresh warning); build finished; `pin-spacer` `0`; subhead present.

- [ ] **Step 4: Browser check (dev) — mobile + reduced motion**

- DevTools device toolbar (touch): the hero plays the entrance only, no pin, scrolls normally.
- OS reduce-motion ON + reload: clean static Beat 0 hero, no pin, panel/captions never appear, content fully visible.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: hero mobile entrance branch + remove superseded scroll-progress hook"
```

---

### Task 6: Final verification

**Files:** none (verification only)

- [ ] **Step 1: Full smoke**

Run: `bun run test:smoke 2>&1 | tail -8`
Expected: `check-all` green + `Build finished.`

- [ ] **Step 2: SSG correctness assertions**

Run:
```bash
grep -oc 'pin-spacer' dist/index.html
grep -oc 'opacity:0;visibility:hidden' dist/index.html
grep -o 'js-hero-h1[^"]*"' dist/index.html | head -1
```
Expected: `pin-spacer` `0`; the inline-hidden cinematic layers present (`>0`); the headline class present and its text visible (no inline `opacity:0` on the h1 itself).

- [ ] **Step 3: Manual sign-off checklist (record results)**

- Desktop: cinematic pin reads premium, not stuck; symmetric on scroll up/down.
- Reduced motion: clean static hero, nothing hidden/blank.
- Mobile: entrance only, normal scroll.
- Keyboard: Tab reaches both CTAs; tabbing does not strand you mid-pin.
- No console errors; 60fps.

---

## Self-Review (completed at plan-write time)

- **Spec coverage:** Beat 0 entrance (T3), Beats 1–3 pinned cinema (T4), plugin registration (T1), markup + inline-hidden layers + no pin-spacer (T2), reduced-motion/no-JS fallback (inherent in T2 markup; verified T2/T5/T6), mobile branch (T5), perf/ease:none/anticipatePin/refresh (T4), a11y aria/keyboard (T4/T6), anti-patterns honored (no filter — veil cross-fade; no confetti — group brighten; no morph; one pin), cleanup of superseded code (T5). All mapped.
- **Placeholders:** none — every step has concrete code/commands. Copy lines are intentionally generic per the approved spec.
- **Type/name consistency:** `useHeroCinema(root)` signature, `js-*` sentinel classes, and class names (`js-hero-scene/veil/panel/cell/construct/ekg/caption-1..3/progress/cta/h1/sub`) match across HeroSection (T2) and useHeroCinema (T3–T5).
- **Known in-browser tuning:** scrub value, `end` distance, `scale` amount, and timeline offsets are starting values to refine in Task 4 Step 3 (a pinned scrollytelling timeline cannot be perfected without a browser).
