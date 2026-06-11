/**
 * Canonical, serializable page metadata (§9.1).
 *
 * THIS is the single source of truth for routes, navigation, footer links, SEO,
 * JSON-LD, sitemap entries, page categories, and Markdown content mapping.
 *
 * It MUST stay importable from plain Node/Bun scripts: no React, no CSS, no
 * browser globals, no Vite-only `import.meta.glob`. `pages.ts` attaches React
 * components on top of this data but never redefines it.
 */
import type { ComponentKey } from "./componentKeys";

export type PageCategory =
  | "home"
  | "team"
  | "project"
  | "wet-lab"
  | "dry-lab"
  | "human-practices"
  | "other";

export type PageKind = "react" | "markdown";

export interface PageSEO {
  title: string;
  description: string;
  keywords: string[];
  ogImage?: string;
  ogType?: "website" | "article";
  robots?: string;
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>;
}

export interface SitemapConfig {
  priority: number;
  changefreq:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
}

export interface BasePageData {
  /** Site-internal route path. Always starts with "/", never includes basePath. */
  path: string;
  name: string;
  title: string;
  /** Optional lead/subtitle shown in the page header. */
  summary?: string;
  category: PageCategory;
  navLabel?: string;
  navGroup?: PageCategory;
  showInNavbar?: boolean;
  showInFooter?: boolean;
  seo: PageSEO;
  sitemap: SitemapConfig;
}

export type MarkdownPageData = BasePageData & {
  kind: "markdown";
  /** Path under src/content, no leading slash and no ".md" suffix. */
  contentPath: string;
};

export type ReactPageData = BasePageData & {
  kind: "react";
  componentKey: ComponentKey;
};

export type PageData = MarkdownPageData | ReactPageData;

