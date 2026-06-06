import { Link } from "react-router-dom";
import { PageHead } from "@/shared/components/PageHead";
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
      <section className="mx-auto max-w-2xl px-4 py-24 text-center">
        <p className="text-6xl font-black text-emerald-600">404</p>
        <h1 className="mt-4 text-3xl font-bold text-slate-900">
          Page not found
        </h1>
        <p className="mt-3 text-slate-600">
          The page you are looking for doesn&apos;t exist or has moved.
        </p>

        <nav aria-label="Suggested pages" className="mt-10">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            Try one of these
          </h2>
          <ul className="mt-4 flex flex-wrap justify-center gap-3">
            {navbarPages.map((page) => (
              <li key={page.path}>
                <Link
                  to={page.path}
                  className="rounded-full border border-slate-200 px-4 py-1.5 text-sm text-slate-700 transition hover:border-emerald-500 hover:text-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
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
