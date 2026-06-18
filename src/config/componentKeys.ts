/**
 * Serializable allow-list of React page component keys (§9/§10).
 *
 * This list is the single source of truth that ties together:
 *   - ReactPageData.componentKey in pageData.ts (which key a page references)
 *   - componentByKey in pages.ts (which React component is attached)
 *   - scripts/validate-pages.ts (which keys are valid, without importing React)
 *
 * Keeping it free of React imports lets the Bun validation script use it.
 */
export const componentKeys = ["home", "team", "attributions"] as const;

export type ComponentKey = (typeof componentKeys)[number];

/** Keys that may exist in the component map without a page referencing them. */
export const reservedComponentKeys: readonly ComponentKey[] = [];
