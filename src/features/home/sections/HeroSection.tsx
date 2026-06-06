import { Link } from "react-router-dom";
import { Cat, Dog, PawPrint, UsersThree } from "@phosphor-icons/react";
import { wikiEnv } from "@/config/env";
import { Icon } from "@/shared/components/Icon";
import { buttonClasses } from "@/shared/components/Button";

/**
 * Homepage hero (§20). Section-specific content/markup stays inside this file.
 */
export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-page to-surface">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-24 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div className="text-center lg:text-left">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary-deep">
            iGEM {wikiEnv.teamYear}
          </p>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-ink sm:text-6xl">
            {wikiEnv.teamName}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-ink-soft lg:mx-0">
            Engineering biology for a more sustainable world. Explore our
            project, research, and the team behind it.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4 lg:justify-start">
            <Link
              to="/description"
              className={buttonClasses("primary", "lg", "group")}
            >
              <Icon as={PawPrint} weight="fill" />
              <span>Explore the project</span>
              <Icon
                as={PawPrint}
                weight="fill"
                className="transition group-hover:translate-x-1"
              />
            </Link>
            <Link to="/team" className={buttonClasses("secondary", "lg")}>
              <Icon as={UsersThree} />
              <span>Meet the team</span>
            </Link>
          </div>
        </div>
        <div
          aria-hidden="true"
          className="relative hidden items-center justify-center lg:flex"
        >
          <Icon
            as={Cat}
            weight="duotone"
            className="h-44 w-44 text-app-peach -rotate-6"
          />
          <Icon
            as={Dog}
            weight="duotone"
            className="h-48 w-48 text-app-teal rotate-6"
          />
          <Icon
            as={PawPrint}
            weight="fill"
            className="absolute left-4 top-6 h-8 w-8 text-app-pink/70"
          />
          <Icon
            as={PawPrint}
            weight="fill"
            className="absolute bottom-8 right-6 h-10 w-10 text-app-blue/70"
          />
          <Icon
            as={PawPrint}
            weight="fill"
            className="absolute right-1/3 top-2 h-6 w-6 text-app-purple/60"
          />
        </div>
      </div>
    </section>
  );
}