export const pageData = [
  {
    path: "/",
    name: "home",
    title: "Home",
    summary:
      "BASIS-China 2026 iGEM. Engineering biology for healthier, happier companions.",
    category: "home",
    kind: "react",
    componentKey: "home",
    navLabel: "Home",
    showInNavbar: true,
    showInFooter: true,
    seo: {
      title: "BASIS-China 2026 iGEM Wiki",
      description:
        "Homepage for the 2026 BASIS-China iGEM team: project, team, and research.",
      keywords: ["iGEM", "BASIS-China", "synthetic biology", "2026"],
      ogType: "website",
    },
    sitemap: { priority: 1, changefreq: "weekly" },
  },
  {
    path: "/team",
    name: "team",
    title: "Meet Our Team",
    summary:
      "The students, instructors, and advisors behind the 2026 BASIS-China project.",
    category: "team",
    kind: "react",
    componentKey: "team",
    navLabel: "Team",
    navGroup: "team",
    showInNavbar: true,
    showInFooter: true,
    seo: {
      title: "Team · BASIS-China 2026 iGEM",
      description:
        "Meet the members, instructors, and advisors of the 2026 BASIS-China iGEM team.",
      keywords: ["iGEM", "team", "members", "BASIS-China"],
      ogType: "website",
    },
    sitemap: { priority: 0.7, changefreq: "monthly" },
  },
  {
    path: "/description",
    name: "description",
    title: "Project Description",
    summary: "How and why we chose our iGEM project.",
    category: "project",
    kind: "markdown",
    contentPath: "articles/project/description",
    navLabel: "Description",
    navGroup: "project",
    showInNavbar: true,
    showInFooter: true,
    seo: {
      title: "Project Description · BASIS-China 2026 iGEM",
      description:
        "The problem, motivation, and goals behind the 2026 BASIS-China iGEM project.",
      keywords: ["project", "description", "iGEM", "BASIS-China"],
      ogType: "article",
    },
    sitemap: { priority: 0.9, changefreq: "monthly" },
  },
  {
    path: "/engineering",
    name: "engineering",
    title: "Engineering Success",
    summary:
      "At least one full iteration of the design–build–test–learn engineering cycle.",
    category: "project",
    kind: "markdown",
    contentPath: "articles/project/engineering",
    navLabel: "Engineering",
    navGroup: "project",
    showInNavbar: true,
    showInFooter: true,
    seo: {
      title: "Engineering Success · BASIS-China 2026 iGEM",
      description:
        "How we applied the engineering design cycle to a technical aspect of our project.",
      keywords: ["engineering", "design cycle", "iGEM", "BASIS-China"],
      ogType: "article",
    },
    sitemap: { priority: 0.9, changefreq: "monthly" },
  },
  {
    path: "/results",
    name: "results",
    title: "Results",
    summary: "Our results, their analysis, and what they mean for the project.",
    category: "project",
    kind: "markdown",
    contentPath: "articles/project/results",
    navLabel: "Results",
    navGroup: "project",
    showInNavbar: true,
    showInFooter: true,
    seo: {
      title: "Results · BASIS-China 2026 iGEM",
      description:
        "Experimental results, analysis, and discussion for the 2026 BASIS-China iGEM project.",
      keywords: ["results", "data", "analysis", "iGEM", "BASIS-China"],
      ogType: "article",
    },
    sitemap: { priority: 0.9, changefreq: "monthly" },
  },
  {
    path: "/contribution",
    name: "contribution",
    title: "Contribution",
    summary: "A documented, reusable contribution for future iGEM teams.",
    category: "project",
    kind: "markdown",
    contentPath: "articles/project/contribution",
    navLabel: "Contribution",
    navGroup: "project",
    showInNavbar: true,
    showInFooter: true,
    seo: {
      title: "Contribution · BASIS-China 2026 iGEM",
      description:
        "A useful, well-documented contribution for the benefit of future iGEM teams.",
      keywords: ["contribution", "iGEM", "BASIS-China"],
      ogType: "article",
    },
    sitemap: { priority: 0.8, changefreq: "monthly" },
  },
  {
    path: "/experiments",
    name: "experiments",
    title: "Experiments",
    summary:
      "Research, experiments, and protocols, written to be reproducible.",
    category: "wet-lab",
    kind: "markdown",
    contentPath: "articles/wet-lab/experiments",
    navLabel: "Experiments",
    navGroup: "wet-lab",
    showInNavbar: true,
    showInFooter: true,
    seo: {
      title: "Experiments · BASIS-China 2026 iGEM",
      description:
        "The research, experiments, and protocols behind the 2026 BASIS-China iGEM project.",
      keywords: ["experiments", "protocols", "wet lab", "iGEM"],
      ogType: "article",
    },
    sitemap: { priority: 0.8, changefreq: "monthly" },
  },
  {
    path: "/notebook",
    name: "notebook",
    title: "Notebook",
    summary:
      "A chronological record of our team's progress through the season.",
    category: "wet-lab",
    kind: "markdown",
    contentPath: "articles/wet-lab/notebook",
    navLabel: "Notebook",
    navGroup: "wet-lab",
    showInNavbar: true,
    showInFooter: true,
    seo: {
      title: "Notebook · BASIS-China 2026 iGEM",
      description:
        "Chronological lab notebook documenting the 2026 BASIS-China iGEM season.",
      keywords: ["notebook", "lab journal", "wet lab", "iGEM"],
      ogType: "article",
    },
    sitemap: { priority: 0.6, changefreq: "weekly" },
  },
  {
    path: "/measurement",
    name: "measurement",
    title: "Measurement",
    summary: "Our measurement approaches for characterizing parts and systems.",
    category: "wet-lab",
    kind: "markdown",
    contentPath: "articles/wet-lab/measurement",
    navLabel: "Measurement",
    navGroup: "wet-lab",
    showInNavbar: true,
    showInFooter: true,
    seo: {
      title: "Measurement · BASIS-China 2026 iGEM",
      description:
        "Measurement and characterization approaches used by the 2026 BASIS-China iGEM team.",
      keywords: ["measurement", "characterization", "wet lab", "iGEM"],
      ogType: "article",
    },
    sitemap: { priority: 0.7, changefreq: "monthly" },
  },
  {
    path: "/plant",
    name: "plant",
    title: "Plant Synthetic Biology",
    summary: "Our work in plant synthetic biology.",
    category: "wet-lab",
    kind: "markdown",
    contentPath: "articles/wet-lab/plant",
    navLabel: "Plant",
    navGroup: "wet-lab",
    showInNavbar: true,
    showInFooter: true,
    seo: {
      title: "Plant Synthetic Biology · BASIS-China 2026 iGEM",
      description:
        "Exemplary work in plant synthetic biology by the 2026 BASIS-China iGEM team.",
      keywords: ["plant", "synthetic biology", "wet lab", "iGEM"],
      ogType: "article",
    },
    sitemap: { priority: 0.6, changefreq: "monthly" },
  },
  {
    path: "/safety-and-security",
    name: "safety-and-security",
    title: "Safety and Security",
    summary:
      "The safety and security considerations of our project and how we mitigate them.",
    category: "wet-lab",
    kind: "markdown",
    contentPath: "articles/wet-lab/safety-and-security",
    navLabel: "Safety & Security",
    navGroup: "wet-lab",
    showInNavbar: true,
    showInFooter: true,
    seo: {
      title: "Safety and Security · BASIS-China 2026 iGEM",
      description:
        "Risk assessment and safety measures for the 2026 BASIS-China iGEM project.",
      keywords: ["safety", "security", "biosafety", "iGEM"],
      ogType: "article",
    },
    sitemap: { priority: 0.7, changefreq: "monthly" },
  },
  {
    path: "/model",
    name: "model",
    title: "Modeling",
    summary: "Our model's assumptions, data, parameters, and results.",
    category: "dry-lab",
    kind: "markdown",
    contentPath: "articles/dry-lab/model",
    navLabel: "Model",
    navGroup: "dry-lab",
    showInNavbar: true,
    showInFooter: true,
    seo: {
      title: "Modeling · BASIS-China 2026 iGEM",
      description:
        "Mathematical and computational modeling of the 2026 BASIS-China iGEM project.",
      keywords: ["model", "modeling", "dry lab", "iGEM"],
      ogType: "article",
    },
    sitemap: { priority: 0.8, changefreq: "monthly" },
  },
  {
    path: "/software",
    name: "software",
    title: "Software",
    summary:
      "Software that makes synthetic biology easier, faster, or more accessible.",
    category: "dry-lab",
    kind: "markdown",
    contentPath: "articles/dry-lab/software",
    navLabel: "Software",
    navGroup: "dry-lab",
    showInNavbar: true,
    showInFooter: true,
    seo: {
      title: "Software · BASIS-China 2026 iGEM",
      description:
        "Software tools developed by the 2026 BASIS-China iGEM team for synthetic biology.",
      keywords: ["software", "tools", "dry lab", "iGEM"],
      ogType: "article",
    },
    sitemap: { priority: 0.7, changefreq: "monthly" },
  },
  {
    path: "/hardware",
    name: "hardware",
    title: "Hardware",
    summary:
      "Hardware that makes synthetic biology easier, faster, or more accessible.",
    category: "dry-lab",
    kind: "markdown",
    contentPath: "articles/dry-lab/hardware",
    navLabel: "Hardware",
    navGroup: "dry-lab",
    showInNavbar: true,
    showInFooter: true,
    seo: {
      title: "Hardware · BASIS-China 2026 iGEM",
      description:
        "Hardware built by the 2026 BASIS-China iGEM team to support synthetic biology.",
      keywords: ["hardware", "devices", "dry lab", "iGEM"],
      ogType: "article",
    },
    sitemap: { priority: 0.7, changefreq: "monthly" },
  },
  {
    path: "/human-practices",
    name: "human-practices",
    title: "Human Practices",
    summary:
      "How the world shapes our work and how our work affects the world.",
    category: "human-practices",
    kind: "markdown",
    contentPath: "articles/engagement/human-practices",
    navLabel: "Human Practices",
    navGroup: "human-practices",
    showInNavbar: true,
    showInFooter: true,
    seo: {
      title: "Human Practices · BASIS-China 2026 iGEM",
      description:
        "How the 2026 BASIS-China iGEM team engaged with stakeholders and the wider world.",
      keywords: ["human practices", "responsibility", "engagement", "iGEM"],
      ogType: "article",
    },
    sitemap: { priority: 0.9, changefreq: "monthly" },
  },
  {
    path: "/education",
    name: "education",
    title: "Education",
    summary: "Our educational tools and outreach activities.",
    category: "human-practices",
    kind: "markdown",
    contentPath: "articles/engagement/education",
    navLabel: "Education",
    navGroup: "human-practices",
    showInNavbar: true,
    showInFooter: true,
    seo: {
      title: "Education · BASIS-China 2026 iGEM",
      description:
        "Educational tools and outreach by the 2026 BASIS-China iGEM team.",
      keywords: ["education", "outreach", "engagement", "iGEM"],
      ogType: "article",
    },
    sitemap: { priority: 0.7, changefreq: "monthly" },
  },
  {
    path: "/inclusivity",
    name: "inclusivity",
    title: "Diversity and Inclusion",
    summary: "Making science accessible to everyone, regardless of background.",
    category: "human-practices",
    kind: "markdown",
    contentPath: "articles/engagement/inclusivity",
    navLabel: "Inclusivity",
    navGroup: "human-practices",
    showInNavbar: true,
    showInFooter: true,
    seo: {
      title: "Diversity and Inclusion · BASIS-China 2026 iGEM",
      description:
        "How the 2026 BASIS-China iGEM team approached diversity, equity, and inclusion.",
      keywords: ["inclusivity", "diversity", "inclusion", "iGEM"],
      ogType: "article",
    },
    sitemap: { priority: 0.6, changefreq: "monthly" },
  },
  {
    path: "/sustainability",
    name: "sustainability",
    title: "Sustainability",
    summary: "How our project maps to the UN Sustainable Development Goals.",
    category: "human-practices",
    kind: "markdown",
    contentPath: "articles/engagement/sustainability",
    navLabel: "Sustainability",
    navGroup: "human-practices",
    showInNavbar: true,
    showInFooter: true,
    seo: {
      title: "Sustainability · BASIS-China 2026 iGEM",
      description:
        "How the 2026 BASIS-China iGEM project addresses the UN Sustainable Development Goals.",
      keywords: ["sustainability", "SDGs", "engagement", "iGEM"],
      ogType: "article",
    },
    sitemap: { priority: 0.6, changefreq: "monthly" },
  },
  {
    path: "/entrepreneurship",
    name: "entrepreneurship",
    title: "Entrepreneurship",
    summary: "Building the business case to commercialize our project.",
    category: "human-practices",
    kind: "markdown",
    contentPath: "articles/engagement/entrepreneurship",
    navLabel: "Entrepreneurship",
    navGroup: "human-practices",
    showInNavbar: true,
    showInFooter: true,
    seo: {
      title: "Entrepreneurship · BASIS-China 2026 iGEM",
      description:
        "The business case and commercialization strategy for the 2026 BASIS-China iGEM project.",
      keywords: ["entrepreneurship", "business", "engagement", "iGEM"],
      ogType: "article",
    },
    sitemap: { priority: 0.6, changefreq: "monthly" },
  },
  {
    path: "/attributions",
    name: "attributions",
    title: "Attributions",
    summary: "Who did what, and the support we received along the way.",
    category: "team",
    kind: "markdown",
    contentPath: "articles/team/attributions",
    navLabel: "Attributions",
    navGroup: "team",
    showInNavbar: true,
    showInFooter: true,
    seo: {
      title: "Attributions · BASIS-China 2026 iGEM",
      description:
        "Attribution of work and acknowledgment of support for the 2026 BASIS-China iGEM team.",
      keywords: ["attributions", "acknowledgments", "iGEM"],
      ogType: "article",
    },
    sitemap: { priority: 0.5, changefreq: "monthly" },
  },
] satisfies PageData[];

export type PageDataItem = (typeof pageData)[number];

export function getPageByName(name: string): PageDataItem | undefined {
  return pageData.find((page) => page.name === name);
}

/** Look up a page by name, throwing on misconfiguration (caught by validation). */
export function requirePage(name: string): PageDataItem {
  const page = getPageByName(name);
  if (!page) throw new Error(`Unknown page: ${name}`);
  return page;
}
