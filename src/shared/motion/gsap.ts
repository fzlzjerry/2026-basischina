import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
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
  gsap.registerPlugin(useGSAP, ScrollTrigger, DrawSVGPlugin);
}

/**
 * Shared motion vocabulary (§20). CONTENT NEVER TRANSLATES — reveals are
 * in-place fades and hand-drawn strokes; the only transforms in entrances
 * belong to decorative paste-ins (scale toward 100%, never past). One
 * vocabulary so every section reads as the same hand annotating the notebook.
 */
export const MOTION = {
  /** In-place opacity reveal for content: short, calm, no displacement. */
  fadeDuration: 0.5,
  fadeEase: "power2.out",
  fadeStagger: 0.1,
  /** Hand-drawn strokes draw by length (swash, paw trail, hero arrow). */
  drawDuration: 0.55,
  drawEase: "power2.inOut",
  revealStart: "top 80%",
} as const;

/**
 * True when the element already intersects the viewport at init time. Reveals
 * must SKIP entirely in that case: a refresh can land mid-page (scroll
 * restoration) or on a viewport tall enough to expose a section, and hiding
 * content that is already on screen is exactly the flash this site bans.
 * Call inside the useGSAP layout effect BEFORE creating any from()-tween
 * (immediateRender hides targets at creation, not at trigger time).
 */
export function inViewAtInit(el: Element | null): boolean {
  if (!el || typeof window === "undefined") return false;
  const rect = el.getBoundingClientRect();
  return rect.top < window.innerHeight && rect.bottom > 0;
}

interface RevealOptions {
  /** Section element the ScrollTrigger watches (usually the useGSAP scope). */
  trigger: Element | null;
  start?: string;
  stagger?: number;
  delay?: number;
  duration?: number;
}

/**
 * Opacity-only scroll reveal: autoAlpha 0 to 1 in place, `once`. No x/y, no
 * scale — content never moves, so nothing needs clearProps and a sticker's
 * CSS tilt (`--rot`) is never touched. No-ops when the trigger is already on
 * screen at init (the prerendered content simply stays visible). Call inside
 * a "(prefers-reduced-motion: no-preference)" matchMedia branch.
 */
export function scrollFadeIn(
  targets: gsap.DOMTarget,
  {
    trigger,
    start = MOTION.revealStart,
    stagger = 0,
    delay = 0,
    duration = MOTION.fadeDuration,
  }: RevealOptions,
): void {
  if (inViewAtInit(trigger)) return;
  gsap.from(targets, {
    autoAlpha: 0,
    duration,
    ease: MOTION.fadeEase,
    stagger,
    delay,
    scrollTrigger: { trigger, start, once: true },
  });
}

/**
 * DrawSVG stroke reveal: the stroke draws itself 0 to full, `once`, with the
 * same in-view init guard — skipped strokes keep their complete prerendered
 * state (reduced-motion / no-JS parity).
 */
export function drawIn(
  targets: gsap.DOMTarget,
  {
    trigger,
    start = MOTION.revealStart,
    stagger = 0,
    delay = 0,
    duration = MOTION.drawDuration,
  }: RevealOptions,
): void {
  if (inViewAtInit(trigger)) return;
  gsap.from(targets, {
    drawSVG: 0,
    duration,
    ease: MOTION.drawEase,
    stagger,
    delay,
    scrollTrigger: { trigger, start, once: true },
  });
}

export { gsap, ScrollTrigger, DrawSVGPlugin, useGSAP };
