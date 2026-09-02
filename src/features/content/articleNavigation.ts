import {
  pageData,
  type MarkdownPageData,
  type PageData,
} from "@/config/pageData";
import { navGroupLabels } from "@/config/navigation";

export type MarkdownPageItem = MarkdownPageData;

export interface ArticleNavigationModel {
  current: MarkdownPageItem;
  groupLabel: string;
  previous?: MarkdownPageItem;
  next?: MarkdownPageItem;
}

const allPages: readonly PageData[] = pageData;

function isMarkdownPage(page: PageData): page is MarkdownPageData {
  return page.kind === "markdown";
}

export function getArticleNavigation(
  currentPath: string,
): ArticleNavigationModel | null {
  const current = allPages.find(
    (page): page is MarkdownPageData =>
      isMarkdownPage(page) && page.path === currentPath,
  );
  if (!current) return null;

  const group = current.navGroup ?? current.category;
  const pages = allPages.filter(
    (page): page is MarkdownPageData =>
      isMarkdownPage(page) &&
      (page.navGroup ?? page.category) === group &&
      page.showInNavbar !== false,
  );
  const index = pages.findIndex((page) => page.path === current.path);

  return {
    current,
    groupLabel: navGroupLabels[group],
    previous: index > 0 ? pages[index - 1] : undefined,
    next: index >= 0 && index < pages.length - 1 ? pages[index + 1] : undefined,
  };
}
