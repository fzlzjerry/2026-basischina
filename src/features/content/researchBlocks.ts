import { load as yamlLoad } from "js-yaml";

export const RESEARCH_BLOCK_KINDS = [
  "result",
  "dbtl",
  "data-figure",
  "protocol",
  "notebook-timeline",
  "stakeholder-impact",
  "part",
  "model-summary",
] as const;

export type ResearchBlockKind = (typeof RESEARCH_BLOCK_KINDS)[number];

export interface ResearchBlockSource {
  kind: ResearchBlockKind;
  content: string;
  line: number;
}

export interface ResearchBlockAnalysis {
  kind: ResearchBlockKind;
  data: Record<string, unknown>;
  id?: string;
  citationKeys: string[];
  evidenceTargets: string[];
  issues: string[];
}

export interface ResearchBlockRenderOptions {
  resolveHref: (href: string) => string;
  renderCitations: (keys: string[]) => string;
}

const RESEARCH_IDS = /^[A-Za-z0-9][A-Za-z0-9_-]*$/;
const kinds = new Set<string>(RESEARCH_BLOCK_KINDS);

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function text(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return undefined;
}

function textList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map(text).filter((item): item is string => item !== undefined);
}

function recordList(value: unknown): Record<string, unknown>[] {
  if (!Array.isArray(value)) return [];
  return value
    .map(asRecord)
    .filter((item): item is Record<string, unknown> => item !== null);
}

function requiredText(
  data: Record<string, unknown>,
  key: string,
  issues: string[],
): string {
  const value = text(data[key]);
  if (!value) issues.push('Missing required field "' + key + '".');
  return value ?? "";
}

function requireTextList(
  data: Record<string, unknown>,
  key: string,
  issues: string[],
): string[] {
  const values = textList(data[key]);
  if (values.length === 0) {
    issues.push('Field "' + key + '" must contain at least one item.');
  }
  return values;
}

function renderList(title: string, values: string[]): string {
  if (values.length === 0) return "";
  return (
    '<section class="research-block-list"><h4>' +
    escapeHtml(title) +
    "</h4><ul>" +
    values.map((value) => "<li>" + escapeHtml(value) + "</li>").join("") +
    "</ul></section>"
  );
}

function renderEvidenceList(values: string[]): string {
  if (values.length === 0) return "";
  return (
    '<section class="research-block-list"><h4>Evidence</h4><ul>' +
    values
      .map(
        (value) =>
          '<li><a class="scientific-evidence-link" href="#' +
          escapeHtml(value) +
          '">' +
          escapeHtml(value) +
          "</a></li>",
      )
      .join("") +
    "</ul></section>"
  );
}

function renderDefinitionRows(
  rows: Array<{ label: string; value: string | undefined }>,
): string {
  const visible = rows.filter((row): row is { label: string; value: string } =>
    Boolean(row.value),
  );
  if (visible.length === 0) return "";
  return (
    '<dl class="research-block-facts">' +
    visible
      .map(
        (row) =>
          "<div><dt>" +
          escapeHtml(row.label) +
          "</dt><dd>" +
          escapeHtml(row.value) +
          "</dd></div>",
      )
      .join("") +
    "</dl>"
  );
}

function renderLink(
  href: string | undefined,
  label: string,
  options: ResearchBlockRenderOptions,
): string {
  if (!href) return "";
  const resolved = options.resolveHref(href);
  const external = /^https?:\/\//i.test(resolved);
  return (
    '<a class="research-block-link" href="' +
    escapeHtml(resolved) +
    '"' +
    (external ? ' target="_blank" rel="noopener noreferrer"' : "") +
    ">" +
    escapeHtml(label) +
    (external ? '<span class="sr-only"> (opens in new tab)</span>' : "") +
    "</a>"
  );
}

function citations(
  data: Record<string, unknown>,
  options: ResearchBlockRenderOptions,
): string {
  const keys = textList(data.citations);
  if (keys.length === 0) return "";
  return (
    '<div class="research-block-citations"><span>Sources</span>' +
    options.renderCitations(keys) +
    "</div>"
  );
}

