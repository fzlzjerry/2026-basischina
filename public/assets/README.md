# Public assets

Files in `public/` are served from the deployment base path (`/basis-china/`).
Reference them in code via `resolveAssetUrl("assets/your-file.png")` and in
Markdown with a root-relative path like `/assets/your-file.png` (the Markdown
renderer rewrites it under the base path automatically).

## Required for SEO

- `og-default.png` — the default Open Graph / social share image (recommended
  1200×630). It is referenced by `src/config/seo.ts` (`defaultOgImage`). Until
  you add it, social share previews will fall back to no image. Override per page
  with `PageSEO.ogImage`.

## Molecular data

- Place `.sdf` / `.pdb` files used by the molecule viewer here (e.g.
  `assets/molecules/example.sdf`).
