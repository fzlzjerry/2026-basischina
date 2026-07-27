/**
 * Theme guard (§3 / §17). Walks the src tree (.ts/.tsx/.css) and fails (exit 1) on:
 *   (a) `text-primary` used as a bare utility (must be `text-primary-deep`, etc.)
 *   (b) any literal #19c8b9 OUTSIDE the single `--color-primary:` definition line
 *   (c) any emoji glyph (the site is SVG-only — Phosphor icons, never emoji)
 *   (d) missing required design tokens in src/styles/main.css
 *   (e) non-named @phosphor-icons/react imports
 *   (f) overshoot eases (back/elastic/bounce) in GSAP `ease:` params
 *   (g) content displacement (x/y/xPercent/yPercent) in GSAP .from()/.fromTo()
 *       under src/features/home + src/app/shell — content never translates
 *
 * Bun script. Intentionally scoped to src/ only, so this file's own regex
 * sources and the #19c8b9 literal below are never scanned (no self-trip).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = path.join(root, "src");
const mainCssRel = "src/styles/main.css";

type Finding = { file: string; line: number; rule: string; text: string };
const findings: Finding[] = [];

// (a) bare `text-primary` utility (allow text-primary-deep / -soft / -rail).
const bareTextPrimary = /\btext-primary\b(?!-)/;
// (b) the brand teal literal, any case.
const tealLiteral = /#19c8b9/i;
// the one line allowed to contain the teal literal.
const primaryDef = /--color-primary:\s*#19c8b9/i;
// (e) Phosphor must be imported via NAMED imports only (default / namespace are banned).
const phosphorBadImport =
  /import\s+(?:\*\s+as\s+\w+|\w+)\s+from\s+["']@phosphor-icons\/react["']/;
// (f) No overshoot eases (user-rejected as gimmicky): entrances use the power
// family only. Matches GSAP `ease:` params, not prose or other strings.
const overshootEase = /\bease:\s*["'](?:back|elastic|bounce)\b/;
// (g) Content never translates (user rule, 2026-07-02): entrance tweens must
// not displace content — no x/y/xPercent/yPercent inside .from()/.fromTo()
// bodies on the homepage or shell. Scroll-linked decorative `.to()` tweens and
// the PageTransition curtain (.to) are exempt by construction; `(?<!Array)`
// keeps Array.from() out of the match.
const displacementScopes = ["src/features/home", "src/app/shell"];
const fromCall = /(?<!Array)\.from(?:To)?\(/g;
const displacementProp = /\b(?:x|y|xPercent|yPercent)\s*:\s*[-\d"']/;
// (c) emoji: pictographs, symbols, dingbats, regional indicators, arrows, and
// technical symbols. Excludes ordinary CJK/Latin text used across the wiki.
// (Non-printing modifiers U+FE0F/U+200D are intentionally omitted — they never
// appear without a base glyph, which the ranges below already catch, and they
// trip eslint's no-misleading-character-class rule.)
const emoji =
  /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{1F1E6}-\u{1F1FF}\u{2190}-\u{21FF}\u{2300}-\u{23FF}]/u;
// Arrows (←↑→↓) live in the 2190–21FF range above; the theme replaces them with
// Phosphor PawPrint, so they are correctly flagged as non-SVG glyphs.

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walk(full));
    } else if (/\.(ts|tsx|css)$/.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

const files = walk(srcDir);
for (const file of files) {
  const rel = path.relative(root, file);
  const lines = fs.readFileSync(file, "utf8").split("\n");
  lines.forEach((text, i) => {
    const lineNo = i + 1;
    if (bareTextPrimary.test(text)) {
      findings.push({
        file: rel,
        line: lineNo,
        rule: "bare text-primary",
        text: text.trim(),
      });
    }
    if (tealLiteral.test(text) && !primaryDef.test(text)) {
      findings.push({
        file: rel,
        line: lineNo,
        rule: "#19c8b9 outside --color-primary def",
        text: text.trim(),
      });
    }
    if (emoji.test(text)) {
      findings.push({
        file: rel,
        line: lineNo,
        rule: "emoji / non-SVG glyph",
        text: text.trim(),
      });
    }
    if (phosphorBadImport.test(text)) {
      findings.push({
        file: rel,
        line: lineNo,
        rule: "non-named @phosphor-icons/react import (use named imports)",
        text: text.trim(),
      });
    }
    if (overshootEase.test(text)) {
      findings.push({
        file: rel,
        line: lineNo,
        rule: "overshoot ease (back/elastic/bounce) — use power-family ease-outs",
        text: text.trim(),
      });
    }
  });

  // (g) content-displacement scan. Tween vars span lines, so this pass walks
  // the raw text: find each .from(/.fromTo( call, slice to its balanced
  // closing paren, and flag x/y props inside the body.
  if (displacementScopes.some((scope) => rel.startsWith(scope))) {
    const text = lines.join("\n");
    for (const match of text.matchAll(fromCall)) {
      const openIdx = (match.index ?? 0) + match[0].length - 1;
      let depth = 1;
      let end = openIdx + 1;
      while (end < text.length && depth > 0) {
        if (text[end] === "(") depth += 1;
        else if (text[end] === ")") depth -= 1;
        end += 1;
      }
      if (displacementProp.test(text.slice(openIdx + 1, end - 1))) {
        const lineNo = text.slice(0, match.index ?? 0).split("\n").length;
        findings.push({
          file: rel,
          line: lineNo,
          rule: "content displacement (x/y) in from()/fromTo() — content never translates",
          text: lines[lineNo - 1].trim(),
        });
      }
    }
  }
}

// (d) required token presence in main.css.
const requiredTokens = [
  "--color-page",
  "--color-surface",
  "--color-ink",
  "--color-ink-soft",
  "--color-primary",
  "--color-primary-deep",
  "--color-primary-soft",
  "--color-primary-rail",
  "--color-error",
  "--color-error-rail",
  "--color-focus-ring",
  "--color-focus-on-dark",
  "--color-border",
  "--color-app-teal",
  "--color-app-teal-ink",
  "--color-app-blue",
  "--color-app-purple",
  "--color-app-green",
  "--color-app-peach",
  "--color-app-pink",
  "--radius-min",
  "--radius-card",
  "--radius-pill",
  "--shadow-soft",
  "--shadow-btn-3d",
  "--shadow-btn-danger",
  // HEAL hand-drawn register (homepage hero + nav).
  "--shadow-sticker",
  "--color-app-orange",
  "--color-sticker-ink",
  "--color-grid-line",
  "--font-script",
  "--font-hand",
  "--font-body",
  "--ease-cozy",
];
const mainCssPath = path.join(root, mainCssRel);
const missingTokens: string[] = [];
if (!fs.existsSync(mainCssPath)) {
  missingTokens.push(`(file missing: ${mainCssRel})`);
} else {
  const css = fs.readFileSync(mainCssPath, "utf8");
  for (const token of requiredTokens) {
    if (!new RegExp(`${token}\\s*:`).test(css)) missingTokens.push(token);
  }
}

// --- Report -----------------------------------------------------------------
let failed = false;
if (findings.length > 0) {
  failed = true;
  console.error(
    `\n✖ Theme audit found ${findings.length} forbidden glyph/class issue(s):\n`,
  );
  for (const f of findings) {
    console.error(`  - ${f.file}:${f.line} [${f.rule}]  ${f.text}`);
  }
}
if (missingTokens.length > 0) {
  failed = true;
  console.error(
    `\n✖ Theme audit: ${missingTokens.length} required token(s) missing from ${mainCssRel}:\n`,
  );
  for (const t of missingTokens) console.error(`  - ${t}`);
}

if (failed) {
  console.error("");
  process.exit(1);
}

console.log(
  `✓ Theme audit passed (${files.length} src files scanned, ${requiredTokens.length} tokens present).`,
);
