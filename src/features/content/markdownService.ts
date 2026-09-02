/**
 * Pure Markdown processing (§15.2).
 *
 * This module is SSR-safe and side-effect free: it parses frontmatter, renders
 * Markdown to HTML, builds a table of contents, resolves links/assets, and
 * expands scientific citations plus whitelisted research blocks. DOM-only
 * enhancements remain in useMarkdownEnhancements.
 */
import MarkdownIt from "markdown-it";
import { load as yamlLoad } from "js-yaml";
import * as katex from "katex";
import referencesRaw from "@/content/references/references.yaml?raw";
import { markdownItKatex } from "./markdownItKatex";
import {
  createScientificRenderState,
  extractFootnoteDefinitions,
  parseReferenceLibrary,
  registerScientificCitationRules,
  renderCitationGroup,
  renderScientificSections,
  type ScientificRenderEnv,
} from "./scientificCitations";
import { isResearchBlockKind, renderResearchBlock } from "./researchBlocks";
import { resolveAssetUrl } from "@/shared/utils/assetUrl";
import { isExternalUrl, resolveInternalHref } from "@/shared/utils/url";
import { uniqueSlug } from "@/shared/utils/slug";

export interface MarkdownMeta {
  title?: string;
  description?: string;
  author?: string;
  date?: string;
  tags?: string[];
  relatedPages?: string[];
  [key: string]: unknown;
}

export interface TocItem {
  title: string;
  url: string;
  depth: number;
  children: TocItem[];
}

export interface ProcessedMarkdown {
  html: string;
  meta: MarkdownMeta;
  toc: TocItem[];
  hasMermaid: boolean;
}

const referenceLibraryResult = parseReferenceLibrary(referencesRaw);
if (referenceLibraryResult.issues.length > 0) {
  throw new Error(
    "Invalid scientific reference library:\n" +
      referenceLibraryResult.issues.map((issue) => "  - " + issue).join("\n"),
  );
}
const referenceLibrary = referenceLibraryResult.library;

const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
  breaks: false,
});

md.use(markdownItKatex, { katex, throwOnError: false });
registerScientificCitationRules(md);

/** Token type derived from the instance (avoids export namespace quirks). */
type MdToken = ReturnType<typeof md.parse>[number];

const defaultFence =
  md.renderer.rules.fence ??
  ((tokens, idx, options, _env, self) =>
    self.renderToken(tokens, idx, options));

md.renderer.rules.fence = (tokens, idx, options, env, self) => {
  const token = tokens[idx];
  const language = token.info.trim().split(/\s+/)[0]?.toLowerCase() ?? "";

  if (language === "mermaid") {
    return (
      '<pre class="mermaid">' + md.utils.escapeHtml(token.content) + "</pre>"
    );
  }

  if (isResearchBlockKind(language)) {
    return renderResearchBlock(language, token.content, {
      resolveHref: resolveAssetUrl,
      renderCitations: (keys) => renderCitationGroup(md, keys, env),
    }).html;
  }

  return defaultFence(tokens, idx, options, env, self);
};

// --- Link hardening + base-path rewriting ------------------------------------

const defaultLinkOpen =
  md.renderer.rules.link_open ??
  ((tokens, idx, options, _env, self) =>
    self.renderToken(tokens, idx, options));

const defaultLinkClose =
  md.renderer.rules.link_close ??
  ((tokens, idx, options, _env, self) =>
    self.renderToken(tokens, idx, options));

interface LinkRenderEnv {
  externalLink?: boolean;
}

md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
  const token = tokens[idx];
  const hrefIndex = token.attrIndex("href");
  if (hrefIndex >= 0 && token.attrs) {
    const href = token.attrs[hrefIndex][1];
    if (isExternalUrl(href)) {
      token.attrSet("target", "_blank");
      token.attrSet("rel", "noopener noreferrer");
      (env as LinkRenderEnv).externalLink = true;
    } else if (href.startsWith("/")) {
      token.attrs[hrefIndex][1] = resolveInternalHref(href);
    }
  }
  return defaultLinkOpen(tokens, idx, options, env, self);
};

md.renderer.rules.link_close = (tokens, idx, options, env, self) => {
  const linkEnv = env as LinkRenderEnv;
  const suffix = linkEnv.externalLink
    ? '<span class="sr-only"> (opens in new tab)</span>'
    : "";
  linkEnv.externalLink = false;
  return suffix + defaultLinkClose(tokens, idx, options, env, self);
};

