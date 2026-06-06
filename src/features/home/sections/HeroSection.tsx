import { Link } from "react-router-dom";
import { wikiEnv } from "@/config/env";

/**
 * Homepage hero (§20). Section-specific content/markup stays inside this file.
 */
export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50 to-white">
      <div className="mx-auto max-w-6xl px-4 py-24 text-center sm:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-emerald-600">
          iGEM {wikiEnv.teamYear}
        </p>
        <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-900 sm:text-6xl">
          {wikiEnv.teamName}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
          Engineering biology for a more sustainable world. Explore our project,
          research, and the team behind it.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            to="/description"
            className="rounded-md bg-emerald-600 px-6 py-3 font-medium text-white transition hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
          >
            Explore the project
          </Link>
          <Link
            to="/team"
            className="rounded-md border border-slate-300 px-6 py-3 font-medium text-slate-700 transition hover:border-emerald-500 hover:text-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
          >
            Meet the team
          </Link>
        </div>
      </div>
    </section>
  );
}
