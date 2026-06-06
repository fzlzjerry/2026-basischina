# BASIS-China 2026 — "猫猫狗狗" (Animal-Crossing cozy) Reskin — Design Spec

**Date:** 2026-06-06
**Branch:** `feat/cats-dogs-theme`
**Status:** Design approved in brainstorming; awaiting spec review → implementation plan.

---

## 1. Overview & goals

The team's iGEM 2026 synbio project is about **pet health (cats & dogs)**. This spec reskins
the existing wiki into a warm, cozy, **Animal-Crossing-inspired** visual language (the look of the
`animal-island-ui` library the team liked), **without** changing content, routing, the page
registry, or the build pipeline.

- **In scope:** visual system only — design tokens, typography, icon system, 7 shared components,
  per-page restyle of all 20 registered pages + the app shell + the Markdown content surfaces
  (code, KaTeX, Mermaid, tables), motion, print styles, favicon.
- **Non-goals:** no new content, no route/registry changes, no new dependencies beyond
  `@phosphor-icons/react`, no dark mode (light-only), no architectural refactor. `pageData.ts`,
  `navigation.ts`, SEO/JSON-LD/sitemap, and the accessibility contract stay intact.
- **Hard rules carried from brainstorming:**
  - **No emoji anywhere** — all glyphs are Phosphor SVG icons or SVG illustration.
  - **Build it ourselves** — port the AC look into Tailwind v4 `@theme`; do **not** depend on the
    `animal-island-ui` npm package (clean IP posture; SSG-safe).
  - Keep it **SSG-safe** (vite-react-ssg build-time prerender) and **WCAG 2.1 AA**.

### Notable, deliberate deviation from the reference
`animal-island-ui` uses **bright mint `#19c8b9`** as its primary button fill with light text. That
pairing is **~2:1 contrast and fails WCAG AA** (a bright midtone cannot carry light *or* dark text).
We therefore adopt a **two-teal system**: bright mint `#19c8b9` is **decoration only** (soft fills,
rails, hover glows, large duotone-icon tint); a **deep teal `#0d6f63`** carries **all text**
(buttons, links, affordance icons). Buttons are thus *deeper* teal than the reference — a visible but
necessary change for an evaluated, public wiki.

---

## 2. Locked decisions (brainstorming outcomes)

| Decision | Choice |
|---|---|
| Visual direction | Animal-Crossing cozy ("猫猫狗狗") — cream + warm brown + teal |
| Component strategy | Self-built; tokens ported into Tailwind v4 `@theme`; no UI-lib dependency |
| Icon library | `@phosphor-icons/react`, **Duotone** default, **Fill** for emphasis |
| Footer | **Deep brown** `#794f27` + cream text |
| Fonts | Self-hosted on `static.igem.wiki/teams/6123/fonts/` (see §4 caveat) |
| Category color-coding | **Ship now** — per-category NookPhone accents + Phosphor icons |
| Code blocks | **Warm pale** background + recolored syntax highlighting |
| Emoji | Never — SVG only |

---

## 3. Design tokens (Tailwind v4 `@theme`)

All values below are **contrast-verified** (see §11). This block is appended to
`src/styles/main.css` **after** `@import "tailwindcss";`. Only valid v4 theme namespaces are used
(`--color-*`, `--font-*`, `--radius-*`, `--shadow-*`, `--ease-*`). `@font-face` lives **outside**
`@theme` (§4). Do **not** transcribe the old workflow draft — it contained `#19c8b9`-as-text and a
false "6.5:1" claim; this is the corrected source of truth.

