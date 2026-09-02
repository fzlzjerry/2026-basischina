import {
  pageData,
  type MarkdownPageData,
  type PageData,
} from "@/config/pageData";
import { navGroupLabels, navGroupOrder } from "@/config/navigation";

export const STUDIO_STORAGE_KEY = "basis-china.studio.draft.v1";
export const STUDIO_FIXTURE_ID = "__fixture__";
export const DEFAULT_PREVIEW_PATH = "/results";

export const DEFAULT_DRAFT = `---
title: Draft page
description: One sentence explaining what readers will find on this page.
author: BASIS-China Team
date: 2026-08-23
tags: [draft]
relatedPages:
  - /engineering
  - /measurement
---

Write a short opening paragraph. Tell the reader what this page is about.

This sentence cites the official wiki guide [@igem-team-wiki-2026]. A claim that
belongs to this page can point at the result card
[[evidence:draft-growth-01|See the result]].

## The question

Explain the problem or goal. Body headings start at \`##\`. The page title above
is the only \`<h1>\`.

> **Takeaway.** Use a block quote for a note, a safety warning, or a one-line
> conclusion. Do not wrap the whole page.

## What we found

The treatment group had a higher final OD600 than the untreated control.

\`\`\`result
id: draft-growth-01
title: Growth assay after 24 hours
claim: The treatment group had a higher mean OD600 than the untreated control.
method: Microplate reader at 600 nm
controls:
  - Untreated culture
  - Medium-only blank
replicates:
  biological: 3
  technical: 3
result:
  value: "0.61 versus 0.42"
  unit: "OD600"
uncertainty: "Mean plus or minus SD"
limitations:
  - Only one strain and one growth condition were tested.
citations:
  - igem-team-wiki-2026
\`\`\`

## What it means

The Michaelis constant $K_m$ is reported in millimolar units. Currency should be
written as USD 100 so the dollar sign is not read as math.

## Limitations and next steps

Say what remains uncertain and what should happen next.[^scope]

[^scope]: This draft is a local preview. Copy the Markdown back into
  \`src/content/articles/\` before committing.
`;

export interface StudioSnippet {
  id: string;
  label: string;
  body: string;
}

export const STUDIO_SNIPPETS: StudioSnippet[] = [
  {
    id: "result",
    label: "result card",
    body: `\`\`\`result
id: result-01
title: Result title
claim: One sentence the data actually support.
method: How it was measured
controls:
  - Untreated culture
replicates:
  biological: 3
  technical: 3
result:
  value: "0.61 versus 0.42"
  unit: "OD600"
uncertainty: "Mean plus or minus SD"
limitations:
  - Name the condition this does not cover.
citations:
  - igem-team-wiki-2026
\`\`\`
`,
  },
  {
    id: "dbtl",
    label: "dbtl cycle",
    body: `\`\`\`dbtl
id: engineering-cycle-01
title: Engineering cycle
cycles:
  - title: Cycle 1
    design: What we changed and why.
    build: How we built the revision.
    test: What we measured.
    learn: What the evidence changed.
    next: The next experiment.
    evidence:
      - result-01
\`\`\`
`,
  },
  {
    id: "data-figure",
    label: "data-figure",
    body: `\`\`\`data-figure
id: figure-01
title: Figure title
caption: "What was measured, units, n, and what the error bars are."
description: One sentence of what the figure shows.
columns:
  - Time (h)
  - Treatment mean
  - Control mean
rows:
  - [0, 0.10, 0.10]
  - [4, 0.42, 0.31]
\`\`\`
`,
  },
  {
    id: "protocol",
    label: "protocol",
    body: `\`\`\`protocol
id: protocol-01
title: Protocol title
objective: What this procedure measures or produces.
version: "1.0"
date: 2026-08-23
materials:
  - Overnight cultures
  - Growth medium
controls:
  - Medium-only blank
safety:
  - Follow the approved organism-handling procedure.
steps:
  - Dilute cultures to the stated starting OD600.
  - Measure OD600 every 20 minutes for 24 hours.
\`\`\`
`,
  },
  {
    id: "notebook",
    label: "notebook-timeline",
    body: `\`\`\`notebook-timeline
id: notebook-01
title: Lab progress
entries:
  - date: 2026-08-23
    workstream: wet-lab
    status: completed
    title: Completed the first assembly
    outcome: Colony PCR found two colonies with the expected insert size.
    next: Sequence both candidate colonies.
\`\`\`
`,
  },
  {
    id: "impact",
    label: "stakeholder-impact",
    body: `\`\`\`stakeholder-impact
id: impact-01
title: Stakeholder feedback
entries:
  - stakeholder: Who we spoke with
    method: Interview
    insight: What they told us.
    change: What the team changed because of that.
    followUp: How we will check the change.
\`\`\`
`,
  },
  {
    id: "part",
    label: "part",
    body: `\`\`\`part
id: part-01
title: Part title
registryId: BBa_EXAMPLE
function: What the part does.
chassis: Escherichia coli
status: Built and sequence-confirmed
registryUrl: https://parts.igem.org/
\`\`\`
`,
  },
  {
    id: "model",
    label: "model-summary",
    body: `\`\`\`model-summary
id: model-01
title: Model summary
assumptions:
  - The culture is well mixed.
parameters:
  - name: Growth rate r
    value: "0.42"
    unit: "h^-1"
    source: Fitted to the control growth curve
validation: Compared with a held-out biological replicate.
limitations:
  - Lag-phase variation is not represented.
\`\`\`
`,
  },
  {
    id: "cite",
    label: "citation",
    body: "[@igem-team-wiki-2026]",
  },
  {
    id: "note",
    label: "footnote",
    body: `This sentence needs a parenthetical.[^note]

[^note]: Put the extra detail here.
`,
  },
  {
    id: "evidence",
    label: "evidence link",
    body: "[[evidence:result-01|See the result]]",
  },
  {
    id: "math",
    label: "equation",
    body: `$$
v = \\frac{V_{max}[S]}{K_m + [S]}
$$
`,
  },
  {
    id: "mermaid",
    label: "mermaid",
    body: `\`\`\`mermaid
flowchart LR
  accTitle: Engineering cycle
  accDescr: The team designs, builds, tests, and learns before starting the next cycle.
  A[Design] --> B[Build]
  B[Build] --> C[Test]
  C[Test] --> D[Learn]
  D[Learn] --> A[Design]
\`\`\`
`,
  },
];

