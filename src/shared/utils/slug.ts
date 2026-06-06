/**
 * Slug helpers shared across content (TOC anchors, etc.) (§15.2).
 */
import { slugify } from "@/config/envShared";

export { slugify };

/**
 * Produce a unique heading id by suffixing duplicates, given a set of ids that
 * have already been used. Mutates `used` to record the returned id.
 */
export function uniqueSlug(text: string, used: Set<string>): string {
  const base = slugify(text) || "section";
  let candidate = base;
  let counter = 1;
  while (used.has(candidate)) {
    candidate = `${base}-${counter}`;
    counter += 1;
  }
  used.add(candidate);
  return candidate;
}