```css
@theme {
  /* ---- Surfaces (warm, never cold gray) ---- */
  --color-page: #f8f8f0;            /* parchment — page background */
  --color-surface: #f7f3df;         /* cream — cards, inputs, article body */
  --color-surface-2: #f9f7f0;       /* warm off-white — inline code bg */
  --color-hover: #f0ede5;           /* neutral hover wash */

  /* ---- Ink (NEVER pure black) ---- */
  --color-ink: #794f27;             /* headings / strong */
  --color-ink-soft: #725d42;        /* body text */
  --color-ink-secondary: #9f927d;   /* secondary (large/non-text only) */
  --color-ink-muted: #8a7b66;       /* muted (large/non-text only) */
  --color-placeholder: #6b5e50;     /* placeholder text (AA, 5.6:1) */
  --color-disabled: #c4b89e;        /* disabled controls only (WCAG-exempt) */

  /* ---- Teal: two-token system ---- */
  --color-primary: #19c8b9;         /* DECORATION ONLY — fills/rails/glows/large icons */
  --color-primary-deep: #0d6f63;    /* TEXT-BEARING — buttons, links, affordance icons */
  --color-primary-soft: #e6f9f6;    /* light teal surface (badges, active nav, blockquote) */
  --color-primary-rail: #0a5249;    /* 3D shadow rail under deep-teal primary button */

  /* ---- Status (text-safe values) ---- */
  --color-success: #2f7a36;         /* AA on cream */
  --color-warning: #946011;         /* ochre amber — AA on cream (4.78:1) */
  --color-error: #c0392b;           /* danger text/fills, white text passes */
  --color-error-soft: #fdecea;      /* error wash */

  /* ---- Focus ---- */
  --color-focus-ring: #794f27;      /* brown — focus ring on LIGHT surfaces (6.6:1) */
  --color-focus-on-dark: #ffcc00;   /* yellow — focus ring on DARK fills only */

  /* ---- Borders ---- */
  --color-border: #8a7b66;          /* standard 2px — interactive edges (3.7:1 non-text) */
  --color-border-soft: #c4b89e;     /* decorative-only dividers inside cards */

  /* ---- Footer (deep brown surface) ---- */
  --color-footer: #794f27;
  --color-footer-divider: #6b5b47;
  --color-footer-text: #f0ede5;
  --color-footer-text-muted: #d9cec4;

  /* ---- NookPhone accent palette: LIGHT = backgrounds/rails, INK = text/icon ---- */
  --color-app-teal: #82d5bb;   --color-app-teal-ink: #1f7a5e;   /* project */
  --color-app-blue: #889df0;   --color-app-blue-ink: #2f4fa8;   /* wet-lab */
  --color-app-purple: #b77dee; --color-app-purple-ink: #6a3fa0; /* dry-lab */
  --color-app-green: #8ac68a;  --color-app-green-ink: #2f7a36;  /* human-practices */
  --color-app-peach: #e18c6f;  --color-app-peach-ink: #b04a28;  /* team */
  --color-app-pink: #f8a6b2;   --color-app-pink-ink: #b03a52;   /* 404 / playful */

  /* ---- Radii (min 12px on interactive; never 0) ---- */
  --radius-min: 12px;
  --radius-badge: 10px;      /* non-interactive tags only */
  --radius-tooltip: 16px;
  --radius-card: 20px;
  --radius-pill: 50px;       /* buttons / inputs / nav items */

  /* ---- Shadows ---- */
  --shadow-soft: 0 2px 4px rgb(61 52 40 / 0.06);
  --shadow-soft-hover: 0 4px 12px rgb(61 52 40 / 0.10);
  --shadow-card-lift: 0 4px 12px rgb(61 52 40 / 0.08);
  --shadow-btn-3d: 0 5px 0 0 var(--color-primary-rail);
  --shadow-btn-3d-hover: 0 6px 0 0 var(--color-primary-rail);
  --shadow-btn-3d-active: 0 1px 0 0 var(--color-primary-rail);

  /* ---- Fonts (families only; @font-face outside @theme) ---- */
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
    font-weight: 500;                 /* AC body weight */
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
  }
  :root { color-scheme: light; }      /* light-only; stop UA dark-mode inversion */
}
```

**Keep** the existing `main.css` rules: `html { scroll-behavior: smooth }`,
`:where([id]) { scroll-margin-top: 5rem }`, and the
`@media (prefers-reduced-motion: reduce)` block — that block already zeroes every
transition/animation duration, so all hover-lift and 3D-press effects auto-neutralize for a11y
(§10) with no extra code.

---

## 4. Typography & fonts

- **Families:** Latin → **Nunito** (rounded, cozy); CJK → **Noto Sans SC**; fallback
  `-apple-system, "PingFang SC", sans-serif`.
- **Weight scale (all ≥400):** body 500; secondary/meta 500; buttons + card titles + subheads 600;
  page/article headings 600–700; **ribbon Title banners 900**.