function shell(
  kind: ResearchBlockKind,
  label: string,
  id: string,
  title: string,
  body: string,
  footer: string,
): string {
  return (
    '<section id="' +
    escapeHtml(id) +
    '" class="research-block research-block--' +
    escapeHtml(kind) +
    '" data-research-kind="' +
    escapeHtml(kind) +
    '" aria-labelledby="' +
    escapeHtml(id) +
    '-title"><header class="research-block-header"><span class="research-block-eyebrow">' +
    escapeHtml(label) +
    '</span><h3 id="' +
    escapeHtml(id) +
    '-title">' +
    escapeHtml(title) +
    "</h3></header>" +
    body +
    (footer
      ? '<footer class="research-block-footer">' + footer + "</footer>"
      : "") +
    "</section>"
  );
}

function renderResult(
  data: Record<string, unknown>,
  id: string,
  title: string,
  issues: string[],
  options: ResearchBlockRenderOptions,
): string {
  const claim = requiredText(data, "claim", issues);
  const method = text(data.method);
  const controls = textList(data.controls);
  const limitations = textList(data.limitations);
  const uncertainty = text(data.uncertainty);
  const dataset = text(data.dataset);
  const resultRecord = asRecord(data.result);
  const result =
    text(data.result) ??
    (resultRecord
      ? [text(resultRecord.value), text(resultRecord.unit)]
          .filter((item): item is string => Boolean(item))
          .join(" ")
      : undefined);
  if (!result) issues.push('Missing required field "result".');

  const replicateRecord = asRecord(data.replicates);
  const replicates = replicateRecord
    ? [
        text(replicateRecord.biological)
          ? text(replicateRecord.biological) + " biological"
          : undefined,
        text(replicateRecord.technical)
          ? text(replicateRecord.technical) + " technical"
          : undefined,
      ]
        .filter((item): item is string => Boolean(item))
        .join(", ")
    : text(data.replicates);

  const body =
    '<p class="research-block-claim"><span>Claim</span>' +
    escapeHtml(claim) +
    "</p>" +
    renderDefinitionRows([
      { label: "Observed result", value: result },
      { label: "Method", value: method },
      { label: "Replicates", value: replicates },
      { label: "Uncertainty", value: uncertainty },
    ]) +
    '<div class="research-block-columns">' +
    renderList("Controls", controls) +
    renderList("Limitations", limitations) +
    "</div>";
  const footer =
    renderLink(dataset, "Open dataset", options) + citations(data, options);

  return shell("result", "Result", id, title, body, footer);
}

function renderDbtl(
  data: Record<string, unknown>,
  id: string,
  title: string,
  issues: string[],
  options: ResearchBlockRenderOptions,
): string {
  const cycles = recordList(data.cycles);
  if (cycles.length === 0) {
    issues.push('Field "cycles" must contain at least one cycle.');
  }

  const body =
    '<ol class="research-dbtl-cycles">' +
    cycles
      .map((cycle, index) => {
        const cycleTitle = text(cycle.title) ?? "Cycle " + (index + 1);
        const phases = ["design", "build", "test", "learn", "next"] as const;
        const phaseRows = phases.map((phase) => {
          const value = text(cycle[phase]);
          if (!value) {
            issues.push(
              'Cycle "' + cycleTitle + '" is missing field "' + phase + '".',
            );
          }
          return {
            label: phase === "next" ? "Next iteration" : phase,
            value,
          };
        });
        const evidence = textList(cycle.evidence);
        return (
          '<li class="research-dbtl-cycle"><h4>' +
          escapeHtml(cycleTitle) +
          "</h4>" +
          renderDefinitionRows(phaseRows) +
          renderEvidenceList(evidence) +
          "</li>"
        );
      })
      .join("") +
    "</ol>";

  return shell(
    "dbtl",
    "Engineering cycle",
    id,
    title,
    body,
    citations(data, options),
  );
}

