/**
 * Pure Markdown processing (§15.2).
 *
 * This module is SSR-safe and side-effect free: it parses frontmatter, renders
 * Markdown to HTML, renders KaTeX to static HTML/MathML, builds a table of
 * contents, rewrites internal links/asset URLs under the base path, and emits
 * Mermaid placeholders. It does NOT touch the DOM, attach listeners, scroll, or
 * update SEO — all of that lives in useMarkdownEnhancements / MarkdownPage.
 *
 * Syntax highlighting (Prism) and Mermaid rendering are deliberately deferred to
 * the client enhancement hook so this module never needs a DOM at build time.
 */
import MarkdownIt from "markdown-it";
import { load as yamlLoad } from "js-yaml";
import * as katex from "katex";
import DOMPurify from "dompurify";
import { markdownItKatex } from "./markdownItKatex";
import { resolveAssetUrl } from "@/shared/utils/assetUrl";
import { isExternalUrl, resolveInternalHref } from "@/shared/utils/url";
import { uniqueSlug } from "@/shared/utils/slug";

export interface MarkdownMeta {
  title?: string;
  description?: string;
  author?: string;
  date?: string;
  tags?: string[];
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

/**
 * Security boundary (§22): raw HTML in Markdown is DISABLED by default, so the
 * generated HTML is safe by construction. Flip this to true ONLY with a
 * documented reason — sanitization (DOMPurify) then runs before the HTML is ever
 * handed to dangerouslySetInnerHTML.
 */
const allowRawHtml: boolean = false;

const md = new MarkdownIt({
  html: allowRawHtml,
  linkify: true,
  typographer: true,
  breaks: false,
});

md.set({
  highlight: (code, lang) => renderCodeBlock(code, lang),
});

md.use(markdownItKatex, { katex, throwOnError: false });

/** Token type derived from the instance (avoids `export =` namespace quirks). */
type MdToken = ReturnType<typeof md.parse>[number];

function renderCodeBlock(code: string, lang: string): string {
  const language = (lang || "text").toLowerCase();
  if (language === "mermaid") {
    // Placeholder rendered to SVG on the client by useMarkdownEnhancements.
    return `<pre class="mermaid">${md.utils.escapeHtml(code)}</pre>`;
  }
  const escaped = md.utils.escapeHtml(code);
  return `<pre class="language-${language}"><code class="language-${language}">${escaped}</code></pre>`;
}

// --- Link hardening + base-path rewriting (§15.4) -----------------------------

const defaultLinkOpen =
  md.renderer.rules.link_open ??
  ((tokens, idx, options, _env, self) =>
    self.renderToken(tokens, idx, options));

md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
  const token = tokens[idx];
  const hrefIndex = token.attrIndex("href");
  if (hrefIndex >= 0 && token.attrs) {
    const href = token.attrs[hrefIndex][1];
    if (isExternalUrl(href)) {
      token.attrSet("target", "_blank");
      token.attrSet("rel", "noopener noreferrer");
    } else if (href.startsWith("/")) {
      token.attrs[hrefIndex][1] = resolveInternalHref(href);
    }
  }
  return defaultLinkOpen(tokens, idx, options, env, self);
};

md.renderer.rules.image = (tokens, idx, options, _env, self) => {
  const token = tokens[idx];
  const srcIndex = token.attrIndex("src");
  if (srcIndex >= 0 && token.attrs) {
    token.attrs[srcIndex][1] = resolveAssetUrl(token.attrs[srcIndex][1]);
  }
  return self.renderToken(tokens, idx, options);
};

// --- Frontmatter --------------------------------------------------------------

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

/**
 * YAML parses an unquoted `date: 2026-05-01` into a Date object, and rendering a
 * Date via String()/toString() is timezone-dependent — which causes a
 * server/client hydration mismatch. Normalize any date to a stable ISO calendar
 * string so the prerendered and hydrated output are identical.
 */
function normalizeMeta(meta: MarkdownMeta): void {
  const rawDate = meta.date as unknown;
  if (rawDate instanceof Date) {
    meta.date = rawDate.toISOString().slice(0, 10);
  } else if (rawDate != null && typeof rawDate !== "string") {
    meta.date = String(rawDate);
  }
}

// --- Table of contents --------------------------------------------------------

function buildToc(tokens: MdToken[]): TocItem[] {
  const used = new Set<string>();
  const flat: TocItem[] = [];

  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i];
    if (token.type !== "heading_open") continue;
    const depth = Number(token.tag.slice(1));
    if (depth < 2 || depth > 3) continue;

    const inline = tokens[i + 1];
    const text = inline?.content?.trim() ?? "";
    if (!text) continue;

    const slug = uniqueSlug(text, used);
    token.attrSet("id", slug);
    flat.push({ title: text, url: `#${slug}`, depth, children: [] });
  }

  // Nest h3 items under the preceding h2.
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

// --- Sanitization (only relevant when raw HTML is enabled) --------------------

function sanitize(html: string): string {
  if (!allowRawHtml) return html;
  // On the server there is no DOM; raw HTML is disabled anyway, so this branch
  // is only reached on the client when the project has opted into raw HTML.
  if (typeof window === "undefined") return html;
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true, mathMl: true, svg: true },
    ADD_ATTR: ["target", "rel", "id", "class"],
    ALLOWED_URI_REGEXP:
      /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
  });
}

// --- Public API ---------------------------------------------------------------

/**
 * Demote any in-body <h1> to <h2> so the page keeps exactly one visible h1 —
 * the article header owns it (§23). Headings are then h2/h3 for TOC nesting.
 */
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

export function processMarkdown(raw: string): ProcessedMarkdown {
  const { meta, body } = parseFrontmatter(raw);
  const env: Record<string, unknown> = {};
  const tokens = md.parse(body, env);
  demoteBodyH1(tokens);
  const toc = buildToc(tokens);
  const html = sanitize(md.renderer.render(tokens, md.options, env));
  const hasMermaid =
    /```\s*mermaid/.test(body) || html.includes('class="mermaid"');

  return { html, meta, toc, hasMermaid };
}
