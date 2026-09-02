/**
 * Official iGEM static CDN for BASIS-China (team 6123).
 *
 * Source binaries stay in this repo (`public/`, `src/assets/`). Production
 * pages must load images, icons, and fonts from static.igem.wiki — GitLab
 * Pages on gitlab.igem.org caps artifacts at 10 MiB, and iGEM forbids
 * third-party CDNs. PNG/JPEG uploads are converted to AVIF by the uploads
 * tool; WebP, SVG, and WOFF2 keep their original names.
 *
 * Videos are not accepted on static.igem.wiki. `not-found-cat.mp4` stays a
 * public Pages asset.
 */
export const IGEM_STATIC_BASE = "https://static.igem.wiki/teams/6123/wiki";

export const igemStatic = {
  favicon: `${IGEM_STATIC_BASE}/brand/favicon-heal.avif`,
  logo: `${IGEM_STATIC_BASE}/brand/heal-logo.webp`,
  affiliations: {
    org: `${IGEM_STATIC_BASE}/brand/avant.webp`,
    // School lockup lives on last year's team bucket; still static.igem.wiki.
    school: "https://static.igem.wiki/teams/5610/wiki/icon/bg.webp",
  },
  banner: `${IGEM_STATIC_BASE}/brand/heal-banner.webp`,
  loopSticker: `${IGEM_STATIC_BASE}/brand/heal-loop-sticker.webp`,
  peelSource: `${IGEM_STATIC_BASE}/brand/heal-peel-source.webp`,
  ogImage: `${IGEM_STATIC_BASE}/covers/og-default.avif`,
  covers: {
    project: `${IGEM_STATIC_BASE}/covers/project-cover.webp`,
    wetLab: `${IGEM_STATIC_BASE}/covers/wet-lab-cover.avif`,
    wetLabWebp: `${IGEM_STATIC_BASE}/covers/wet-lab-cover.webp`,
    dryLab: `${IGEM_STATIC_BASE}/covers/dry-lab-cover.webp`,
    dryLabV2: `${IGEM_STATIC_BASE}/covers/dry-lab-cover-v2.webp`,
    engagement: `${IGEM_STATIC_BASE}/covers/engagement-cover.webp`,
    engagementV2: `${IGEM_STATIC_BASE}/covers/engagement-cover-v2.webp`,
    team: `${IGEM_STATIC_BASE}/covers/team-cover.webp`,
    markdownDemo: `${IGEM_STATIC_BASE}/covers/markdown-demo-figure.svg`,
  },
  illustrations: {
    care: `${IGEM_STATIC_BASE}/illustrations/care.webp`,
    engineer: `${IGEM_STATIC_BASE}/illustrations/engineer.webp`,
    heroLabPaw: `${IGEM_STATIC_BASE}/illustrations/hero-lab-paw.webp`,
    pawCorner: `${IGEM_STATIC_BASE}/illustrations/paw-corner.webp`,
    peekingCat: `${IGEM_STATIC_BASE}/illustrations/peeking-cat.webp`,
    sunsetDuo: `${IGEM_STATIC_BASE}/illustrations/sunset-duo.webp`,
    understand: `${IGEM_STATIC_BASE}/illustrations/understand.webp`,
  },
} as const;

const PUBLIC_ASSET_CDN: Record<string, string> = {
  "favicon-heal.png": igemStatic.favicon,
  "assets/og-default.png": igemStatic.ogImage,
  "assets/project-cover.webp": igemStatic.covers.project,
  "assets/wet-lab-cover.jpg": igemStatic.covers.wetLab,
  "assets/wet-lab-cover.webp": igemStatic.covers.wetLabWebp,
  "assets/dry-lab-cover.webp": igemStatic.covers.dryLab,
  "assets/dry-lab-cover-v2.webp": igemStatic.covers.dryLabV2,
  "assets/engagement-cover.webp": igemStatic.covers.engagement,
  "assets/engagement-cover-v2.webp": igemStatic.covers.engagementV2,
  "assets/team-cover.webp": igemStatic.covers.team,
  "assets/markdown-demo-figure.svg": igemStatic.covers.markdownDemo,
};

/** Map a public-dir path to its static.igem.wiki URL when one exists. */
export function lookupPublicAssetCdn(assetPath: string): string | undefined {
  return PUBLIC_ASSET_CDN[assetPath.replace(/^\/+/, "")];
}
