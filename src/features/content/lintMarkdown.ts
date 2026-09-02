/**
 * Per-document scientific Markdown lint.
 *
 * Shared by `scripts/validate-content.ts` (production gate) and the local
 * writing studio (live feedback). Filesystem-only checks — such as whether a
 * `/assets/...` file exists under public/ — stay in the script.
 */
import { load as yamlLoad } from "js-yaml";
import {
  extractFootnoteDefinitions,
  type ReferenceLibrary,
} from "./scientificCitations";
import {
  analyzeResearchBlock,
  extractResearchBlocks,
  renderResearchBlock,
} from "./researchBlocks";

export interface MarkdownLintIssue {
  message: string;
  line?: number;
  scope?: string;
}

export interface MarkdownLintAsset {
  value: string;
  line: number;
  kind: string;
}

export interface MarkdownLintStats {
  researchBlocks: number;
  citations: number;
  footnotes: number;
}

export interface MarkdownLintContext {
  knownPagePaths: ReadonlySet<string>;
  referenceLibrary: ReferenceLibrary;
}

export interface MarkdownLintResult {
  issues: MarkdownLintIssue[];
  localAssets: MarkdownLintAsset[];
  stats: MarkdownLintStats;
}

const ASSET_FIELDS = ["dataset", "image", "download"] as const;

