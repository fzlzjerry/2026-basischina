# Team BASIS-China 2026 Wiki

A content-first, statically prerendered iGEM wiki built with React, Vite, and
build-time SSG. The architecture follows
[`docs/wiki-react-architecture-blueprint.md`](docs/wiki-react-architecture-blueprint.md).

This repository **MUST** contain all coding assets to generate the wiki. Images,
photos, icons, and fonts **MUST** be stored on `static.igem.wiki` (via
[tools.igem.org](https://tools.igem.org)); videos **MUST** be embedded from the
[iGEM Video Universe](https://video.igem.org). For current requirements see
[competition.igem.org/deliverables/team-wiki](https://competition.igem.org/deliverables/team-wiki).

## Key properties

- **One source of truth.** `src/config/pageData.ts` defines every page's route,
  title, navigation, footer placement, SEO, JSON-LD, sitemap entry, and Markdown
  mapping. Routes, nav, footer, sitemap, and SEO are all derived from it.
- **Build-time prerendering.** [`vite-react-ssg`](https://github.com/Daydreamer-riri/vite-react-ssg)
  emits one HTML file per route with per-route `<title>`, meta, Open Graph,
  canonical, and JSON-LD baked into the static markup — so search engines and
  social scrapers see real content without running JavaScript.
- **Markdown content runtime.** Articles support frontmatter, a table of
  contents, KaTeX math (prerendered), Prism code highlighting, Mermaid diagrams,
  and base-path-aware links/images. Raw HTML is disabled by default.
- **Accessible by contract.** One `<h1>` per route, a skip link, route focus
  management, keyboard-accessible navigation, and `prefers-reduced-motion`
  support.

## Getting started

This project uses **[Bun](https://bun.sh)** as its single package manager (CI
uses Bun too).

```bash
bun install        # install dependencies
bun run dev        # start the dev server (Vite)
bun run build      # validate + type-check + sitemap + static prerender -> dist/
bun run preview    # serve the production build locally
```

### Useful scripts

| Script                  | What it does                                            |
| ----------------------- | ------------------------------------------------------- |
| `bun run validate:pages`| Fail-fast checks on the page registry (§10)             |
| `bun run type-check`    | `tsc --noEmit` over `src/` and `scripts/`               |
| `bun run lint:check`    | ESLint                                                  |
| `bun run format:check`  | Prettier check                                          |
| `bun run check-all`     | validate + type-check + lint + format                   |
| `bun run generate:sitemap` | Write `public/sitemap.xml` + `public/robots.txt`     |
| `bun run test:smoke`    | `check-all` then a full build                           |

## Adding a page

1. Add an entry to `src/config/pageData.ts` (the only registry).
2. For a **Markdown** page: set `kind: "markdown"` and a `contentPath`, then
   create `src/content/<contentPath>.md` with frontmatter.
3. For a **React** page: set `kind: "react"` and a `componentKey`, register the
   key in `src/config/componentKeys.ts`, and map it to a lazy component in
   `src/config/pages.ts`.
4. Run `bun run validate:pages` — it fails if anything is missing or drifts.

Navigation, footer links, the sitemap, and SEO update automatically.

## Project structure

```text
src/
├── app/            -> boot, router (RouteRecord[]), and the app shell
│   ├── main.tsx        -> ViteReactSSG entry
│   ├── router.tsx      -> routes generated from the registry
│   └── shell/          -> AppShell, Navbar, Footer
├── config/         -> cross-cutting configuration
│   ├── pageData.ts     -> CANONICAL serializable page metadata
│   ├── pages.ts        -> attaches React components to pageData
│   ├── componentKeys.ts, navigation.ts, env.ts, envShared.ts, seo.ts
├── content/        -> Markdown articles (src/content/articles/**)
├── features/       -> page modules: content (Markdown runtime), home, team, molecule
├── shared/         -> components, hooks (usePageHead, etc.), utils
└── styles/         -> Tailwind entry + Markdown CSS
scripts/            -> validate-pages.ts, generate-sitemap.ts (Bun)
```

## Environment

Configured in `.env` and read through `src/config/env.ts`:

```text
VITE_TEAM_NAME=BASIS-China
VITE_TEAM_YEAR=2026
VITE_BASE_PATH=/basis-china/
VITE_SITE_URL=https://2026.igem.wiki/basis-china
```

`VITE_BASE_PATH` / `VITE_SITE_URL` are the source of truth for the Vite base,
React Router basename, canonical URLs, the sitemap, and asset resolution. CI must
build with the same values used for deployment.

## Technologies

- [React](https://react.dev) + [TypeScript](https://www.typescriptlang.org)
- [Vite](https://vite.dev) + [vite-react-ssg](https://github.com/Daydreamer-riri/vite-react-ssg) (static prerender)
- [React Router](https://reactrouter.com) (v6, data routes)
- [Tailwind CSS](https://tailwindcss.com) v4
- [markdown-it](https://github.com/markdown-it/markdown-it), [KaTeX](https://katex.org), [Prism](https://prismjs.com), [Mermaid](https://mermaid.js.org)
- Head management via vite-react-ssg's SSR-safe `<Head>` (react-helmet-async)

> **Note on the head manager.** The blueprint recommends `@unhead/react` *or an
> equivalent head manager*. This project uses vite-react-ssg's built-in `<Head>`,
> which is the documented, SSR-correct way to get per-route head tags into the
> prerendered HTML for this toolchain.

## Deployment

`bun run build` produces a static `dist/`. CI (`.gitlab-ci.yml`) publishes it to
GitLab Pages; each route is a real HTML file, so direct links and refreshes work
without a server. The wildcard route also prerenders `404.html`, keeping unknown
URLs aligned with the in-app not-found page during hydration.

## License

Content is licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
