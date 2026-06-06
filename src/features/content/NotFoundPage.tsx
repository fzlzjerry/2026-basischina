import { Link } from "react-router-dom";
import { Cat } from "@phosphor-icons/react";
import { PageHead } from "@/shared/components/PageHead";
import { Icon } from "@/shared/components/Icon";
import { buttonClasses } from "@/shared/components/Button";
import { navbarPages, navLabelFor } from "@/config/navigation";

/**
 * 404 page (§11). Suggestions are derived from navbar pages — no second route
 * list. Marked noindex so search engines do not surface it.
 */
export function NotFoundPage() {
  return (
    <>
      <PageHead
        path="/404"
        title="Page not found"
        seo={{
          title: "Page not found — BASIS-China 2026 iGEM",
          description: "The requested page could not be found.",
          keywords: ["404", "not found"],
          robots: "noindex, follow",
        }}
      />
      <section className="mx-auto max-w-2xl bg-page px-4 py-24 text-center">
        <Icon
          as={Cat}
          size="lg"
          className="mx-auto mb-4 text-primary-deep"
          title="Lost cat"
        />
        <p className="text-6xl font-black text-error">404</p>
        <h1 className="mt-4 text-3xl font-bold text-ink">Page not found</h1>
        <p className="mt-3 text-ink-soft">
          The page you are looking for doesn&apos;t exist or has moved.
        </p>

        <nav aria-label="Suggested pages" className="mt-10">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-secondary">
            Try one of these
          </h2>
          <ul className="mt-4 flex flex-wrap justify-center gap-3">
            {navbarPages.map((page) => (
              <li key={page.path}>
                <Link
                  to={page.path}
                  className={buttonClasses("secondary", "sm")}
                >
                  {navLabelFor(page)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </section>
    </>
  );
}