export function findLevel1HeadingLine(source: string): number | null {
  const lines = source.split(/\r?\n/);
  let index = 0;

  if (lines[0]?.trim() === "---") {
    index = 1;
    while (index < lines.length && lines[index]?.trim() !== "---") index += 1;
    index += 1;
  }

  let inFence = false;
  let fenceMarker = "";
  for (; index < lines.length; index += 1) {
    const line = lines[index] ?? "";
    const fence = line.match(/^\s*(```+|~~~+)/);
    if (fence) {
      const marker = fence[1].startsWith("`") ? "`" : "~";
      if (!inFence) {
        inFence = true;
        fenceMarker = marker;
      } else if (marker === fenceMarker) {
        inFence = false;
        fenceMarker = "";
      }
      continue;
    }
    if (!inFence && /^# \S/.test(line)) return index + 1;
  }
  return null;
}

export function formatMarkdownLintIssue(
  sourceLabel: string,
  issue: MarkdownLintIssue,
): string {
  if (issue.line != null && issue.scope) {
    return (
      sourceLabel +
      ":" +
      issue.line +
      " [" +
      issue.scope +
      "]: " +
      issue.message
    );
  }
  if (issue.line != null) {
    return sourceLabel + ":" + issue.line + ": " + issue.message;
  }
  return sourceLabel + ": " + issue.message;
}

export function lintMarkdownSource(
  raw: string,
  context: MarkdownLintContext,
): MarkdownLintResult {
  const issues: MarkdownLintIssue[] = [];
  const localAssets: MarkdownLintAsset[] = [];
  const frontmatter = parseFrontmatter(raw);
  if (frontmatter.error) {
    issues.push({
      message: frontmatter.error,
      line: 1,
    });
  }

  for (const target of frontmatter.relatedPages) {
    const targetPath = target.split("#", 1)[0] || "/";
    if (!context.knownPagePaths.has(targetPath)) {
      issues.push({
        message:
          'related page "' + target + '" does not match a registered route.',
      });
    }
  }

  const footnotes = extractFootnoteDefinitions(frontmatter.body);
  const blocks = extractResearchBlocks(footnotes.body);
  const evidenceIds = new Set<string>();
  const blockCitationKeys: string[] = [];
  const blockEvidenceTargets: Array<{
    target: string;
    line: number;
    kind: string;
  }> = [];

  for (const block of blocks) {
    const analysis = analyzeResearchBlock(block.kind, block.content);
    for (const key of ASSET_FIELDS) {
      const value = analysis.data[key];
      if (typeof value !== "string" || !value.startsWith("/assets/")) continue;
      localAssets.push({
        value,
        line: block.line,
        kind: block.kind,
      });
    }

    const rendered = renderResearchBlock(block.kind, block.content, {
      resolveHref: (href) => href,
      renderCitations: () => "",
    });
    if (rendered.id) {
      if (evidenceIds.has(rendered.id)) {
        issues.push({
          message: 'duplicate research block id "' + rendered.id + '".',
          line: block.line,
        });
      }
      evidenceIds.add(rendered.id);
    }
    for (const issue of rendered.issues) {
      issues.push({
        message: issue,
        line: block.line,
        scope: block.kind,
      });
    }
    blockCitationKeys.push(...rendered.citationKeys);
    for (const target of rendered.evidenceTargets) {
      blockEvidenceTargets.push({
        target,
        line: block.line,
        kind: block.kind,
      });
    }
  }

  for (const evidence of blockEvidenceTargets) {
    if (!evidenceIds.has(evidence.target)) {
      issues.push({
        message:
          'evidence target "' +
          evidence.target +
          '" does not match a research block id on the page.',
        line: evidence.line,
        scope: evidence.kind,
      });
    }
  }

  const visible = withoutInlineCode(withoutFences(footnotes.body));
  const noteText = withoutInlineCode(
    Array.from(footnotes.definitions.values()).join("\n"),
  );
  const usedCitations = [
    ...citationKeys(visible),
    ...citationKeys(noteText),
    ...blockCitationKeys,
  ];
  for (const key of usedCitations) {
    if (!context.referenceLibrary[key]) {
      issues.push({
        message: 'unknown citation key "' + key + '".',
      });
    }
  }

  const refs = footnoteRefs(visible);
  const referencedNotes = new Set(refs);
  for (const key of refs) {
    if (!footnotes.definitions.has(key)) {
      issues.push({
        message: 'missing definition for footnote "' + key + '".',
      });
    }
  }
  for (const key of footnotes.definitions.keys()) {
    if (!referencedNotes.has(key)) {
      issues.push({
        message: 'footnote "' + key + '" is defined but never used.',
      });
    }
  }

  const targets = [...evidenceRefs(visible), ...evidenceRefs(noteText)];
  for (const target of targets) {
    if (!evidenceIds.has(target)) {
      issues.push({
        message:
          'evidence link "' +
          target +
          '" does not match a research block id on the page.',
      });
    }
  }

  return {
    issues,
    localAssets,
    stats: {
      researchBlocks: blocks.length,
      citations: usedCitations.length,
      footnotes: refs.length,
    },
  };
}

function parseFrontmatter(raw: string): {
  relatedPages: string[];
  body: string;
  error?: string;
} {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw);
  if (!match) return { relatedPages: [], body: raw };

  try {
    const parsed = yamlLoad(match[1]);
    const relatedPages =
      parsed && typeof parsed === "object" && !Array.isArray(parsed)
        ? asStringList((parsed as Record<string, unknown>).relatedPages)
        : [];
    return { relatedPages, body: raw.slice(match[0].length) };
  } catch (error) {
    return {
      relatedPages: [],
      body: raw.slice(match[0].length),
      error:
        "Invalid YAML in frontmatter: " +
        (error instanceof Error ? error.message : String(error)),
    };
  }
}

function asStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function withoutFences(raw: string): string {
  const lines = raw.split(/\r?\n/);
  const visible: string[] = [];
  let inFence = false;
  let marker = "";

  for (const line of lines) {
    const fence = line.match(/^\s*([\x60]{3,}|~~~+)/);
    if (fence) {
      const nextMarker = fence[1][0];
      if (!inFence) {
        inFence = true;
        marker = nextMarker;
      } else if (marker === nextMarker) {
        inFence = false;
        marker = "";
      }
      continue;
    }
    if (!inFence) visible.push(line);
  }

  return visible.join("\n");
}

function withoutInlineCode(raw: string): string {
  return raw.replace(/[\x60][^\x60]*[\x60]/g, "");
}

function citationKeys(raw: string): string[] {
  const keys: string[] = [];
  for (const match of raw.matchAll(/\[@([^\]]+)\]/g)) {
    for (const part of match[1].split(/\s*;\s*/)) {
      const key = part.replace(/^@/, "").trim();
      if (key) keys.push(key);
    }
  }
  return keys;
}

function footnoteRefs(raw: string): string[] {
  return Array.from(
    raw.matchAll(/\[\^([A-Za-z0-9][A-Za-z0-9_-]*)\]/g),
    (match) => match[1],
  );
}

function evidenceRefs(raw: string): string[] {
  return Array.from(
    raw.matchAll(/\[\[evidence:([A-Za-z0-9][A-Za-z0-9_-]*)(?:\|[^\]]+)?\]\]/g),
    (match) => match[1],
  );
}