function renderDataFigure(
  data: Record<string, unknown>,
  id: string,
  title: string,
  issues: string[],
  options: ResearchBlockRenderOptions,
): string {
  const caption = requiredText(data, "caption", issues);
  const description = text(data.description);
  const image = text(data.image);
  const alt = text(data.alt);
  if (image && !alt) issues.push('Data figure with "image" also needs "alt".');

  const columns = textList(data.columns);
  const rows = Array.isArray(data.rows)
    ? data.rows.filter(Array.isArray).map((row) => row.map(text))
    : [];
  if (rows.length > 0 && columns.length === 0) {
    issues.push('Data figure with "rows" also needs "columns".');
  }
  for (const [index, row] of rows.entries()) {
    if (row.length !== columns.length || row.some((cell) => !cell)) {
      issues.push(
        "Data figure row " +
          (index + 1) +
          " must contain one value for every column.",
      );
    }
  }

  const figure =
    '<figure class="research-data-figure">' +
    (image
      ? '<img src="' +
        escapeHtml(options.resolveHref(image)) +
        '" alt="' +
        escapeHtml(alt ?? "") +
        '" loading="lazy" decoding="async">'
      : "") +
    (description
      ? '<p class="research-figure-description">' +
        escapeHtml(description) +
        "</p>"
      : "") +
    (rows.length > 0
      ? '<div class="research-table-scroll"><table><thead><tr>' +
        columns
          .map((column) => '<th scope="col">' + escapeHtml(column) + "</th>")
          .join("") +
        "</tr></thead><tbody>" +
        rows
          .map(
            (row) =>
              "<tr>" +
              row
                .map((cell) => "<td>" + escapeHtml(cell ?? "") + "</td>")
                .join("") +
              "</tr>",
          )
          .join("") +
        "</tbody></table></div>"
      : "") +
    "<figcaption><span>Figure</span>" +
    escapeHtml(caption) +
    "</figcaption></figure>";
  const footer =
    renderLink(text(data.download), "Download data", options) +
    renderLink(text(data.analysis), "Open analysis", options) +
    citations(data, options);

  return shell("data-figure", "Data figure", id, title, figure, footer);
}

function renderProtocol(
  data: Record<string, unknown>,
  id: string,
  title: string,
  issues: string[],
  options: ResearchBlockRenderOptions,
): string {
  const objective = requiredText(data, "objective", issues);
  const materials = requireTextList(data, "materials", issues);
  const steps = requireTextList(data, "steps", issues);
  const controls = textList(data.controls);
  const safety = textList(data.safety);
  const body =
    '<p class="research-block-claim"><span>Objective</span>' +
    escapeHtml(objective) +
    "</p>" +
    renderDefinitionRows([
      { label: "Version", value: text(data.version) },
      { label: "Updated", value: text(data.date) },
    ]) +
    '<div class="research-block-columns">' +
    renderList("Materials", materials) +
    renderList("Controls", controls) +
    renderList("Safety", safety) +
    "</div>" +
    '<section class="research-protocol-steps"><h4>Procedure</h4><ol>' +
    steps.map((step) => "<li>" + escapeHtml(step) + "</li>").join("") +
    "</ol></section>";
  const footer =
    renderLink(text(data.download), "Download protocol", options) +
    citations(data, options);

  return shell("protocol", "Protocol", id, title, body, footer);
}

function renderTimeline(
  data: Record<string, unknown>,
  id: string,
  title: string,
  issues: string[],
  options: ResearchBlockRenderOptions,
): string {
  const entries = recordList(data.entries);
  if (entries.length === 0) {
    issues.push('Field "entries" must contain at least one notebook entry.');
  }
  const body =
    '<ol class="research-timeline">' +
    entries
      .map((entry, index) => {
        const entryTitle = requiredText(entry, "title", issues);
        const date = requiredText(entry, "date", issues);
        const outcome = requiredText(entry, "outcome", issues);
        const entryId = text(entry.id) ?? id + "-entry-" + (index + 1);
        return (
          '<li id="' +
          escapeHtml(entryId) +
          '"><div class="research-timeline-meta"><time datetime="' +
          escapeHtml(date) +
          '">' +
          escapeHtml(date) +
          "</time>" +
          (text(entry.workstream)
            ? "<span>" + escapeHtml(text(entry.workstream) ?? "") + "</span>"
            : "") +
          (text(entry.status)
            ? "<span>" + escapeHtml(text(entry.status) ?? "") + "</span>"
            : "") +
          "</div><h4>" +
          escapeHtml(entryTitle) +
          "</h4><p>" +
          escapeHtml(outcome) +
          "</p>" +
          (text(entry.next)
            ? '<p class="research-timeline-next"><span>Next</span>' +
              escapeHtml(text(entry.next) ?? "") +
              "</p>"
            : "") +
          renderEvidenceList(textList(entry.evidence)) +
          "</li>"
        );
      })
      .join("") +
    "</ol>";

  return shell(
    "notebook-timeline",
    "Notebook timeline",
    id,
    title,
    body,
    citations(data, options),
  );
}

