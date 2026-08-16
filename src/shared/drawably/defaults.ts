/**
 * Shared sketch options for the HEAL ink layer.
 *
 * Pages must import wrappers from this folder (or `@/shared/components/Button`),
 * never `drawably/react` directly. A light boil is the library's signature —
 * the stroke breathes like a pen still on the page. Hover/press re-sketches.
 * `prefers-reduced-motion` freezes both (library default).
 */
import type { DrawablyButtonOptions, DrawablyOptions } from "drawably";

export const INK_SKETCH_OPTIONS: Pick<
  DrawablyOptions,
  "boil" | "roughness" | "width"
> = {
  boil: 0.28,
  roughness: 1.2,
  width: 2.5,
};

export const INK_BUTTON_VARIANT: DrawablyButtonOptions["variant"] = "outline";

/** Stable numeric seed from labels / indices so hydrate does not redraw a new face. */
export function seedFrom(...parts: Array<string | number>): number {
  let hash = 2166136261;
  const input = parts.join(":");
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}
