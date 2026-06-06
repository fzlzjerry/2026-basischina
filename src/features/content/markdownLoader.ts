/**
 * Markdown loader (§15.3).
 *
 * Markdown is imported eagerly as raw strings. Eager (synchronous) loading is
 * deliberate: it lets MarkdownPage render fully during the build-time prerender,
 * so the article HTML — not a loading spinner — ends up in the static output.
 */
const markdownModules = import.meta.glob("/src/content/**/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

function modulePathFor(contentPath: string): string {
  return `/src/content/${contentPath}.md`;
}

export function hasMarkdown(contentPath: string): boolean {
  return modulePathFor(contentPath) in markdownModules;
}

export function getMarkdown(contentPath: string): string {
  const raw = markdownModules[modulePathFor(contentPath)];
  if (typeof raw !== "string") {
    throw new Error(`Markdown file not found: ${modulePathFor(contentPath)}`);
  }
  return raw;
}
