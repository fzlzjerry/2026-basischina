/**
 * Page registry validation (§10). Runs before build and fails on drift.
 *
 * Imports ONLY serializable modules (pageData, componentKeys, envShared) so it
 * runs under Bun without loading React, CSS, or Vite-only globals.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pageData } from "../src/config/pageData";
import {
  componentKeys,
  reservedComponentKeys,
} from "../src/config/componentKeys";
import { resolveWikiEnv } from "../src/config/envShared";
import { findLevel1HeadingLine } from "../src/features/content/lintMarkdown";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const contentDir = path.join(root, "src", "content");
const wikiEnv = resolveWikiEnv(process.env as Record<string, string>);

const errors: string[] = [];
const fail = (message: string) => errors.push(message);

// --- Uniqueness ---------------------------------------------------------------
const seenPaths = new Map<string, number>();
const seenNames = new Map<string, number>();
for (const page of pageData) {
  seenPaths.set(page.path, (seenPaths.get(page.path) ?? 0) + 1);
  seenNames.set(page.name, (seenNames.get(page.name) ?? 0) + 1);
}
for (const [value, count] of seenPaths) {
  if (count > 1) fail(`Duplicate path "${value}" (${count} pages).`);
}
for (const [value, count] of seenNames) {
  if (count > 1) fail(`Duplicate name "${value}" (${count} pages).`);
}

// --- Per-page checks ----------------------------------------------------------
const basePrefix = wikiEnv.basePath.replace(/\/+$/, ""); // "/basis-china"
const referencedKeys = new Set<string>();

for (const page of pageData) {
  const id = `page "${page.name}"`;

  if (!page.path.startsWith("/")) {
    fail(`${id}: path "${page.path}" must start with "/".`);
  }
  if (
    basePrefix &&
    (page.path === basePrefix || page.path.startsWith(`${basePrefix}/`))
  ) {
    fail(
      `${id}: path "${page.path}" must not include the base path "${basePrefix}". Paths are route-local.`,
    );
  }

  // SEO presence
  if (!page.seo?.title) fail(`${id}: seo.title is required.`);
  if (!page.seo?.description) fail(`${id}: seo.description is required.`);
  if (!page.seo?.keywords || page.seo.keywords.length === 0) {
    fail(`${id}: seo.keywords must be a non-empty array.`);
  }

  // Sitemap priority range
  const priority = page.sitemap?.priority;
  if (typeof priority !== "number" || priority < 0 || priority > 1) {
    fail(`${id}: sitemap.priority must be a number between 0 and 1.`);
  }

  if (page.kind === "markdown") {
    const cp = page.contentPath;
    if (cp.startsWith("/")) fail(`${id}: contentPath must not start with "/".`);
    if (cp.endsWith(".md"))
      fail(`${id}: contentPath must omit the ".md" suffix.`);
    const file = path.join(contentDir, `${cp}.md`);
    if (!fs.existsSync(file)) {
      fail(`${id}: missing Markdown file at src/content/${cp}.md.`);
    }
  } else {
    if (!componentKeys.includes(page.componentKey)) {
      fail(
        `${id}: componentKey "${page.componentKey}" is not in componentKeys [${componentKeys.join(", ")}].`,
      );
    }
    referencedKeys.add(page.componentKey);
  }
}

// --- No level-1 headings in Markdown bodies (single-h1-per-route) --------------
// Each route's layout renders the page <h1>; article bodies must start at "##".
// We scan every src/content/**/*.md for "# " at line start, ignoring frontmatter
// and fenced code blocks (e.g. a "# comment" inside a ```python block is fine).
const collectMarkdownFiles = (dir: string): string[] => {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...collectMarkdownFiles(full));
    else if (entry.isFile() && entry.name.endsWith(".md")) out.push(full);
  }
  return out;
};

if (fs.existsSync(contentDir)) {
  for (const file of collectMarkdownFiles(contentDir)) {
    const rel = path.relative(contentDir, file);
    const lineNo = findLevel1HeadingLine(fs.readFileSync(file, "utf8"));
    if (lineNo !== null) {
      fail(
        `src/content/${rel}: level-1 heading at line ${lineNo}. Article bodies must start at "##" — the route layout owns the page <h1>.`,
      );
    }
  }
}

// --- Every component key must be used (unless reserved) ------------------------
for (const key of componentKeys) {
  if (!referencedKeys.has(key) && !reservedComponentKeys.includes(key)) {
    fail(
      `componentKey "${key}" is declared but never referenced by a React page.`,
    );
  }
}

// --- Report -------------------------------------------------------------------
if (errors.length > 0) {
  console.error(`\n✖ Page validation failed (${errors.length} issue(s)):\n`);
  for (const message of errors) console.error(`  - ${message}`);
  console.error("");
  process.exit(1);
}

console.log(`✓ Page validation passed (${pageData.length} pages).`);
