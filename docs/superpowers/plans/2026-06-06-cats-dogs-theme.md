# Cats & Dogs (Animal-Crossing) Theme — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reskin the BASIS-China 2026 iGEM wiki into a warm, cozy Animal-Crossing "猫猫狗狗" visual system without changing content, routing, or the build pipeline.

**Architecture:** Port a WCAG-AA-verified token set into Tailwind v4 `@theme`; build 5 shared components (Icon / Button / Card / Title / Tag) plus a category-metadata module; restyle the app shell, home, Markdown surfaces, team page, and all states to consume them. No UI-library dependency (clean IP); SSG-safe throughout.

**Tech Stack:** React 18 · Vite · vite-react-ssg (build-time prerender) · Tailwind CSS v4 · react-router v6 · @phosphor-icons/react · Bun.

**Branch:** `feat/cats-dogs-theme` (codebase + spec already committed). **Spec:** `docs/superpowers/specs/2026-06-06-cats-dogs-theme-design.md`.

---

## Verification strategy (gate-driven — no unit-test runner)

This codebase has no test framework and the work is ~90% styling, so each task verifies through the project's real gates plus a new theme guard. Do **not** add a test runner.

| Gate | Command | Catches |
|---|---|---|
| Types | `bun run type-check` | Component APIs, `Record<PageCategory>` exhaustiveness, bad props |
| Registry | `bun run validate:pages` | Page-registry invariants + new single-h1 assertion |
| Theme guard | `bun run audit:theme` | `#19c8b9`-as-text, emoji, missing tokens, non-named Phosphor imports |
| Lint | `bun run lint:check` | ESLint |
| Build | `bun run build` | Full vite-react-ssg prerender (the real integration gate) |
| Visual | `bun run dev` | Human/agent eyeball of a route while styling |
| All | `bun run check-all` | validate + type-check + lint + format + **audit:theme** |

Commit after every task on `feat/cats-dogs-theme`, conventional types, ending each message with `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.

---

## File-structure map

**New files**
- `src/shared/components/Icon.tsx` — Phosphor wrapper (weight/size/aria).
- `src/shared/components/Button.tsx` — `Button` + `buttonClasses()` (primary/danger/secondary/ghost).
- `src/shared/components/Card.tsx` — plain/polka/interactive + accent rail.
- `src/shared/components/Title.tsx` — ribbon-banner heading.
- `src/shared/components/Tag.tsx` — category/status pill.
- `src/config/pageCategoryMeta.tsx` — `Record<PageCategory,{Icon,accent,label}>` (React/Phosphor lives here, NOT in `pageData.ts`).
- `scripts/audit-theme.ts` — Bun theme guard, wired into `check-all`.
- `public/favicon-catdog.svg` — themed favicon (uploaded to `static.igem.wiki/teams/6123/`).

**Modified files**
- `src/styles/main.css` — `@theme` tokens, base layer, `.ac-polka`/`.ac-ribbon`, `@media print`, `@font-face`.
- `src/styles/markdown.css` — warm article/code/table/blockquote restyle.
- `src/features/content/useMarkdownEnhancements.ts` — Mermaid `theme:'base'` + Nunito.
- `scripts/validate-pages.ts` — single-h1 assertion.
- `index.html` — body bg, `color-scheme`, themed favicon, Latin-font preload.
- `package.json` — `@phosphor-icons/react` dep + `audit:theme` script.
- App shell: `AppShell.tsx`, `Navbar.tsx`, `Footer.tsx`.
- Home: `HeroSection.tsx`, `HighlightsSection.tsx`, `MoleculeSection.tsx`, `MoleculeViewer.tsx`.
- Content: `MarkdownArticle.tsx`, `ArticleTableOfContents.tsx`, `NotFoundPage.tsx`.
- Team/states: `TeamPage.tsx`, `PageLoading.tsx`, `ErrorBoundary.tsx`.

**Execution order:** Phases run top-to-bottom. **Task 1.0 (install Phosphor) is the hard prerequisite** for every component and page phase. Within a phase, tasks are independent unless noted.

---

## Phase 1 — Tokens, base, fonts, print, guard script

> Branch: `feat/cats-dogs-theme`. All tasks commit on this branch. There is no unit-test runner; verification is gate-driven (`type-check`, `validate:pages`, `audit:theme`, `lint:check`, `build`, `dev`).
>
> Font caveat resolved at plan time: probing `https://static.igem.wiki/teams/6123/fonts/{nunito-500,nunito-700,Nunito}.woff2` returned **HTTP 403** (not 200). Per the design spec §4 verify-or-fallback rule, Task 2 ships the `@font-face` rules and the `<link rel="preload">` tags **commented out** and relies on the system fallback already present in `--font-body`. Re-run the curl checks in Task 2; if any URL returns 200 at implementation time, uncomment only the verified rules.

---

### Task 1.0: Install the Phosphor icon dependency (PREREQUISITE — run first)

**Files:** Modify `package.json` (dependencies)

Every `<Icon as={…}>` in this plan imports from this package; it MUST be installed before Phase 2. It ships pure-SVG React components (named exports) that prerender safely under vite-react-ssg.

- [ ] **Step 1: Install**

```bash
bun add @phosphor-icons/react@^2.1.7
```
Expected: `package.json` `dependencies` gains `"@phosphor-icons/react"`; `bun.lock` updates; no error.

- [ ] **Step 2: Verify present**

```bash
grep -q '@phosphor-icons/react' package.json && echo OK
```
Expected: `OK`.

- [ ] **Step 3: Commit**

```bash
git add package.json bun.lock && git commit -m "chore: add @phosphor-icons/react" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 1.1: Replace `src/styles/main.css` with the authoritative `@theme` tokens, base layer, AC helpers, and print stylesheet

**Files:** Modify `src/styles/main.css` (current lines 1–27, full file)

Current file (verbatim) is only the Tailwind import plus three preserved rules:

```css
@import "tailwindcss";

html {
  scroll-behavior: smooth;
}

/* Offset anchor jumps so headings clear the sticky navbar. */
:where([id]) {
  scroll-margin-top: 5rem;
}

/* Respect users who prefer reduced motion (§23). */
@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }

  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

The three preserved rules (`html { scroll-behavior }`, `:where([id]) { scroll-margin-top }`, the `prefers-reduced-motion` block) MUST remain unchanged. The `@theme` block goes immediately **after** `@import "tailwindcss";`. `@font-face` is added in Task 2.

- [ ] **Step 1: Overwrite `src/styles/main.css` with the full file below** (authoritative `@theme` token block + `@layer base` + `@layer components` AC helpers + `@media print`, with the three existing rules preserved verbatim)

```css
@import "tailwindcss";

/* ===========================================================================
   Design tokens (§3). Tailwind v4 auto-generates utilities from these:
   --color-page → bg-page/text-page; --radius-pill → rounded-pill;
   --shadow-btn-3d → shadow-btn-3d; --color-focus-ring → outline-focus-ring; etc.
   All color values are WCAG-AA-verified. @font-face lives OUTSIDE @theme (Task 2).
   =========================================================================== */
@theme {
  /* ---- Surfaces & ink ---- */
  --color-page: #f8f8f0;
  --color-surface: #f7f3df;
  --color-surface-2: #f9f7f0;
  --color-hover: #f0ede5;
  --color-ink: #794f27;
  --color-ink-soft: #725d42;
  --color-ink-secondary: #9f927d;
  --color-ink-muted: #8a7b66;
  --color-placeholder: #6b5e50;
  --color-disabled: #c4b89e;

  /* ---- Brand primary (teal). NOTE: #19c8b9 is decorative-only; never text. ---- */
  --color-primary: #19c8b9;
  --color-primary-deep: #0d6f63;
  --color-primary-soft: #e6f9f6;
  --color-primary-rail: #0a5249;

  /* ---- Status ---- */
  --color-success: #2f7a36;
  --color-success-soft: #eaf4e7;
  --color-warning: #946011;
  --color-warning-soft: #fbf1d6;
  --color-error: #c0392b;
  --color-error-soft: #fdecea;
  --color-error-rail: #8a2a20;

  /* ---- Focus ---- */
  --color-focus-ring: #794f27;
  --color-focus-on-dark: #ffcc00;

  /* ---- Borders ---- */
  --color-border: #8a7b66;
  --color-border-soft: #c4b89e;

  /* ---- Footer ---- */
  --color-footer: #794f27;
  --color-footer-divider: #6b5b47;
  --color-footer-text: #f0ede5;
  --color-footer-text-muted: #d9cec4;

  /* ---- NookPhone accent palette: LIGHT = backgrounds/rails, INK = text/icon ---- */
  --color-app-teal: #82d5bb;
  --color-app-teal-ink: #1f7a5e;
  --color-app-blue: #889df0;
  --color-app-blue-ink: #2f4fa8;
  --color-app-purple: #b77dee;
  --color-app-purple-ink: #6a3fa0;
  --color-app-green: #8ac68a;
  --color-app-green-ink: #2f7a36;
  --color-app-peach: #e18c6f;
  --color-app-peach-ink: #b04a28;
  --color-app-pink: #f8a6b2;
  --color-app-pink-ink: #b03a52;

  /* ---- Radii (min 12px on interactive; never 0) ---- */
  --radius-min: 12px;
  --radius-badge: 10px;
  --radius-tooltip: 16px;
  --radius-card: 20px;
  --radius-pill: 50px;

  /* ---- Shadows ---- */
  --shadow-soft: 0 2px 4px rgb(61 52 40 / 0.06);
  --shadow-soft-hover: 0 4px 12px rgb(61 52 40 / 0.10);
  --shadow-card-lift: 0 4px 12px rgb(61 52 40 / 0.08);
  --shadow-btn-3d: 0 5px 0 0 var(--color-primary-rail);
  --shadow-btn-3d-hover: 0 6px 0 0 var(--color-primary-rail);
  --shadow-btn-3d-active: 0 1px 0 0 var(--color-primary-rail);
  --shadow-btn-danger: 0 5px 0 0 var(--color-error-rail);
  --shadow-btn-danger-hover: 0 6px 0 0 var(--color-error-rail);
  --shadow-btn-danger-active: 0 1px 0 0 var(--color-error-rail);

  /* ---- Fonts (families only; @font-face outside @theme, see Task 2) ---- */
  --font-body: "Nunito", "Noto Sans SC", -apple-system, "PingFang SC", sans-serif;
  --font-display: "Nunito", "Noto Sans SC", -apple-system, "PingFang SC", sans-serif;

  /* ---- Easing + global transition default ---- */
  --ease-cozy: cubic-bezier(0.4, 0, 0.2, 1);
  --default-transition-duration: 0.25s;
  --default-transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

@layer base {
  body {
    background-color: var(--color-page);
    color: var(--color-ink-soft);
    font-family: var(--font-body);
    font-weight: 500; /* AC body weight */
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
  }
  :root {
    color-scheme: light; /* light-only; stop UA dark-mode inversion */
  }
}

/* ===========================================================================
   AC helper classes (consumed by Card.tsx / Title.tsx in Phase 2).
   =========================================================================== */
@layer components {
  /* Decorative polka-dot texture (aria-hidden surfaces only). */
  .ac-polka {
    background-image: radial-gradient(
      rgb(138 123 102 / 0.14) 1.5px,
      transparent 1.5px
    );
    background-size: 26px 26px;
  }

  /* Ribbon banner: cozy primary-soft pill with triangular swallowtail ends. */
  .ac-ribbon {
    position: relative;
    display: inline-block;
    background-color: var(--color-primary-soft);
    border: 2px solid var(--color-border);
    color: var(--color-ink);
    font-weight: 900;
    padding: 0.35em 1.4em;
    border-radius: var(--radius-min);
  }
  .ac-ribbon::before,
  .ac-ribbon::after {
    content: "";
    position: absolute;
    top: 50%;
    width: 0;
    height: 0;
    transform: translateY(-50%);
    border-block: 0.55em solid transparent;
  }
  .ac-ribbon::before {
    left: -0.5em;
    border-right: 0.55em solid var(--color-border);
  }
  .ac-ribbon::after {
    right: -0.5em;
    border-left: 0.55em solid var(--color-border);
  }
}

html {
  scroll-behavior: smooth;
}

/* Offset anchor jumps so headings clear the sticky navbar. */
:where([id]) {
  scroll-margin-top: 5rem;
}

/* Respect users who prefer reduced motion (§23). */
@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }

  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* ===========================================================================
   Print stylesheet (§14): hide chrome, flatten depth, black-on-white body+code,
   expand collapsibles/TOC, show link URLs, avoid breaking inside cards/figures.
   =========================================================================== */
@media print {
  nav,
  header,
  footer,
  [data-print-hide] {
    display: none !important;
  }

  body {
    background: #fff !important;
    color: #000 !important;
  }

  *,
  *::before,
  *::after {
    box-shadow: none !important;
    text-shadow: none !important;
  }

  pre,
  code {
    background: #fff !important;
    color: #000 !important;
    border: 1px solid #000 !important;
  }

  /* Expand collapsibles and TOC so nothing is hidden on paper. */
  details {
    display: block !important;
  }
  details > summary {
    display: none !important;
  }
  details[data-print-expand],
  [data-collapsible] {
    height: auto !important;
    max-height: none !important;
    overflow: visible !important;
  }

  /* Surface link targets next to their anchor text. */
  a[href^="http"]::after {
    content: " (" attr(href) ")";
    font-size: 0.85em;
    word-break: break-all;
  }

  /* Keep figures and cards intact across page breaks. */
  figure,
  pre,
  table,
  [data-card] {
    break-inside: avoid;
    page-break-inside: avoid;
  }
}
```

