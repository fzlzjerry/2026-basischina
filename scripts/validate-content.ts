import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pageData } from "../src/config/pageData";
import { parseReferenceLibrary } from "../src/features/content/scientificCitations";
import {
  formatMarkdownLintIssue,
  lintMarkdownSource,
} from "../src/features/content/lintMarkdown";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const contentDir = path.join(root, "src", "content");
const referencePath = path.join(contentDir, "references", "references.yaml");
const issues: string[] = [];
const knownPagePaths = new Set(pageData.map((page) => page.path));

function collectMarkdownFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...collectMarkdownFiles(full));
    else if (entry.isFile() && entry.name.endsWith(".md")) files.push(full);
  }
  return files;
}

if (!fs.existsSync(referencePath)) {
  issues.push("Missing src/content/references/references.yaml.");
}

const referenceResult = fs.existsSync(referencePath)
  ? parseReferenceLibrary(fs.readFileSync(referencePath, "utf8"))
  : { library: {}, issues: [] as string[] };
for (const issue of referenceResult.issues) {
  issues.push("references.yaml: " + issue);
}

let researchBlockCount = 0;
let citationCount = 0;
let footnoteCount = 0;

for (const file of collectMarkdownFiles(contentDir)) {
  const rel = path.relative(root, file);
  const raw = fs.readFileSync(file, "utf8");
  const result = lintMarkdownSource(raw, {
    knownPagePaths,
    referenceLibrary: referenceResult.library,
  });

  researchBlockCount += result.stats.researchBlocks;
  citationCount += result.stats.citations;
  footnoteCount += result.stats.footnotes;

  for (const issue of result.issues) {
    issues.push(formatMarkdownLintIssue(rel, issue));
  }

  for (const asset of result.localAssets) {
    const filePath = path.join(root, "public", asset.value.replace(/^\/+/, ""));
    if (!fs.existsSync(filePath)) {
      issues.push(
        rel +
          ":" +
          asset.line +
          " [" +
          asset.kind +
          ']: local asset "' +
          asset.value +
          '" does not exist under public/.',
      );
    }
  }
}

if (issues.length > 0) {
  console.error(
    "\nContent validation failed (" + issues.length + " issue(s)):\n",
  );
  for (const issue of issues) console.error("  - " + issue);
  console.error("");
  process.exit(1);
}

console.log(
  "Content validation passed: " +
    researchBlockCount +
    " research block(s), " +
    citationCount +
    " citation(s), " +
    footnoteCount +
    " footnote reference(s).",
);
