/**
 * HEAL hand-drawn register helpers (homepage). The sticker family reads as paper
 * cut-outs pasted onto the lab-notebook grid: a bold outline + hard offset
 * shadow (`.heal-sticker` in main.css), plus a per-element wonky border-radius
 * and a small hand-pasted tilt supplied here. Cycling tilt/radius by index keeps
 * repeated elements (nav pills, bento tiles) from snapping into a uniform grid.
 *
 * Pure module (no React component exports) so it is safe to import anywhere.
 */
import type { CSSProperties } from "react";

export const STICKER_ROTS = [
  "-1.2deg",
  "1deg",
  "-0.6deg",
  "1.3deg",
  "-1deg",
  "0.8deg",
  "-1.4deg",
];

export const STICKER_RADII = [
  "14px 9px 16px 8px / 8px 16px 9px 14px",
  "10px 15px 9px 17px / 16px 8px 15px 9px",
  "16px 8px 14px 10px / 9px 15px 8px 16px",
  "9px 16px 10px 15px / 15px 9px 16px 8px",
  "13px 11px 17px 9px / 9px 16px 10px 15px",
  "15px 10px 12px 14px / 12px 14px 9px 16px",
  "11px 16px 8px 14px / 14px 8px 16px 10px",
];

/** Per-element tilt + wonky radius cycled by index; `--rot` drives .heal-sticker. */
export function stickerStyle(i: number, rot?: string): CSSProperties {
  return {
    "--rot": rot ?? STICKER_ROTS[i % STICKER_ROTS.length],
    borderRadius: STICKER_RADII[i % STICKER_RADII.length],
  } as CSSProperties;
}

/** Explicit tilt + radius (for one-off shapes like the hero CTAs). */
export function stickerStyleRaw(rot: string, radius: string): CSSProperties {
  return { "--rot": rot, borderRadius: radius } as CSSProperties;
}

/** Sticker CTA button: Gochi Hand paper button, orange (primary) or cream. */
export function ctaClasses(variant: "primary" | "secondary"): string {
  return [
    "heal-sticker inline-flex items-center gap-2 px-6 py-3 font-hand text-lg leading-none text-sticker-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring",
    variant === "primary" ? "bg-app-orange" : "bg-surface-2",
  ].join(" ");
}
