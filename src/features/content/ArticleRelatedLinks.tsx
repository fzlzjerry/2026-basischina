import { LinkSimple } from "@phosphor-icons/react";
import { Link } from "react-router-dom";
import { pageData } from "@/config/pageData";
import { Icon } from "@/shared/components/Icon";

interface ArticleRelatedLinksProps {
  paths?: string[];
}

export function ArticleRelatedLinks({ paths }: ArticleRelatedLinksProps) {
  if (!paths || paths.length === 0) return null;

  const links = paths.flatMap((target) => {
    const pagePath = target.split("#", 1)[0] || "/";
    const page = pageData.find((candidate) => candidate.path === pagePath);
    return page ? [{ target, title: page.title }] : [];
  });
  if (links.length === 0) return null;

  return (
    <nav
      aria-label="Related evidence"
      className="mt-10 rounded-[16px] border-2 border-border-soft bg-surface p-5"
      data-print-hide
    >
      <h2 className="font-hand text-xl text-ink">Related evidence</h2>
      <ul className="mt-3 flex flex-wrap gap-2">
        {links.map((link) => (
          <li key={link.target}>
            <Link
              to={link.target}
              className="inline-flex min-h-11 items-center gap-2 rounded-pill bg-primary-soft px-3 py-2 text-sm font-bold text-sticker-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
            >
              <Icon as={LinkSimple} size="xs" />
              {link.title}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
