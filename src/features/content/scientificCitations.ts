import type MarkdownIt from "markdown-it";
import { load as yamlLoad } from "js-yaml";

export interface ScientificReference {
  type: "article" | "book" | "web" | "dataset" | "igem-wiki";
  title: string;
  authors?: string[];
  organization?: string;
  journal?: string;
  year: string;
  volume?: string;
  issue?: string;
  pages?: string;
  publisher?: string;
  doi?: string;
  url?: string;
  accessed?: string;
}

export type ReferenceLibrary = Record<string, ScientificReference>;

export interface ReferenceLibraryResult {
  library: ReferenceLibrary;
  issues: string[];
}

export interface ScientificRenderState {
  references: ReferenceLibrary;
  citationOrder: string[];
  citationNumbers: Map<string, number>;
  citationOccurrences: Map<string, number>;
  citationBacklinks: Map<string, string[]>;
  missingCitations: Set<string>;
  footnoteDefinitions: Map<string, string>;
  footnoteOrder: string[];
  footnoteNumbers: Map<string, number>;
  footnoteOccurrences: Map<string, number>;
  footnoteBacklinks: Map<string, string[]>;
  missingFootnotes: Set<string>;
  evidenceTargets: Set<string>;
}

export interface ScientificRenderEnv extends Record<string, unknown> {
  scientific?: ScientificRenderState;
}

export interface ScientificSection {
  title: string;
  url: string;
}

const REFERENCE_KEY = /^[A-Za-z0-9][A-Za-z0-9_.:-]*$/;

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function optionalString(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return undefined;
}

function stringList(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const items = value
    .map(optionalString)
    .filter((item): item is string => item !== undefined);
  return items.length > 0 ? items : undefined;
}

