import { useState } from "react";
import { CaretDown, CaretRight } from "@phosphor-icons/react";
import { Icon } from "@/shared/components/Icon";
import { WashiTape } from "@/shared/components/WashiTape";
import { stickerStyle } from "@/shared/styles/heal";
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
            className="block rounded-[10px] px-2 py-1 text-sm text-ink-soft transition hover:bg-app-orange-soft hover:text-sticker-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
          >
            {item.title}
          </a>
          {item.children.length > 0 ? (
            <div className="ml-3 border-l-2 border-border-soft pl-2">
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
    // A <div>; the contained nav carries the landmark + label. Sits as a sticker
    // cutout pasted into the notebook margin (static tilt, no hover-lift), held
    // down by a strip of washi tape straddling its top edge.
    <div className="heal-cutout relative bg-page p-4" style={stickerStyle(2)}>
      <WashiTape
        tone="teal"
        className="-top-3.5 left-1/2 w-20 -translate-x-1/2 rotate-2"
      />
      <nav aria-label="Table of contents">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="toc-list"
          className="flex w-full items-center justify-between rounded-[10px] font-hand text-base text-sticker-ink transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
        >
          On this page
          <Icon as={open ? CaretDown : CaretRight} size="sm" aria-hidden />
        </button>
        {open ? (
          <div id="toc-list" className="mt-3">
            <TocList items={items} />
          </div>
        ) : null}
      </nav>
    </div>
  );
}
