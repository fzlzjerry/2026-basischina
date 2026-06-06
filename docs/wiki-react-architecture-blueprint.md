# iGEM Wiki React Architecture Blueprint

> This document is an architecture blueprint for the 2026 BASIS-China iGEM Wiki.
> It is not tied to any previous year's project name, content, or codebase.

## 1. Purpose

This blueprint defines a reusable architecture for building the 2026
BASIS-China iGEM Wiki from scratch with React.

The document is intended to be given directly to an implementation agent. The
agent should be able to create the project structure, core files, routing,
content runtime, static prerendering, SEO pipeline, sitemap generation, safety
guards, and deployment checks from this specification.

## 2. Goals

- Build a static, content-first iGEM Wiki using React.
- Keep the architecture easy to extend for a new team year.
- Make page metadata the single source for routes, navigation, SEO, sitemap,
  and Markdown content mapping.
- Produce crawler-visible per-route HTML for content pages through build-time
  prerendering.
- Support scientific documentation features:
  - Markdown articles
  - Frontmatter metadata
  - Table of contents
  - KaTeX equations
  - Mermaid diagrams
  - Prism code highlighting
  - Optional 3D molecular visualization
- Keep deployment compatible with static hosting such as GitLab Pages or iGEM
  wiki deployment.
- Avoid one huge page component that owns unrelated interaction, data, and
  rendering logic.

## 3. Non-goals

- Do not migrate an existing year's Wiki file by file.
- Do not define visual art direction, brand style, colors, or page aesthetics.
- Do not require a runtime backend or runtime SSR server.
- Do not confuse "no runtime server" with "no build-time prerendering".
- Do not introduce a global state manager by default.
- Do not duplicate route, navigation, SEO, and sitemap definitions across files.
- Do not rely on client-side meta tag mutation as the only SEO mechanism for
  pages that need accurate search previews or social share cards.

## 4. Target Stack

Use the latest stable versions available when the new Wiki is started. Pin exact
versions in `package.json` after project creation.

Recommended baseline:

```text
Vite
React
TypeScript
React Router
vite-react-ssg or equivalent build-time prerender step
@unhead/react
Tailwind CSS
Markdown-it
DOMPurify
KaTeX
Mermaid
Prism
Bun
```

Rules:

- Pin the React Router major version in `package.json`; do not silently switch
  between data-router mode and framework mode.
- Use one package manager consistently. If the project declares Bun, CI uses
  Bun.
- Build-time prerendering is required for public content pages unless the team
  intentionally accepts client-side-only SEO.

## 5. Architecture Model

The project uses a Content-first Static Wiki Architecture:

```text
App Shell
  -> Serializable Page Registry
  -> React Page Registry
  -> Router / Nav / SEO / Sitemap
  -> Feature Modules
  -> Markdown Runtime
  -> Static Prerender
  -> Static Deployment
```

The most important rule is:

```text
config/pageData.ts is the canonical serializable source of page metadata.
```

`config/pages.ts` may attach React components to `pageData`, but it must not
redefine page metadata. Routes, navigation, footer links, Markdown paths, SEO
metadata, JSON-LD, sitemap entries, and page categories must be derived from the
same page metadata.

## 6. Recommended Directory Structure

```text
src/
├── app/
│   ├── App.tsx
│   ├── main.tsx
│   ├── router.tsx
│   └── shell/
│       ├── AppShell.tsx
│       ├── Navbar.tsx
│       └── Footer.tsx
├── config/
│   ├── env.ts
│   ├── pageData.ts
│   ├── pages.ts
│   └── seo.ts
├── content/
│   ├── articles/
│   └── assets/
├── features/
│   ├── content/
│   │   ├── MarkdownPage.tsx
│   │   ├── MarkdownArticle.tsx
│   │   ├── ArticleTableOfContents.tsx
│   │   ├── markdownService.ts
│   │   └── useMarkdownEnhancements.ts
│   ├── home/
│   │   ├── HomePage.tsx
│   │   ├── sections/
│   │   └── useHomeScrollProgress.ts
│   ├── molecule/
│   │   ├── MoleculeViewer.tsx
│   │   ├── use3DMolViewer.ts
│   │   └── types.ts
│   └── team/
│       ├── TeamPage.tsx
│       ├── teamData.ts
│       └── teamTypes.ts
├── shared/
│   ├── components/
│   │   ├── ErrorBoundary.tsx
│   │   └── PageLoading.tsx
│   ├── hooks/
│   │   ├── usePageHead.ts
│   │   ├── useScrollToTop.ts
│   │   └── useScript.ts
│   ├── services/
│   ├── types/
│   └── utils/
│       ├── assetUrl.ts
│       ├── slug.ts
│       └── url.ts
└── styles/
    ├── main.css
    └── markdown.css
scripts/
├── generate-sitemap.ts
└── validate-pages.ts
```

