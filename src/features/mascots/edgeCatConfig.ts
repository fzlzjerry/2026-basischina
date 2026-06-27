/**
 * Edge-cat variant resolution (pure, SSR-safe — no React, no DOM).
 *
 * Picks the color, side, and mood of the perching cat for a given route, so
 * different pages show different cats. Side alternates by the page's index in
 * the registry so adjacent nav items don't perch on the same edge; mood is
 * "sleepy" for the wet-lab notebook pages (a dozing cat fits the register) and
 * "alert" elsewhere; color follows the page category accent family.
 */
import { pageData, type PageCategory } from "@/config/pageData";

export type EdgeCatColor = "peach" | "ginger" | "cream" | "grey";
export type EdgeCatSide = "left" | "right";
export type EdgeCatMood = "alert" | "sleepy";

export interface EdgeCatVariant {
  colors: EdgeCatColor;
  side: EdgeCatSide;
  mood: EdgeCatMood;
}

const COLOR_BY_CATEGORY: Record<PageCategory, EdgeCatColor> = {
  home: "peach",
  team: "ginger",
  project: "peach",
  "wet-lab": "grey",
  "dry-lab": "cream",
  "human-practices": "ginger",
  other: "peach",
};

const MOOD_BY_CATEGORY: Record<PageCategory, EdgeCatMood> = {
  home: "alert",
  team: "alert",
  project: "alert",
  "wet-lab": "sleepy",
  "dry-lab": "alert",
  "human-practices": "alert",
  other: "alert",
};

/** Normalize a route-local pathname to match pageData.path (leading slash, no trailing). */
function normalizePath(pathname: string): string {
  if (!pathname || pathname === "/") return "/";
  return pathname.replace(/\/+$/, "");
}

/**
 * Resolve the edge-cat variant for a route-local pathname. Returns a stable
 * default for unknown paths (e.g. the 404 wildcard).
 */
export function resolveEdgeCatVariant(pathname: string): EdgeCatVariant {
  const normalized = normalizePath(pathname);
  const idx = pageData.findIndex((p) => p.path === normalized);
  const category: PageCategory = idx >= 0 ? pageData[idx].category : "other";

  return {
    colors: COLOR_BY_CATEGORY[category] ?? "peach",
    mood: MOOD_BY_CATEGORY[category] ?? "alert",
    side: (idx >= 0 ? idx : 0) % 2 === 0 ? "right" : "left",
  };
}