export function parseReferenceLibrary(raw: string): ReferenceLibraryResult {
  const issues: string[] = [];
  let parsed: unknown;

  try {
    parsed = yamlLoad(raw);
  } catch (error) {
    return {
      library: {},
      issues: [
        "Reference library YAML is invalid: " +
          (error instanceof Error ? error.message : String(error)),
      ],
    };
  }

  const root = asRecord(parsed);
  if (!root) {
    return {
      library: {},
      issues: ["Reference library must be a YAML object keyed by citation id."],
    };
  }

  const library: ReferenceLibrary = {};
  const doiOwners = new Map<string, string>();
  const allowedTypes = new Set([
    "article",
    "book",
    "web",
    "dataset",
    "igem-wiki",
  ]);

  for (const [key, value] of Object.entries(root)) {
    if (!REFERENCE_KEY.test(key)) {
      issues.push(
        'Reference key "' + key + '" contains unsupported characters.',
      );
      continue;
    }

    const record = asRecord(value);
    if (!record) {
      issues.push('Reference "' + key + '" must be a YAML object.');
      continue;
    }

    const type = optionalString(record.type);
    const title = optionalString(record.title);
    const year = optionalString(record.year);

    if (!type || !allowedTypes.has(type)) {
      issues.push(
        'Reference "' +
          key +
          '" needs type: article, book, web, dataset, or igem-wiki.',
      );
    }
    if (!title) issues.push('Reference "' + key + '" is missing title.');
    if (!year) issues.push('Reference "' + key + '" is missing year.');
    if (!title || !year || !type || !allowedTypes.has(type)) continue;

    const authors = stringList(record.authors);
    const organization = optionalString(record.organization);
    if (!authors && !organization) {
      issues.push(
        'Reference "' + key + '" needs authors or an organization attribution.',
      );
    }

    const doi = optionalString(record.doi);
    if (doi) {
      const normalized = doi
        .toLowerCase()
        .replace(/^https?:\/\/(?:dx\.)?doi\.org\//, "");
      const owner = doiOwners.get(normalized);
      if (owner) {
        issues.push(
          'References "' + owner + '" and "' + key + '" share DOI ' + doi + ".",
        );
      } else {
        doiOwners.set(normalized, key);
      }
    }

    library[key] = {
      type: type as ScientificReference["type"],
      title,
      year,
      authors,
      organization,
      journal: optionalString(record.journal),
      volume: optionalString(record.volume),
      issue: optionalString(record.issue),
      pages: optionalString(record.pages),
      publisher: optionalString(record.publisher),
      doi,
      url: optionalString(record.url),
      accessed: optionalString(record.accessed),
    };
  }

  return { library, issues };
}

export function createScientificRenderState(
  references: ReferenceLibrary,
  footnoteDefinitions: Map<string, string>,
): ScientificRenderState {
  return {
    references,
    citationOrder: [],
    citationNumbers: new Map(),
    citationOccurrences: new Map(),
    citationBacklinks: new Map(),
    missingCitations: new Set(),
    footnoteDefinitions,
    footnoteOrder: [],
    footnoteNumbers: new Map(),
    footnoteOccurrences: new Map(),
    footnoteBacklinks: new Map(),
    missingFootnotes: new Set(),
    evidenceTargets: new Set(),
  };
}

function scientificState(env: unknown): ScientificRenderState {
  const renderEnv = env as ScientificRenderEnv;
  if (!renderEnv.scientific) {
    renderEnv.scientific = createScientificRenderState({}, new Map());
  }
  return renderEnv.scientific;
}

function escapeHtml(md: MarkdownIt, value: string): string {
  return md.utils.escapeHtml(value);
}

function escapeAttribute(md: MarkdownIt, value: string): string {
  return escapeHtml(md, value).replace(/"/g, "&quot;");
}

function assignCitationNumber(
  key: string,
  state: ScientificRenderState,
): number {
  const existing = state.citationNumbers.get(key);
  if (existing !== undefined) return existing;
  const number = state.citationOrder.length + 1;
  state.citationOrder.push(key);
  state.citationNumbers.set(key, number);
  if (!state.references[key]) state.missingCitations.add(key);
  return number;
}

export function renderCitationGroup(
  md: MarkdownIt,
  keys: string[],
  env: unknown,
): string {
  const state = scientificState(env);
  const links = keys.map((key) => {
    const number = assignCitationNumber(key, state);
    const occurrence = (state.citationOccurrences.get(key) ?? 0) + 1;
    state.citationOccurrences.set(key, occurrence);
    const backlinkId = "cite-" + key + "-" + occurrence;
    const backlinks = state.citationBacklinks.get(key) ?? [];
    backlinks.push(backlinkId);
    state.citationBacklinks.set(key, backlinks);
    const reference = state.references[key];
    const label = reference
      ? "Reference " + number + ": " + reference.title
      : "Missing reference " + key;

    return (
      '<a id="' +
      escapeAttribute(md, backlinkId) +
      '" href="#ref-' +
      escapeAttribute(md, key) +
      '" aria-label="' +
      escapeAttribute(md, label) +
      '">[' +
      number +
      "]</a>"
    );
  });

  return (
    '<sup class="scientific-citation">' +
    links.join('<span aria-hidden="true">, </span>') +
    "</sup>"
  );
}

function renderFootnoteReference(
  md: MarkdownIt,
  key: string,
  env: unknown,
): string {
  const state = scientificState(env);
  let number = state.footnoteNumbers.get(key);
  if (number === undefined) {
    number = state.footnoteOrder.length + 1;
    state.footnoteOrder.push(key);
    state.footnoteNumbers.set(key, number);
  }
  if (!state.footnoteDefinitions.has(key)) state.missingFootnotes.add(key);

  const occurrence = (state.footnoteOccurrences.get(key) ?? 0) + 1;
  state.footnoteOccurrences.set(key, occurrence);
  const backlinkId = "note-ref-" + key + "-" + occurrence;
  const backlinks = state.footnoteBacklinks.get(key) ?? [];
  backlinks.push(backlinkId);
  state.footnoteBacklinks.set(key, backlinks);

  return (
    '<sup class="scientific-footnote-ref"><a id="' +
    escapeAttribute(md, backlinkId) +
    '" href="#note-' +
    escapeAttribute(md, key) +
    '" aria-label="Note ' +
    number +
    '">' +
    number +
    "</a></sup>"
  );
}

function renderEvidenceLink(
  md: MarkdownIt,
  id: string,
  label: string | undefined,
  env: unknown,
): string {
  const state = scientificState(env);
  state.evidenceTargets.add(id);
  const visible = label?.trim() || "Evidence: " + id;
  return (
    '<a class="scientific-evidence-link" href="#' +
    escapeAttribute(md, id) +
    '" data-evidence-target="' +
    escapeAttribute(md, id) +
    '">' +
    escapeHtml(md, visible) +
    "</a>"
  );
}

export function registerScientificCitationRules(md: MarkdownIt): void {
  md.inline.ruler.before("emphasis", "scientific_citation", (state, silent) => {
    const match =
      /^\[@([A-Za-z0-9][A-Za-z0-9_.:-]*(?:\s*;\s*@[A-Za-z0-9][A-Za-z0-9_.:-]*)*)\]/.exec(
        state.src.slice(state.pos),
      );
    if (!match) return false;
    if (!silent) {
      const token = state.push("scientific_citation", "", 0);
      token.meta = {
        keys: match[1].split(/\s*;\s*/).map((key) => key.replace(/^@/, "")),
      };
    }
    state.pos += match[0].length;
    return true;
  });

  md.inline.ruler.before("emphasis", "scientific_footnote", (state, silent) => {
    const match = /^\[\^([A-Za-z0-9][A-Za-z0-9_-]*)\]/.exec(
      state.src.slice(state.pos),
    );
    if (!match) return false;
    if (!silent) {
      const token = state.push("scientific_footnote", "", 0);
      token.meta = { key: match[1] };
    }
    state.pos += match[0].length;
    return true;
  });

  md.inline.ruler.before("link", "scientific_evidence", (state, silent) => {
    const match =
      /^\[\[evidence:([A-Za-z0-9][A-Za-z0-9_-]*)(?:\|([^\]]+))?\]\]/.exec(
        state.src.slice(state.pos),
      );
    if (!match) return false;
    if (!silent) {
      const token = state.push("scientific_evidence", "", 0);
      token.meta = { id: match[1], label: match[2]?.trim() };
    }
    state.pos += match[0].length;
    return true;
  });

  md.renderer.rules.scientific_citation = (tokens, idx, _options, env) => {
    const keys = (tokens[idx].meta?.keys ?? []) as string[];
    return renderCitationGroup(md, keys, env);
  };
  md.renderer.rules.scientific_footnote = (tokens, idx, _options, env) => {
    return renderFootnoteReference(
      md,
      String(tokens[idx].meta?.key ?? ""),
      env,
    );
  };
  md.renderer.rules.scientific_evidence = (tokens, idx, _options, env) => {
    return renderEvidenceLink(
      md,
      String(tokens[idx].meta?.id ?? ""),
      tokens[idx].meta?.label as string | undefined,
      env,
    );
  };
}

export function extractFootnoteDefinitions(raw: string): {
  body: string;
  definitions: Map<string, string>;
} {
  const definitions = new Map<string, string>();
  const output: string[] = [];
  const lines = raw.split(/\r?\n/);
  let inFence = false;
  let fenceMarker = "";

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index] ?? "";
    const fence = line.match(/^\s*([\x60]{3,}|~~~+)/);
    if (fence) {
      const marker = fence[1][0];
      if (!inFence) {
        inFence = true;
        fenceMarker = marker;
      } else if (marker === fenceMarker) {
        inFence = false;
        fenceMarker = "";
      }
      output.push(line);
      continue;
    }

    const definition = !inFence
      ? line.match(/^\[\^([A-Za-z0-9][A-Za-z0-9_-]*)\]:\s*(.*)$/)
      : null;
    if (!definition) {
      output.push(line);
      continue;
    }

    const key = definition[1];
    const content = [definition[2]];
    while (index + 1 < lines.length) {
      const continuation = lines[index + 1]?.match(/^(?: {2,}|\t)(.*)$/);
      if (!continuation) break;
      content.push(continuation[1]);
      index += 1;
    }
    definitions.set(key, content.join("\n").trim());
  }

  return { body: output.join("\n"), definitions };
}