Rules:

- `app/` owns application boot, routing, and shell.
- `config/` owns cross-cutting project configuration.
- `pageData.ts` owns serializable page metadata.
- `pages.ts` attaches React lazy components to page metadata.
- `features/` owns business-facing page modules.
- `shared/` owns reusable utilities and low-level hooks.
- `content/` owns Markdown source files and content-local assets.
- `styles/` owns global CSS and Markdown rendering CSS.
- `scripts/` owns build-time validation and generated artifacts.

## 7. Environment and URL Contract

Create `src/config/env.ts` and keep all project environment parsing there.

Do not derive the public deployment URL only from the team name. The iGEM URL
slug should be pinned to the official assigned path.

Required environment variables:

```text
VITE_TEAM_NAME=BASIS-China
VITE_TEAM_YEAR=2026
VITE_BASE_PATH=/basis-china/
VITE_SITE_URL=https://2026.igem.wiki/basis-china
```

Example:

```ts
export interface WikiEnv {
  teamName: string
  teamYear: string
  teamId?: string
  basePath: string
  siteUrl: string
}

export function normalizeBasePath(value: string): string {
  const trimmed = value.trim()
  if (!trimmed || trimmed === '/') return '/'
  return `/${trimmed.replace(/^\/+|\/+$/g, '')}/`
}

export function normalizeSiteUrl(value: string): string {
  return value.trim().replace(/\/+$/g, '')
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
}

const teamName = import.meta.env.VITE_TEAM_NAME || 'BASIS-China'
const teamYear = import.meta.env.VITE_TEAM_YEAR || '2026'
const inferredSlug = slugify(teamName)

export const wikiEnv: WikiEnv = {
  teamName,
  teamYear,
  teamId: import.meta.env.VITE_TEAM_ID,
  basePath: normalizeBasePath(import.meta.env.VITE_BASE_PATH || `/${inferredSlug}/`),
  siteUrl: normalizeSiteUrl(
    import.meta.env.VITE_SITE_URL || `https://${teamYear}.igem.wiki/${inferredSlug}`
  ),
}
```

Rules:

- `VITE_BASE_PATH` and `VITE_SITE_URL` are the preferred source of truth.
- `teamName` slug inference is only a local fallback.
- `page.path` is always a site-internal route path and must never include
  `wikiEnv.basePath`.
- Vite `base`, React Router `basename`, sitemap URLs, canonical URLs, Markdown
  internal links, and static asset URLs must all derive from `wikiEnv`.
- Use one trailing-slash convention:
  - `basePath` includes leading and trailing slash.
  - `siteUrl` has no trailing slash.
  - canonical route URLs are `siteUrl + normalizedPagePath`.

## 8. Vite Base Contract

`vite.config.ts` must use the same base path contract as the app.

Example:

```ts
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

function normalizeBasePath(value: string): string {
  const trimmed = value.trim()
  if (!trimmed || trimmed === '/') return '/'
  return `/${trimmed.replace(/^\/+|\/+$/g, '')}/`
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const base = normalizeBasePath(env.VITE_BASE_PATH || '/basis-china/')

  return {
    base,
    plugins: [react()],
    resolve: {
      alias: {
        '@': '/src',
      },
    },
  }
})
```

Rules:

- `base` must not be hard-coded independently from the runtime env contract.
- CI must build with the same `VITE_BASE_PATH` and `VITE_SITE_URL` that the
  deployed site uses.
- Public assets referenced from React or Markdown must use a resolver that
  prefixes `wikiEnv.basePath` when needed.

## 9. Page Registry

Create two registry files:

```text
src/config/pageData.ts
src/config/pages.ts
```

### 9.1 Serializable Page Data

`pageData.ts` is the canonical metadata source. It must be importable from Node
scripts without loading React, CSS, browser globals, or Vite-only component
graphs.

```ts
export type PageCategory =
  | 'home'
  | 'team'
  | 'project'
  | 'wet-lab'
  | 'dry-lab'
  | 'human-practices'
  | 'other'

