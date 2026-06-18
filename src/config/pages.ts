/**
 * React page registry (§9.3).
 *
 * Attaches a dynamic-import thunk to each React page in the canonical `pageData`.
 * It must NOT redefine page metadata — it only maps componentKey -> importer.
 *
 * The router consumes these as vite-react-ssg route-level `lazy` routes (which
 * the runtime pre-resolves before client hydration). That is the SSG-correct way
 * to code-split route components: React.lazy + Suspense would render the fallback
 * during hydration and mismatch the prerendered HTML.
 */
import type { ComponentType } from "react";
import type { ComponentKey } from "./componentKeys";
import { pageData, type PageData } from "./pageData";

export type PageModule = { default: ComponentType };
export type PageImporter = () => Promise<PageModule>;

const importerByKey = {
  home: () => import("@/features/home/HomePage"),
  team: () => import("@/features/team/TeamPage"),
  attributions: () => import("@/features/attributions/AttributionsPage"),
} satisfies Record<ComponentKey, PageImporter>;

export type MarkdownPageConfig = Extract<PageData, { kind: "markdown" }>;

export type ReactPageConfig = Extract<PageData, { kind: "react" }> & {
  importer: PageImporter;
};

export type PageConfig = MarkdownPageConfig | ReactPageConfig;

export const pages: PageConfig[] = pageData.map((page) => {
  if (page.kind === "markdown") return page;

  const importer = importerByKey[page.componentKey];
  if (!importer) {
    throw new Error(`Missing React component for page: ${page.name}`);
  }

  return { ...page, importer };
});
