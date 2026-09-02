import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { Link } from "react-router-dom";
import { Icon } from "@/shared/components/Icon";
import { getArticleNavigation } from "./articleNavigation";

interface ArticlePagerProps {
  path: string;
}

export function ArticlePager({ path }: ArticlePagerProps) {
  const navigation = getArticleNavigation(path);
  if (!navigation || (!navigation.previous && !navigation.next)) return null;

  return (
    <nav
      aria-label="More in this section"
      className="mt-12 grid gap-4 border-t-2 border-border-soft pt-8 sm:grid-cols-2"
      data-print-hide
    >
      {navigation.previous ? (
        <Link
          to={navigation.previous.path}
          className="heal-cutout group flex min-h-24 items-center gap-3 bg-app-orange-soft p-5 text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
        >
          <Icon as={CaretLeft} weight="bold" className="text-primary-deep" />
          <span>
            <span className="block font-hand text-sm text-ink-soft">
              Previous in {navigation.groupLabel}
            </span>
            <span className="mt-1 block font-bold">
              {navigation.previous.title}
            </span>
          </span>
        </Link>
      ) : (
        <span aria-hidden="true" />
      )}
      {navigation.next ? (
        <Link
          to={navigation.next.path}
          className="heal-cutout group flex min-h-24 items-center justify-end gap-3 bg-primary-soft p-5 text-right text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
        >
          <span>
            <span className="block font-hand text-sm text-ink-soft">
              Next in {navigation.groupLabel}
            </span>
            <span className="mt-1 block font-bold">
              {navigation.next.title}
            </span>
          </span>
          <Icon as={CaretRight} weight="bold" className="text-primary-deep" />
        </Link>
      ) : null}
    </nav>
  );
}