export type PageKind = 'react' | 'markdown'

export interface PageSEO {
  title: string
  description: string
  keywords: string[]
  ogImage?: string
  ogType?: 'website' | 'article'
  robots?: string
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>
}

export interface SitemapConfig {
  priority: number
  changefreq:
    | 'always'
    | 'hourly'
    | 'daily'
    | 'weekly'
    | 'monthly'
    | 'yearly'
    | 'never'
}

export interface BasePageData {
  path: string
  name: string
  title: string
  category: PageCategory
  navLabel?: string
  navGroup?: PageCategory
  showInNavbar?: boolean
  showInFooter?: boolean
  seo: PageSEO
  sitemap: SitemapConfig
}

export type MarkdownPageData = BasePageData & {
  kind: 'markdown'
  contentPath: string
}

export type ReactPageData = BasePageData & {
  kind: 'react'
  componentKey: string
}

export type PageData = MarkdownPageData | ReactPageData
```

### 9.2 Page Data Example

```ts
import type { PageData } from '@/config/pageData'

export const pageData = [
  {
    path: '/',
    name: 'home',
    title: 'BASIS-China 2026 Wiki Home',
    category: 'home',
    kind: 'react',
    componentKey: 'home',
    navLabel: 'Home',
    showInNavbar: true,
    showInFooter: true,
    seo: {
      title: 'BASIS-China 2026 iGEM Wiki',
      description: 'Homepage for the 2026 BASIS-China iGEM Wiki.',
      keywords: ['iGEM', 'synthetic biology'],
      ogType: 'website',
    },
    sitemap: {
      priority: 1,
      changefreq: 'weekly',
    },
  },
  {
    path: '/project',
    name: 'project-overview',
    title: 'Project Overview',
    category: 'project',
    kind: 'markdown',
    navLabel: 'Project',
    navGroup: 'project',
    showInNavbar: true,
    showInFooter: true,
    contentPath: 'articles/project/overview',
    seo: {
      title: 'Project Overview - iGEM Wiki',
      description: 'Project background, problem, and solution overview.',
      keywords: ['project', 'description', 'iGEM'],
      ogType: 'article',
    },
    sitemap: {
      priority: 0.9,
      changefreq: 'monthly',
    },
  },
] satisfies PageData[]
```

### 9.3 React Page Registry

`pages.ts` attaches React components to `pageData`. It must not redefine page
metadata.

```ts
import { lazy, type ComponentType, type LazyExoticComponent } from 'react'
import { pageData, type PageData } from '@/config/pageData'

const componentByKey = {
  home: lazy(() => import('@/features/home/HomePage')),
  team: lazy(() => import('@/features/team/TeamPage')),
} satisfies Record<string, LazyExoticComponent<ComponentType>>

export type MarkdownPageConfig = Extract<PageData, { kind: 'markdown' }>

export type ReactPageConfig = Extract<PageData, { kind: 'react' }> & {
  component: LazyExoticComponent<ComponentType>
}

export type PageConfig = MarkdownPageConfig | ReactPageConfig

