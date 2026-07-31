import { readdir, readFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { gzipSync } from "node:zlib";
import { pageData } from "../src/config/pageData";
import { buildAssetUrl, resolveWikiEnv } from "../src/config/envShared";

interface ManifestChunk {
  file: string;
  isEntry?: boolean;
  css?: string[];
}

const DIST_DIR = join(process.cwd(), "dist");
const MANIFEST_PATH = join(DIST_DIR, ".vite", "manifest.json");
const EXPECTED_HTML_PAGES = pageData.length + 1;
const MAX_ENTRY_RAW_BYTES = 550 * 1024;
const MAX_ENTRY_GZIP_BYTES = 180 * 1024;
const MAX_GLOBAL_CSS_GZIP_BYTES = 32 * 1024;
const MAX_LAZY_CHUNK_RAW_BYTES = 900 * 1024;
const MAX_LAZY_CHUNK_GZIP_BYTES = 300 * 1024;
const wikiEnv = resolveWikiEnv(process.env as Record<string, string>);

function formatKiB(bytes: number): string {
  return `${(bytes / 1024).toFixed(2)} KiB`;
}

function linkTags(html: string): string[] {
  return html.match(/<link\b[^>]*>/gi) ?? [];
}

function hasAttribute(tag: string, name: string, value: RegExp): boolean {
  const match = tag.match(new RegExp(`\\b${name}=["']([^"']+)["']`, "i"));
  return value.test(match?.[1] ?? "");
}

function attributeValue(tag: string, name: string): string | undefined {
  return tag.match(new RegExp(`\\b${name}=["']([^"']+)["']`, "i"))?.[1];
}

const failures: string[] = [];
const manifest = JSON.parse(await readFile(MANIFEST_PATH, "utf8")) as Record<
  string,
  ManifestChunk
>;
const entries = Object.entries(manifest).filter(([, chunk]) => chunk.isEntry);

if (entries.length !== 1) {
  failures.push(
    `Expected one client entry in the manifest; found ${entries.length}.`,
  );
}

const [entryKey, entry] = entries[0] ?? ["missing", undefined];
let entryRawBytes = 0;
let entryGzipBytes = 0;
let globalCssGzipBytes = 0;
let largestLazyChunk = { file: "none", raw: 0, gzip: 0 };

if (entry) {
  const entryBuffer = await readFile(join(DIST_DIR, entry.file));
  entryRawBytes = entryBuffer.byteLength;
  entryGzipBytes = gzipSync(entryBuffer).byteLength;

  if (entryRawBytes > MAX_ENTRY_RAW_BYTES) {
    failures.push(
      `Critical entry ${entry.file} is ${formatKiB(entryRawBytes)} raw; budget is ${formatKiB(MAX_ENTRY_RAW_BYTES)}.`,
    );
  }
  if (entryGzipBytes > MAX_ENTRY_GZIP_BYTES) {
    failures.push(
      `Critical entry ${entry.file} is ${formatKiB(entryGzipBytes)} gzip; budget is ${formatKiB(MAX_ENTRY_GZIP_BYTES)}.`,
    );
  }

  for (const cssFile of entry.css ?? []) {
    const css = await readFile(join(DIST_DIR, cssFile));
    globalCssGzipBytes += gzipSync(css).byteLength;
  }
  if (globalCssGzipBytes > MAX_GLOBAL_CSS_GZIP_BYTES) {
    failures.push(
      `Global CSS is ${formatKiB(globalCssGzipBytes)} gzip; budget is ${formatKiB(MAX_GLOBAL_CSS_GZIP_BYTES)}.`,
    );
  }
}

const htmlFiles = (await readdir(DIST_DIR))
  .filter((file) => file.endsWith(".html"))
  .sort();
if (htmlFiles.length !== EXPECTED_HTML_PAGES) {
  failures.push(
    `Expected ${EXPECTED_HTML_PAGES} prerendered HTML files; found ${htmlFiles.length}.`,
  );
}

let assetPreloads = 0;
let mislabeledFontPreloads = 0;
let modulePreloads = 0;
for (const htmlFile of htmlFiles) {
  const html = await readFile(join(DIST_DIR, htmlFile), "utf8");
  const links = linkTags(html);
  const preloads = links.filter((tag) =>
    hasAttribute(tag, "rel", /^preload$/i),
  );
  modulePreloads += links.filter((tag) =>
    hasAttribute(tag, "rel", /^modulepreload$/i),
  ).length;
  const fontOrImagePreloads = preloads.filter(
    (tag) =>
      hasAttribute(tag, "as", /^font$/i) || hasAttribute(tag, "as", /^image$/i),
  );
  assetPreloads += fontOrImagePreloads.length;
  mislabeledFontPreloads += preloads.filter(
    (tag) =>
      hasAttribute(tag, "as", /^font$/i) &&
      hasAttribute(tag, "type", /^font\/woff2$/i) &&
      /\bhref=["'][^"']+\.(?:woff|ttf)["']/i.test(tag),
  ).length;
}

if (assetPreloads > 0) {
  failures.push(
    `Found ${assetPreloads} automatic font/image preloads across prerendered pages; budget is zero.`,
  );
}
if (mislabeledFontPreloads > 0) {
  failures.push(
    `Found ${mislabeledFontPreloads} WOFF/TTF preloads mislabeled as font/woff2.`,
  );
}
if (modulePreloads > 0) {
  failures.push(
    `Found ${modulePreloads} recursive module preloads across prerendered pages; budget is zero.`,
  );
}

const assetFiles = await readdir(join(DIST_DIR, "assets"));
const legacyFontAssets = assetFiles.filter((file) =>
  /\.(?:woff|ttf)$/i.test(file),
);
if (legacyFontAssets.length > 0) {
  failures.push(
    `Found ${legacyFontAssets.length} legacy WOFF/TTF assets; production fonts must be WOFF2-only.`,
  );
}

const entryFileName = entry ? basename(entry.file) : "";
for (const file of assetFiles.filter(
  (asset) => asset.endsWith(".js") && asset !== entryFileName,
)) {
  const contents = await readFile(join(DIST_DIR, "assets", file));
  const raw = contents.byteLength;
  const gzip = gzipSync(contents).byteLength;
  if (raw > largestLazyChunk.raw) {
    largestLazyChunk = { file, raw, gzip };
  }
  if (raw > MAX_LAZY_CHUNK_RAW_BYTES) {
    failures.push(
      `Lazy chunk ${file} is ${formatKiB(raw)} raw; budget is ${formatKiB(MAX_LAZY_CHUNK_RAW_BYTES)}.`,
    );
  }
  if (gzip > MAX_LAZY_CHUNK_GZIP_BYTES) {
    failures.push(
      `Lazy chunk ${file} is ${formatKiB(gzip)} gzip; budget is ${formatKiB(MAX_LAZY_CHUNK_GZIP_BYTES)}.`,
    );
  }
}

const homeHtml = await readFile(join(DIST_DIR, "index.html"), "utf8");
if (/KaTeX_[^"'<> ]+\.(?:woff2?|ttf)/.test(homeHtml)) {
  failures.push("Homepage HTML still references KaTeX font assets.");
}
const expectedFaviconUrl = buildAssetUrl(wikiEnv.basePath, "favicon-heal.png");
if (
  !linkTags(homeHtml).some(
    (tag) =>
      hasAttribute(tag, "rel", /^icon$/i) &&
      attributeValue(tag, "href") === expectedFaviconUrl,
  )
) {
  failures.push("Homepage favicon is missing the configured base path.");
}

if (!htmlFiles.includes("404.html")) {
  failures.push("The prerendered 404.html artifact is missing.");
} else {
  const notFoundHtml = await readFile(join(DIST_DIR, "404.html"), "utf8");
  if (
    !/Page not found/.test(notFoundHtml) ||
    !/noindex,\s*follow/.test(notFoundHtml)
  ) {
    failures.push("404.html is not the prerendered, noindex not-found page.");
  }
  if (
    /HEAL: healthier, happier companions, by BASIS-China/.test(notFoundHtml)
  ) {
    failures.push("404.html was overwritten with the homepage shell.");
  }
}

console.log(`✓ Build audit inspected ${htmlFiles.length} prerendered pages.`);
console.log(
  `  Entry ${entryKey}: ${formatKiB(entryRawBytes)} raw / ${formatKiB(entryGzipBytes)} gzip.`,
);
console.log(
  `  Largest lazy chunk ${largestLazyChunk.file}: ${formatKiB(largestLazyChunk.raw)} raw / ${formatKiB(largestLazyChunk.gzip)} gzip.`,
);
console.log(`  Global CSS: ${formatKiB(globalCssGzipBytes)} gzip.`);
console.log(`  Automatic font/image preloads: ${assetPreloads}.`);
console.log(`  Recursive module preloads: ${modulePreloads}.`);

if (failures.length > 0) {
  for (const failure of failures) console.error(`✗ ${failure}`);
  process.exit(1);
}

console.log("✓ Production resource budgets passed.");
