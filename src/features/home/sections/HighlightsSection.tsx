import { Link } from "react-router-dom";

interface Highlight {
  title: string;
  description: string;
  to: string;
  cta: string;
}

const highlights: Highlight[] = [
  {
    title: "The project",
    description:
      "Why we chose our challenge, the science behind our solution, and where we are headed.",
    to: "/description",
    cta: "Read the description",
  },
  {
    title: "The team",
    description:
      "The students, instructors, and advisors who made this season possible.",
    to: "/team",
    cta: "Meet the team",
  },
];

/**
 * Homepage highlights (§20). Section content is local to this file.
 */
export function HighlightsSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
      <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900">
        Start exploring
      </h2>
      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        {highlights.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="group rounded-2xl border border-slate-200 p-8 transition hover:border-emerald-400 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
          >
            <h3 className="text-xl font-semibold text-slate-900">
              {item.title}
            </h3>
            <p className="mt-3 text-slate-600">{item.description}</p>
            <span className="mt-4 inline-block font-medium text-emerald-700 group-hover:underline">
              {item.cta} →
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