- **Self-hosting (iGEM rule — fonts MUST be on `static.igem.wiki`, not Google Fonts CDN):**
  `@font-face` rules go in `main.css` **outside** `@theme`, under
  `https://static.igem.wiki/teams/6123/fonts/`.

  > ⚠️ **Unverified at spec time.** Probing that path for common filenames returned **HTTP 403**
  > (object store denies listing; inconclusive about existence). The exact uploaded filenames are
  > unknown. **Implementation step:** `curl -o /dev/null -w "%{http_code}"` each candidate URL; only
  > wire `@font-face`/`<link rel=preload>` to URLs that return **200**. If none verify, ship the
  > **system-font fallback stack** (already in `--font-body`) and add `@font-face` in a follow-up —
  > this degrades safely (no broken text, just non-brand fonts).

  Named convention (adjust to real filenames once verified):
  ```css
  @font-face{font-family:"Nunito";src:url("https://static.igem.wiki/teams/6123/fonts/nunito-500.woff2") format("woff2");font-weight:500;font-display:swap;}
  /* + weights 400/600/700/900 for Nunito; 400/500/700 for "Noto Sans SC" */
  ```
- **Preload (perf):** preload **only the small Latin Nunito** critical weights (500/700) in
  `index.html`. **Do NOT preload Noto Sans SC** — a full CJK woff2 is multiple MB and would tank LCP.
  Subset Noto Sans SC to used glyphs, or load it `font-display: swap` without preload so Latin paints
  first.
- **Markdown article body (long science text, must stay readable while cozy):** body `#725d42` on a
  **cream card `#f7f3df`** (not bare parchment) for steady ~5.6:1; line-height **1.7–1.75**; measure
  capped by the existing container. Headings `#794f27` with 2px warm-brown bottom borders as chapter
  breaks. (Contrast details in §11.)

---

## 5. Icon system (Phosphor)

- **Dependency:** add `@phosphor-icons/react`. **Default weight = Duotone**; **Fill** reserved for
  emphasis/active/selected. No other weights. No emoji — these SVGs are the only glyph source.
- **Imports:** always individual named imports (`import { Cat, PawPrint } from "@phosphor-icons/react"`).
  **Never** barrel/`import *` — keeps the prerender bundle lean.
- **SSG safety:** Phosphor icons are pure SVG React components (no `window`/`document` at module load
  or first render) → prerender cleanly.
- **Wrapper:** route all usage through `src/shared/components/Icon.tsx`:
  - `as={PhosphorComponent}` prop (never barrel-import inside the wrapper);
  - `weight` defaults to `"duotone"`; pass `"fill"` for emphasis;
  - size map `{ xs:16, sm:20, md:24, lg:32 }`; inline-with-text ≈ `1em`;
  - color via `currentColor` (caller applies a token class, e.g. `text-[color:var(--color-primary-deep)]`);
  - `aria-hidden="true"` by default; when `title` is passed → `role="img"` + `aria-label`.
- **Theme signature glyph:** `PawPrint` (replaces every `→`/arrow in CTAs) to reinforce 猫猫狗狗.
- **Per-category mapping** (drives §7; keyed to the **real** 7-member union):

  | Category | Phosphor icon | Accent bg / rail | Icon+text ink |
  |---|---|---|---|
  | `home` | `House` | app-teal `#82d5bb` | `#1f7a5e` |
  | `project` | `Flask` (or `Dna`) | app-teal `#82d5bb` | `#1f7a5e` |
  | `wet-lab` | `TestTube` | app-blue `#889df0` | `#2f4fa8` |
  | `dry-lab` | `Desktop` (or `Code`) | app-purple `#b77dee` | `#6a3fa0` |
  | `human-practices` | `HandHeart` | app-green `#8ac68a` | `#2f7a36` |
  | `team` | `UsersThree` | app-peach `#e18c6f` | `#b04a28` |
  | `other` (fallback) | `Compass` | neutral cream | `#725d42` |

  > Note: `human-practices` is the nav group labeled **"Engagement"**; `other` is the **"More"**
  > catch-all (no page currently uses it, but the record must be exhaustive).

---

## 6. Component specs

All live in `src/shared/components/` (except Navbar/Footer in `src/app/shell/`). All use the §3
tokens, inherit the 0.25s cozy transition, and use yellow-on-dark / brown-on-light focus rings with
`outline-2 outline-offset-2`.

