/**
 * Base-path-aware public asset resolver (§8/§15.4).
 *
 * Use this for any asset referenced from React or rewritten from Markdown so the
 * deployment prefix (wikiEnv.basePath) is applied exactly once.
 */
import { wikiEnv } from "@/config/env";
import { lookupPublicAssetCdn } from "@/config/igemStatic";
import { buildAssetUrl } from "@/config/envShared";

export function resolveAssetUrl(assetPath: string): string {
  return (
    lookupPublicAssetCdn(assetPath) ??
    buildAssetUrl(wikiEnv.basePath, assetPath)
  );
}