export interface StoredStudioDraft {
  source: string;
  previewPath: string;
  updatedAt: string;
}

const allPages: readonly PageData[] = pageData;

function isMarkdownPage(page: PageData): page is MarkdownPageData {
  return page.kind === "markdown";
}

export function markdownStudioPages(): MarkdownPageData[] {
  return allPages.filter(isMarkdownPage);
}

export function studioPageGroups(): Array<{
  key: string;
  label: string;
  pages: MarkdownPageData[];
}> {
  const pages = markdownStudioPages();
  return navGroupOrder
    .map((key) => ({
      key,
      label: navGroupLabels[key],
      pages: pages.filter((page) => (page.navGroup ?? page.category) === key),
    }))
    .filter((group) => group.pages.length > 0);
}

export function normalizeStudioPageParam(value: string | null): string | null {
  if (!value) return null;
  if (value === STUDIO_FIXTURE_ID) return STUDIO_FIXTURE_ID;
  const path = value.startsWith("/") ? value : `/${value.replace(/^\/+/, "")}`;
  return markdownStudioPages().some((page) => page.path === path) ? path : null;
}

export function readStoredDraft(): StoredStudioDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STUDIO_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredStudioDraft>;
    if (typeof parsed.source !== "string" || !parsed.source.trim()) return null;
    const previewPath =
      normalizeStudioPageParam(parsed.previewPath ?? null) ??
      DEFAULT_PREVIEW_PATH;
    return {
      source: parsed.source,
      previewPath,
      updatedAt:
        typeof parsed.updatedAt === "string"
          ? parsed.updatedAt
          : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function writeStoredDraft(draft: StoredStudioDraft): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STUDIO_STORAGE_KEY, JSON.stringify(draft));
}

export function insertAtCursor(
  source: string,
  start: number,
  end: number,
  insertion: string,
): { source: string; cursor: number } {
  const next = source.slice(0, start) + insertion + source.slice(end);
  return { source: next, cursor: start + insertion.length };
}

export function indentSelection(
  source: string,
  start: number,
  end: number,
  direction: 1 | -1,
): { source: string; start: number; end: number } {
  const lineStart = source.lastIndexOf("\n", Math.max(0, start - 1)) + 1;
  const block = source.slice(lineStart, end);
  const lines = block.split("\n");
  const nextLines = lines.map((line) => {
    if (direction > 0) return "  " + line;
    return line.startsWith("  ")
      ? line.slice(2)
      : line.startsWith("\t")
        ? line.slice(1)
        : line;
  });
  const nextBlock = nextLines.join("\n");
  const next = source.slice(0, lineStart) + nextBlock + source.slice(end);
  const delta = nextBlock.length - block.length;
  return {
    source: next,
    start: start + (direction > 0 ? 2 : Math.min(0, delta)),
    end: end + delta,
  };
}
