/**
 * Navigation + footer link derivation (§14).
 *
 * Navbar, Footer, and the 404 page all derive their links from here so there is
 * never a second hard-coded route list. Serializable (no React imports).
 */
import { pageData, type PageCategory, type PageDataItem } from "./pageData";

export const navbarPages: PageDataItem[] = pageData.filter(
  (page) => page.showInNavbar,
);

export const footerPages: PageDataItem[] = pageData.filter(
  (page) => page.showInFooter,
);

/** Human-readable labels for nav groups, in display order. */
export const navGroupOrder: PageCategory[] = [
  "home",
  "team",
  "project",
  "wet-lab",
  "dry-lab",
  "human-practices",
  "other",
];

export const navGroupLabels: Record<PageCategory, string> = {
  home: "Home",
  team: "Team",
  project: "Project",
  "wet-lab": "Wet Lab",
  "dry-lab": "Dry Lab",
  "human-practices": "Engagement",
  other: "More",
};

export interface NavGroup {
  key: PageCategory;
  label: string;
  pages: PageDataItem[];
}

/**
 * Group navbar pages by navGroup (falling back to category), preserving a stable
 * group order. A group with a single top-level page renders as a flat link.
 */
export function getNavGroups(): NavGroup[] {
  const groups = new Map<PageCategory, PageDataItem[]>();

  for (const page of navbarPages) {
    const key = page.navGroup ?? page.category;
    const existing = groups.get(key);
    if (existing) existing.push(page);
    else groups.set(key, [page]);
  }

  return navGroupOrder
    .filter((key) => groups.has(key))
    .map((key) => ({
      key,
      label: navGroupLabels[key],
      pages: groups.get(key) ?? [],
    }));
}

export const navLabelFor = (page: PageDataItem): string =>
  page.navLabel ?? page.title;
