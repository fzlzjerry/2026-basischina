/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Minimal KaTeX plugin for markdown-it (vendored).
 *
 * Adapted from the well-known `markdown-it-katex` implementation. It adds inline
 * `$...$` and block `$$...$$` math, rendered to static HTML/MathML via
 * `katex.renderToString` — which runs in Node, so equations are present in the
 * build-time prerendered HTML (no client JS required to see the math). State
 * parameters are typed as `any` because markdown-it does not export stable
 * public types for its rule state; this is intentional for vendored plugin code.
 */
import type MarkdownIt from "markdown-it";
import type { KatexOptions } from "katex";

interface KatexPluginOptions extends KatexOptions {
  katex: {
    renderToString: (tex: string, options?: KatexOptions) => string;
  };
}

function isValidDelim(state: any, pos: number) {
  const prevChar = pos > 0 ? state.src.charCodeAt(pos - 1) : -1;
  const nextChar = pos + 1 <= state.posMax ? state.src.charCodeAt(pos + 1) : -1;

  let canOpen = true;
  let canClose = true;

  if (
    prevChar === 0x20 ||
    prevChar === 0x09 ||
    (nextChar >= 0x30 && nextChar <= 0x39)
  ) {
    canClose = false;
  }
  if (nextChar === 0x20 || nextChar === 0x09) {
    canOpen = false;
  }

  return { canOpen, canClose };
}

function mathInline(state: any, silent: boolean): boolean {
  if (state.src[state.pos] !== "$") return false;

  let res = isValidDelim(state, state.pos);
  if (!res.canOpen) {
    if (!silent) state.pending += "$";
    state.pos += 1;
    return true;
  }

  const start = state.pos + 1;
  let match = start;
  let pos: number;
  // eslint-disable-next-line no-cond-assign
  while ((match = state.src.indexOf("$", match)) !== -1) {
    pos = match - 1;
    while (state.src[pos] === "\\") pos -= 1;
    if ((match - pos) % 2 === 1) break;
    match += 1;
  }

  if (match === -1) {
    if (!silent) state.pending += "$";
    state.pos = start;
    return true;
  }

  if (match - start === 0) {
    if (!silent) state.pending += "$$";
    state.pos = start + 1;
    return true;
  }

  res = isValidDelim(state, match);
  if (!res.canClose) {
    if (!silent) state.pending += "$";
    state.pos = start;
    return true;
  }

  if (!silent) {
    const token = state.push("math_inline", "math", 0);
    token.markup = "$";
    token.content = state.src.slice(start, match);
  }

  state.pos = match + 1;
  return true;
}

function mathBlock(
  state: any,
  start: number,
  end: number,
  silent: boolean,
): boolean {
  let pos = state.bMarks[start] + state.tShift[start];
  let max = state.eMarks[start];

  if (pos + 2 > max) return false;
  if (state.src.slice(pos, pos + 2) !== "$$") return false;

  pos += 2;
  let firstLine = state.src.slice(pos, max);

  if (silent) return true;

  let found = false;
  let lastLine = "";

  if (firstLine.trim().slice(-2) === "$$") {
    firstLine = firstLine.trim().slice(0, -2);
    found = true;
  }

  let next = start;
  while (!found) {
    next += 1;
    if (next >= end) break;

    pos = state.bMarks[next] + state.tShift[next];
    max = state.eMarks[next];
    if (pos < max && state.tShift[next] < state.blkIndent) break;

    if (state.src.slice(pos, max).trim().slice(-2) === "$$") {
      const lastPos = state.src.slice(0, max).lastIndexOf("$$");
      lastLine = state.src.slice(pos, lastPos);
      found = true;
    }
  }

  state.line = next + 1;

  const token = state.push("math_block", "math", 0);
  token.block = true;
  token.content =
    (firstLine && firstLine.trim() ? `${firstLine}\n` : "") +
    state.getLines(start + 1, next, state.tShift[start], true) +
    (lastLine && lastLine.trim() ? lastLine : "");
  token.map = [start, state.line];
  token.markup = "$$";
  return true;
}

export function markdownItKatex(
  md: MarkdownIt,
  options: KatexPluginOptions,
): void {
  const { katex, ...katexOptions } = options;

  const render = (tex: string, displayMode: boolean): string => {
    try {
      return katex.renderToString(tex, {
        ...katexOptions,
        displayMode,
        throwOnError: false,
      });
    } catch {
      const safe = md.utils.escapeHtml(tex);
      return displayMode
        ? `<pre class="katex-error">${safe}</pre>`
        : `<span class="katex-error">${safe}</span>`;
    }
  };

  md.inline.ruler.after("escape", "math_inline", mathInline);
  md.block.ruler.after("blockquote", "math_block", mathBlock, {
    alt: ["paragraph", "reference", "blockquote", "list"],
  });

  md.renderer.rules.math_inline = (tokens, idx) =>
    render(tokens[idx].content, false);
  md.renderer.rules.math_block = (tokens, idx) =>
    `${render(tokens[idx].content, true)}\n`;
}
