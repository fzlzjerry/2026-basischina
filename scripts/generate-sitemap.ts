/**
 * Sitemap generation (§18).
 *
 * Imports ONLY pageData + the pure env contract (never React or pages.ts).
 * Wildcard/404 routes are excluded. lastmod uses the related source file's
 * modification time when available.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pageData, type PageData } from "../src/config/pageData";
import {
  buildCanonicalUrl,
  normalizePagePath,
  resolveWikiEnv,
} from "../src/config/envShared";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const wikiEnv = resolveWikiEnv(process.env as Record<string, string>);

// Map React component keys to their source file for lastmod (best-effort).
const reactSourceByKey: Record<string, string> = {
  home: "src/features/home/HomePage.tsx",
  team: "src/features/team/TeamPage.tsx",
};

function sourceFileFor(page: PageData): string | null {
  const file =
    page.kind === "markdown"
      ? path.join(root, "src", "content", `${page.contentPath}.md`)
      : path.join(root, reactSourceByKey[page.componentKey] ?? "");
  return file && fs.existsSync(file) ? file : null;
}

function lastmodFor(page: PageData): string | null {
  const file = sourceFileFor(page);
  if (!file) return null;
  return fs.statSync(file).mtime.toISOString().slice(0, 10);
}

const xmlEscape = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const entries = pageData
  .map((page) => {
    const loc = xmlEscape(buildCanonicalUrl(wikiEnv.siteUrl, page.path));
    const lastmod = lastmodFor(page);
    const lines = [
      "  <url>",
      `    <loc>${loc}</loc>`,
      lastmod ? `    <lastmod>${lastmod}</lastmod>` : null,
      `    <changefreq>${page.sitemap.changefreq}</changefreq>`,
      `    <priority>${page.sitemap.priority.toFixed(1)}</priority>`,
      "  </url>",
    ].filter(Boolean);
    return lines.join("\n");
  })
  .join("\n");

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>
`;

const publicDir = path.join(root, "public");
fs.mkdirSync(publicDir, { recursive: true });
fs.writeFileSync(path.join(publicDir, "sitemap.xml"), sitemap, "utf8");

// robots.txt with the absolute sitemap URL (kept in sync with siteUrl).
const sitemapUrl = `${wikiEnv.siteUrl}/sitemap.xml`;
const studioDisallow = `${wikiEnv.basePath}studio`;
const robots = `User-agent: *\nAllow: /\nDisallow: ${studioDisallow}\n\nSitemap: ${sitemapUrl}\n`;
fs.writeFileSync(path.join(publicDir, "robots.txt"), robots, "utf8");

console.log(
  `✓ Wrote ${pageData.length} URLs to public/sitemap.xml + robots.txt (base: ${normalizePagePath(
    wikiEnv.basePath,
  )}).`,
);