function renderStakeholderImpact(
  data: Record<string, unknown>,
  id: string,
  title: string,
  issues: string[],
  options: ResearchBlockRenderOptions,
): string {
  const entries = recordList(data.entries);
  if (entries.length === 0) {
    issues.push('Field "entries" must contain at least one stakeholder entry.');
  }
  const body =
    '<ol class="research-impact-chain">' +
    entries
      .map((entry) => {
        const stakeholder = requiredText(entry, "stakeholder", issues);
        const rows = ["method", "insight", "change", "followUp"].map((key) => {
          const value = text(entry[key]);
          if (key !== "followUp" && !value) {
            issues.push(
              'Stakeholder "' +
                stakeholder +
                '" is missing field "' +
                key +
                '".',
            );
          }
          return {
            label:
              key === "followUp"
                ? "Follow-up"
                : key === "change"
                  ? "Design change"
                  : key,
            value,
          };
        });
        return (
          "<li><h4>" +
          escapeHtml(stakeholder) +
          "</h4>" +
          renderDefinitionRows(rows) +
          "</li>"
        );
      })
      .join("") +
    "</ol>";

  return shell(
    "stakeholder-impact",
    "Stakeholder impact",
    id,
    title,
    body,
    citations(data, options),
  );
}

function renderPart(
  data: Record<string, unknown>,
  id: string,
  title: string,
  issues: string[],
  options: ResearchBlockRenderOptions,
): string {
  const registryId = requiredText(data, "registryId", issues);
  const partFunction = requiredText(data, "function", issues);
  const chassis = requiredText(data, "chassis", issues);
  const status = requiredText(data, "status", issues);
  const body = renderDefinitionRows([
    { label: "Registry ID", value: registryId },
    { label: "Function", value: partFunction },
    { label: "Chassis", value: chassis },
    { label: "Status", value: status },
    { label: "Characterization", value: text(data.characterization) },
  ]);
  const footer =
    renderLink(text(data.registryUrl), "Open Registry entry", options) +
    renderLink(text(data.sequence), "Open sequence", options) +
    citations(data, options);

  return shell("part", "Part", id, title, body, footer);
}

function renderModelSummary(
  data: Record<string, unknown>,
  id: string,
  title: string,
  issues: string[],
  options: ResearchBlockRenderOptions,
): string {
  const assumptions = requireTextList(data, "assumptions", issues);
  const limitations = textList(data.limitations);
  const parameters = recordList(data.parameters);
  if (parameters.length === 0) {
    issues.push('Field "parameters" must contain at least one parameter.');
  }
  const parameterTable =
    '<div class="research-table-scroll"><table><thead><tr><th scope="col">Parameter</th><th scope="col">Value</th><th scope="col">Unit</th><th scope="col">Source</th></tr></thead><tbody>' +
    parameters
      .map((parameter) => {
        const name = requiredText(parameter, "name", issues);
        const value = requiredText(parameter, "value", issues);
        const unit = requiredText(parameter, "unit", issues);
        const source = requiredText(parameter, "source", issues);
        return (
          '<tr><th scope="row">' +
          escapeHtml(name) +
          "</th><td>" +
          escapeHtml(value) +
          "</td><td>" +
          escapeHtml(unit) +
          "</td><td>" +
          escapeHtml(source) +
          "</td></tr>"
        );
      })
      .join("") +
    "</tbody></table></div>";
  const body =
    '<div class="research-block-columns">' +
    renderList("Assumptions", assumptions) +
    renderList("Limitations", limitations) +
    "</div>" +
    parameterTable +
    renderDefinitionRows([
      { label: "Validation", value: text(data.validation) },
      { label: "Sensitivity", value: text(data.sensitivity) },
    ]);
  const footer =
    renderLink(text(data.code), "Open model code", options) +
    renderLink(text(data.dataset), "Open model data", options) +
    citations(data, options);

  return shell("model-summary", "Model summary", id, title, body, footer);
}

