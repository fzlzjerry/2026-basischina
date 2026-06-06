/**
 * Pure environment + URL contract (§7).
 *
 * This module must stay free of `import.meta`, React, CSS, and browser globals
 * so it can be imported from three places with identical behaviour:
 *   - the Vite app runtime (src/config/env.ts)
 *   - vite.config.ts (to derive `base`)
 *   - the Bun build scripts (scripts/*.ts, reading process.env)
 */

export interface WikiEnv {
  teamName: string;
  teamYear: string;
  teamId?: string;
  /** Always begins and ends with a slash, e.g. "/basis-china/". */
  basePath: string;
  /** Never ends with a slash, e.g. "https://2026.igem.wiki/basis-china". */
  siteUrl: string;
}

/** A generic key/value source (import.meta.env or process.env). */
export type EnvSource = Record<string, string | undefined>;

export function normalizeBasePath(value: string): string {
  const trimmed = value.trim();
  if (!trimmed || trimmed === "/") return "/";
  return `/${trimmed.replace(/^\/+|\/+$/g, "")}/`;
}

export function normalizeSiteUrl(value: string): string {
  return value.trim().replace(/\/+$/g, "");
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

/** Ensure a site-internal route path is normalized to a leading-slash form. */
export function normalizePagePath(path: string): string {
  if (!path || path === "/") return "/";
  const trimmed = path.replace(/\/+$/g, "");
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

/** Canonical absolute URL for a site-internal route path. */
export function buildCanonicalUrl(siteUrl: string, path: string): string {
  const normalizedPath = normalizePagePath(path);
  return normalizedPath === "/" ? `${siteUrl}/` : `${siteUrl}${normalizedPath}`;
}

/**
 * Resolve a public asset path under the deployment base path.
 * Absolute URLs (http(s)://, //, data:) and already-prefixed paths pass through.
 */
export function buildAssetUrl(basePath: string, assetPath: string): string {
  if (/^([a-z]+:)?\/\//i.test(assetPath) || assetPath.startsWith("data:")) {
    return assetPath;
  }
  const cleaned = assetPath.replace(/^\/+/, "");
  if (cleaned.startsWith(basePath.replace(/^\/+/, ""))) {
    return `/${cleaned}`;
  }
  return `${basePath}${cleaned}`;
}

/** Build the canonical WikiEnv from any env source. */
export function resolveWikiEnv(source: EnvSource): WikiEnv {
  const teamName = source.VITE_TEAM_NAME?.trim() || "BASIS-China";
  const teamYear = source.VITE_TEAM_YEAR?.trim() || "2026";
  const teamId = source.VITE_TEAM_ID?.trim() || undefined;
  const inferredSlug = slugify(teamName);

  return {
    teamName,
    teamYear,
    teamId,
    basePath: normalizeBasePath(source.VITE_BASE_PATH || `/${inferredSlug}/`),
    siteUrl: normalizeSiteUrl(
      source.VITE_SITE_URL || `https://${teamYear}.igem.wiki/${inferredSlug}`,
    ),
  };
}
