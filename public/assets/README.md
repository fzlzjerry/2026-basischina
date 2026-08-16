# Public assets

Files in `public/` are served from the deployment base path (`/basis-china/`).
Reference them in code via `resolveAssetUrl("assets/your-file.png")` and in
Markdown with a root-relative path like `/assets/your-file.png` (the Markdown
renderer rewrites it under the base path automatically).

## Category covers

Project and Team use native 1600×800 WebP covers. The active Wet Lab, Dry Lab,
and Engagement art intentionally keeps each source's original aspect ratio:

- `wet-lab-cover.jpg` — 1527×1079
- `dry-lab-cover.webp` — 1600×1132
- `engagement-cover.webp` — 1800×1193

`src/shared/components/CategoryCover.tsx` keeps Project and Team in their native
2:1 banner treatment. Wet Lab, Dry Lab, and Engagement use the edgeless `plate`
composition: full native-ratio artwork tipped and bled beyond the article
measure, with live labels set as separate hand-ruled marginalia. On mobile the
artwork goes flat and runs to the right trim. A multiply blend lets the notebook
grid show through light source-paper areas. The homepage workstream leaves reuse
the same files and native dimensions.

## 404 motion

`not-found-cat.mp4` is a silent 3520×2488, 0.87-second decorative tail-flick.
The 404 route resolves it through `resolveAssetUrl` and plays it once only when
reduced motion is not requested; otherwise it leaves a decoded still visible.

## Required for SEO

- `og-default.png` — the default Open Graph / social share image (1200×630),
  referenced by `src/config/seo.ts` (`defaultOgImage`) as an absolute URL.
  It is a COMMITTED asset, not a build product: regenerate it with
  `bun scripts/generate-og.ts` after editing the art board at
  `scripts/og/og-card.html` (headless system Chrome renders the board; the
  CI/iGEM build environment has no Chrome). Override per page with
  `PageSEO.ogImage`.
