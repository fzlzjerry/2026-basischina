/**
 * Route URL helpers (§7/§17).
 *
 * Canonical URLs are always `wikiEnv.siteUrl + normalizedPagePath` and never
 * include `wikiEnv.basePath` twice.
 */
import { wikiEnv } from "@/config/env";
import { buildCanonicalUrl, normalizePagePath } from "@/config/envShared";

export function canonicalUrl(path: string): string {
  return buildCanonicalUrl(wikiEnv.siteUrl, path);
}

export { normalizePagePath };

/** True for links that point outside the wiki and need rel/target hardening. */
export function isExternalUrl(href: string): boolean {
  return /^([a-z]+:)?\/\//i.test(href) || href.startsWith("mailto:");
}

/**
 * Rewrite a site-internal Markdown link ("/team") to include the base path so it
 * resolves correctly under the deployment prefix. External links pass through.
 */
export function resolveInternalHref(href: string): string {
  if (isExternalUrl(href) || href.startsWith("#")) return href;
  if (!href.startsWith("/")) return href;
  const base = wikiEnv.basePath.replace(/\/+$/, "");
  if (href.startsWith(`${base}/`)) return href;
  return `${base}${href}`;
}