export const pages: PageConfig[] = pageData.map(page => {
  if (page.kind === 'markdown') return page

  const component = componentByKey[page.componentKey]
  if (!component) {
    throw new Error(`Missing React component for page: ${page.name}`)
  }

  return {
    ...page,
    component,
  }
})
```

Rules:

- Every routable page must be declared in `pageData`.
- Markdown pages must define `contentPath`.
- React pages must define `componentKey`.
- `pages.ts` attaches components and must not duplicate metadata.
- Navbar and footer must not own their own independent page lists.
- Sitemap and validation scripts must import `pageData`, not `pages`.

## 10. Page Registry Validation

Create `scripts/validate-pages.ts`.

This script must run before build and fail on drift.

It must check:

- `path` values are unique.
- `name` values are unique.
- `path` starts with `/`.
- `path` does not start with `wikiEnv.basePath`; page paths are route-local.
- `contentPath` has no leading `/` and no `.md` suffix.
- Markdown pages have an existing `src/content/<contentPath>.md` file.
- React page `componentKey` has an entry in `componentByKey` or an equivalent
  component map validation.
- Every `componentByKey` entry is referenced by at least one React page, unless
  it is explicitly marked as reserved.
- `sitemap.priority` is between `0` and `1`.
- `seo.title`, `seo.description`, and `seo.keywords` are present.
- Navbar and footer pages are routable pages.
- No legacy or hidden route list exists in sitemap, nav, or Markdown page code.

The build must not continue if this script fails.

## 11. Router Generation and Static Routing

Create `src/app/router.tsx`.

The router must be generated from `pages`.

Default strategy:

- Use Browser History routing when static prerendering or host-level fallback is
  available.
- Generate static HTML for all public `pageData` routes at build time.
- Use a Hash Router only as an explicit fallback when the host cannot serve
  deep links and the team accepts weaker canonical URLs.

Example:

```tsx
import { Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { AppShell } from '@/app/shell/AppShell'
import { MarkdownPage } from '@/features/content/MarkdownPage'
import { NotFoundPage } from '@/features/content/NotFoundPage'
import { PageLoading } from '@/shared/components/PageLoading'
import { RouteErrorBoundary } from '@/shared/components/ErrorBoundary'
import { wikiEnv } from '@/config/env'
import { pages } from '@/config/pages'

function renderPage(page: (typeof pages)[number]) {
  if (page.kind === 'markdown') {
    return <MarkdownPage page={page} />
  }

  const PageComponent = page.component

  return (
    <Suspense fallback={<PageLoading />}>
      <PageComponent />
    </Suspense>
  )
}

export const router = createBrowserRouter(
  [
    {
      element: <AppShell />,
      errorElement: <RouteErrorBoundary />,
      children: [
        ...pages.map(page => ({
          path: page.path,
          element: renderPage(page),
          errorElement: <RouteErrorBoundary />,
        })),
        {
          path: '*',
          element: <NotFoundPage />,
        },
      ],
    },
  ],
  {
    basename: wikiEnv.basePath,
  }
)
```

Rules:

- Use lazy-loaded React page components.
- Wrap lazy route elements in `Suspense`.
- Add route-level error handling.
- Keep all page metadata in `pageData`.
- 404 suggestions should be generated from
  `pageData.filter(page => page.showInNavbar)`.
- Do not rely on `basename` to solve deep-link refresh behavior. `basename`
  only solves path prefixing.

## 12. Static Prerendering and SEO Contract

Public content pages require build-time prerendered HTML unless the team
explicitly accepts client-side-only SEO.

Recommended implementation:

- Use `vite-react-ssg` or an equivalent prerender step.
- Generate one HTML entry per public route in `pageData`.
- Inject route-specific head tags into each generated HTML file.
- Keep output as static `dist/` files.

Rules:

- SSG/prerendering is allowed because it does not require a runtime server.
- Client-side head updates are useful for in-app navigation but are not enough
  for accurate social share previews.
- WeChat, X, Facebook, LinkedIn, and similar scrapers may not execute JavaScript.
- If prerendering is disabled, the document must state that per-route OG tags
  and JSON-LD are best-effort only.
- If the host cannot serve deep links, either:
  - deploy prerendered route HTML files, or
  - provide a documented static fallback such as `404.html` copying when the
    host supports it, or
  - use Hash Router and accept weaker URL/SEO behavior.

## 13. App Shell

Create `src/app/shell/AppShell.tsx`.

The shell owns only persistent layout:

- Navbar
- Route outlet
- Footer
- Global scroll restoration
- Global SEO fallback
- Route focus management

Example:

```tsx
import { Outlet } from 'react-router-dom'
import { Footer } from '@/app/shell/Footer'
import { Navbar } from '@/app/shell/Navbar'
import { useScrollToTop } from '@/shared/hooks/useScrollToTop'
import { useRouteFocus } from '@/shared/hooks/useRouteFocus'

export function AppShell() {
  useScrollToTop()
  useRouteFocus()

  return (
    <div className="min-h-screen">
      <a className="sr-only focus:not-sr-only" href="#main-content">
        Skip to content
      </a>
      <Navbar />
      <main id="main-content" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
```

Do not put page-specific effects inside the shell.

## 14. Navigation and Footer

`Navbar` and `Footer` must derive links from `pageData` or `pages`.

Example:

```ts
import { pageData } from '@/config/pageData'

type PageDataItem = (typeof pageData)[number]

export const navbarPages = pageData.filter(page => page.showInNavbar)
export const footerPages = pageData.filter(page => page.showInFooter)

export const groupedNavbarPages = navbarPages.reduce(
  (groups, page) => {
    const group = page.navGroup || page.category
    groups[group] = [...(groups[group] || []), page]
    return groups
  },
  {} as Record<string, PageDataItem[]>
)
```

Rules:

- No duplicated hard-coded nav item arrays.
- Use `path` for links.
- Use `navLabel || title` for display text.
- Active state should come from the current route path.
- Navbar must be keyboard accessible.
- Dropdowns must be reachable by keyboard and should expose ARIA state.

## 15. Markdown Content Runtime

Markdown pages use:

```text
PageData.contentPath
  -> Markdown loader
  -> Markdown parser
  -> HTML string + meta + TOC
  -> React page component
  -> DOM enhancement hooks
```

### 15.1 Markdown File Format

Every Markdown file should start with frontmatter:

```md
---
title: Project Overview
description: Short description for SEO and page header.
author: BASIS-China Team
date: 2026-10-01
tags: [project, iGEM, synthetic biology]
---

# Project Overview

Markdown content starts here.
```

### 15.2 Markdown Service

`markdownService.ts` should be pure.

It may:

- parse frontmatter
- render Markdown
- generate TOC
- render KaTeX strings
- produce Mermaid placeholders
- produce Prism-highlighted code blocks
- sanitize generated HTML when raw HTML is enabled

It must not:

- call `document.querySelector`
- attach event listeners
- mutate the DOM
- update SEO
- scroll the page

Example service contract:

```ts
export interface MarkdownMeta {
  title?: string
  description?: string
  author?: string
  date?: string
  tags?: string[]
  [key: string]: unknown
}

export interface TocItem {
  title: string
  url: string
  depth: number
  children?: TocItem[]
}

export interface ProcessedMarkdown {
  html: string
  meta: MarkdownMeta
  toc: TocItem[]
  hasMermaid: boolean
}

export function processMarkdown(markdown: string): ProcessedMarkdown {
  // Parse frontmatter.
  // Render Markdown.
  // Build TOC.
  // Sanitize if raw HTML is enabled.
  // Return serializable data only.
}
```

### 15.3 Markdown Loader

Use Vite raw imports:

```ts
const markdownModules = import.meta.glob('/src/content/**/*.md', {
  query: '?raw',
  import: 'default',
})

export async function loadMarkdown(path: string): Promise<string> {
  const modulePath = `/src/content/${path}.md`
  const loader = markdownModules[modulePath]

  if (!loader) {
    throw new Error(`Markdown file not found: ${modulePath}`)
  }

  return loader() as Promise<string>
}
```

### 15.4 Markdown Links and Assets

Markdown content must be base-path aware.

Rules:

- Internal links like `[Team](/team)` must be rewritten or intercepted so they
  resolve under `wikiEnv.basePath`.
- Static assets must use `resolveAssetUrl()` or an equivalent helper.
- Do not hard-code production URLs such as
  `https://2026.igem.wiki/basis-china/...` inside Markdown.
- Local Markdown images should live under `src/content/assets` or
  `public/assets`.
- Images must have meaningful alt text or an explicit decorative marker.
- Dangerous URL protocols such as `javascript:` are forbidden.
- `data:` URLs are forbidden unless a specific safe media type is explicitly
  allowed.

### 15.5 DOM Enhancements Hook

Create `useMarkdownEnhancements.ts`.

This hook may:

- dynamically import Mermaid only when the page contains Mermaid placeholders
- attach copy-to-clipboard handlers
- normalize post-render behavior
- clean up event listeners on unmount

Example:

```ts
import { useEffect } from 'react'

export function useMarkdownEnhancements(container: HTMLElement | null, hasMermaid: boolean) {
  useEffect(() => {
    if (!container) return

    let disposed = false

    async function enhance() {
      if (hasMermaid) {
        const mermaid = await import('mermaid')
        if (disposed) return
        // Render Mermaid placeholders here.
        void mermaid
      }

      // Attach code copy handlers.
    }

    void enhance()

    return () => {
      disposed = true
      // Remove listeners here.
    }
  }, [container, hasMermaid])
}
```

## 16. Markdown Page Component

`MarkdownPage` receives a `MarkdownPageConfig`.

It should:

- load Markdown by `page.contentPath`
- process Markdown through `markdownService`
- update head metadata from page config plus frontmatter
- render article header, TOC, and HTML
- show loading and error states

It should not:

- hard-code route name to content path mappings
- own global scroll logic
- define page lists
- directly render unsanitized untrusted HTML

## 17. Head Management, SEO, and JSON-LD

Use `@unhead/react` or an equivalent head manager. Do not hand-roll a large
meta-tag reconciler unless there is a specific reason.

Create `src/shared/hooks/usePageHead.ts`.

Head metadata should be generated from:

```text
PageData.seo
  + Markdown frontmatter
  + wikiEnv.siteUrl
  + current route path
```

The hook should set:

- `title`
- `meta[name="description"]`
- `meta[name="keywords"]`
- `meta[name="author"]`
- Open Graph tags
- Twitter card tags
- canonical link
- JSON-LD scripts

Rules:

- Do not hard-code canonical URLs in pages.
- Canonical URLs must use `wikiEnv.siteUrl + page.path`.
- `page.path` must not include `wikiEnv.basePath`; otherwise canonical URLs can
  accidentally duplicate the deployment prefix.
- Use the head manager's dedupe features for route changes.
- JSON-LD must be produced with `JSON.stringify`.
- Article Markdown pages should use `ogType: 'article'`.
- Build-time prerendering must output page-specific head tags into static HTML.
- Client-side head updates alone are not sufficient for social share previews.

## 18. Sitemap Generation

Create `scripts/generate-sitemap.ts`.

The sitemap script must import `pageData.ts`. It must not import React
components or `pages.ts`.

Rules:

- No hand-written second route array.
- Exclude wildcard 404 routes.
- Use `PageData.sitemap`.
- Use file modification time of related Markdown or React page when practical.
- Write output to `public/sitemap.xml`.
- Use `wikiEnv.siteUrl` and normalized page paths.

## 19. Scientific Visualization Module

3Dmol or other scientific visualization should live in a feature module:

```text
features/molecule/
├── MoleculeViewer.tsx
├── use3DMolViewer.ts
└── types.ts
```

Rules:

- The component owns markup.
- The hook owns script loading, viewer initialization, cleanup, and errors.
- The hook must not be embedded inside the homepage component.
- 3Dmol must not be included in the main application bundle.
- Load the 3Dmol script only when the viewer route or component is mounted.
- Prefer viewport-triggered viewer initialization when the viewer appears below
  the first viewport.
- The hook must clean up animation frames and viewer resources on unmount.
- The hook must respect `prefers-reduced-motion`.
- Molecular data files should live in `public/assets` or a clear static asset
  folder.
- The homepage should only compose `<MoleculeViewer />`.

Example hook contract:

```ts
export interface MoleculeViewerOptions {
  elementId: string
  sdfUrl: string
  autoRotate?: boolean
}

export interface MoleculeViewerState {
  loading: boolean
  error: string | null
  ready: boolean
}

export function use3DMolViewer(options: MoleculeViewerOptions): MoleculeViewerState {
  // Load script if needed.
  // Create viewer.
  // Fetch SDF.
  // Render molecule.
  // Respect reduced motion.
  // Clean up animation frame on unmount.
}
```

## 20. Homepage Architecture

The homepage must be split into feature sections.

Recommended structure:

```text
features/home/
├── HomePage.tsx
├── sections/
│   ├── HeroSection.tsx
│   ├── ProblemSection.tsx
│   ├── SolutionSection.tsx
│   ├── MoleculeSection.tsx
│   └── ImpactSection.tsx
└── useHomeScrollProgress.ts
```

Rules:

- `HomePage.tsx` composes sections only.
- Section-specific content and interaction stay inside section files.
- Scroll progress and chapter tracking live in hooks.
- No homepage file should become a multi-thousand-line component.
- Animations must respect `prefers-reduced-motion`.

## 21. State Management

Default state strategy:

- Use local `useState` for UI state.
- Use `useMemo` for derived page data.
- Use `useEffect` for browser side effects.
- Use custom hooks for reusable behavior.

Do not add Zustand, Redux, Jotai, or another global store by default.

Introduce a global store only if at least one of these appears:

- cross-page interactive state
- persistent user preferences
- complex shared client cache
- multi-step workflow state reused across routes

## 22. Security Boundary

Default policy:

- Raw HTML in Markdown is disabled by default.
- If raw HTML is required, generated HTML must pass through DOMPurify or an
  equivalent sanitizer before `dangerouslySetInnerHTML`.
- Sanitization must happen before any value reaches `dangerouslySetInnerHTML`.
- Sanitizer configuration must define an explicit allowlist for tags and
  attributes used by the Wiki content.
- URL-bearing attributes such as `href` and `src` must enforce a protocol
  allowlist.
- Untrusted Markdown must always be sanitized.
- External links must add `target="_blank"` and `rel="noopener noreferrer"`.
- Dangerous URL protocols such as `javascript:` are forbidden.
- `data:` URLs are forbidden unless a specific safe media type is explicitly
  allowed.
- JSON-LD must be injected through `JSON.stringify`.
- Do not interpolate untrusted strings into script tags.

The default assumption is trusted Markdown from the team repository, but the
implementation should still keep raw HTML disabled unless the project has a
documented reason to enable it.

## 23. Accessibility Requirements

Accessibility is part of the architecture contract.

Rules:

- Every route should have exactly one visible `h1`.
- The app shell must include a skip link.
- Route changes should move focus to the main content region.
- Navbar and dropdowns must be keyboard accessible.
- Markdown images require alt text or an explicit decorative marker.
- Article TOC should expose appropriate ARIA state for collapsible controls.
- Animations and auto-rotating visualizations must respect
  `prefers-reduced-motion`.
- Interactive controls must have visible focus states.

## 24. Package Scripts

Recommended scripts:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "bun run validate:pages && bun run type-check && bun run generate:sitemap && vite build --mode production",
    "build:fast": "vite build --mode production",
    "preview": "vite preview",
    "type-check": "tsc --noEmit",
    "lint": "eslint . --fix",
    "lint:check": "eslint .",
    "format": "prettier --write \"src/**/*.{ts,tsx,css,md,json}\" \"scripts/**/*.ts\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx,css,md,json}\" \"scripts/**/*.ts\"",
    "check-all": "bun run validate:pages && bun run type-check && bun run lint:check && bun run format:check",
    "validate:pages": "bun scripts/validate-pages.ts",
    "generate:sitemap": "bun scripts/generate-sitemap.ts",
    "test:smoke": "bun run check-all && bun run build"
  }
}
```

Rules:

- Use one package manager consistently.
- If the project declares Bun, CI should use Bun.
- `build` must include page validation, type checking, sitemap generation, and
  production build.
- `build:fast` is allowed only for quick local iteration.
- CI must not deploy an unchecked build.
- Do not rely solely on lifecycle hooks such as `prebuild`; call validation and
  sitemap generation explicitly in `build`.

## 25. CI Requirements

Minimum CI stages:

```text
install
check
build
deploy
```

The check stage must run:

```bash
bun run validate:pages
bun run type-check
bun run lint:check
bun run format:check
```

The build stage must run:

```bash
bun run build
```

Deployment should publish the `dist/` directory.

## 26. Acceptance Criteria

A new Wiki generated from this blueprint is acceptable when:

- Adding a page requires changing only `pageData.ts` plus the target Markdown or
  React page component map entry.
- Routes, navigation, footer links, SEO, and sitemap are all derived from page
  registry data.
- `pages.ts` attaches React components to `pageData` and does not redefine page
  metadata.
- Markdown pages support frontmatter, headings, TOC, KaTeX, Mermaid, Prism code
  blocks, images, and external links.
- Markdown raw HTML is disabled by default or sanitized if explicitly enabled.
- Internal links and assets work correctly under `wikiEnv.basePath`.
- Public content routes have prerendered page-specific head metadata unless the
  team explicitly accepts client-side-only SEO.
- The homepage is split into feature modules.
- Scientific visualization is isolated in `features/molecule`.
- No page has a hidden second route or content mapping.
- Route lazy loading is wrapped in `Suspense`.
- Route-level errors have an error boundary.
- `bun run validate:pages` passes.
- `bun run type-check` passes.
- `bun run lint:check` passes.
- `bun run format:check` passes.
- `bun run build` passes.
- Static hosting can serve `dist/` directly, including direct access or refresh
  for public routes.
- Accessibility requirements in section 23 are satisfied.

## 27. Agent Implementation Steps

When an implementation agent receives this document, it should execute in this
order:

1. Create the Vite React TypeScript project.
2. Install React Router, prerender/SSG tooling, `@unhead/react`, Tailwind,
   Markdown, DOMPurify, KaTeX, Mermaid, and Prism dependencies.
3. Create the directory structure from section 6.
4. Implement `env.ts`, base path normalization, site URL normalization, slug
   utilities, and asset URL helpers.
5. Configure Vite `base` from the same base path contract.
6. Implement `pageData.ts` as the canonical serializable metadata registry.
7. Implement `pages.ts` by attaching React lazy components to `pageData`.
8. Implement `scripts/validate-pages.ts`.
9. Implement React Router generation from the registry with `Suspense` and
   route-level error boundaries.
10. Implement build-time prerendering for public routes.
11. Implement `AppShell`, `Navbar`, and `Footer`.
12. Implement Markdown loader, parser, TOC generation, sanitizer policy, and
    enhancement hook.
13. Implement `MarkdownPage` and article layout.
14. Implement head management and JSON-LD through `@unhead/react`.
15. Implement sitemap generation from `pageData`.
16. Implement homepage feature module structure.
17. Implement team data module if the Wiki needs a team page.
18. Implement molecule visualization only if the project needs 3D scientific
    rendering.
19. Wire scripts and CI.
20. Run page validation, type check, lint, format check, and production build.
21. Verify direct route refresh, canonical URLs, internal links, static assets,
    and prerendered head tags.
22. Fix any route, sitemap, content registry, or SEO drift before delivery.

## 28. Review Checklist

Before shipping the new Wiki architecture, review these questions:

- Is `pageData.ts` the only metadata registry?
- Does `pages.ts` only attach React components?
- Does any file maintain a second route list?
- Does the sitemap script duplicate page paths?
- Does the navbar duplicate page paths?
- Does any Markdown page map route names to content paths manually?
- Does `vite.config.ts` use the same base path as the router and URL helpers?
- Are internal Markdown links base-path aware?
- Are public assets base-path aware?
- Is route-level head metadata prerendered into static HTML?
- Is raw Markdown HTML disabled or sanitized?
- Are browser DOM side effects inside hooks rather than pure services?
- Is the homepage split into smaller modules?
- Are route lazy imports wrapped in `Suspense`?
- Are route errors handled by an error boundary?
- Can static hosting serve direct route refreshes without a runtime server?
- Are package manager and CI commands consistent?
- Do all quality commands pass?
- Are accessibility requirements covered?

## 29. Default Assumptions

- The target project is the 2026 BASIS-China iGEM Wiki.
- The target architecture is React + Vite + static prerendering.
- The project is deployed as a static site.
- Markdown content is written by trusted team members.
- Raw HTML in Markdown is disabled unless sanitized.
- The Wiki needs strong content organization more than app-like global state.
- This document defines architecture and engineering rules only.
- Visual design, art direction, and branding are intentionally out of scope.