md.renderer.rules.image = (tokens, idx, options, _env, self) => {
  const token = tokens[idx];
  const srcIndex = token.attrIndex("src");
  if (srcIndex >= 0 && token.attrs) {
    token.attrs[srcIndex][1] = resolveAssetUrl(token.attrs[srcIndex][1]);
  }
  return self.renderToken(tokens, idx, options);
};

const defaultHeadingClose =
  md.renderer.rules.heading_close ??
  ((tokens, idx, options, _env, self) =>
    self.renderToken(tokens, idx, options));

md.renderer.rules.heading_close = (tokens, idx, options, env, self) => {
  const opening = tokens[idx - 2];
  const inline = tokens[idx - 1];
  const id = opening?.attrGet("id");
  const depth = Number(opening?.tag.slice(1));
  const permalink =
    id && depth >= 2 && depth <= 3
      ? '<a class="heading-permalink" href="#' +
        md.utils.escapeHtml(id) +
        '" aria-label="Permanent link to ' +
        md.utils.escapeHtml(inline?.content ?? "section") +
        '">#</a>'
      : "";
  return permalink + defaultHeadingClose(tokens, idx, options, env, self);
};

// --- Frontmatter -------------------------------------------------------------

function parseFrontmatter(raw: string): { meta: MarkdownMeta; body: string } {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw);
  if (!match) return { meta: {}, body: raw };
  let meta: MarkdownMeta = {};
  try {
    const parsed = yamlLoad(match[1]);
    if (parsed && typeof parsed === "object") {
      meta = parsed as MarkdownMeta;
    }
  } catch {
    meta = {};
  }
  normalizeMeta(meta);
  return { meta, body: raw.slice(match[0].length) };
}

function normalizeMeta(meta: MarkdownMeta): void {
  const rawDate = meta.date as unknown;
  if (rawDate instanceof Date) {
    meta.date = rawDate.toISOString().slice(0, 10);
  } else if (rawDate != null && typeof rawDate !== "string") {
    meta.date = String(rawDate);
  }

  if (!Array.isArray(meta.relatedPages)) {
    delete meta.relatedPages;
  } else {
    meta.relatedPages = meta.relatedPages.filter(
      (item): item is string => typeof item === "string" && item.length > 0,
    );
  }
}

// --- Table of contents -------------------------------------------------------

function buildToc(tokens: MdToken[]): TocItem[] {
  const used = new Set<string>();
  const flat: TocItem[] = [];

  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (token.type !== "heading_open") continue;
    const depth = Number(token.tag.slice(1));
    if (depth < 2 || depth > 3) continue;

    const inline = tokens[index + 1];
    const title = inline?.content?.trim() ?? "";
    if (!title) continue;

    const slug = uniqueSlug(title, used);
    token.attrSet("id", slug);
    flat.push({ title, url: "#" + slug, depth, children: [] });
  }

  const roots: TocItem[] = [];
  let current: TocItem | null = null;
  for (const item of flat) {
    if (item.depth === 2) {
      roots.push(item);
      current = item;
    } else if (current) {
      current.children.push(item);
    } else {
      roots.push(item);
    }
  }
  return roots;
}

function demoteBodyH1(tokens: MdToken[]): void {
  for (const token of tokens) {
    if (
      (token.type === "heading_open" || token.type === "heading_close") &&
      token.tag === "h1"
    ) {
      token.tag = "h2";
    }
  }
}

// --- Public API --------------------------------------------------------------

export function processMarkdown(raw: string): ProcessedMarkdown {
  const frontmatter = parseFrontmatter(raw);
  const footnotes = extractFootnoteDefinitions(frontmatter.body);
  const env: ScientificRenderEnv = {
    scientific: createScientificRenderState(
      referenceLibrary,
      footnotes.definitions,
    ),
  };
  const tokens = md.parse(footnotes.body, env);
  demoteBodyH1(tokens);
  const toc = buildToc(tokens);
  let html = md.renderer.render(tokens, md.options, env);
  const supplemental = renderScientificSections(md, env);
  if (supplemental.html) html += "\n" + supplemental.html;
  for (const section of supplemental.sections) {
    toc.push({
      title: section.title,
      url: section.url,
      depth: 2,
      children: [],
    });
  }

  const hasMermaid =
    /[\x60]{3}\s*mermaid/.test(footnotes.body) ||
    html.includes('class="mermaid"');

  return {
    html,
    meta: frontmatter.meta,
    toc,
    hasMermaid,
  };
}
