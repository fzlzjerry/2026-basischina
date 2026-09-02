import { useEffect, useMemo, useState } from "react";
import type { TocItem } from "./markdownService";

function flattenIds(items: TocItem[]): string[] {
  const ids: string[] = [];
  for (const item of items) {
    ids.push(item.url.replace(/^#/, ""));
    ids.push(...flattenIds(item.children));
  }
  return ids;
}

export function useActiveHeading(
  items: TocItem[],
  contentKey: string,
): string | undefined {
  const ids = useMemo(() => flattenIds(items), [items]);
  const [activeId, setActiveId] = useState<string>();

  useEffect(() => {
    if (typeof window === "undefined" || ids.length === 0) return;

    const headings = ids
      .map((id) => document.getElementById(id))
      .filter((heading): heading is HTMLElement => heading !== null);
    if (headings.length === 0) return;

    let frame: number | undefined;
    const update = () => {
      frame = undefined;
      const navHeight =
        document
          .querySelector<HTMLElement>('[data-site-chrome="navbar"]')
          ?.getBoundingClientRect().height ?? 72;
      const threshold = navHeight + 32;
      let next = headings[0].id;

      for (const heading of headings) {
        if (heading.getBoundingClientRect().top <= threshold) {
          next = heading.id;
        } else {
          break;
        }
      }

      const atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 8;
      if (atBottom) next = headings[headings.length - 1].id;

      setActiveId((current) => (current === next ? current : next));
    };
    const schedule = () => {
      if (frame === undefined) frame = window.requestAnimationFrame(update);
    };
    const onHashChange = () => {
      const hash = decodeURIComponent(window.location.hash.replace(/^#/, ""));
      if (ids.includes(hash)) setActiveId(hash);
    };

    update();
    onHashChange();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener("hashchange", onHashChange);

    return () => {
      if (frame !== undefined) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("hashchange", onHashChange);
    };
  }, [contentKey, ids]);

  return activeId;
}
