/**
 * Markdown loader (§15.3).
 *
 * Sources are separate lazy modules. The route loader imports only the requested
 * article during SSG, then vite-react-ssg serializes the processed result for
 * hydration and client navigation. This keeps all article sources out of the
 * global browser entry while preserving complete prerendered HTML.
 */
const markdownModules = import.meta.glob("/src/content/articles/**/*.md", {
  query: "?raw",
  import: "default",
}) as Record<string, () => Promise<string>>;

function modulePathFor(contentPath: string): string {
  return `/src/content/${contentPath}.md`;
}

export async function loadMarkdown(contentPath: string): Promise<string> {
  const load = markdownModules[modulePathFor(contentPath)];
  if (!load) {
    throw new Error(`Markdown file not found: ${modulePathFor(contentPath)}`);
  }
  return load();
}
