/**
 * Vite-facing environment entry point (§7).
 *
 * All project environment parsing lives here. The pure normalization logic is
 * shared with vite.config.ts and the Bun build scripts via ./envShared.
 */
import { resolveWikiEnv, type WikiEnv } from "./envShared";

export type { WikiEnv } from "./envShared";
export {
  normalizeBasePath,
  normalizeSiteUrl,
  slugify,
  normalizePagePath,
  buildCanonicalUrl,
  buildAssetUrl,
} from "./envShared";

export const wikiEnv: WikiEnv = resolveWikiEnv(import.meta.env);
