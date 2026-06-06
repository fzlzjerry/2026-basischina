/**
 * Prism core + language grammars, statically imported.
 *
 * Vite cannot analyze dynamic imports of bare package specifiers
 * (`import(`prismjs/components/${x}`)`), so the grammars are imported statically
 * here. This module is itself loaded via a RELATIVE dynamic import from
 * useMarkdownEnhancements, so Vite still code-splits Prism + all grammars into a
 * separate chunk that only loads on Markdown pages, in the browser.
 *
 * Import order matters: grammars that extend others must come after them
 * (c -> cpp, javascript/jsx + typescript -> tsx, markup -> markdown).
 */
import Prism from "prismjs";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-c";
import "prismjs/components/prism-cpp";
import "prismjs/components/prism-python";
import "prismjs/components/prism-r";
import "prismjs/components/prism-json";
import "prismjs/components/prism-yaml";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-markdown";
import "prismjs/components/prism-latex";

export default Prism;
