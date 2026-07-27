# Public assets

Files in `public/` are served from the deployment base path (`/basis-china/`).
Reference them in code via `resolveAssetUrl("assets/your-file.png")` and in
Markdown with a root-relative path like `/assets/your-file.png` (the Markdown
renderer rewrites it under the base path automatically).

## Category covers

The Project, Wet Lab, Dry Lab, Engagement, and Team mastheads are native 2:1
WebP assets (`*-cover*.webp`, 1600×800). They intentionally contain no words:
`src/shared/components/CategoryCover.tsx` renders the accessible category label
and page heading as live HTML over the left-side safe zone.

## Required for SEO

- `og-default.png` — the default Open Graph / social share image (1200×630),
  referenced by `src/config/seo.ts` (`defaultOgImage`) as an absolute URL.
  It is a COMMITTED asset, not a build product: regenerate it with
  `bun scripts/generate-og.ts` after editing the art board at
  `scripts/og/og-card.html` (headless system Chrome renders the board; the
  CI/iGEM build environment has no Chrome). Override per page with
  `PageSEO.ogImage`.
