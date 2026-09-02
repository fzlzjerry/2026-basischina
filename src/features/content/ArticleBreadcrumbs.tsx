import { CaretRight, House } from "@phosphor-icons/react";
import { Link } from "react-router-dom";
import { Icon } from "@/shared/components/Icon";
import { getArticleNavigation } from "./articleNavigation";

interface ArticleBreadcrumbsProps {
  path: string;
}

export function ArticleBreadcrumbs({ path }: ArticleBreadcrumbsProps) {
  const navigation = getArticleNavigation(path);
  if (!navigation) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className="mb-6 text-sm text-ink-soft"
      data-print-hide
    >
      <ol className="flex flex-wrap items-center gap-1.5">
        <li>
          <Link
            to="/"
            className="inline-flex min-h-11 items-center gap-1.5 rounded-[10px] px-2 hover:bg-app-orange-soft hover:text-sticker-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
          >
            <Icon as={House} size="xs" weight="duotone" />
            Home
          </Link>
        </li>
        <li aria-hidden="true" className="text-ink-muted">
          <Icon as={CaretRight} size="xs" />
        </li>
        <li>
          <span className="inline-flex min-h-11 items-center px-2">
            {navigation.groupLabel}
          </span>
        </li>
        <li aria-hidden="true" className="text-ink-muted">
          <Icon as={CaretRight} size="xs" />
        </li>
        <li>
          <span
            aria-current="page"
            className="inline-flex min-h-11 items-center px-2 font-bold text-ink"
          >
            {navigation.current.title}
          </span>
        </li>
      </ol>
    </nav>
  );
}
