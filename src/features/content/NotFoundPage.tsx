import { Link } from "react-router-dom";
import { PageHead } from "@/shared/components/PageHead";
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
        {/* A lost cat in the hero/mascot register: the perfect on-brand 404. */}
        <svg
          viewBox="0 0 240 200"
          role="img"
          aria-label="A lost cat looking around for its way home"
          className="mx-auto mb-6 w-44 sm:w-52"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="nf-cat" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#ec9b80" />
              <stop offset="1" stopColor="#e18c6f" />
            </linearGradient>
          </defs>
          <ellipse
            cx="120"
            cy="184"
            rx="58"
            ry="8"
            fill="#9c6a44"
            opacity="0.13"
          />
          <g
            stroke="#7a5230"
            strokeWidth="3.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          >
            <path
              d="M82 170 C 48 172 46 138 72 130 C 86 126 92 140 84 150"
              fill="url(#nf-cat)"
            />
            <path
              d="M120 96 C 86 96 74 134 80 162 C 84 180 156 180 160 162 C 166 134 154 96 120 96 Z"
              fill="url(#nf-cat)"
            />
            <ellipse cx="104" cy="174" rx="13" ry="9" fill="url(#nf-cat)" />
            <ellipse cx="136" cy="174" rx="13" ry="9" fill="url(#nf-cat)" />
          </g>
          <path
            d="M96 104 Q 120 116 144 104"
            stroke="#f3899a"
            strokeWidth="7"
            fill="none"
            strokeLinecap="round"
          />
          <circle
            cx="120"
            cy="112"
            r="7"
            fill="#f6c453"
            stroke="#7a5230"
            strokeWidth="2.5"
          />
          <path d="M120 108 v6" stroke="#7a5230" strokeWidth="1.5" />
          <g transform="rotate(-7 120 86)">
            <g
              stroke="#7a5230"
              strokeWidth="3.5"
              strokeLinejoin="round"
              strokeLinecap="round"
            >
              <path d="M92 54 L 82 22 L 116 44 Z" fill="url(#nf-cat)" />
              <path d="M148 54 L 158 22 L 124 44 Z" fill="url(#nf-cat)" />
              <circle cx="120" cy="80" r="40" fill="url(#nf-cat)" />
            </g>
            <path d="M96 50 L 90 30 L 112 44 Z" fill="#f4a9b8" />
            <path d="M144 50 L 150 30 L 128 44 Z" fill="#f4a9b8" />
            <circle cx="98" cy="90" r="6" fill="#f0967f" opacity="0.6" />
            <circle cx="142" cy="90" r="6" fill="#f0967f" opacity="0.6" />
            <ellipse cx="107" cy="80" rx="6.5" ry="9" fill="#43321f" />
            <ellipse cx="133" cy="80" rx="6.5" ry="9" fill="#43321f" />
            <circle cx="109.5" cy="76" r="2.6" fill="#fff" />
            <circle cx="135.5" cy="76" r="2.6" fill="#fff" />
            <path
              d="M120 96 C 116 91 110 91.5 110.5 87 C 111 83.5 116.5 83.5 120 88 C 123.5 83.5 129 83.5 129.5 87 C 130 91.5 124 91 120 96 Z"
              fill="#db6f6f"
            />
            <path
              d="M120 95 q -6 6 -12 2 M120 95 q 6 6 12 2"
              stroke="#7a5230"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M84 84 q -18 -2 -28 -7 M84 91 q -18 3 -28 3 M156 84 q 18 -2 28 -7 M156 91 q 18 3 28 3"
              stroke="#c2a087"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
            />
          </g>
        </svg>
        <p className="text-6xl font-black text-ink">404</p>
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