### Button — `src/shared/components/Button.tsx`
Common: `rounded-pill`, `font-semibold`, `inline-flex items-center gap-2`, icon slot ≈ 1.1em
`currentColor`. Sizes sm/md/lg. Disabled: `opacity-60 cursor-not-allowed`, no shadow/translate.
- **primary** — `bg-[var(--color-primary-deep)]` **white** text (≈6.4:1), `shadow-btn-3d`;
  hover `shadow-btn-3d-hover -translate-y-px`; active `shadow-btn-3d-active translate-y-0.5`.
- **danger** — `bg-[var(--color-error)]` white text (5.4:1), rail `#8a2a20`; destructive only.
- **secondary** — `bg-surface text-[var(--color-primary-deep)] border-2 border-[var(--color-border)]
  shadow-soft`; hover `-translate-y-px shadow-soft-hover border-primary-deep`.
- **ghost** — transparent, `text-[var(--color-primary-deep)]`; hover `bg-primary-soft`; no shadow.

### Card — `src/shared/components/Card.tsx`
Base `bg-surface rounded-card border-2 border-[var(--color-border)] p-8` (compact `p-4`).
Variants: **plain** (`shadow-soft`); **polka** (adds radial-dot texture, decorative); **interactive**
(`hover:-translate-y-0.5 hover:shadow-card-lift`, focus ring; for Link/button cards);
**accent** (`border-l-4` in a `--color-app-*` token for category coding). Titles `text-ink
font-semibold`; body `text-ink-soft`.

### Title (ribbon) — `src/shared/components/Title.tsx`
Inline-block ribbon: `bg-primary-soft` + `border-2 border-[var(--color-border)]`, `px-6 py-2`,
`rounded-min`, text `text-ink font-black (900)`. Swallowtail ends = pure-CSS `::before/::after`
notches (no image, SSG-safe, `aria-hidden`). `level` (h1/h2/h3 → semantic tag + size), `align`.
Fallback if responsive swallowtail is fragile: flat banner with notched corners (still weight 900,
never a rounded blob).

### Tag — `src/shared/components/Tag.tsx`
`rounded-badge` (non-interactive), `px-2.5 py-0.5 text-xs font-semibold`. **category**: light accent
bg + the accent's **-ink** token text (≥4.5:1, e.g. `#ecf8f2` bg + `#1f7a5e` text). **status**:
success/warning/error/info(primary-soft + primary-deep). Optional leading Phosphor icon 0.9em. If a
Tag becomes a clickable filter, bump to `rounded-pill`.

### Navbar — `src/app/shell/Navbar.tsx`
Header `bg-page/90 backdrop-blur border-b-2 border-[var(--color-border)]`. Logo `text-ink
font-bold`; year span `text-[var(--color-primary-deep)]`. Link pills `rounded-pill`; active
`bg-primary-soft text-[var(--color-primary-deep)]` (5.7:1); idle `text-ink-soft hover:bg-hover
hover:text-ink hover:-translate-y-px`. Dropdown toggle adds `shadow-soft` → hover 3D. Replace glyphs:
`▾`→`<CaretDown weight="duotone">`, `☰`→`<List>`, `✕`→`<X>` (Duotone, `text-[var(--color-primary-deep)]`).
Dropdown menu `bg-page border-2 border-[var(--color-border)] rounded-card shadow-card-lift`. Keep all
`aria-expanded`/`aria-controls`/Escape/`sr-only` labels.

### Footer — `src/app/shell/Footer.tsx`
`bg-[var(--color-footer)] text-[var(--color-footer-text)] border-t-2
border-[var(--color-footer-divider)]`. Meta/labels `text-footer-text-muted`. Links `hover:text-page
hover:underline`, **yellow** focus ring (dark surface). **Do not touch** the CC-license and GitLab
links' `href/rel/target` (iGEM-required on every page); restyle color only.

### Icon — `src/shared/components/Icon.tsx`
As specced in §5.

---

## 7. Category metadata module (NEW)

`src/config/pageCategoryMeta.tsx` — a **presentation** module (may import React + Phosphor) mapping
`PageCategory → { Icon, accentBg, accentRail, ink, label }`. Typed
`Record<PageCategory, CategoryMeta>` so the compiler **enforces all 7 keys**
(`home｜team｜project｜wet-lab｜dry-lab｜human-practices｜other`) — the synth draft used non-existent
`description/design/engagement` keys and would have broken `tsc`/`validate-pages`.

