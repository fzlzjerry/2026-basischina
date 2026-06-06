/**
 * Presentation metadata for each page category (§ pageCategoryMeta).
 *
 * This is the ONLY module that pairs a PageCategory with a React/Phosphor icon.
 * `pageData.ts` and `navigation.ts` stay serializable (no React, no JSX) so the
 * Bun validate/sitemap scripts can import them; all icon + JSX presentation for
 * categories lives here instead.
 *
 * Typing as `Record<PageCategory, CategoryMeta>` makes the compiler enforce that
 * every one of the 7 categories is mapped — `bun run type-check` fails on drift.
 */
import {
  Compass,
  Desktop,
  Flask,
  HandHeart,
  House,
  TestTube,
  UsersThree,
} from "@phosphor-icons/react";
import type { ComponentType } from "react";

import type { PageCategory } from "./pageData";

/** Phosphor icon component shape (accepts size/weight/className/etc.). */
type PhosphorIcon = ComponentType<{
  size?: number | string;
  weight?: "thin" | "light" | "regular" | "bold" | "fill" | "duotone";
  className?: string;
}>;

/** Accent keys mirror the Card `accent` union so `meta.accent` is pass-through. */
export type CategoryAccent =
  | "teal"
  | "blue"
  | "purple"
  | "green"
  | "peach"
  | "pink";

export interface CategoryMeta {
  Icon: PhosphorIcon;
  accent: CategoryAccent;
  label: string;
}

export const pageCategoryMeta: Record<PageCategory, CategoryMeta> = {
  home: { Icon: House, accent: "teal", label: "Home" },
  project: { Icon: Flask, accent: "teal", label: "Project" },
  "wet-lab": { Icon: TestTube, accent: "blue", label: "Wet Lab" },
  "dry-lab": { Icon: Desktop, accent: "purple", label: "Dry Lab" },
  "human-practices": { Icon: HandHeart, accent: "green", label: "Engagement" },
  team: { Icon: UsersThree, accent: "peach", label: "Team" },
  other: { Icon: Compass, accent: "pink", label: "More" },
};