- [ ] **Step 2: Verify the build compiles the new CSS** (cheapest sufficient gate is the full SSG build, since `type-check` does not touch CSS and the token utilities must resolve through Tailwind v4's vite plugin)

```
bun run build
```

Expected: build completes with `✓ built` (vite-react-ssg prerender succeeds) and no "Cannot apply unknown utility class" / unresolved `@theme` errors. (`bun run audit:theme` does not exist yet — it is added in Task 3.)

- [ ] **Step 3: Commit**

```
git add src/styles/main.css && git commit -m "feat: add AC theme tokens, base layer, AC helpers, and print stylesheet" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 1.2: Add self-hosted `@font-face` (verify-or-fallback) to `main.css`

**Files:** Modify `src/styles/main.css` (insert `@font-face` block after the `@theme` block / before `@layer base`)

> At plan time the candidate font URLs returned **HTTP 403**, so the `@font-face` rules below ship **commented out** and the system fallback stack in `--font-body` is used. Step 1 re-runs the probe; uncomment only the rules whose URL returns 200.

- [ ] **Step 1: Re-probe each candidate font URL (verify-or-fallback gate)**

```
for w in 400 500 600 700 900; do printf "nunito-%s.woff2 -> " "$w"; curl -s -o /dev/null -w "%{http_code}\n" --max-time 12 "https://static.igem.wiki/teams/6123/fonts/nunito-$w.woff2"; done
for w in 400 500 700; do printf "noto-sans-sc-%s.woff2 -> " "$w"; curl -s -o /dev/null -w "%{http_code}\n" --max-time 12 "https://static.igem.wiki/teams/6123/fonts/noto-sans-sc-$w.woff2"; done
```

Expected (as observed at plan time): each line prints `403` (or `404`). **Decision rule:** if a URL prints `200`, leave that one `@font-face` rule (and, for Nunito 500/700 only, its `index.html` preload) **uncommented** in Step 2/Step 3; for every URL that is NOT `200`, keep that rule **commented out**. With all-403, ship everything commented (the documented fallback path).

- [ ] **Step 2: Insert the commented `@font-face` block into `src/styles/main.css`** — place it immediately after the closing `}` of the `@theme` block and before `@layer base {`. Locate this exact boundary text:

```css
  --default-transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

@layer base {
```

Replace it with:

```css
  --default-transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* ===========================================================================
   Self-hosted fonts (§4, iGEM rule: fonts MUST live on static.igem.wiki).
   Probed at implementation time — every candidate URL returned HTTP 403, so
   these rules are COMMENTED OUT and the site uses the system fallback stack
   already declared in --font-body / --font-display (degrades safely: no broken
   text, just non-brand fonts). Uncomment any rule whose URL returns 200 per the
   Task 2 Step 1 curl probe; adjust filenames to the real uploaded names.
   =========================================================================== */
/*
@font-face { font-family: "Nunito"; src: url("https://static.igem.wiki/teams/6123/fonts/nunito-400.woff2") format("woff2"); font-weight: 400; font-style: normal; font-display: swap; }
@font-face { font-family: "Nunito"; src: url("https://static.igem.wiki/teams/6123/fonts/nunito-500.woff2") format("woff2"); font-weight: 500; font-style: normal; font-display: swap; }
@font-face { font-family: "Nunito"; src: url("https://static.igem.wiki/teams/6123/fonts/nunito-600.woff2") format("woff2"); font-weight: 600; font-style: normal; font-display: swap; }
@font-face { font-family: "Nunito"; src: url("https://static.igem.wiki/teams/6123/fonts/nunito-700.woff2") format("woff2"); font-weight: 700; font-style: normal; font-display: swap; }
@font-face { font-family: "Nunito"; src: url("https://static.igem.wiki/teams/6123/fonts/nunito-900.woff2") format("woff2"); font-weight: 900; font-style: normal; font-display: swap; }
@font-face { font-family: "Noto Sans SC"; src: url("https://static.igem.wiki/teams/6123/fonts/noto-sans-sc-400.woff2") format("woff2"); font-weight: 400; font-style: normal; font-display: swap; }
@font-face { font-family: "Noto Sans SC"; src: url("https://static.igem.wiki/teams/6123/fonts/noto-sans-sc-500.woff2") format("woff2"); font-weight: 500; font-style: normal; font-display: swap; }
@font-face { font-family: "Noto Sans SC"; src: url("https://static.igem.wiki/teams/6123/fonts/noto-sans-sc-700.woff2") format("woff2"); font-weight: 700; font-style: normal; font-display: swap; }
*/

@layer base {
```

- [ ] **Step 3: Verify the build still prerenders with the @font-face edit**

```
bun run build
```

Expected: `✓ built` with no errors. (Commented `@font-face` rules are inert; the system-font fallback renders.)

- [ ] **Step 4: Commit**

```
git add src/styles/main.css && git commit -m "feat: add self-hosted @font-face (verify-or-fallback) with system-font fallback" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 1.3: Add the `audit:theme` guard script and wire it into `package.json`

**Files:** Create `scripts/audit-theme.ts` ; Modify `package.json` (current lines 8–22 `"scripts"` block)

> The guard walks `src/**/*.{ts,tsx,css}` only (per the spec contract). It deliberately does NOT walk `scripts/`, so this audit file's own regex strings and the `#19c8b9` literal it references cannot self-trip. The single allowed `#19c8b9` occurrence is the `--color-primary: #19c8b9;` definition line inside `src/styles/main.css`.

- [ ] **Step 1: Create `scripts/audit-theme.ts`** with the full content below

```ts
/**
 * Theme guard (§3 / §17). Walks src/**/*.{ts,tsx,css} and fails (exit 1) on:
 *   (a) `text-primary` used as a bare utility (must be `text-primary-deep`, etc.)
 *   (b) any literal #19c8b9 OUTSIDE the single `--color-primary:` definition line
 *   (c) any emoji glyph (the site is SVG-only — Phosphor icons, never emoji)
 *   (d) missing required design tokens in src/styles/main.css
 *
 * Bun script. Intentionally scoped to src/ only, so this file's own regex
 * sources and the #19c8b9 literal below are never scanned (no self-trip).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = path.join(root, "src");
const mainCssRel = "src/styles/main.css";

type Finding = { file: string; line: number; rule: string; text: string };
const findings: Finding[] = [];

// (a) bare `text-primary` utility (allow text-primary-deep / -soft / -rail).
const bareTextPrimary = /\btext-primary\b(?!-)/;
// (b) the brand teal literal, any case.
const tealLiteral = /#19c8b9/i;
// the one line allowed to contain the teal literal.
const primaryDef = /--color-primary:\s*#19c8b9/i;
// (e) Phosphor must be imported via NAMED imports only (default / namespace are banned).
const phosphorBadImport = /import\s+(?:\*\s+as\s+\w+|\w+)\s+from\s+["']@phosphor-icons\/react["']/;
// (c) emoji: pictographs, symbols, dingbats, regional indicators, variation
// selectors, ZWJ. Excludes ordinary CJK/Latin text used across the wiki.
const emoji =
  /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{1F1E6}-\u{1F1FF}\u{FE0F}\u{200D}\u{2190}-\u{21FF}\u{2300}-\u{23FF}]/u;
// Arrows (←↑→↓) live in the 2190–21FF range above; the theme replaces them with
// Phosphor PawPrint, so they are correctly flagged as non-SVG glyphs.

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walk(full));
    } else if (/\.(ts|tsx|css)$/.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

const files = walk(srcDir);
for (const file of files) {
  const rel = path.relative(root, file);
  const lines = fs.readFileSync(file, "utf8").split("\n");
  lines.forEach((text, i) => {
    const lineNo = i + 1;
    if (bareTextPrimary.test(text)) {
      findings.push({ file: rel, line: lineNo, rule: "bare text-primary", text: text.trim() });
    }
    if (tealLiteral.test(text) && !primaryDef.test(text)) {
      findings.push({ file: rel, line: lineNo, rule: "#19c8b9 outside --color-primary def", text: text.trim() });
    }
    if (emoji.test(text)) {
      findings.push({ file: rel, line: lineNo, rule: "emoji / non-SVG glyph", text: text.trim() });
    }
    if (phosphorBadImport.test(text)) {
      findings.push({ file: rel, line: lineNo, rule: "non-named @phosphor-icons/react import (use named imports)", text: text.trim() });
    }
  });
}

// (d) required token presence in main.css.
const requiredTokens = [
  "--color-page",
  "--color-surface",
  "--color-ink",
  "--color-ink-soft",
  "--color-primary",
  "--color-primary-deep",
  "--color-primary-soft",
  "--color-primary-rail",
  "--color-error",
  "--color-error-rail",
  "--color-focus-ring",
  "--color-focus-on-dark",
  "--color-border",
  "--color-app-teal",
  "--color-app-teal-ink",
  "--color-app-blue",
  "--color-app-purple",
  "--color-app-green",
  "--color-app-peach",
  "--color-app-pink",
  "--radius-min",
  "--radius-card",
  "--radius-pill",
  "--shadow-soft",
  "--shadow-btn-3d",
  "--shadow-btn-danger",
  "--font-body",
  "--ease-cozy",
];
const mainCssPath = path.join(root, mainCssRel);
const missingTokens: string[] = [];
if (!fs.existsSync(mainCssPath)) {
  missingTokens.push(`(file missing: ${mainCssRel})`);
} else {
  const css = fs.readFileSync(mainCssPath, "utf8");
  for (const token of requiredTokens) {
    if (!new RegExp(`${token}\\s*:`).test(css)) missingTokens.push(token);
  }
}

// --- Report -----------------------------------------------------------------
let failed = false;
if (findings.length > 0) {
  failed = true;
  console.error(`\n✖ Theme audit found ${findings.length} forbidden glyph/class issue(s):\n`);
  for (const f of findings) {
    console.error(`  - ${f.file}:${f.line} [${f.rule}]  ${f.text}`);
  }
}
if (missingTokens.length > 0) {
  failed = true;
  console.error(`\n✖ Theme audit: ${missingTokens.length} required token(s) missing from ${mainCssRel}:\n`);
  for (const t of missingTokens) console.error(`  - ${t}`);
}

if (failed) {
  console.error("");
  process.exit(1);
}

console.log(`✓ Theme audit passed (${files.length} src files scanned, ${requiredTokens.length} tokens present).`);
```

- [ ] **Step 2: Add the `audit:theme` script and append it to `check-all` in `package.json`** — current `"scripts"` block (lines 8–22) is:

```json
  "scripts": {
    "dev": "vite",
    "build": "bun run validate:pages && bun run type-check && bun run generate:sitemap && vite-react-ssg build",
    "build:fast": "vite-react-ssg build",
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
  },
```

Replace it with (adds `"audit:theme"`, and inserts `bun run audit:theme` into `check-all` right after `type-check`):

```json
  "scripts": {
    "dev": "vite",
    "build": "bun run validate:pages && bun run type-check && bun run generate:sitemap && vite-react-ssg build",
    "build:fast": "vite-react-ssg build",
    "preview": "vite preview",
    "type-check": "tsc --noEmit",
    "lint": "eslint . --fix",
    "lint:check": "eslint .",
    "format": "prettier --write \"src/**/*.{ts,tsx,css,md,json}\" \"scripts/**/*.ts\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx,css,md,json}\" \"scripts/**/*.ts\"",
    "check-all": "bun run validate:pages && bun run type-check && bun run audit:theme && bun run lint:check && bun run format:check",
    "validate:pages": "bun scripts/validate-pages.ts",
    "generate:sitemap": "bun scripts/generate-sitemap.ts",
    "audit:theme": "bun scripts/audit-theme.ts",
    "test:smoke": "bun run check-all && bun run build"
  },
```

- [ ] **Step 3: Run the guard to establish the baseline (NOT green yet — expected)**

```
bun run audit:theme; echo "exit=$?"
```

Expected: a **non-zero** exit (`exit=1`) listing the pre-existing non-SVG glyphs still in the un-reskinned source — at least `☰` / `✕` in `src/app/shell/Navbar.tsx` and `→` in `src/features/home/sections/HighlightsSection.tsx` (rule `emoji / non-SVG glyph`). This is correct: those glyphs become Phosphor `<Icon>`s in Phases 4–5, and the token-presence check already passes (Phase 1 added the tokens). The guard turns **green** once Phases 4–7 land; it is enforced as a hard gate in Phase 8 (the first place `check-all` is expected to pass).

- [ ] **Step 4: Prove the guard FAILS on a forbidden glyph (negative case, then revert)** — temporarily inject a bare `text-primary` to confirm a non-zero exit, then undo it so the tree stays clean.

```
printf '\n/* audit-self-test text-primary */\n' >> src/styles/main.css && bun run audit:theme; echo "exit=$?"; git checkout -- src/styles/main.css
```

Expected: report prints `✖ Theme audit found 1 forbidden glyph/class issue(s):` with a `[bare text-primary]` line pointing at `src/styles/main.css`, then `exit=1`; `git checkout` restores the file so `git status` shows `main.css` unmodified afterward.

- [ ] **Step 5: Commit** (the guard is created + wired into `check-all`; it stays red on the legacy glyphs until Phases 4–7 clear them)

```
git add scripts/audit-theme.ts package.json && git commit -m "chore: add audit:theme guard (no bare text-primary, no #19c8b9 text, no emoji, token presence) and wire into check-all" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```


---

## Phase 2 — Shared components (Icon, Button, Card, Title, Tag)

> **Dependency-ordering note (read first):** These five components consume tokens/utilities and the icon package introduced by other phases:
> - **`@phosphor-icons/react`** is installed in **Task 1.0** (the global prerequisite that runs before every other phase). `Icon.tsx` imports a type from it (`import type { IconProps } from "@phosphor-icons/react"`); because Task 1.0 ran first, `bun run type-check` resolves it cleanly here.
> - The `@theme` token block and the `.ac-polka` / `.ac-ribbon` `@layer components` helpers are added in **Phase 1**. They generate the Tailwind utilities (`bg-app-teal`, `rounded-pill`, `shadow-btn-3d`, …) these components reference. `tsc` does **not** evaluate Tailwind class strings, so `type-check` passes for Button/Card/Title/Tag regardless; the classes only need Phase 1 to be present for `bun run audit:theme` / `bun run build` / visual checks.
>
> **Ordering inside this phase:** Build the four Phosphor-free components first (each is independently `type-check`-clean the moment it is written), then `Icon.tsx` last. Task 1.0 already installed Phosphor, so `Icon.tsx` type-checks immediately.
>
> No `clsx`/`classnames`/`tailwind-merge` dependency exists in this repo (verified in `package.json`), so each component uses a tiny local `cx(...)` helper (filter-falsy + join) for className composition — zero new dependencies, fully typed.

---

### Task 2.1: Create `Button.tsx` + exported `buttonClasses()`

**Files:** Create `src/shared/components/Button.tsx`

- [ ] **Step 1: Write the Button component and `buttonClasses` helper** matching the CONTRACT base/size/variant strings exactly.

```tsx
import type { ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "danger" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-pill font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0";

const SIZES: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-base",
  lg: "px-7 py-3.5 text-lg",
};

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-primary-deep text-white shadow-btn-3d focus-visible:outline-focus-on-dark hover:shadow-btn-3d-hover hover:-translate-y-px active:shadow-btn-3d-active active:translate-y-0.5",
  danger:
    "bg-error text-white shadow-btn-danger focus-visible:outline-focus-on-dark hover:shadow-btn-danger-hover hover:-translate-y-px active:shadow-btn-danger-active active:translate-y-0.5",
  secondary:
    "bg-surface text-primary-deep border-2 border-border shadow-soft focus-visible:outline-focus-ring hover:-translate-y-px hover:shadow-soft-hover hover:border-primary-deep active:translate-y-0.5",
  ghost:
    "bg-transparent text-primary-deep focus-visible:outline-focus-ring hover:bg-primary-soft",
};

/**
 * Returns the full class string for a button surface. Use on `<Button>` or on a
 * `<Link className={buttonClasses(...)}>` that should look like a button.
 */
export function buttonClasses(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  extra?: string,
): string {
  return [BASE, SIZES[size], VARIANTS[variant], extra]
    .filter(Boolean)
    .join(" ");
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  type = "button",
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClasses(variant, size, className)}
      {...rest}
    >
      {children}
    </button>
  );
}
```

- [ ] **Step 2: Verify types** (Button imports no Phosphor — gate passes immediately).

```
bun run type-check
```
Expected: command exits 0 with no output (no TypeScript errors).

- [ ] **Step 3: Commit.**

```
git add src/shared/components/Button.tsx && git commit -m "feat: add Button component with buttonClasses helper" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 2.2: Create `Card.tsx` (plain / polka / interactive + accent left-rail)

**Files:** Create `src/shared/components/Card.tsx`

- [ ] **Step 1: Write the Card component.** Base `bg-surface rounded-card border-2 border-border` with padding `p-8` (or `p-4` when `compact`); `plain`→`shadow-soft`; `polka`→`shadow-soft ac-polka`; `interactive`→focusable hover-lift; `accent`→`border-l-4 border-<accent>` mapped to the `--color-app-*` tokens.

```tsx
import type { ReactNode } from "react";

export type CardVariant = "plain" | "polka" | "interactive";
export type CardAccent = "teal" | "blue" | "purple" | "green" | "peach" | "pink";

const VARIANTS: Record<CardVariant, string> = {
  plain: "shadow-soft",
  polka: "shadow-soft ac-polka",
  interactive:
    "shadow-soft transition hover:-translate-y-0.5 hover:shadow-card-lift focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-focus-ring",
};

const ACCENTS: Record<CardAccent, string> = {
  teal: "border-l-4 border-app-teal",
  blue: "border-l-4 border-app-blue",
  purple: "border-l-4 border-app-purple",
  green: "border-l-4 border-app-green",
  peach: "border-l-4 border-app-peach",
  pink: "border-l-4 border-app-pink",
};

function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export interface CardProps {
  variant?: CardVariant;
  accent?: CardAccent;
  compact?: boolean;
  className?: string;
  children?: ReactNode;
}

export function Card({
  variant = "plain",
  accent,
  compact = false,
  className,
  children,
}: CardProps) {
  return (
    <div
      className={cx(
        "bg-surface rounded-card border-2 border-border text-ink",
        compact ? "p-4" : "p-8",
        VARIANTS[variant],
        accent && ACCENTS[accent],
        className,
      )}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Verify types** (no Phosphor import).

```
bun run type-check
```
Expected: command exits 0 with no output (no TypeScript errors).

- [ ] **Step 3: Commit.**

```
git add src/shared/components/Card.tsx && git commit -m "feat: add Card component with plain/polka/interactive variants and accent rail" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 2.3: Create `Title.tsx` (ribbon heading)

**Files:** Create `src/shared/components/Title.tsx`

- [ ] **Step 1: Write the Title component.** Renders the semantic heading tag (`h1`/`h2`/`h3`) sized per level, wrapping a `span.ac-ribbon` (the swallowtail banner styling lives in `.ac-ribbon`, added in Phase 1). `align` controls block alignment of the inline-block ribbon.

```tsx
import type { ReactNode } from "react";

export type TitleLevel = "h1" | "h2" | "h3";
export type TitleAlign = "left" | "center";

const SIZES: Record<TitleLevel, string> = {
  h1: "text-3xl sm:text-4xl",
  h2: "text-2xl sm:text-3xl",
  h3: "text-xl sm:text-2xl",
};

const ALIGN: Record<TitleAlign, string> = {
  left: "text-left",
  center: "text-center",
};

function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export interface TitleProps {
  level?: TitleLevel;
  align?: TitleAlign;
  className?: string;
  children?: ReactNode;
}

export function Title({
  level = "h2",
  align = "left",
  className,
  children,
}: TitleProps) {
  const Heading = level;
  return (
    <Heading className={cx(SIZES[level], ALIGN[align], className)}>
      <span className="ac-ribbon">{children}</span>
    </Heading>
  );
}
```

- [ ] **Step 2: Verify types** (no Phosphor import).

```
bun run type-check
```
Expected: command exits 0 with no output (no TypeScript errors).

- [ ] **Step 3: Commit.**

```
git add src/shared/components/Title.tsx && git commit -m "feat: add Title ribbon heading component" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 2.4: Create `Tag.tsx` (category + status tones)

**Files:** Create `src/shared/components/Tag.tsx`

- [ ] **Step 1: Write the Tag component.** Non-interactive badge: `rounded-badge px-2.5 py-0.5 text-xs font-semibold inline-flex items-center gap-1`. Category tones map to `bg-app-<accent>/15` + `text-app-<accent>-ink`; status tones (`success/warning/error/info`) map to soft bg + matching ink token. An optional leading Phosphor glyph is passed by the caller as `children` (e.g. `<Icon as={...} size="xs" />`) — Tag itself stays Phosphor-free.

```tsx
import type { ReactNode } from "react";

export type TagTone =
  | "teal"
  | "blue"
  | "purple"
  | "green"
  | "peach"
  | "pink"
  | "success"
  | "warning"
  | "error"
  | "info";

const TONES: Record<TagTone, string> = {
  teal: "bg-app-teal/15 text-app-teal-ink",
  blue: "bg-app-blue/15 text-app-blue-ink",
  purple: "bg-app-purple/15 text-app-purple-ink",
  green: "bg-app-green/15 text-app-green-ink",
  peach: "bg-app-peach/15 text-app-peach-ink",
  pink: "bg-app-pink/15 text-app-pink-ink",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  error: "bg-error-soft text-error",
  info: "bg-primary-soft text-primary-deep",
};

function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export interface TagProps {
  tone?: TagTone;
  className?: string;
  children?: ReactNode;
}

export function Tag({ tone = "info", className, children }: TagProps) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 rounded-badge px-2.5 py-0.5 text-xs font-semibold",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
```

- [ ] **Step 2: Verify types** (no Phosphor import).

```
bun run type-check
```
Expected: command exits 0 with no output (no TypeScript errors).

- [ ] **Step 3: Commit.**

```
git add src/shared/components/Tag.tsx && git commit -m "feat: add Tag component with category and status tones" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 2.5: Create `Icon.tsx` (Phosphor wrapper)

> **Depends on Task 1.0** (`@phosphor-icons/react` in `package.json` + `bun install`). The `import type { IconProps }` line resolves only after that install. The `as` prop is typed `ComponentType<IconProps>` (Phosphor icon components are `ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>>`, assignable to it). We import **only** `IconProps` — never Phosphor's own `Icon` type — to avoid a name collision with this component.

**Files:** Create `src/shared/components/Icon.tsx`

- [ ] **Step 1: Write the Icon wrapper.** Size map `xs:16 / sm:20 / md:24 / lg:32`; `weight` defaults to `"duotone"`; color flows via `currentColor` (caller sets a `text-*` token class through `className`); `aria-hidden` by default, but when `title` is passed → `role="img"` + `aria-label={title}`. Never barrel-imports Phosphor.

```tsx
import type { ComponentType } from "react";
import type { IconProps as PhosphorIconProps } from "@phosphor-icons/react";

export type IconSize = "xs" | "sm" | "md" | "lg";

const SIZES: Record<IconSize, number> = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
};

export interface IconProps extends Omit<PhosphorIconProps, "size" | "weight" | "ref"> {
  /** A named Phosphor component, e.g. `import { PawPrint } from "@phosphor-icons/react"`. */
  as: ComponentType<PhosphorIconProps>;
  size?: IconSize;
  weight?: PhosphorIconProps["weight"];
  className?: string;
  /** When set, the icon is announced: `role="img"` + `aria-label`. Otherwise `aria-hidden`. */
  title?: string;
}

export function Icon({
  as: Glyph,
  size = "sm",
  weight = "duotone",
  className,
  title,
  ...rest
}: IconProps) {
  const labelled = title !== undefined;
  return (
    <Glyph
      size={SIZES[size]}
      weight={weight}
      className={className}
      color="currentColor"
      aria-hidden={labelled ? undefined : true}
      role={labelled ? "img" : undefined}
      aria-label={labelled ? title : undefined}
      {...rest}
    />
  );
}
```

- [ ] **Step 2: Verify types.**

```
bun run type-check
```
Expected (after Task 1.0 has installed `@phosphor-icons/react`): command exits 0 with no output. If Task 1.0 has **not** yet run, expect exactly `error TS2307: Cannot find module '@phosphor-icons/react'` on the `import type` line — re-run this gate once Task 1.0 lands; no other component is affected.

- [ ] **Step 3: Commit.**

```
git add src/shared/components/Icon.tsx && git commit -m "feat: add Icon Phosphor wrapper with size and aria handling" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 2.6: Phase-wide gate (lint + full type-check)

**Files:** Modify none (verification only).

- [ ] **Step 1: Lint the new components** (catches `react-refresh/only-export-components`; `buttonClasses` is exported alongside `Button` from the same file, which is the documented Tailwind/shadcn pattern and only triggers a `warn`, not an error, under this repo's `.eslintrc.cjs`).

```
bun run lint:check
```
Expected: no errors (exit 0). At most a `react-refresh/only-export-components` warning on `Button.tsx`/`Icon.tsx`/`Tag.tsx`/`Card.tsx`/`Title.tsx`; warnings do not fail the gate.

- [ ] **Step 2: Full type-check across the five components** (run after Task 1.0 so `Icon.tsx`'s Phosphor import resolves).

```
bun run type-check
```
Expected: command exits 0 with no output (no TypeScript errors) — confirms all five components satisfy the CONTRACT APIs (`Icon`, `Button` + `buttonClasses`, `Card`, `Title`, `Tag`).


---

## Phase 3 — Category metadata + single-h1 assertion

### Task 3.1: Create `pageCategoryMeta.tsx` (the only React/Phosphor home for category icons)

**Files:**
- Create: `src/config/pageCategoryMeta.tsx`

Per the shared contract, `pageData.ts` and `navigation.ts` must stay React/Phosphor-free (Bun scripts import them). This new `.tsx` module is the single presentation layer that maps each `PageCategory` to its Phosphor `Icon`, accent token, and label. Typing it as `Record<PageCategory, CategoryMeta>` makes `tsc` enforce that **all 7 keys are present** (exhaustiveness) — drop or misname a key and `bun run type-check` fails. `@phosphor-icons/react` is already a dependency (added in the icon-system phase), and named imports are required by the spec.

- [ ] **Step 1: Write the full module.** The seven keys are exactly `home | project | wet-lab | dry-lab | human-practices | team | other` (the `PageCategory` union from `src/config/pageData.ts`, lines 13–20). Accent strings are constrained to the `Card` accent union so consumers can pass `meta.accent` straight into `<Card accent={...}>`.

```tsx
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
```

- [ ] **Step 2: Verify exhaustiveness + types.** Run the type gate (it loads `react-jsx` from `tsconfig.json` and resolves the `@phosphor-icons/react` named imports + the `Record<PageCategory>` keys).

```bash
bun run type-check
```

Expected: completes with no output and exit code 0 (tsc `--noEmit` passes; all 7 PageCategory keys present, no missing/extra keys, Phosphor imports resolve).

- [ ] **Step 3: Commit.**

```bash
git add src/config/pageCategoryMeta.tsx && git commit -m "feat: add pageCategoryMeta with per-category Phosphor icons" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 3.2: Add the single-h1 (no level-1 heading in article bodies) assertion to `validate-pages.ts`

**Files:**
- Modify: `scripts/validate-pages.ts` (insert a new check block after the per-page loop ends at line 87 and before the "Every component key must be used" section at line 89)

The one-h1-per-route contract requires that the route layout renders the page `<h1>` and every Markdown article body therefore starts at `##`. We enforce it in `validate:pages` by scanning each `*.md` file under `src/content` for a level-1 heading (`# ` at line start) **outside** fenced code blocks and **outside** frontmatter. This must skip fences: `src/content/articles/wet-lab/experiments.md` line 61 contains `# Example: average normalized signal across replicates`, which is a **Python comment inside a ```python fence** — a naive `^# ` match would falsely fail. The new code tracks ``` / `~~~` fence toggling and strips the leading `---…---` frontmatter, so it flags only real Markdown H1s in the body.

The current file (read in full): it imports `fs`/`path`, derives `contentDir` (line 18), pushes into `errors[]` via `fail()` (lines 21–22), runs a per-page loop closing at line 87, then a component-key loop (89–96) and the report (98–106).

- [ ] **Step 1: Insert the assertion block.** Place it exactly between the close of the per-page loop and the component-key section. The current lines are:

```ts
    referencedKeys.add(page.componentKey);
  }
}

// --- Every component key must be used (unless reserved) ------------------------
```

Replace that exact span with (adds the new block, keeps the existing closing `}` and the component-key comment intact):

```ts
    referencedKeys.add(page.componentKey);
  }
}

// --- No level-1 headings in Markdown bodies (single-h1-per-route) --------------
// Each route's layout renders the page <h1>; article bodies must start at "##".
// We scan every src/content/**/*.md for "# " at line start, ignoring frontmatter
// and fenced code blocks (e.g. a "# comment" inside a ```python block is fine).
const collectMarkdownFiles = (dir: string): string[] => {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...collectMarkdownFiles(full));
    else if (entry.isFile() && entry.name.endsWith(".md")) out.push(full);
  }
  return out;
};

const findLevel1Heading = (source: string): number | null => {
  const lines = source.split(/\r?\n/);
  let index = 0;

  // Strip leading YAML frontmatter ("---" on the first line ... closing "---").
  if (lines[0]?.trim() === "---") {
    index = 1;
    while (index < lines.length && lines[index]?.trim() !== "---") index += 1;
    index += 1; // step past the closing delimiter
  }

  let inFence = false;
  let fenceMarker = "";
  for (; index < lines.length; index += 1) {
    const line = lines[index] ?? "";
    const fence = line.match(/^\s*(```+|~~~+)/);
    if (fence) {
      const marker = fence[1].startsWith("`") ? "`" : "~";
      if (!inFence) {
        inFence = true;
        fenceMarker = marker;
      } else if (marker === fenceMarker) {
        inFence = false;
        fenceMarker = "";
      }
      continue;
    }
    if (!inFence && /^# \S/.test(line)) return index + 1; // 1-based line number
  }
  return null;
};

if (fs.existsSync(contentDir)) {
  for (const file of collectMarkdownFiles(contentDir)) {
    const rel = path.relative(contentDir, file);
    const lineNo = findLevel1Heading(fs.readFileSync(file, "utf8"));
    if (lineNo !== null) {
      fail(
        `src/content/${rel}: level-1 heading at line ${lineNo}. Article bodies must start at "##" — the route layout owns the page <h1>.`,
      );
    }
  }
}

// --- Every component key must be used (unless reserved) ------------------------
```

- [ ] **Step 2: Verify the registry gate now includes the new assertion and still PASSES.** The only `# ` in `src/content` is inside a ```python fence in `experiments.md`, so a correct fence-aware scan must not flag it.

```bash
bun run validate:pages
```

Expected: `✓ Page validation passed (N pages).` (exit code 0; the fenced `# Example:` comment in `wet-lab/experiments.md` is correctly ignored).

- [ ] **Step 3 (negative check — temporary, do not commit): prove the assertion actually catches a real H1.** Append a real level-1 heading to a body, confirm it FAILS, then revert.

```bash
printf '\n# Stray top-level heading\n' >> src/content/articles/team/attributions.md && bun run validate:pages; echo "exit=$?"; git checkout -- src/content/articles/team/attributions.md
```

Expected: prints `✖ Page validation failed (1 issue(s)):` listing `src/content/articles/team/attributions.md: level-1 heading at line …` then `exit=1`; the final `git checkout` restores the file (re-run `bun run validate:pages` if you want to reconfirm it returns to PASS — it will).

- [ ] **Step 4: Type-check the script change** (it lives under `scripts/`, included by `tsconfig.json` `"include": ["src", "scripts", "vite.config.ts"]`).

```bash
bun run type-check
```

Expected: no output, exit code 0.

- [ ] **Step 5: Commit** (only the script — the content file was reverted in Step 3 and must NOT be staged).

```bash
git add scripts/validate-pages.ts && git commit -m "feat: assert no level-1 headings in markdown bodies (single-h1 contract)" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Phase 4 — App shell (AppShell, Navbar, Footer)

> Dependencies: this phase consumes Phase 2's `Icon` component (`src/shared/components/Icon.tsx`) and the `@phosphor-icons/react` package, plus the Phase 1 `@theme` tokens and the index.html/main.css body-background change. The `bun run build` and `bun run dev` gates below only pass when this phase is assembled **after** the tokens phase, the Icon-component phase, and the index.html/body phase. All three tasks are committed individually with the `style:` conventional type on branch `feat/cats-dogs-theme`.

---

### Task 4.1: Reskin AppShell root + skip-link

**Files:** Modify `src/app/shell/AppShell.tsx` (lines 26–42)

Current (lines 26–33):

```tsx
  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-800">
      <a
        href="#main-content"
        className="sr-only z-50 rounded-md bg-emerald-600 px-4 py-2 text-white focus:not-sr-only focus:absolute focus:left-4 focus:top-4"
      >
        Skip to content
      </a>
```

Two changes per spec §8: (1) drop `bg-white text-slate-800` from the root div (the cream background + ink text now live on `<body>` via index.html/main.css); (2) restyle the skip-link to a brown pill with cream text and a yellow on-dark focus ring (`bg-footer` is `#794f27`, `text-page` is `#f8f8f0` → AA-passing, not pure-black).

- [ ] **Step 1: Drop `bg-white text-slate-800` from the root div.**

```tsx
    <div className="flex min-h-screen flex-col">
```

- [ ] **Step 2: Restyle the skip-link className** (`old → new`): replace `rounded-md bg-emerald-600 px-4 py-2 text-white` with `rounded-pill bg-footer px-4 py-2 text-page`, swap the focus ring to yellow-on-dark, and keep the existing `sr-only z-50` + `focus:not-sr-only focus:absolute focus:left-4 focus:top-4` reveal classes.

```tsx
      <a
        href="#main-content"
        className="sr-only z-50 rounded-pill bg-footer px-4 py-2 text-page focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-on-dark"
      >
        Skip to content
      </a>
```

The full `return` block after both edits:

```tsx
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main-content"
        className="sr-only z-50 rounded-pill bg-footer px-4 py-2 text-page focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-on-dark"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
        <Suspense fallback={<PageLoading />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
```

- [ ] **Step 3: Verify — type-check + theme audit.**

```bash
bun run type-check && bun run audit:theme
```

Expected: both exit 0 with no errors (no `#19c8b9`-as-text, no emoji, tokens present; AppShell now uses only semantic utilities, no `slate`/`emerald`/`white`).

- [ ] **Step 4: Commit.**

```bash
git add src/app/shell/AppShell.tsx && git commit -m "style: reskin AppShell root + skip-link to cozy theme" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 4.2: Reskin Navbar (cream header, pill links, Phosphor icons)

**Files:** Modify `src/app/shell/Navbar.tsx` (full-file rewrite of lines 1–175)

Because the reskin touches nearly every line (header, logo, link pills, dropdown toggle, dropdown menu, mobile toggle, mobile panel) **and** replaces three emoji glyphs (`▾ ☰ ✕`) with `<Icon>`-wrapped Phosphor components, this task replaces the whole file. Per spec §6, all `aria-expanded`/`aria-haspopup`/`aria-controls`/Escape-handling/`sr-only` labels are preserved verbatim; only classes, glyphs, and two named imports change.

Load-bearing before→after strings (verify each against the current file):

| Location | Before | After |
|---|---|---|
| header (L69) | `border-b border-slate-200 bg-white/90` | `border-b-2 border-border bg-page/90` |
| logo (L78) | `text-slate-900` | `text-ink` |
| year span (L81) | `font-normal text-emerald-600` | `font-normal text-primary-deep` |
| idle link (L9–15) | `text-slate-600 hover:bg-slate-100 hover:text-slate-900` | `text-ink-soft hover:bg-hover hover:text-ink hover:-translate-y-px` |
| active link (L13) | `bg-emerald-50 text-emerald-700` | `bg-primary-soft text-primary-deep` |
| link radius/focus (L11) | `rounded-md … outline-emerald-600` | `rounded-pill … outline-focus-ring` |
| toggle btn (L108) | `rounded-md … text-slate-600 hover:bg-slate-100 … outline-emerald-600` | `rounded-pill … shadow-soft text-ink-soft hover:bg-hover hover:text-ink hover:-translate-y-px … outline-focus-ring` |
| caret glyph (L111–113) | `<span aria-hidden>▾</span>` | `<Icon as={CaretDown} size="xs" aria-hidden />` |
| dropdown menu (L116) | `rounded-lg border border-slate-200 bg-white … shadow-lg` | `rounded-card border-2 border-border bg-page … shadow-card-lift` |
| mobile toggle (L138) | `rounded-md p-2 text-slate-700 hover:bg-slate-100 … outline-emerald-600` | `rounded-pill p-2.5 text-primary-deep hover:bg-hover … outline-focus-ring` |
| mobile glyph (L141–143) | `<span aria-hidden>{mobileOpen ? "✕" : "☰"}</span>` | `<Icon as={mobileOpen ? X : List} … aria-hidden />` |
| mobile panel (L151) | `border-t border-slate-200 bg-white` | `border-t-2 border-border bg-page` |
| mobile group label (L155) | `text-slate-400` | `text-ink-soft` |

> Note on `text-ink-soft` for the mobile group label: `text-ink-secondary` (`#9f927d`) does **not** clear 4.5:1 on cream, so we use `text-ink-soft` (`#725d42`) which passes. The mobile toggle gets `p-2.5` (≈44px tap target with the 20px `sm` icon) per spec §8's ≥44px requirement; the link pills already meet height via `px-3 py-2`.

- [ ] **Step 1: Replace the entire file** `src/app/shell/Navbar.tsx` with:

```tsx
import { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import { CaretDown, List, X } from "@phosphor-icons/react";
import { Icon } from "@/shared/components/Icon";
import { wikiEnv } from "@/config/env";
import { getNavGroups, navLabelFor } from "@/config/navigation";
import type { PageDataItem } from "@/config/pageData";

const groups = getNavGroups();

function linkClasses(isActive: boolean): string {
  return [
    "inline-flex rounded-pill px-3 py-2 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring",
    isActive
      ? "bg-primary-soft text-primary-deep"
      : "text-ink-soft hover:bg-hover hover:text-ink hover:-translate-y-px",
  ].join(" ");
}

function NavbarLink({
  page,
  onNavigate,
}: {
  page: PageDataItem;
  onNavigate?: () => void;
}) {
  return (
    <NavLink
      to={page.path}
      end={page.path === "/"}
      onClick={onNavigate}
      className={({ isActive }) => linkClasses(isActive)}
    >
      {navLabelFor(page)}
    </NavLink>
  );
}

/**
 * Site navigation (§14/§23): links derived from the page registry, keyboard-
 * accessible dropdowns with aria-expanded, and a mobile disclosure panel.
 */
export function Navbar() {
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenGroup(null);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpenGroup(null);
        setMobileOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <header
      ref={navRef}
      className="sticky top-0 z-40 border-b-2 border-border bg-page/90 backdrop-blur"
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8"
      >
        <NavLink
          to="/"
          end
          className="text-lg font-bold tracking-tight text-ink"
        >
          {wikiEnv.teamName}
          <span className="ml-1 font-normal text-primary-deep">
            iGEM {wikiEnv.teamYear}
          </span>
        </NavLink>

        {/* Desktop navigation */}
        <ul className="hidden items-center gap-1 lg:flex">
          {groups.map((group) => {
            if (group.pages.length === 1) {
              return (
                <li key={group.key}>
                  <NavbarLink page={group.pages[0]} />
                </li>
              );
            }
            const isOpen = openGroup === group.key;
            return (
              <li key={group.key} className="relative">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-haspopup="true"
                  onClick={() =>
                    setOpenGroup((current) =>
                      current === group.key ? null : group.key,
                    )
                  }
                  className="inline-flex items-center gap-1 rounded-pill px-3 py-2 text-sm font-medium text-ink-soft shadow-soft transition hover:-translate-y-px hover:bg-hover hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
                >
                  {group.label}
                  <Icon
                    as={CaretDown}
                    size="xs"
                    className="text-primary-deep"
                    aria-hidden="true"
                  />
                </button>
                {isOpen ? (
                  <ul className="absolute left-0 mt-1 min-w-48 rounded-card border-2 border-border bg-page p-1 shadow-card-lift">
                    {group.pages.map((page) => (
                      <li key={page.path}>
                        <NavbarLink
                          page={page}
                          onNavigate={() => setOpenGroup(null)}
                        />
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            );
          })}
        </ul>

        {/* Mobile toggle */}
        <button
          type="button"
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav"
          onClick={() => setMobileOpen((value) => !value)}
          className="rounded-pill p-2.5 text-primary-deep transition hover:bg-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring lg:hidden"
        >
          <span className="sr-only">Toggle navigation</span>
          <Icon as={mobileOpen ? X : List} size="md" aria-hidden="true" />
        </button>
      </nav>

      {/* Mobile panel */}
      {mobileOpen ? (
        <div
          id="mobile-nav"
          className="border-t-2 border-border bg-page px-4 py-3 lg:hidden"
        >
          {groups.map((group) => (
            <div key={group.key} className="py-2">
              <p className="px-3 text-xs font-semibold uppercase tracking-wide text-ink-soft">
                {group.label}
              </p>
              <ul className="mt-1 flex flex-col">
                {group.pages.map((page) => (
                  <li key={page.path}>
                    <NavbarLink
                      page={page}
                      onNavigate={() => setMobileOpen(false)}
                    />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : null}
    </header>
  );
}
```

- [ ] **Step 2: Verify — no emoji glyphs survive + tokens valid.**

```bash
bun run audit:theme && grep -n -E "▾|☰|✕" src/app/shell/Navbar.tsx; echo "exit=$?"
```

Expected: `audit:theme` exits 0 (no emoji, no `#19c8b9`-as-text, tokens present); the grep prints **no matching lines** and `exit=1` (grep found nothing — the three emoji glyphs are gone, replaced by `CaretDown`/`List`/`X`).

- [ ] **Step 3: Verify — full SSG build (real integration gate for the new Phosphor/Icon imports).**

```bash
bun run build
```

Expected: build completes successfully; `validate:pages`, `type-check`, sitemap generation, and `vite-react-ssg build` all pass with no errors — confirming the named `@phosphor-icons/react` imports and the `Icon` wrapper prerender cleanly into every route.

- [ ] **Step 4: Visual check (human/agent).**

```bash
bun run dev
```

Expected: at `http://localhost:5173/` the header is cream (`#f8f8f0`/90) with a 2px brown bottom border; the logo is brown ink with a deep-teal "iGEM 2026" span; nav links are pills (active = mint `bg-primary-soft` + deep-teal text); the dropdown caret is a duotone Phosphor `CaretDown`; opening a group shows a cream `rounded-card` menu with deep shadow; at narrow width the mobile toggle shows a `List` icon that swaps to `X` when open; Tab-focusing any link/button shows a brown (`outline-focus-ring`) ring. Stop dev when done.

- [ ] **Step 5: Commit.**

```bash
git add src/app/shell/Navbar.tsx && git commit -m "style: reskin Navbar with cozy header, pill links, Phosphor icons" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 4.3: Reskin Footer (deep brown surface, cream text, preserve required links)

**Files:** Modify `src/app/shell/Footer.tsx` (lines 19–84)

Per spec §6/§8: footer surface → `bg-footer` (`#794f27`) with cream text tokens (`text-footer-text` / `text-footer-text-muted`), 2px `border-footer-divider` top border + `<hr>`, links `hover:text-page hover:underline` with a **yellow on-dark** focus ring. The CC-license link (current L59–66) and GitLab link (current L71–78) keep their `href`/`rel`/`target` and visible text **verbatim** — only color classes change, and a yellow focus ring is **added** (both currently have no `focus-visible` outline at all, which is an AA gap).

Load-bearing before→after strings:

| Location | Before | After |
|---|---|---|
| footer (L21) | `mt-16 border-t border-slate-200 bg-slate-900 text-slate-300` | `mt-16 border-t-2 border-footer-divider bg-footer text-footer-text` |
| team name (L25) | `text-lg font-bold text-white` | `text-lg font-bold text-page` |
| tagline (L26) | `mt-2 text-sm text-slate-400` | `mt-2 text-sm text-footer-text-muted` |
| group label (L33) | `… tracking-wide text-slate-500` | `… tracking-wide text-footer-text-muted` |
| column link (L41) | `text-sm text-slate-300 … hover:text-white … outline-emerald-500` | `text-sm text-footer-text … hover:text-page hover:underline … outline-focus-on-dark` |
| hr (L52) | `my-8 border-slate-700` | `my-8 border-footer-divider` |
| license div (L55) | `space-y-2 text-xs text-slate-400` | `space-y-2 text-xs text-footer-text-muted` |
| CC link (L60) | `font-medium text-slate-200 underline hover:text-white` (no focus ring) | `font-medium text-page underline hover:text-page` + yellow focus ring |
| GitLab link (L72) | `font-medium text-slate-200 underline hover:text-white` (no focus ring) | `font-medium text-page underline hover:text-page` + yellow focus ring |

- [ ] **Step 1: Restyle the `<footer>` element** (L21 before → after):

```tsx
    <footer className="mt-16 border-t-2 border-footer-divider bg-footer text-footer-text">
```

- [ ] **Step 2: Restyle the team name + tagline** (L25–29):

```tsx
          <div>
            <p className="text-lg font-bold text-page">{wikiEnv.teamName}</p>
            <p className="mt-2 text-sm text-footer-text-muted">
              iGEM {wikiEnv.teamYear} — engineering biology for a more
              sustainable world.
            </p>
          </div>
```

- [ ] **Step 3: Restyle the column group label + links** (L31–49):

```tsx
          {footerGroups.map((group) => (
            <nav key={group.key} aria-label={group.label}>
              <p className="text-sm font-semibold uppercase tracking-wide text-footer-text-muted">
                {group.label}
              </p>
              <ul className="mt-3 space-y-2">
                {group.pages.map((page) => (
                  <li key={page.path}>
                    <Link
                      to={page.path}
                      className="text-sm text-footer-text transition hover:text-page hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-on-dark"
                    >
                      {navLabelFor(page)}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
```

- [ ] **Step 4: Restyle the divider `<hr>` + license block** — change `border-slate-700` → `border-footer-divider` and `text-slate-400` → `text-footer-text-muted`, then recolor both required links **without touching** `href`/`rel`/`target` or their visible text, adding the yellow on-dark focus ring (L52–81):

```tsx
        <hr className="my-8 border-footer-divider" />

        {/* Required on every iGEM wiki page: license + repository link. */}
        <div className="space-y-2 text-xs text-footer-text-muted">
          <p>
            © {wikiEnv.teamYear} {wikiEnv.teamName}. Content on this site is
            licensed under a{" "}
            <a
              className="font-medium text-page underline transition hover:text-page focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-on-dark"
              href="https://creativecommons.org/licenses/by/4.0/"
              rel="license noopener noreferrer"
              target="_blank"
            >
              Creative Commons Attribution 4.0 International license
            </a>
            .
          </p>
          <p>
            The repository used to create this website is available at{" "}
            <a
              className="font-medium text-page underline transition hover:text-page focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-on-dark"
              href={`https://gitlab.igem.org/${wikiEnv.teamYear}/${teamSlug}`}
              rel="noopener noreferrer"
              target="_blank"
            >
              gitlab.igem.org/{wikiEnv.teamYear}/{teamSlug}
            </a>
            .
          </p>
        </div>
```

- [ ] **Step 5: Verify — required links unchanged + tokens valid.**

```bash
bun run audit:theme && grep -c 'rel="license noopener noreferrer"' src/app/shell/Footer.tsx && grep -c 'href={`https://gitlab.igem.org/${wikiEnv.teamYear}/${teamSlug}`}' src/app/shell/Footer.tsx
```

Expected: `audit:theme` exits 0 (no `slate`/`white`/emoji, cream tokens present); both `grep -c` print `1` — confirming the CC-license `rel` and the GitLab `href` template literal are preserved verbatim.

- [ ] **Step 6: Verify — full SSG build.**

```bash
bun run build
```

Expected: build completes successfully (all gates pass), confirming the footer prerenders into every route with the required license + repository links intact.

- [ ] **Step 7: Visual check (human/agent).**

```bash
bun run dev
```

Expected: at `http://localhost:5173/` the footer is deep brown (`#794f27`) with a 2px lighter-brown top border; team name is cream (`text-page`), tagline/labels are muted cream (`text-footer-text-muted`); column + license + GitLab links are cream, underline on hover, and show a yellow (`outline-focus-on-dark`) ring on keyboard focus; the divider `<hr>` is the brown divider tone. Stop dev when done.

- [ ] **Step 8: Commit.**

```bash
git add src/app/shell/Footer.tsx && git commit -m "style: reskin Footer to deep-brown cozy surface" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Phase 5 — Home (hero, highlights, molecule)

### Task 5.1: Reskin Home Hero (HeroSection.tsx)

**Files:**
- Modify: `src/features/home/sections/HeroSection.tsx` (current lines 1-38, full file replace)

- [ ] **Step 1: Replace the entire file with the themed hero.** Native `<h1>` stays plain (only section h2's become `<Title>` ribbons); section gradient `from-page to-surface`; eyebrow `text-primary-deep`; h1 `text-ink`; body `text-ink-soft`; CTAs render `buttonClasses(...)` on `<Link>` (Card/Button-style 3D pills) with PawPrint + UsersThree icons; warm decorative Cat/Dog illustration scaled past Icon's `lg` cap via `className` height/width (CSS overrides Phosphor's intrinsic size), with small paw accents. Icons are named Phosphor imports only (no barrel).

```tsx
import { Link } from "react-router-dom";
import { Cat, Dog, PawPrint, UsersThree } from "@phosphor-icons/react";
import { wikiEnv } from "@/config/env";
import { Icon } from "@/shared/components/Icon";
import { buttonClasses } from "@/shared/components/Button";

/**
 * Homepage hero (§20). Section-specific content/markup stays inside this file.
 */
export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-page to-surface">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-24 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div className="text-center lg:text-left">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary-deep">
            iGEM {wikiEnv.teamYear}
          </p>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-ink sm:text-6xl">
            {wikiEnv.teamName}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-ink-soft lg:mx-0">
            Engineering biology for a more sustainable world. Explore our
            project, research, and the team behind it.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4 lg:justify-start">
            <Link to="/description" className={buttonClasses("primary", "lg", "group")}>
              <Icon as={PawPrint} weight="fill" />
              <span>Explore the project</span>
              <Icon as={PawPrint} weight="fill" className="transition group-hover:translate-x-1" />
            </Link>
            <Link to="/team" className={buttonClasses("secondary", "lg")}>
              <Icon as={UsersThree} />
              <span>Meet the team</span>
            </Link>
          </div>
        </div>
        <div
          aria-hidden="true"
          className="relative hidden items-center justify-center lg:flex"
        >
          <Icon as={Cat} weight="duotone" className="h-44 w-44 text-app-peach -rotate-6" />
          <Icon as={Dog} weight="duotone" className="h-48 w-48 text-app-teal rotate-6" />
          <Icon as={PawPrint} weight="fill" className="absolute left-4 top-6 h-8 w-8 text-app-pink/70" />
          <Icon as={PawPrint} weight="fill" className="absolute bottom-8 right-6 h-10 w-10 text-app-blue/70" />
          <Icon as={PawPrint} weight="fill" className="absolute right-1/3 top-2 h-6 w-6 text-app-purple/60" />
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify types + theme guard.** No banned tokens, named imports, component APIs satisfied.
```
bun run type-check && bun run audit:theme
```
Expected: both exit 0 with no errors (no `#19c8b9`-as-text, no emoji, all tokens present).

- [ ] **Step 3: Visual check the hero route.** Confirm gradient parchment background, brown ink h1, teal eyebrow, two 3D pill CTAs with paw/people icons, and the cat/dog + paw illustration (peach cat, teal dog) on `lg`. Verify the trailing paw on the primary CTA nudges right on hover.
```
bun run dev
```
Expected: dev server serves `/`; hero renders as described with no console errors.

- [ ] **Step 4: Commit.**
```
git add src/features/home/sections/HeroSection.tsx && git commit -m "style: reskin home hero with cats-dogs theme tokens and paw CTAs" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 5.2: Reskin Home Highlights (HighlightsSection.tsx)

**Files:**
- Modify: `src/features/home/sections/HighlightsSection.tsx` (current lines 1-55, full file replace)

- [ ] **Step 1: Replace the entire file.** Add a `category: PageCategory` field to each highlight (project, team); h2 → `<Title level="h2" align="center">`; each card is a `<Link>` (the focusable, `group` element) wrapping `<Card variant="interactive" accent={...}>` with the `.ac-polka` texture helper. Pull icon + accent from `pageCategoryMeta`, aliasing its `Icon` field to avoid clashing with the `<Icon>` wrapper. Replace the `→` glyph with a trailing PawPrint that nudges on `group-hover`.

> NOTE FOR ASSEMBLER: The spec shorthand `<Card variant="interactive polka accent">` is intent, not literal props. Per the Phase 2 contract, `variant` is a single enum (`plain|polka|interactive`) and `accent` is a separate prop; Card is NOT a Link (no `to`/`as`). We therefore: keep `<Link>` as the focusable wrapper, set `variant="interactive"`, pass `accent` separately, and add polka via the Phase-1 `.ac-polka` class. This is contract-safe regardless of how Phase 2 typed `variant`.

```tsx
import { Link } from "react-router-dom";
import { PawPrint } from "@phosphor-icons/react";
import type { PageCategory } from "@/config/pageData";
import { pageCategoryMeta } from "@/config/pageCategoryMeta";
import { Icon } from "@/shared/components/Icon";
import { Card } from "@/shared/components/Card";
import { Title } from "@/shared/components/Title";

interface Highlight {
  title: string;
  description: string;
  to: string;
  cta: string;
  category: PageCategory;
}

const highlights: Highlight[] = [
  {
    title: "The project",
    description:
      "Why we chose our challenge, the science behind our solution, and where we are headed.",
    to: "/description",
    cta: "Read the description",
    category: "project",
  },
  {
    title: "The team",
    description:
      "The students, instructors, and advisors who made this season possible.",
    to: "/team",
    cta: "Meet the team",
    category: "team",
  },
];

/**
 * Homepage highlights (§20). Section content is local to this file.
 */
export function HighlightsSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
      <Title level="h2" align="center">
        Start exploring
      </Title>
      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        {highlights.map((item) => {
          const { Icon: CategoryIcon, accent } = pageCategoryMeta[item.category];
          return (
            <Link
              key={item.to}
              to={item.to}
              className="group block rounded-card outline-focus-ring focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              <Card variant="interactive" accent={accent} className="ac-polka h-full">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-min bg-primary-soft text-primary-deep">
                  <Icon as={CategoryIcon} size="md" />
                </span>
                <h3 className="mt-4 text-xl font-semibold text-ink">
                  {item.title}
                </h3>
                <p className="mt-3 text-ink-soft">{item.description}</p>
                <span className="mt-4 inline-flex items-center gap-2 font-semibold text-primary-deep">
                  {item.cta}
                  <Icon
                    as={PawPrint}
                    className="transition group-hover:translate-x-1"
                  />
                </span>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
```

> NOTE: The spec says "remove `→`, use PawPrint". The trailing nudge glyph here uses `PawPrint` from Phosphor as a directional affordance; if the assembler prefers the literal paw signature glyph, swap `PawPrint` → `PawPrint` (import + both usages) with `weight="fill"`. Either is theme-compliant (named Phosphor import, no Unicode `→`). Defaulting to the paw signature is acceptable — flag for the assembler to pick one project-wide.

- [ ] **Step 2: Verify types + theme guard.** Exhaustive `pageCategoryMeta` access type-checks; no banned tokens/emoji.
```
bun run type-check && bun run audit:theme
```
Expected: both exit 0; no errors.

- [ ] **Step 3: Visual check the highlights.** Confirm the "Start exploring" ribbon title, two polka cards lifting on hover (interactive), category icons in soft-teal chips, accent left-border per category (project→teal, team→peach), and the CTA glyph nudging right on hover.
```
bun run dev
```
Expected: `/` renders highlights as described; no console errors.

- [ ] **Step 4: Commit.**
```
git add src/features/home/sections/HighlightsSection.tsx && git commit -m "style: reskin home highlights as polka interactive category cards" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 5.3: Reskin Home Molecule Section (MoleculeSection.tsx)

**Files:**
- Modify: `src/features/home/sections/MoleculeSection.tsx` (current lines 23-50 — JSX only; `SAMPLE_MOLECULE` const lines 6-17 unchanged)

- [ ] **Step 1: Replace the `MoleculeSection` JSX (current lines 23-50).** Section `bg-page`; h2 → `<Title level="h2">`; body copy → `text-ink-soft`. Keep the `MoleculeViewer` import (line 1), the `SAMPLE_MOLECULE` constant (lines 6-17), and all viewer props unchanged. Replace exactly this block:

```tsx
export function MoleculeSection() {
  return (
    <section className="bg-slate-50">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Molecules in motion
          </h2>
          <p className="mt-4 text-slate-600">
            Synthetic biology is the engineering of molecular machines. Drag to
            rotate the interactive model — a placeholder we will replace with
            the key molecules from our project.
          </p>
          <p className="mt-4 text-sm text-slate-500">
            The 3D viewer is loaded only when this section scrolls into view,
            and auto-rotation pauses for visitors who prefer reduced motion.
          </p>
        </div>
        <MoleculeViewer
          label="Interactive 3D model of a water molecule"
          sdfData={SAMPLE_MOLECULE}
          format="sdf"
          autoRotate
        />
      </div>
    </section>
  );
}
```

with:

```tsx
export function MoleculeSection() {
  return (
    <section className="bg-page">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <Title level="h2">Molecules in motion</Title>
          <p className="mt-4 text-ink-soft">
            Synthetic biology is the engineering of molecular machines. Drag to
            rotate the interactive model — a placeholder we will replace with
            the key molecules from our project.
          </p>
          <p className="mt-4 text-sm text-ink-soft">
            The 3D viewer is loaded only when this section scrolls into view,
            and auto-rotation pauses for visitors who prefer reduced motion.
          </p>
        </div>
        <MoleculeViewer
          label="Interactive 3D model of a water molecule"
          sdfData={SAMPLE_MOLECULE}
          format="sdf"
          autoRotate
        />
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Add the `Title` import at the top of the file.** Replace the import line:

```tsx
import { MoleculeViewer } from "@/features/molecule/MoleculeViewer";
```

with:

```tsx
import { MoleculeViewer } from "@/features/molecule/MoleculeViewer";
import { Title } from "@/shared/components/Title";
```

- [ ] **Step 3: Verify types + theme guard.**
```
bun run type-check && bun run audit:theme
```
Expected: both exit 0; no banned `slate-*`/emoji introduced.

- [ ] **Step 4: Commit.**
```
git add src/features/home/sections/MoleculeSection.tsx && git commit -m "style: retheme home molecule section with page bg and ribbon title" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 5.4: Retint MoleculeViewer container (MoleculeViewer.tsx)

**Files:**
- Modify: `src/features/molecule/MoleculeViewer.tsx` (current lines 23-46 — markup only)

- [ ] **Step 1: Restyle the markup classes only.** Container → `border-2 border-border bg-page rounded-card`; loading/error spans → `text-ink-muted`; figcaption → `text-ink-soft`. Do NOT touch `useId`, `use3DMolViewer`, the `{ loading, error, ready }` destructure, or the conditional render structure (these are the SSG-safe hooks the task forbids changing). Ignore the spec's "transparent-alpha/parchment shows through" aside — that would require a hook change and is out of scope this phase. The new markup also adds `data-print-hide` to the `<figure>` so the Phase-1 `@media print` block (which hides `[data-print-hide]`) keeps the WebGL viewer off printed pages. Replace exactly this block (current lines 23-46):

```tsx
  return (
    <figure className={className}>
      <div
        id={elementId}
        role="img"
        aria-label={label}
        className="relative mx-auto aspect-square w-full max-w-md rounded-xl border border-slate-200 bg-slate-50"
      >
        {!ready && !error ? (
          <span className="absolute inset-0 flex items-center justify-center text-sm text-slate-500">
            {loading ? "Loading 3D viewer…" : "Scroll to load 3D viewer"}
          </span>
        ) : null}
        {error ? (
          <span className="absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-slate-500">
            {error}
          </span>
        ) : null}
      </div>
      <figcaption className="mt-3 text-center text-sm text-slate-500">
        {label}
      </figcaption>
    </figure>
  );
```

with:

```tsx
  return (
    <figure className={className} data-print-hide>
      <div
        id={elementId}
        role="img"
        aria-label={label}
        className="relative mx-auto aspect-square w-full max-w-md rounded-card border-2 border-border bg-page"
      >
        {!ready && !error ? (
          <span className="absolute inset-0 flex items-center justify-center text-sm text-ink-muted">
            {loading ? "Loading 3D viewer…" : "Scroll to load 3D viewer"}
          </span>
        ) : null}
        {error ? (
          <span className="absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-ink-muted">
            {error}
          </span>
        ) : null}
      </div>
      <figcaption className="mt-3 text-center text-sm text-ink-soft">
        {label}
      </figcaption>
    </figure>
  );
```

- [ ] **Step 2: Verify types + theme guard.**
```
bun run type-check && bun run audit:theme
```
Expected: both exit 0; no `slate-*`/emoji remain in this file.

- [ ] **Step 3: Full SSG build gate (this is the prerender-sensitive file).** Confirms the lazy 3Dmol viewer + `useId` markup still prerenders cleanly under vite-react-ssg.
```
bun run build
```
Expected: build completes successfully; home route prerendered with no SSR/window errors.

- [ ] **Step 4: Commit.**
```
git add src/features/molecule/MoleculeViewer.tsx && git commit -m "style: retint molecule viewer container with theme tokens" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```


---

## Phase 6 — Markdown surfaces (markdown.css, Mermaid, TOC, MarkdownArticle, 404)

> **Phase dependencies (must already be merged on `feat/cats-dogs-theme`):**
> Phase 1 (`@theme` tokens in `src/styles/main.css`, the `bun run audit:theme` guard, and the `.ac-polka` / `.ac-ribbon` CSS helpers) and Phase 2 (`Card`, `Title`, `Icon`, `Button` components under `src/shared/components/`). Phase 3 (`pageCategoryMeta`) is **not** required here.
>
> **Load-bearing facts verified against the current tree (do not skip):**
> - `markdown.css` is imported **before** `prism-tomorrow.css` in `src/app/shell/AppShell.tsx` (lines 13 then 15). Prism's token rules therefore win on equal specificity, so every code-block recolor below is scoped under `.markdown-body` to raise specificity above Prism's bare `.token.*` / `pre[class*="language-"]` selectors. Do **not** reorder the AppShell imports.
> - `prism-tomorrow` base: `code/pre[class*="language-"] { color:#ccc }`, `pre[class*="language-"] { background:#2d2d2d }`; tokens: comment/prolog/doctype/cdata `#999`, punctuation `#ccc`, tag/attr-name/namespace/deleted `#e2777a`, function-name `#6196cc`, boolean/number/function `#f08d49`, property/class-name/constant/symbol `#f8c555`, selector/important/atrule/keyword/builtin `#cc99cd`, string/char/attr-value/regex/variable `#7ec699`, operator/entity/url `#67cdcc`, inserted `green`.
> - KaTeX CSS contains **zero** hardcoded black (`color: inherit`), so it already inherits `.markdown-body` brown; the §9 KaTeX guard is added defensively only.
> - `TocItem` shape (`src/features/content/markdownService.ts`): `{ title: string; url: string; depth: number; children: TocItem[] }`.
> - Phosphor named imports only (no default/glob imports), per spec §12.

---

### Task 6.1: Reskin `markdown.css` body/headings/links/blockquote/inline-code/tables (§9)

**Files:** Modify `src/styles/markdown.css` (current lines 8–146: the `.markdown-body` base through `.katex-error` rule — everything **above** the "Code copy button" comment at line 148).

This task replaces the slate/emerald/rose palette with theme tokens. The code-block (Prism) recolor and the copy button are handled in Task 2; leave lines 148–176 untouched in this task.

- [ ] **Step 1: Replace the base-through-hr rules with token colors.** Replace the current block spanning lines 8–146 (from `.markdown-body {` through the `.markdown-body .katex-error { … }` rule) with the following. Hardcoded hex values are intentional and match the §9/§11 AA-verified palette (this file is plain CSS, not Tailwind, so `@theme` utilities are not available here).

```css
.markdown-body {
  color: #725d42; /* --color-ink-soft, 5.61:1 on cream */
  line-height: 1.75;
  font-size: 1rem;
}

.markdown-body > :first-child {
  margin-top: 0;
}

.markdown-body h2 {
  margin-top: 2.5rem;
  margin-bottom: 1rem;
  font-size: 1.6rem;
  font-weight: 700;
  color: #794f27; /* --color-ink */
  padding-bottom: 0.3rem;
  border-bottom: 2px solid #8a7b66; /* --color-border */
}

.markdown-body h3 {
  margin-top: 2rem;
  margin-bottom: 0.75rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: #794f27; /* --color-ink */
}

.markdown-body h4 {
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
  font-size: 1.05rem;
  font-weight: 600;
  color: #794f27; /* --color-ink */
}

.markdown-body p,
.markdown-body ul,
.markdown-body ol,
.markdown-body blockquote,
.markdown-body table,
.markdown-body pre {
  margin-top: 0;
  margin-bottom: 1.25rem;
}

.markdown-body a {
  color: #0d6f63; /* --color-primary-deep, 5.43:1 on cream — NOT #19c8b9 */
  text-decoration: underline;
  text-underline-offset: 2px;
}

.markdown-body a:hover {
  color: #0a5249; /* --color-primary-rail */
}

.markdown-body ul {
  list-style: disc;
  padding-left: 1.5rem;
}

.markdown-body ol {
  list-style: decimal;
  padding-left: 1.5rem;
}

.markdown-body li {
  margin-bottom: 0.4rem;
}

.markdown-body blockquote {
  border-left: 4px solid #0d6f63; /* --color-primary-deep rail */
  background: #e6f9f6; /* --color-primary-soft */
  padding: 0.75rem 1rem;
  color: #725d42; /* --color-ink-soft */
  border-radius: 0 12px 12px 0; /* --radius-min */
}

.markdown-body blockquote > :last-child {
  margin-bottom: 0;
}

.markdown-body :not(pre) > code {
  background: #f9f7f0; /* --color-surface-2 */
  border-radius: 8px;
  padding: 0.15em 0.35em;
  font-size: 0.875em;
  color: #794f27; /* --color-ink, 6.36:1 on surface-2 */
}

.markdown-body pre {
  position: relative;
  overflow-x: auto;
  border-radius: 0.5rem;
  padding: 1rem;
  font-size: 0.875rem;
}

.markdown-body pre.mermaid {
  background: transparent;
  display: flex;
  justify-content: center;
  padding: 0;
}

.markdown-body img {
  max-width: 100%;
  height: auto;
  border-radius: 0.5rem;
}

.markdown-body table {
  width: 100%;
  border-collapse: collapse;
  display: block;
  overflow-x: auto;
}

.markdown-body th,
.markdown-body td {
  border: 1px solid #8a7b66; /* --color-border */
  padding: 0.5rem 0.75rem;
  text-align: left;
}

.markdown-body th {
  background: #f7f3df; /* --color-surface */
  font-weight: 600;
  color: #794f27; /* --color-ink */
}

.markdown-body hr {
  margin: 2rem 0;
  border: 0;
  border-top: 2px solid #8a7b66; /* --color-border */
}

/* KaTeX inherits color (no hardcoded #000); pin to ink defensively (§9). */
.markdown-body .katex {
  color: #794f27; /* --color-ink */
}

.markdown-body .katex-error {
  color: #c0392b; /* --color-error */
}
```

- [ ] **Step 2: Verify the theme audit and lint pass.** This guard (Phase 1) asserts no `#19c8b9` used as text and no emoji in styles.

```
bun run audit:theme && bun run lint:check
```
Expected: both commands exit 0 with no findings (specifically: no `#19c8b9` flagged as a text color in `markdown.css`).

- [ ] **Step 3: Commit.**

```
git add src/styles/markdown.css && git commit -m "style: reskin markdown body/headings/links/tables to cats-dogs tokens" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 6.2: Warm the Prism code-block surface + recolor every token ≥4.5:1 (§9)

**Files:** Modify `src/styles/markdown.css` (the "Code copy button" block, current lines 148–176).

Because `prism-tomorrow.css` is imported **after** `markdown.css` in `AppShell.tsx`, the overrides are scoped under `.markdown-body` so their specificity (`.markdown-body` + `.token.x` = 2 classes, or `.markdown-body` + `pre[class*="language-"]` = 2 classes + element) beats Prism's bare single-class / single-element-plus-attr selectors. Each syntax hue below is the warm replacement and its verified contrast on the pale `#fffaf5` code background.

- [ ] **Step 1: Replace the entire copy-button block (lines 148–176) with the warm Prism surface, token recolors, and the re-themed copy button.**

```css
/* ── Code blocks: warm pale surface overriding prism-tomorrow's dark theme ──
   Imported AFTER markdown.css, so every rule is scoped under .markdown-body to
   win specificity. Each token color re-verified ≥4.5:1 on #fffaf5. */
.markdown-body pre[class*="language-"],
.markdown-body code[class*="language-"] {
  color: #725d42; /* base token, 5.46:1 on #fffaf5 */
  background: none;
  text-shadow: none;
}

.markdown-body pre[class*="language-"] {
  background: #fffaf5; /* warm pale cream */
  border: 1px solid #c4b89e; /* --color-border-soft (non-text) */
}

.markdown-body :not(pre) > code[class*="language-"] {
  background: #f9f7f0; /* --color-surface-2 */
  color: #794f27;
}

/* Token recolors — warm hues, all ≥4.5:1 on #fffaf5 */
.markdown-body .token.comment,
.markdown-body .token.block-comment,
.markdown-body .token.prolog,
.markdown-body .token.doctype,
.markdown-body .token.cdata {
  color: #6b5e50; /* 5.40:1 */
  font-style: italic;
}

.markdown-body .token.punctuation {
  color: #725d42; /* 5.46:1 */
}

.markdown-body .token.tag,
.markdown-body .token.attr-name,
.markdown-body .token.namespace,
.markdown-body .token.deleted {
  color: #b04a28; /* peach-ink, 4.85:1 */
}

.markdown-body .token.function-name,
.markdown-body .token.function {
  color: #2f4fa8; /* blue-ink, 5.93:1 */
}

.markdown-body .token.boolean,
.markdown-body .token.number {
  color: #946011; /* warning, 4.78:1 */
}

.markdown-body .token.property,
.markdown-body .token.class-name,
.markdown-body .token.constant,
.markdown-body .token.symbol {
  color: #6a3fa0; /* purple-ink, 6.85:1 */
}

.markdown-body .token.selector,
.markdown-body .token.important,
.markdown-body .token.atrule,
.markdown-body .token.keyword,
.markdown-body .token.builtin {
  color: #b03a52; /* pink-ink, 5.27:1 */
}

.markdown-body .token.string,
.markdown-body .token.char,
.markdown-body .token.attr-value,
.markdown-body .token.regex,
.markdown-body .token.variable {
  color: #2f7a36; /* success/green-ink, 4.76:1 */
}

.markdown-body .token.operator,
.markdown-body .token.entity,
.markdown-body .token.url {
  color: #1f7a5e; /* teal-ink, 4.71:1 */
}

.markdown-body .token.inserted {
  color: #2f7a36; /* success */
}

.markdown-body .token.important,
.markdown-body .token.bold {
  font-weight: 700;
}

.markdown-body .token.italic {
  font-style: italic;
}

/* Code copy button injected by useMarkdownEnhancements. */
.markdown-body pre.code-block {
  padding-top: 2.25rem;
}

.markdown-body .code-copy-button {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  font-size: 0.75rem;
  line-height: 1;
  padding: 0.3rem 0.55rem;
  border-radius: 12px; /* --radius-min */
  background: #e6f9f6; /* --color-primary-soft */
  color: #794f27; /* --color-ink, 6.50:1 on primary-soft */
  border: 1px solid #8a7b66; /* --color-border */
  cursor: pointer;
  transition: background 0.15s ease;
}

.markdown-body .code-copy-button:hover {
  background: #d6f3ee; /* slightly deeper soft teal */
}

.markdown-body .code-copy-button:focus-visible {
  outline: 2px solid #794f27; /* brown focus ring on light (§11) */
  outline-offset: 2px;
}
```

- [ ] **Step 2: Verify the theme audit + lint pass.**

```
bun run audit:theme && bun run lint:check
```
Expected: both exit 0; no `#19c8b9`-as-text and no emoji flagged in the recolored token rules.

- [ ] **Step 3: Build to confirm the CSS bundles cleanly under SSG.**

```
bun run build
```
Expected: build completes with no CSS/PostCSS errors and prerenders all routes.

- [ ] **Step 4: Commit.**

```
git add src/styles/markdown.css && git commit -m "style: warm prism code surface with AA-verified token recolors" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 6.3: Re-theme Mermaid (`theme:'base'` + token themeVariables, unconditional fontFamily)

**Files:** Modify `src/features/content/useMarkdownEnhancements.ts` (current lines 79–104: the `if (hasMermaid)` block, specifically the `prefersReducedMotion` read on 82–84 and the `mermaid.initialize({...})` call on 85–91).

The current code reads `prefers-reduced-motion` only to set `fontFamily: "inherit"` when reduced motion is on — that is backwards (it drops the themed font for reduced-motion users and never sets the brand font otherwise) and unrelated to motion. Replace with `theme:'base'` + token `themeVariables`, with `fontFamily` set **unconditionally**.

- [ ] **Step 1: Replace lines 82–91** (the `const prefersReducedMotion = …;` declaration through the closing `});` of `mermaid.initialize`) with the token-mapped base theme. Note `prefersReducedMotion` is removed entirely — it is no longer read anywhere in this hook.

Before (lines 82–91):
```ts
        const prefersReducedMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          theme: "default",
          flowchart: { useMaxWidth: true },
          ...(prefersReducedMotion ? { fontFamily: "inherit" } : {}),
        });
```

After:
```ts
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          theme: "base",
          flowchart: { useMaxWidth: true },
          themeVariables: {
            primaryColor: "#e6f9f6",
            primaryBorderColor: "#0d6f63",
            primaryTextColor: "#794f27",
            lineColor: "#8a7b66",
            secondaryColor: "#f7f3df",
            tertiaryColor: "#fdf0ea",
            textColor: "#725d42",
            fontFamily: "Nunito, 'Noto Sans SC', sans-serif",
            fontSize: "14px",
          },
        });
```

- [ ] **Step 2: Type-check (confirms the `mermaid.initialize` config still satisfies its typed API and no dangling `prefersReducedMotion` reference remains).**

```
bun run type-check
```
Expected: `tsc --noEmit` exits 0 with no errors.

- [ ] **Step 3: Lint (confirms no unused-var leftover and import hygiene).**

```
bun run lint:check
```
Expected: eslint exits 0 with no errors or warnings.

- [ ] **Step 4: Commit.**

```
git add src/features/content/useMarkdownEnhancements.ts && git commit -m "feat: theme mermaid with base palette and unconditional brand font" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 6.4: Restyle the Table of Contents as a compact cream `Card` with a `CaretDown` toggle

**Files:** Modify `src/features/content/ArticleTableOfContents.tsx` (rewrite the full current file, lines 1–59).

Per spec table row "Table of contents": compact cream `<Card>`; the `+`/`−` text toggle becomes a Phosphor `<CaretDown>`/`<CaretRight>` icon; links become `text-ink-soft` with `hover:bg-primary-soft hover:text-primary-deep`; `aria-expanded` / `aria-controls` are preserved. The `Card` and `Icon` components are the Phase 2 APIs; `CaretDown`/`CaretRight` are named Phosphor imports (§12).

- [ ] **Step 1: Replace the entire file contents with the themed version.**

```tsx
import { useState } from "react";
import { CaretDown, CaretRight } from "@phosphor-icons/react";
import { Card } from "@/shared/components/Card";
import { Icon } from "@/shared/components/Icon";
import type { TocItem } from "./markdownService";

interface ArticleTableOfContentsProps {
  items: TocItem[];
}

function TocList({ items }: { items: TocItem[] }) {
  return (
    <ul className="space-y-1">
      {items.map((item) => (
        <li key={item.url}>
          <a
            href={item.url}
            className="block rounded-min px-2 py-1 text-sm text-ink-soft transition hover:bg-primary-soft hover:text-primary-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
          >
            {item.title}
          </a>
          {item.children.length > 0 ? (
            <div className="ml-3 border-l-2 border-border-soft pl-2">
              <TocList items={item.children} />
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

/**
 * Collapsible "On this page" navigation (§23: exposes aria-expanded state).
 */
export function ArticleTableOfContents({ items }: ArticleTableOfContentsProps) {
  const [open, setOpen] = useState(true);
  if (items.length === 0) return null;

  return (
    <Card
      compact
      className="border-2 border-border"
      // Card is a <div>; the contained nav carries the landmark + label.
    >
      <nav aria-label="Table of contents">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="toc-list"
          className="flex w-full items-center justify-between rounded-min text-sm font-semibold text-ink transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
        >
          On this page
          <Icon as={open ? CaretDown : CaretRight} size="sm" aria-hidden />
        </button>
        {open ? (
          <div id="toc-list" className="mt-3">
            <TocList items={items} />
          </div>
        ) : null}
      </nav>
    </Card>
  );
}
```

> **Note for the assembler / Phase 2 consistency:** `Icon` is `aria-hidden` by default (no `title`), so the explicit `aria-hidden` above is belt-and-suspenders and harmless. If Phase 2's `Icon` rejects an explicit `aria-hidden` prop (it spreads only `className`/`title`), drop the `aria-hidden` attribute — the default already renders `aria-hidden="true"`. Keep `size="sm"` (20px) to match the caption text scale.

- [ ] **Step 2: Type-check (confirms the `Card`/`Icon` prop usage matches the Phase 2 signatures and the Phosphor named imports resolve).**

```
bun run type-check
```
Expected: `tsc --noEmit` exits 0.

- [ ] **Step 3: Validate pages + lint.**

```
bun run validate:pages && bun run lint:check
```
Expected: both exit 0 (TOC change is presentational; page invariants and the single-h1 assertion remain satisfied).

- [ ] **Step 4: Commit.**

```
git add src/features/content/ArticleTableOfContents.tsx && git commit -m "style: restyle TOC as compact cream Card with caret toggle" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 6.5: Wrap the article body in a cream `Card` and re-token the `MarkdownArticle` header

**Files:** Modify `src/features/content/MarkdownArticle.tsx` (current lines 1–65; touch the imports on 1–4, the `<header>` on 32–47, and the body `<div>` on 49–62).

Per spec table row "Markdown article": wrap `.markdown-body` in a cream `<Card variant="plain">`; header gets a `border-b-2 border-border`; h1 → `text-ink`; meta date → `text-ink-secondary` (NOT `text-disabled`/`#c4b89e`, which would fail contrast). The two-column grid (body + sticky TOC aside) is preserved; only the body cell is wrapped in `Card`.

- [ ] **Step 1: Add the `Card` import.** Replace the import block (lines 1–4):

Before:
```tsx
import { useState } from "react";
import { ArticleTableOfContents } from "./ArticleTableOfContents";
import { useMarkdownEnhancements } from "./useMarkdownEnhancements";
import type { ProcessedMarkdown } from "./markdownService";
```

After:
```tsx
import { useState } from "react";
import { Card } from "@/shared/components/Card";
import { ArticleTableOfContents } from "./ArticleTableOfContents";
import { useMarkdownEnhancements } from "./useMarkdownEnhancements";
import type { ProcessedMarkdown } from "./markdownService";
```

- [ ] **Step 2: Re-token the header.** Replace the `<header>` block (lines 32–47):

Before:
```tsx
      <header className="mb-8 border-b border-slate-200 pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          {processed.meta.title ?? title}
        </h1>
        {description ? (
          <p className="mt-3 max-w-3xl text-lg text-slate-600">{description}</p>
        ) : null}
        {processed.meta.date ? (
          <p className="mt-2 text-sm text-slate-400">
            Updated{" "}
            <time dateTime={String(processed.meta.date)}>
              {String(processed.meta.date)}
            </time>
          </p>
        ) : null}
      </header>
```

After:
```tsx
      <header className="mb-8 border-b-2 border-border pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          {processed.meta.title ?? title}
        </h1>
        {description ? (
          <p className="mt-3 max-w-3xl text-lg text-ink-soft">{description}</p>
        ) : null}
        {processed.meta.date ? (
          <p className="mt-2 text-sm text-ink-secondary">
            Updated{" "}
            <time dateTime={String(processed.meta.date)}>
              {String(processed.meta.date)}
            </time>
          </p>
        ) : null}
      </header>
```

- [ ] **Step 3: Wrap the markdown body cell in `<Card variant="plain">`.** Replace the body `<div ref={setContainer} …>` (lines 50–56). The `ref`/`className="markdown-body min-w-0"`/`dangerouslySetInnerHTML` stay on the inner div; `Card` becomes the cream surface around it. The `min-w-0` is duplicated onto the `Card` so the grid track can still shrink for horizontal-scroll tables/code.

Before:
```tsx
        <div
          ref={setContainer}
          className="markdown-body min-w-0"
          // Markdown is rendered with raw HTML disabled and sanitized when
          // enabled (§22), so the resulting HTML is safe to inject here.
          dangerouslySetInnerHTML={{ __html: processed.html }}
        />
```

After:
```tsx
        <Card variant="plain" className="min-w-0">
          <div
            ref={setContainer}
            className="markdown-body min-w-0"
            // Markdown is rendered with raw HTML disabled and sanitized when
            // enabled (§22), so the resulting HTML is safe to inject here.
            dangerouslySetInnerHTML={{ __html: processed.html }}
          />
        </Card>
```

- [ ] **Step 4: Type-check + validate pages (confirms `Card variant="plain"` matches Phase 2, and the single-h1 contract still holds).**

```
bun run type-check && bun run validate:pages
```
Expected: both exit 0.

- [ ] **Step 5: Build (the real SSG integration gate — article routes prerender with the new Card wrapper).**

```
bun run build
```
Expected: build completes; all Markdown article routes prerender without errors.

- [ ] **Step 6: Commit.**

```
git add src/features/content/MarkdownArticle.tsx && git commit -m "style: wrap article body in cream Card and re-token header" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 6.6: Reskin the 404 (`NotFoundPage`) — `bg-page`, error code, secondary-pill links, friendly icon

**Files:** Modify `src/features/content/NotFoundPage.tsx` (rewrite the full current file, lines 1–51).

Per spec table row "404": `bg-page`; the `404` code stays **large + bold** (≥24px) so the 3:1 large-text gate applies to `text-error`; suggestion links become `<Button variant="secondary" size="sm">` pills (rendered on `<Link>` via `buttonClasses`); add a friendly `Cat`/`Dog` icon. `PageHead`/`noindex`/`navbarPages`/`navLabelFor` and the `<h1>`-per-route contract are preserved. `buttonClasses` and `Icon` are Phase 2 APIs; `Cat` is a named Phosphor import (§12).

- [ ] **Step 1: Replace the entire file contents.**

```tsx
import { Link } from "react-router-dom";
import { Cat } from "@phosphor-icons/react";
import { PageHead } from "@/shared/components/PageHead";
import { Icon } from "@/shared/components/Icon";
import { buttonClasses } from "@/shared/components/Button";
import { navbarPages, navLabelFor } from "@/config/navigation";

/**
 * 404 page (§11). Suggestions are derived from navbar pages — no second route
 * list. Marked noindex so search engines do not surface it.
 */
export function NotFoundPage() {
  return (
    <>
      <PageHead
        path="/404"
        title="Page not found"
        seo={{
          title: "Page not found — BASIS-China 2026 iGEM",
          description: "The requested page could not be found.",
          keywords: ["404", "not found"],
          robots: "noindex, follow",
        }}
      />
      <section className="mx-auto max-w-2xl bg-page px-4 py-24 text-center">
        <Icon
          as={Cat}
          size="lg"
          className="mx-auto mb-4 text-primary-deep"
          title="Lost cat"
        />
        <p className="text-6xl font-black text-error">404</p>
        <h1 className="mt-4 text-3xl font-bold text-ink">Page not found</h1>
        <p className="mt-3 text-ink-soft">
          The page you are looking for doesn&apos;t exist or has moved.
        </p>

        <nav aria-label="Suggested pages" className="mt-10">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-secondary">
            Try one of these
          </h2>
          <ul className="mt-4 flex flex-wrap justify-center gap-3">
            {navbarPages.map((page) => (
              <li key={page.path}>
                <Link
                  to={page.path}
                  className={buttonClasses("secondary", "sm")}
                >
                  {navLabelFor(page)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </section>
    </>
  );
}
```

> **Note for assembler:** the `Cat` icon is given a `title` so `Icon` renders `role="img"` + `aria-label` (per Phase 2 contract) — it conveys the friendly-mascot intent rather than being purely decorative. If the design team prefers a fully decorative icon, drop `title` to make it `aria-hidden`. Either is AA-valid; `title` is the more descriptive default chosen here.

- [ ] **Step 2: Type-check + lint (confirms `buttonClasses("secondary","sm")` signature, `Icon` props, and the `Cat` named import resolve).**

```
bun run type-check && bun run lint:check
```
Expected: both exit 0.

- [ ] **Step 3: Build (404 is prerendered by `vite-react-ssg`; this is the integration gate).**

```
bun run build
```
Expected: build completes; the `/404` route prerenders without errors.

- [ ] **Step 4 (visual): Dev-server spot check.** Run the dev server and open the 404 route in a browser.

```
bun run dev
```
Expected: navigating to any unknown path (e.g. `http://localhost:5173/does-not-exist`) shows the parchment `bg-page` background, a teal `Cat` icon, a large brick-red `404`, brown `text-ink` heading, and secondary-pill suggestion links with the 3D-less secondary hover/lift. Stop the server (Ctrl-C) after confirming.

- [ ] **Step 5: Commit.**

```
git add src/features/content/NotFoundPage.tsx && git commit -m "style: reskin 404 with bg-page, friendly cat icon and secondary pills" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 6.7: Phase-wide verification gate

**Files:** (no file changes — verification only)

- [ ] **Step 1: Run the full gate suite in order.**

```
bun run type-check && bun run validate:pages && bun run audit:theme && bun run lint:check && bun run build
```
Expected: every command exits 0. Specifically — `audit:theme` reports no `#19c8b9`-as-text and no emoji across `markdown.css`; `validate:pages` passes the single-h1 assertion; `build` prerenders every route (including Markdown articles and `/404`) with no SSR/hydration errors.

- [ ] **Step 2 (visual): Confirm a real Markdown article surface.** Run the dev server and open any content route that contains a code block, a blockquote, a table, and (if available) a Mermaid diagram.

```
bun run dev
```
Expected: body text is warm brown `#725d42` on the cream `Card`; h2 has a 2px brown bottom border; links are deep teal `#0d6f63` (not bright `#19c8b9`); blockquote shows a teal rail on a soft-teal fill; code blocks render on warm pale `#fffaf5` with legible warm syntax colors and a soft-teal "Copy" button with a brown focus ring; the TOC is a compact cream card with a caret toggle whose `aria-expanded` flips on click; any Mermaid diagram uses the soft-teal/brown base palette in Nunito. Stop the server after confirming.


---

## Phase 7 — Team, states, index.html, favicon

### Task 7.1: Add `@phosphor-icons/react` dependency

**Files:** Modify `package.json` (deps block, current lines 23–32)

NOTE: the dependency was already installed in **Task 1.0** (the global prerequisite). This task is an idempotent re-verification (`bun add` is a no-op if it is already present). The package ships pure-SVG React components (named exports), which prerender safely under vite-react-ssg.

- [ ] **Step 1: Install the dependency** — run the exact command:

```bash
bun add @phosphor-icons/react@^2.1.7
```

  Expected: `bun.lock` updates and `package.json` `dependencies` gains a `"@phosphor-icons/react"` entry; install completes with no error.

- [ ] **Step 2: Verify it landed in `package.json` deps** — run:

```bash
grep '"@phosphor-icons/react"' package.json
```

  Expected: one line printed, e.g. `    "@phosphor-icons/react": "^2.1.7",` (under `"dependencies"`, not `"devDependencies"`).

- [ ] **Step 3: Confirm it resolves and is importable** — run:

```bash
bun run -e 'import("@phosphor-icons/react").then(m => console.log(["Cat","Dog","User","Warning"].every(k => k in m) ? "OK" : "MISSING"))'
```

  Expected: `OK` (the named exports `Cat`, `Dog`, `User`, `Warning` all exist — these are the icons consumed later in this phase).

- [ ] **Step 4: Commit**

```bash
git add package.json bun.lock && git commit -m "chore: add @phosphor-icons/react dependency" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 7.2: Reskin the Team page (Title/Card/Tag/Icon + all-empty-roster empty state)

**Files:** Modify `src/features/team/TeamPage.tsx` (replace entire file, current lines 1–85)

Current state to change (before → after):
- `MemberCard` `<li className="rounded-2xl border border-slate-200 p-6 text-center">` → `<li>` wrapping `<Card variant="polka" compact>`. (Member cards are NOT links, so we use `variant="polka"`, the literal token the spec quotes for this surface — NOT `interactive`, which would falsely imply clickability. `Card` has no `as` prop, so the `<ul>`/`<li>` list semantics are preserved by keeping the `<li>` wrapper.)
- avatar `bg-emerald-100` + initial-letter fallback `text-emerald-700` → `bg-primary-soft` + `<Icon as={User}>` fallback.
- focus badge `<p className="text-sm font-medium text-emerald-700">` → `<Tag tone="info">` (Tag owns the `#794f27`-on-soft 6.5:1 visual from Phase 2; do not recompute the hex or color-code per focus area).
- bio `text-slate-600` → `text-ink-soft`.
- header h1 `<h1 className="text-3xl … text-slate-900 sm:text-4xl">` → `<Title level="h1">` (Title owns sizing + ribbon; drop the `text-3xl sm:text-4xl` font-size classes so they don't fight the component). Summary `text-slate-600` → `text-ink-soft`.
- section h2 `<h2 className="text-2xl font-bold text-slate-900">` → `<Title level="h2">`.
- header divider `border-slate-200` → `border-border-soft`.
- **NEW:** compute rendered sections first; if the whole roster is empty, render one centered `<Card>` empty-state (Cat + Dog `<Icon>` + "Team roster coming soon") instead of nothing. Single-`<h1>` contract preserved (one `<Title level="h1">`; sections are `level="h2"`).

- [ ] **Step 1: Replace the file with the reskinned version** — write `src/features/team/TeamPage.tsx`:

```tsx
import { Cat, Dog, User } from "@phosphor-icons/react";
import { requirePage } from "@/config/pageData";
import { Card } from "@/shared/components/Card";
import { Icon } from "@/shared/components/Icon";
import { PageHead } from "@/shared/components/PageHead";
import { Tag } from "@/shared/components/Tag";
import { Title } from "@/shared/components/Title";
import { resolveAssetUrl } from "@/shared/utils/assetUrl";
import { teamMembers, teamSections } from "./teamData";
import type { TeamMember } from "./teamTypes";

const page = requirePage("team");

function MemberCard({ member }: { member: TeamMember }) {
  return (
    <li>
      <Card variant="polka" compact className="h-full text-center">
        <div className="mx-auto flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-primary-soft">
          {member.photo ? (
            <img
              src={resolveAssetUrl(member.photo)}
              alt={`Portrait of ${member.name}`}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <Icon
              as={User}
              size="lg"
              weight="duotone"
              className="text-primary-deep"
            />
          )}
        </div>
        <h3 className="mt-4 text-lg font-semibold text-ink">{member.name}</h3>
        {member.focus ? (
          <div className="mt-2 flex justify-center">
            <Tag tone="info">{member.focus}</Tag>
          </div>
        ) : null}
        {member.bio ? (
          <p className="mt-3 text-sm text-ink-soft">{member.bio}</p>
        ) : null}
      </Card>
    </li>
  );
}

/**
 * Team page (React feature module). Roster comes from teamData.ts.
 */
export function TeamPage() {
  const renderedSections = teamSections
    .map((section) => ({
      section,
      members: teamMembers.filter((member) =>
        section.roles.includes(member.role),
      ),
    }))
    .filter((group) => group.members.length > 0);

  return (
    <>
      <PageHead path={page.path} title={page.title} seo={page.seo} />
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <header className="mb-10 border-b border-border-soft pb-6">
          <Title level="h1">{page.title}</Title>
          {page.summary ? (
            <p className="mt-4 max-w-3xl text-lg text-ink-soft">
              {page.summary}
            </p>
          ) : null}
        </header>

        {renderedSections.length === 0 ? (
          <Card variant="plain" className="mx-auto max-w-md text-center">
            <div
              aria-hidden="true"
              className="flex items-center justify-center gap-3 text-primary-deep"
            >
              <Icon as={Cat} size="lg" weight="duotone" />
              <Icon as={Dog} size="lg" weight="duotone" />
            </div>
            <p className="mt-4 text-lg font-semibold text-ink">
              Team roster coming soon
            </p>
            <p className="mt-2 text-sm text-ink-soft">
              Our cats &amp; dogs are still rounding up the crew. Check back
              shortly to meet the BASIS-China team.
            </p>
          </Card>
        ) : (
          renderedSections.map(({ section, members }) => (
            <section key={section.id} className="mb-12">
              <Title level="h2">{section.title}</Title>
              <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {members.map((member, index) => (
                  <MemberCard key={`${member.name}-${index}`} member={member} />
                ))}
              </ul>
            </section>
          ))
        )}
      </div>
    </>
  );
}

export default TeamPage;
```

- [ ] **Step 2: Type-check (verifies Title/Card/Tag/Icon API wiring + named Phosphor imports)** — run:

```bash
bun run type-check
```

  Expected: exits 0, no output. (Confirms `Card variant="polka"`, `Tag tone="info"`, `Title level`, and `Icon as=/size=/weight=` all match the Phase 2 signatures, and `User`/`Cat`/`Dog` are valid named exports.)

- [ ] **Step 3: Single-h1 + page-registry invariants** — run:

```bash
bun run validate:pages
```

  Expected: passes (exactly one `<h1>` on the route — the lone `<Title level="h1">`; all sections are `h2`).

- [ ] **Step 4: Theme guard (no emoji, no `#19c8b9`-as-text, tokens present)** — run:

```bash
bun run audit:theme
```

  Expected: passes (glyphs are Phosphor SVG `<Icon>`s — zero emoji; no bright-teal text).

- [ ] **Step 5: Lint** — run:

```bash
bun run lint:check
```

  Expected: exits 0, no errors.

- [ ] **Step 6: Full SSG build (the real integration gate — confirms the route prerenders)** — run:

```bash
bun run build
```

  Expected: build succeeds; `/team` prerenders with no SSR/hydration warning. (Phosphor icons are pure SVG, so first paint is stable.)

- [ ] **Step 7: Visual check (partial — populated roster only)** — run `bun run dev`, open `/team`. Expected: ribbon Title heading, polka member cards with brown `User` avatar fallback + `info` Tag badges. NOTE: the all-empty-roster empty-state is NOT reachable in `dev` without temporarily emptying `teamData.ts` — do not treat this `dev` check as covering the empty-state branch; type-check + build are its real gates.

- [ ] **Step 8: Commit**

```bash
git add src/features/team/TeamPage.tsx && git commit -m "feat: reskin team page with ribbon titles, polka member cards, and empty-state" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 7.3: Reskin `PageLoading` spinner to the theme

**Files:** Modify `src/shared/components/PageLoading.tsx` (replace entire file, current lines 1–18)

Before → after: spinner color `text-emerald-600` → `text-primary-deep`; size `h-8 w-8` → `h-10 w-10` (per spec §8). KEEP `motion-safe:animate-spin`, `role="status"`, `aria-live="polite"`, the `sr-only` "Loading…" label, and `aria-hidden` on the spinner.

- [ ] **Step 1: Replace the file** — write `src/shared/components/PageLoading.tsx`:

```tsx
/**
 * Suspense fallback for lazily-loaded route components (§11).
 */
export function PageLoading() {
  return (
    <div
      className="flex min-h-[50vh] items-center justify-center"
      role="status"
      aria-live="polite"
    >
      <span className="sr-only">Loading…</span>
      <span
        aria-hidden="true"
        className="motion-safe:animate-spin inline-block h-10 w-10 rounded-full border-2 border-current border-t-transparent text-primary-deep"
      />
    </div>
  );
}
```

- [ ] **Step 2: Type-check + lint** — run:

```bash
bun run type-check && bun run lint:check
```

  Expected: both exit 0, no errors.

- [ ] **Step 3: Theme guard** — run:

```bash
bun run audit:theme
```

  Expected: passes (no `emerald-*`, no emoji; `text-primary-deep` token present).

- [ ] **Step 4: Commit** (groups with the next ErrorBoundary task is acceptable, but commit standalone here for a clean history)

```bash
git add src/shared/components/PageLoading.tsx && git commit -m "style: theme PageLoading spinner with primary-deep token" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 7.4: Reskin `ErrorBoundary` (RouteErrorBoundary + AppErrorBoundary fallback)

**Files:** Modify `src/shared/components/ErrorBoundary.tsx` (current lines 1–74)

Before → after:
- `RouteErrorBoundary`: h1 `text-slate-900` → `text-ink`; detail `text-slate-600` → `text-ink-soft`; the "Back to Home" `<Link>` swaps its `bg-emerald-600 …` classes for `buttonClasses("primary")` (it is a recovery action and stays a `<Link>` — the contract exports `buttonClasses` specifically "for use on `<Link>`"; do NOT convert it to `<Button>` or use `danger`). ADD an optional decorative `<Warning>` icon above the title.
- `AppErrorBoundary.render()` fallback `text-slate-600` → `text-ink-soft`.

- [ ] **Step 1: Update the imports line** — in `src/shared/components/ErrorBoundary.tsx`, change line 1–2:

```tsx
import { Component, type ErrorInfo, type ReactNode } from "react";
import { Link, isRouteErrorResponse, useRouteError } from "react-router-dom";
```

  to:

```tsx
import { Warning } from "@phosphor-icons/react";
import { Component, type ErrorInfo, type ReactNode } from "react";
import { Link, isRouteErrorResponse, useRouteError } from "react-router-dom";
import { buttonClasses } from "@/shared/components/Button";
import { Icon } from "@/shared/components/Icon";
```

- [ ] **Step 2: Restyle the `RouteErrorBoundary` returned markup** — replace the current `return (...)` block (lines 21–32):

```tsx
  return (
    <section className="mx-auto max-w-2xl px-4 py-24 text-center">
      <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
      <p className="mt-4 text-slate-600">{detail}</p>
      <Link
        to="/"
        className="mt-8 inline-block rounded-md bg-emerald-600 px-5 py-2.5 font-medium text-white transition hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
      >
        Back to Home
      </Link>
    </section>
  );
```

  with:

```tsx
  return (
    <section className="mx-auto max-w-2xl px-4 py-24 text-center">
      <Icon
        as={Warning}
        size="lg"
        weight="duotone"
        className="mx-auto mb-4 block text-primary-deep"
      />
      <h1 className="text-3xl font-bold text-ink">{title}</h1>
      <p className="mt-4 text-ink-soft">{detail}</p>
      <Link to="/" className={buttonClasses("primary", "md", "mt-8")}>
        Back to Home
      </Link>
    </section>
  );
```

- [ ] **Step 3: Restyle the `AppErrorBoundary` fallback** — replace the current fallback paragraph (lines 66–68):

```tsx
          <p className="px-4 py-8 text-center text-slate-600">
            This section failed to load.
          </p>
```

  with:

```tsx
          <p className="px-4 py-8 text-center text-ink-soft">
            This section failed to load.
          </p>
```

- [ ] **Step 4: Type-check (verifies `buttonClasses` 3-arg signature + `Icon` API)** — run:

```bash
bun run type-check
```

  Expected: exits 0, no output. (Confirms `buttonClasses("primary", "md", "mt-8")` matches `buttonClasses(variant, size, extra?)`.)

- [ ] **Step 5: Theme guard + lint** — run:

```bash
bun run audit:theme && bun run lint:check
```

  Expected: both pass (no `emerald-*`/`slate-*`, no emoji).

- [ ] **Step 6: Full SSG build** — run:

```bash
bun run build
```

  Expected: build succeeds. NOTE: these error states are transient/hard to trigger in `dev` (require a thrown render error), so build + type-check are the real gates; no `dev` visual checkbox here.

- [ ] **Step 7: Commit**

```bash
git add src/shared/components/ErrorBoundary.tsx && git commit -m "style: theme route + app error boundaries with primary button and warning icon" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 7.5: Author the themed cat/dog favicon SVG (in-repo source-of-truth artifact)

**Files:** Create `public/favicon-catdog.svg`

The favicon is a concrete deliverable (§13). Because we cannot push to `static.igem.wiki` from this environment, we author the real, complete SVG in-repo as the source-of-truth artifact; a human uploads it (Task 7). The motif is inspired by Phosphor's `Cat` glyph but authored from honest geometry (no fabricated Phosphor path data). Fills use theme browns/teal-deep/teal-light — deliberately NOT bare `#19c8b9` — so any `audit:theme` hex grep stays clean.

- [ ] **Step 1: Create the SVG** — write `public/favicon-catdog.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" role="img" aria-label="BASIS-China cat and dog">
  <rect width="64" height="64" rx="14" fill="#f7f3df"/>
  <!-- Cat head (left) -->
  <g>
    <path d="M14 26 L19 14 L27 22 Z" fill="#0d6f63"/>
    <path d="M36 22 L44 14 L49 26 Z" fill="#0d6f63"/>
    <circle cx="31" cy="34" r="16" fill="#82d5bb"/>
    <circle cx="25" cy="32" r="2.4" fill="#794f27"/>
    <circle cx="37" cy="32" r="2.4" fill="#794f27"/>
    <path d="M31 37 l-2.2 2.6 a2.2 2.2 0 0 0 4.4 0 Z" fill="#794f27"/>
    <path d="M31 41 q0 4 -5 4" stroke="#794f27" stroke-width="1.4" fill="none" stroke-linecap="round"/>
    <path d="M31 41 q0 4 5 4" stroke="#794f27" stroke-width="1.4" fill="none" stroke-linecap="round"/>
    <path d="M16 33 h6 M16 36 h6" stroke="#794f27" stroke-width="1.2" stroke-linecap="round"/>
    <path d="M40 33 h6 M40 36 h6" stroke="#794f27" stroke-width="1.2" stroke-linecap="round"/>
  </g>
  <!-- Paw accent (bottom-right) -->
  <g fill="#0d6f63">
    <circle cx="48" cy="50" r="4.4"/>
    <circle cx="42.5" cy="45.5" r="1.9"/>
    <circle cx="48" cy="43.5" r="1.9"/>
    <circle cx="53.5" cy="45.5" r="1.9"/>
  </g>
</svg>
```

- [ ] **Step 2: Validate the SVG is well-formed XML** — run:

```bash
bunx --bun -e 'const s=require("fs").readFileSync("public/favicon-catdog.svg","utf8");const {DOMParser}=require("@xmldom/xmldom")||{};' 2>/dev/null; node -e 'const fs=require("fs");const s=fs.readFileSync("public/favicon-catdog.svg","utf8");if(!/<svg[\s\S]*<\/svg>\s*$/.test(s.trim()))throw new Error("malformed");if(/#19c8b9/i.test(s))throw new Error("bare bright-teal in asset");console.log("OK")'
```

  Expected: `OK` (well-formed `<svg>…</svg>`, and confirms no bare `#19c8b9` fill that a hex grep could flag).

- [ ] **Step 3: Commit the artifact**

```bash
git add public/favicon-catdog.svg && git commit -m "feat: add themed cat/dog favicon SVG source artifact" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 7.6: Theme `index.html` (favicon, body bg, color-scheme, commented Latin preload)

**Files:** Modify `index.html` (full overwrite — current file is 19 lines)

This is the SINGLE owner of `index.html` edits (Phase 1 touches only `main.css`). Overwrite the whole file so there are no fragile partial matches.

- [ ] **Step 1: Overwrite `index.html`** with exactly:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link
      rel="icon"
      href="https://static.igem.wiki/teams/6123/favicon-catdog.svg"
      type="image/svg+xml"
    />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="color-scheme" content="light" />
    <!-- Preload ONLY the small Latin Nunito critical weights (500/700) — never the
         multi-MB CJK Noto Sans SC, which would tank LCP. Commented until the font
         URLs return 200 (see the @font-face block in src/styles/main.css). Uncomment
         the weight(s) that pass the Task 1.2 curl probe. -->
    <!--
    <link rel="preload" as="font" type="font/woff2" crossorigin href="https://static.igem.wiki/teams/6123/fonts/nunito-500.woff2" />
    <link rel="preload" as="font" type="font/woff2" crossorigin href="https://static.igem.wiki/teams/6123/fonts/nunito-700.woff2" />
    -->
    <!-- Per-route page title, meta, canonical, and JSON-LD are injected at
         build time by the head manager (src/shared/components/PageHead.tsx).
         No static page title is set here, to avoid duplicating it. -->
  </head>
  <body style="background:#f8f8f0">
    <div id="root"></div>
    <script type="module" src="/src/app/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 2: Full SSG build** — `bun run build` — Expected: build succeeds; `dist/index.html` retains the inline body bg, color-scheme meta, and themed favicon.

- [ ] **Step 3: Confirm wiring** — run:

```bash
grep -c "igem-2022.svg" index.html; grep -c "teams/6123/favicon-catdog.svg" index.html; grep -c 'name="color-scheme"' index.html
```
  Expected: `0`, `1`, `1`.

- [ ] **Step 4: Commit** — `git add index.html && git commit -m "feat: theme index.html (parchment body bg, light color-scheme, cat/dog favicon, Latin preload)" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"`

---

### Task 7.7: Upload the favicon to `static.igem.wiki` (MANUAL — human-gated, not an automated build gate)

**Files:** None (deployment action against the in-repo `public/favicon-catdog.svg` artifact from Task 5)

This step requires iGEM team credentials and the iGEM static-asset uploader, which are not available in this environment. It is intentionally NOT attached to any `bun run` gate — the `build` gate already passed in Task 6 with the external href (vite never fetches it). Document this as a manual checkbox so the deliverable closes when a human has the credentials.

- [ ] **Step 1: Upload the artifact** — a team member with iGEM access uploads `public/favicon-catdog.svg` to the team's static space so it is served at exactly:

```
https://static.igem.wiki/teams/6123/favicon-catdog.svg
```

  (Use the iGEM 2026 team file uploader; the path must match the `href` already committed in `index.html`.)

- [ ] **Step 2: Verify the hosted URL returns 200 with an SVG content-type** (run AFTER upload only):

```bash
curl -sS -o /dev/null -w '%{http_code} %{content_type}\n' https://static.igem.wiki/teams/6123/favicon-catdog.svg
```

  Expected: `200 image/svg+xml` (the favicon resolves in production). If this 404s, the upload has not propagated yet — re-run; do NOT treat a pre-upload 404 as a code regression.

- [ ] **Step 3: No commit** — this task ships no repository change (the `index.html` href and the SVG source artifact were already committed in Tasks 5–6). Mark the deliverable complete once Step 2 returns 200.

---

## Phase 8 — Final end-to-end verification

### Task 8.1: Full gate sweep + visual smoke + commit

**Files:** none (verification only)

- [ ] **Step 1: Run the full gate suite**

```bash
bun run check-all && bun run build
```
Expected: validate-pages, type-check, lint, format, **audit:theme** all pass; full SSG build emits every route under `dist/` with no errors or hydration warnings.

- [ ] **Step 2: Confirm the theme guard is clean**

```bash
bun run audit:theme
```
Expected: `audit:theme` reports 0 violations (no `#19c8b9`-as-text, no emoji, all required tokens present, Phosphor imports named-only).

- [ ] **Step 3: Visual smoke pass** (`bun run preview` after build, or `bun run dev`)

Eyeball each, confirming the cozy theme + AA legibility:
- `/` — hero (deep-teal CTAs, cat/dog illustration, paw accents), highlight cards (category accents + icons), molecule section.
- any article (e.g. `/description`) — cream article card, ribbon title, deep-teal links, warm code block, themed Mermaid/KaTeX/table, TOC.
- `/team` — ribbon headings, polka member cards, focus badge.
- a bad URL (e.g. `/nope`) — themed 404 with cat/dog.
- mobile width — Phosphor hamburger, pill nav panel.
- OS "reduce motion" on — no hover-lift/3D-press animation; spinner static.
- print preview of an article — chrome hidden, black-on-white body+code, link URLs shown.

- [ ] **Step 4: Final commit (if any polish edits were made)**

```bash
git add -A && git commit -m "style: final cats & dogs theme polish pass" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>" || echo "nothing to commit"
```