> **Critical constraint:** `pageData.ts` and `navigation.ts` must stay **pure Node-importable** (no
> React/Phosphor/CSS) — `scripts/validate-pages.ts` and `scripts/generate-sitemap.ts` import them
> under Bun. All JSX/icons live in the new `pageCategoryMeta.tsx`, never in `pageData.ts`.

---

## 8. Per-page / per-surface application

20 registered pages + shell + states. Categories: home (1), team (team, attributions),
project (description, engineering, results, contribution), wet-lab (experiments, notebook,
measurement, plant, safety-and-security), dry-lab (model, software, hardware),
human-practices (human-practices, education, inclusivity, sustainability, entrepreneurship).

| Surface | Change |
|---|---|
| **AppShell** | Drop `bg-white text-slate-800` (now on `<body>`); skip-link → `rounded-pill bg-[var(--color-footer)] text-page` + yellow focus (passes AA, not pure-black). |
| **Home hero** | Section `from-page to-surface`; eyebrow `text-primary-deep`; h1 `text-ink`; body `text-ink-soft`; CTAs → `<Button variant=primary/secondary>` with PawPrint / UsersThree; warm cat/dog illustration + paw accents (SVG, decorative). |
| **Home highlights** | h2 → `<Title>`; cards → `<Card variant="interactive polka accent">` Links; remove `→`, use PawPrint; category accent + icon per §5. |
| **Home molecule** | Section `bg-page`; h2 → `<Title>`; body `text-ink-soft`; viewer container retinted (below). |
| **Molecule viewer** | `border-2 border-[var(--color-border)]`, `bg-page`, `rounded-card`; loading/error `text-ink-muted`; figcaption `text-ink-soft`. (Canvas is transparent-alpha → parchment shows through; CPK atom colors stay — scientific convention.) |
| **Markdown article** | Wrap `.markdown-body` in cream `<Card variant="plain">`; restyle `markdown.css` (§9). |
| **Table of contents** | Compact cream `<Card>`; `+/-` → `<CaretDown/CaretRight>`; links `text-ink-soft`, hover `bg-primary-soft text-primary-deep`; keep `aria-expanded/controls`. |
| **Team page** | h1/h2 → `<Title>`; MemberCard → `<Card variant="polka">` interactive; avatar `bg-primary-soft`, fallback `<User>`; focus badge → `<Tag>` (`#794f27` on soft, 6.5:1); **add all-empty roster empty-state** (Card + Cat/Dog icon + "Team roster coming soon"). |
| **404** | `bg-page`; error code `text-[var(--color-error)]` at **large bold** (≥24px) so 3:1 applies; suggestion links → `<Button variant=secondary sm>` pills; friendly Cat/Dog icon. |
| **PageLoading** | Spinner `text-[var(--color-primary-deep)]`, `h-10 w-10`, keep `motion-safe:animate-spin` + `role=status`. |
| **ErrorBoundary** | h1 `text-ink`; "Back to Home" → `<Button variant=primary>` (recovery, not danger); optional `<Warning>`. |
| **Mobile nav** | `bg-page border-t-2 border-[var(--color-border)]`; `☰/✕`→Phosphor; pills ≥44px tap height. |
| **index.html** | `<body style="background:#f8f8f0">` (kill white flash); preload Latin Nunito only; `color-scheme: light`; **swap stale `igem-2022.svg` favicon → themed cat/dog SVG** hosted at `static.igem.wiki/teams/6123/` (concrete deliverable). |
| **package.json** | Add `@phosphor-icons/react`; enforce named imports. |

---

## 9. Markdown content surfaces (`markdown.css` + `useMarkdownEnhancements.ts`)

- **Body** `#725d42` on cream, line-height 1.7–1.75. **h2** `#794f27` + 2px `#8a7b66` bottom border;
  h3/h4 `#794f27`. **Links** `#0d6f63` (AA — **not** `#19c8b9`, which would be a regression),
  underline + offset. **Blockquote** left rail `#0d6f63`, bg `#e6f9f6`, text `#725d42`,
  radius `0 12px 12px 0`. **Inline code** bg `#f9f7f0`, text `#794f27`, radius 8px.