function externalLink(
  md: MarkdownIt,
  href: string,
  visible: string,
  label: string,
): string {
  return (
    '<a href="' +
    escapeAttribute(md, href) +
    '" target="_blank" rel="noopener noreferrer" aria-label="' +
    escapeAttribute(md, label) +
    '">' +
    escapeHtml(md, visible) +
    '<span class="sr-only"> (opens in new tab)</span></a>'
  );
}

function renderReference(
  md: MarkdownIt,
  key: string,
  reference: ScientificReference | undefined,
  state: ScientificRenderState,
): string {
  const number = state.citationNumbers.get(key) ?? 0;
  const backlinks = state.citationBacklinks.get(key) ?? [];
  if (!reference) {
    return (
      '<li id="ref-' +
      escapeAttribute(md, key) +
      '" class="scientific-reference scientific-reference--missing">' +
      '<span class="scientific-reference-number">' +
      number +
      ".</span><span>Missing reference: " +
      escapeHtml(md, key) +
      "</span></li>"
    );
  }

  const authors = reference.authors?.join("; ") ?? reference.organization ?? "";
  const publication = [
    reference.journal,
    reference.publisher,
    reference.volume ? "vol. " + reference.volume : undefined,
    reference.issue ? "no. " + reference.issue : undefined,
    reference.pages ? "pp. " + reference.pages : undefined,
  ]
    .filter((item): item is string => Boolean(item))
    .join(", ");
  const links: string[] = [];

  if (reference.doi) {
    const doi = reference.doi.replace(/^https?:\/\/(?:dx\.)?doi\.org\//i, "");
    links.push(
      externalLink(
        md,
        "https://doi.org/" + doi,
        "DOI: " + doi,
        "Open DOI " + doi,
      ),
    );
  } else if (reference.url) {
    links.push(
      externalLink(
        md,
        reference.url,
        "Source",
        "Open source for " + reference.title,
      ),
    );
  }
  if (reference.accessed) {
    links.push("Accessed " + escapeHtml(md, reference.accessed));
  }

  const backlinkHtml = backlinks
    .map((backlink, index) => {
      const suffix = backlinks.length > 1 ? " " + (index + 1) : "";
      return (
        '<a class="scientific-reference-backlink" href="#' +
        escapeAttribute(md, backlink) +
        '" aria-label="Back to citation ' +
        number +
        suffix +
        '">Back' +
        suffix +
        "</a>"
      );
    })
    .join(" ");

  return (
    '<li id="ref-' +
    escapeAttribute(md, key) +
    '" class="scientific-reference"><span class="scientific-reference-number">' +
    number +
    ".</span><div><span>" +
    escapeHtml(md, authors) +
    (authors ? ". " : "") +
    "</span><cite>" +
    escapeHtml(md, reference.title) +
    "</cite><span>. " +
    escapeHtml(md, reference.year) +
    (publication ? ". " + escapeHtml(md, publication) : "") +
    ".</span>" +
    (links.length > 0
      ? '<span class="scientific-reference-links">' +
        links.join(" · ") +
        "</span>"
      : "") +
    '<span class="scientific-reference-backlinks">' +
    backlinkHtml +
    "</span></div></li>"
  );
}

export function renderScientificSections(
  md: MarkdownIt,
  env: ScientificRenderEnv,
): { html: string; sections: ScientificSection[] } {
  const state = scientificState(env);
  const chunks: string[] = [];
  const sections: ScientificSection[] = [];

  if (state.footnoteOrder.length > 0) {
    sections.push({ title: "Notes", url: "#scientific-notes" });
    const notes = state.footnoteOrder.map((key) => {
      const number = state.footnoteNumbers.get(key) ?? 0;
      const definition = state.footnoteDefinitions.get(key);
      const content = definition
        ? md.render(definition, env)
        : "<p>Missing footnote: " + escapeHtml(md, key) + "</p>";
      const backlinks = (state.footnoteBacklinks.get(key) ?? [])
        .map((backlink, index, all) => {
          const suffix = all.length > 1 ? " " + (index + 1) : "";
          return (
            '<a class="scientific-note-backlink" href="#' +
            escapeAttribute(md, backlink) +
            '" aria-label="Back to note ' +
            number +
            suffix +
            '">Back' +
            suffix +
            "</a>"
          );
        })
        .join(" ");
      return (
        '<li id="note-' +
        escapeAttribute(md, key) +
        '"><div class="scientific-note-content">' +
        content +
        '</div><span class="scientific-note-backlinks">' +
        backlinks +
        "</span></li>"
      );
    });
    chunks.push(
      '<section class="scientific-notes" aria-labelledby="scientific-notes">' +
        '<h2 id="scientific-notes">Notes</h2><ol>' +
        notes.join("") +
        "</ol></section>",
    );
  }

  if (state.citationOrder.length > 0) {
    sections.push({ title: "References", url: "#scientific-references" });
    const references = state.citationOrder.map((key) =>
      renderReference(md, key, state.references[key], state),
    );
    chunks.push(
      '<section class="scientific-references" aria-labelledby="scientific-references">' +
        '<h2 id="scientific-references">References</h2><ol>' +
        references.join("") +
        "</ol></section>",
    );
  }

  return { html: chunks.join("\n"), sections };
}