export function isResearchBlockKind(value: string): value is ResearchBlockKind {
  return kinds.has(value);
}

export function analyzeResearchBlock(
  kind: ResearchBlockKind,
  source: string,
): ResearchBlockAnalysis {
  const issues: string[] = [];
  let parsed: unknown;
  try {
    parsed = yamlLoad(source);
  } catch (error) {
    return {
      kind,
      data: {},
      citationKeys: [],
      evidenceTargets: [],
      issues: [
        "Invalid YAML: " +
          (error instanceof Error ? error.message : String(error)),
      ],
    };
  }

  const data = asRecord(parsed);
  if (!data) {
    return {
      kind,
      data: {},
      citationKeys: [],
      evidenceTargets: [],
      issues: ["Research block content must be a YAML object."],
    };
  }

  const id = text(data.id);
  const title = text(data.title);
  if (!id) {
    issues.push('Missing required field "id".');
  } else if (!RESEARCH_IDS.test(id)) {
    issues.push(
      'Field "id" must start with a letter or number and contain only letters, numbers, hyphens, or underscores.',
    );
  }
  if (!title) issues.push('Missing required field "title".');

  const evidenceTargets: string[] = [];
  if (kind === "dbtl") {
    for (const cycle of recordList(data.cycles)) {
      evidenceTargets.push(...textList(cycle.evidence));
    }
  }
  if (kind === "notebook-timeline") {
    for (const entry of recordList(data.entries)) {
      evidenceTargets.push(...textList(entry.evidence));
    }
  }

  return {
    kind,
    data,
    id,
    citationKeys: textList(data.citations),
    evidenceTargets,
    issues,
  };
}

export function renderResearchBlock(
  kind: ResearchBlockKind,
  source: string,
  options: ResearchBlockRenderOptions,
): {
  html: string;
  id?: string;
  issues: string[];
  citationKeys: string[];
  evidenceTargets: string[];
} {
  const analysis = analyzeResearchBlock(kind, source);
  const issues = [...analysis.issues];
  const id = analysis.id ?? "invalid-research-block";
  const title = text(analysis.data.title) ?? "Invalid research block";
  let html = "";

  switch (kind) {
    case "result":
      html = renderResult(analysis.data, id, title, issues, options);
      break;
    case "dbtl":
      html = renderDbtl(analysis.data, id, title, issues, options);
      break;
    case "data-figure":
      html = renderDataFigure(analysis.data, id, title, issues, options);
      break;
    case "protocol":
      html = renderProtocol(analysis.data, id, title, issues, options);
      break;
    case "notebook-timeline":
      html = renderTimeline(analysis.data, id, title, issues, options);
      break;
    case "stakeholder-impact":
      html = renderStakeholderImpact(analysis.data, id, title, issues, options);
      break;
    case "part":
      html = renderPart(analysis.data, id, title, issues, options);
      break;
    case "model-summary":
      html = renderModelSummary(analysis.data, id, title, issues, options);
      break;
  }

  if (issues.length > 0) {
    html =
      '<aside class="research-block-error" role="alert"><strong>Research block needs attention.</strong><ul>' +
      issues.map((issue) => "<li>" + escapeHtml(issue) + "</li>").join("") +
      "</ul></aside>" +
      html;
  }

  return {
    html,
    id: analysis.id,
    issues,
    citationKeys: analysis.citationKeys,
    evidenceTargets: analysis.evidenceTargets,
  };
}

export function extractResearchBlocks(source: string): ResearchBlockSource[] {
  const lines = source.split(/\r?\n/);
  const blocks: ResearchBlockSource[] = [];

  for (let index = 0; index < lines.length; index += 1) {
    const opening = lines[index]?.match(/^\s*[\x60]{3}([A-Za-z0-9-]+)\s*$/);
    if (!opening) continue;
    const language = opening[1].toLowerCase();
    const startLine = index + 1;
    const content: string[] = [];
    index += 1;
    while (
      index < lines.length &&
      !/^\s*[\x60]{3}\s*$/.test(lines[index] ?? "")
    ) {
      content.push(lines[index] ?? "");
      index += 1;
    }
    if (isResearchBlockKind(language)) {
      blocks.push({
        kind: language,
        content: content.join("\n"),
        line: startLine,
      });
    }
  }

  return blocks;
}