- **Tables** border `#8a7b66`; `th` bg `#f7f3df`, text `#794f27`. **HR** 2px `#8a7b66`.
- **Code blocks (warm, per decision):** override `prism-tomorrow` dark bg → pale cream `#fffaf5`,
  base token `#725d42`; warm the syntax hues and **re-verify each token color ≥4.5:1 on the pale bg**
  before ship. Copy button: `bg-primary-soft text-ink border border-[var(--color-border)]
  rounded-min`, yellow→no, **brown** focus ring on light.
- **KaTeX:** confirm it does not render pure `#000`; if so, set to `#794f27`.
- **Mermaid** (`useMarkdownEnhancements.ts`): switch `theme:'default'` → **`theme:'base'`** with
  `themeVariables` mapped to tokens and **`fontFamily` set unconditionally** (fix the current
  backwards `prefers-reduced-motion ? 'inherit'` branch):
  ```ts
  mermaid.initialize({
    startOnLoad: false,
    theme: 'base',
    themeVariables: {
      primaryColor: '#e6f9f6', primaryBorderColor: '#0d6f63', primaryTextColor: '#794f27',
      lineColor: '#8a7b66', secondaryColor: '#f7f3df', tertiaryColor: '#fdf0ea',
      textColor: '#725d42', fontFamily: "Nunito, 'Noto Sans SC', sans-serif", fontSize: '14px',
    },
  });
  ```

---

## 10. Motion & interaction

CSS-transition based; inherits the theme default (0.25s + cozy easing).
- **Hover lift:** cards `-translate-y-0.5`, buttons/nav-links `-translate-y-px`, with a shadow step-up.
- **3D press (primary/danger only):** rest 5px rail → hover 6px → active 1px + `translate-y-0.5`
  (shadow shortening reads as a physical press).
- **CTA paw nudge:** `group-hover:translate-x-1` on the trailing PawPrint.
- **Ribbon Title & icons:** static (no entrance animation → stable SSG first paint, no layout shift).
- **Reduced motion:** reuse the **existing** `@media (prefers-reduced-motion: reduce)` block — it
  already forces all durations to ~0, collapsing every translate/shadow transition to an instant
  state and stopping `animate-spin`. No parallel a11y logic.

---

## 11. Accessibility (WCAG 2.1 AA — verified)

Verified contrast (computed; surfaces: page `#f8f8f0`, cream `#f7f3df`, soft `#e6f9f6`, brown `#794f27`):

| Pair | Ratio | Gate | Result |
|---|---|---|---|
| white on primary-deep `#0d6f63` (button) | ~6.4:1 | 4.5 | ✅ |
| primary-deep `#0d6f63` text on cream / page | 5.43 / 5.67 | 4.5 | ✅ |
| body `#725d42` on cream / page | 5.61 / 5.86 | 4.5 | ✅ |
| heading `#794f27` on cream / page | 6.36 / 6.65 | 4.5 | ✅ |
| ink `#794f27` on primary-soft (badge) | 6.50 | 4.5 | ✅ |
| border `#8a7b66` on cream (non-text) | 3.69 | 3.0 | ✅ |
| focus brown `#794f27` on light (non-text) | 6.36–6.65 | 3.0 | ✅ |
| focus yellow `#ffcc00` on brown / deep-teal (non-text) | 4.69 / 3.62 | 3.0 | ✅ |
| placeholder `#6b5e50` on cream | 5.64 | 4.5 | ✅ |
| danger: white on `#c0392b`; `#c0392b` on page (large) | 5.44 / 5.10 | 4.5 | ✅ |
| accent ink teal/blue/purple/green/orange on cream | 4.71–6.72 | 4.5 | ✅ |
| status ink: warning `#946011` / success `#2f7a36` / pink `#b03a52` on cream | 4.78 / 4.76 / 5.27 | 4.5 | ✅ |
| footer cream `#f0ede5` on brown | 6.06 | 4.5 | ✅ |

- **Focus rings:** **brown `#794f27`** on light surfaces; **yellow `#ffcc00`** only on dark fills
  (primary/danger buttons, footer, skip-link). Offset is cosmetic, **not** the contrast mechanism.
- **Decoration-only** (no contrast requirement): bright `#19c8b9` fills/rails/glows, large duotone
  icon tints, `#9f927d`/`#c4b89e` decorative borders, polka texture (`aria-hidden`).
- **Preserve the existing contract:** one `<h1>` per route, skip link, route focus, keyboard nav,
  `aria-expanded` dropdowns, reduced-motion. **Single-h1 guard:** article bodies must start at `##`;
  add a `validate-pages` assertion that no Markdown body contains a level-1 `#`.
