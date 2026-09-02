import { useState } from "react";
import { CaretDown, CaretRight } from "@phosphor-icons/react";
import { Icon } from "@/shared/components/Icon";
import { WashiTape } from "@/shared/components/WashiTape";
import { stickerStyle } from "@/shared/styles/heal";
import type { TocItem } from "./markdownService";

interface ArticleTableOfContentsProps {
  items: TocItem[];
  activeId?: string;
  instanceId: string;
  defaultOpen?: boolean;
  compact?: boolean;
}

function TocList({ items, activeId }: { items: TocItem[]; activeId?: string }) {
  return (
    <ul className="space-y-1">
      {items.map((item) => {
        const id = item.url.replace(/^#/, "");
        const active = activeId === id;
        const classes = [
          "flex min-h-11 items-center rounded-[10px] px-2 py-1 text-sm transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring",
          active
            ? "bg-app-orange-soft font-bold text-sticker-ink"
            : "text-ink-soft hover:bg-app-orange-soft hover:text-sticker-ink",
        ].join(" ");

        return (
          <li key={item.url}>
            <a
              href={item.url}
              aria-current={active ? "location" : undefined}
              className={classes}
            >
              {item.title}
            </a>
            {item.children.length > 0 ? (
              <div className="ml-3 border-l-2 border-border-soft pl-2">
                <TocList items={item.children} activeId={activeId} />
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

export function ArticleTableOfContents({
  items,
  activeId,
  instanceId,
  defaultOpen = true,
  compact = false,
}: ArticleTableOfContentsProps) {
  const [open, setOpen] = useState(defaultOpen);
  if (items.length === 0) return null;

  return (
    <div
      className={
        compact
          ? "heal-cutout relative bg-page px-4 py-3"
          : "heal-cutout relative bg-page p-4"
      }
      style={stickerStyle(compact ? 1 : 2)}
      data-collapsible
    >
      <WashiTape
        tone="teal"
        className="-top-3.5 left-1/2 w-20 -translate-x-1/2 rotate-2"
      />
      <nav aria-label="Table of contents">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls={instanceId}
          className="flex min-h-11 w-full items-center justify-between rounded-[10px] font-hand text-base text-sticker-ink transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
        >
          <span>
            On this page
            {activeId ? (
              <span className="ml-2 font-body text-xs font-normal text-ink-soft">
                {items
                  .flatMap((item) => [item, ...item.children])
                  .find((item) => item.url === "#" + activeId)?.title ?? ""}
              </span>
            ) : null}
          </span>
          <Icon as={open ? CaretDown : CaretRight} size="sm" aria-hidden />
        </button>
        {open ? (
          <div id={instanceId} className="mt-3">
            <TocList items={items} activeId={activeId} />
          </div>
        ) : null}
      </nav>
    </div>
  );
}
