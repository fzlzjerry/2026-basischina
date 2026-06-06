import { useState } from "react";
import type { TocItem } from "./markdownService";

interface ArticleTableOfContentsProps {
  items: TocItem[];
}

function TocList({ items }: { items: TocItem[] }) {
  return (
    <ul className="space-y-1">
      {items.map((item) => (
        <li key={item.url}>
          <a
            href={item.url}
            className="block rounded px-2 py-1 text-sm text-slate-600 transition hover:bg-slate-100 hover:text-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600"
          >
            {item.title}
          </a>
          {item.children.length > 0 ? (
            <div className="ml-3 border-l border-slate-200 pl-2">
              <TocList items={item.children} />
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

/**
 * Collapsible "On this page" navigation (§23: exposes aria-expanded state).
 */
export function ArticleTableOfContents({ items }: ArticleTableOfContentsProps) {
  const [open, setOpen] = useState(true);
  if (items.length === 0) return null;

  return (
    <nav
      aria-label="Table of contents"
      className="rounded-lg border border-slate-200 bg-white/60 p-4"
    >
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="toc-list"
        className="flex w-full items-center justify-between text-sm font-semibold text-slate-900"
      >
        On this page
        <span aria-hidden="true">{open ? "−" : "+"}</span>
      </button>
      {open ? (
        <div id="toc-list" className="mt-3">
          <TocList items={items} />
        </div>
      ) : null}
    </nav>
  );
}