- `color-scheme: light` set (light-only site; prevents UA dark-mode inversion).

---

## 12. SSG / build safety

- **No new prerender breaks** (confirmed by review): the 3Dmol viewer renders an identical
  server/first-client placeholder (`inView=false`), all `window`/`document`/`IntersectionObserver`
  access is `useEffect`-gated; Phosphor icons are pure SVG.
- **Enforce:** (1) Phosphor **named imports only**; (2) `pageData.ts` + `navigation.ts` stay
  React/Phosphor-free; (3) any new client-only effect stays `useEffect`-gated or `ClientOnly`-wrapped
  with a stable server placeholder.
- Build gate unchanged: `validate:pages → type-check → generate:sitemap → vite-react-ssg build`.

---

## 13. iGEM compliance & IP

- **Fonts** self-hosted at `static.igem.wiki/teams/6123/fonts/` (§4 verify-or-fallback).
- **Favicon**: replace stale shared `igem-2022.svg` with a themed cat/dog SVG at
  `static.igem.wiki/teams/6123/...` (concrete deliverable, not optional).
- **Images/icons**: Phosphor SVGs compile into the JS bundle (coding asset — allowed); any raster
  imagery must be hosted on `static.igem.wiki`.
- **CC-BY + GitLab repo links**: preserved on every page (restyle only).
- **IP posture (clean):** zero `animal-island-ui` dependency — only raw token values reproduced in
  `@theme`; no third-party code shipped. **Keep Nintendo marks (`NookPhone`, `Animal Crossing`,
  `Nook`) out of any shipped identifiers/class names/copy** — design-doc references only. The
  `--color-app-*` token names are neutral.
- **3Dmol external CDN (open item):** `use3DMolViewer.ts` loads `https://3dmol.org` at runtime —
  outside `static.igem.wiki`. Verify against iGEM 2026 resource policy; if disallowed, self-host on
  `static.igem.wiki`. Minimum: document the dependency + keep the themed graceful-fail message.

---

## 14. Print stylesheet (`@media print`)

Add to `main.css`: hide navbar/footer/molecule-viewer; flatten shadows + 3D rails; force near-black
ink on white for body + code; expand TOC/collapsibles; show link URLs (`a[href]::after`); avoid
page-breaks inside cards/figures.

---

## 15. Open items / risks (carry into the plan)

1. **Fonts unverified** — confirm 200 at real `teams/6123/fonts/*.woff2` URLs at implementation, else
   ship fallback + follow-up PR.
2. **Mascot illustration source** — hero cat/dog: Phosphor `Cat`/`Dog` Duotone (consistent, free) vs a
   custom commissioned SVG (more brand, more work). Default: Phosphor now, custom later.
3. **3Dmol CDN hosting** — confirm policy (above).
4. **Favicon asset** — needs a real themed SVG produced + uploaded.
5. **Prism token recolor** — must re-verify each syntax color ≥4.5:1 on the pale code bg.

---

## 16. Suggested implementation phasing

1. **Tokens + base** — `@theme`, `@layer base`, fonts (verify or fallback), `color-scheme`, print block.
2. **Shared components** — Icon, Button, Card, Title, Tag (+ unit/visual sanity).
3. **Category meta** — `pageCategoryMeta.tsx` (typed to 7 keys).
4. **Shell** — AppShell, Navbar, Footer.
5. **Home** — hero, highlights, molecule section + viewer.
6. **Markdown surfaces** — `markdown.css`, code/KaTeX/Mermaid/tables, TOC.
7. **Team + states** — Team (+ empty state), 404, PageLoading, ErrorBoundary.
8. **index.html + favicon**, then polish pass.

## 17. Acceptance criteria

- `bun run check-all` (validate-pages + type-check + lint + format) passes; `bun run build`
  (full SSG) succeeds; every route prerenders.
- No `#19c8b9` used as text or as a text-bearing button fill anywhere (grep clean).
- Contrast: all text ≥4.5:1, large text/UI ≥3:1 (per §11).
- No emoji in shipped code (grep clean).
- `pageData.ts` / `navigation.ts` remain React-free; no SSR/hydration warnings.
- Accessibility contract intact (one h1/route, skip link, keyboard nav, reduced-motion).
- Nintendo marks absent from shipped identifiers/copy.
```
