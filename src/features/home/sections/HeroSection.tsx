import { useRef } from "react";
import { Link } from "react-router-dom";
import { Cat, Dog, PawPrint, UsersThree } from "@phosphor-icons/react";
import { wikiEnv } from "@/config/env";
import { Icon } from "@/shared/components/Icon";
import { buttonClasses } from "@/shared/components/Button";
import { useHeroCinema } from "../useHeroCinema";

/**
 * Homepage hero (§20). A clean, cozy, animal-forward first screen: warm
 * headline + the cat & dog front and centre. Motion is a restrained on-load
 * entrance (headline line-mask reveal + pets settle), gated for reduced motion.
 */
export function HeroSection() {
  const root = useRef<HTMLElement>(null);
  useHeroCinema(root);

  return (
    <section
      ref={root}
      className="relative overflow-hidden bg-gradient-to-b from-page to-surface"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-24 sm:px-6 lg:grid-cols-2 lg:px-8">
        {/* Text */}
        <div className="text-center lg:text-left">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary-deep">
            iGEM {wikiEnv.teamYear}
          </p>
          <h1 className="js-hero-h1 mt-4 text-4xl font-black leading-tight tracking-tight text-ink sm:text-6xl">
            {wikiEnv.teamName}
          </h1>
          <p className="js-hero-sub mx-auto mt-6 max-w-xl text-lg text-ink-soft lg:mx-0">
            Engineering biology for healthier, happier companions.
          </p>
          <div className="js-hero-cta mt-10 flex flex-wrap justify-center gap-4 lg:justify-start">
            <Link
              to="/description"
              className={buttonClasses("primary", "lg", "group")}
            >
              <Icon as={PawPrint} weight="fill" />
              <span>Explore the project</span>
            </Link>
            <Link to="/team" className={buttonClasses("secondary", "lg")}>
              <Icon as={UsersThree} />
              <span>Meet the team</span>
            </Link>
          </div>
        </div>

        {/* Art: the cat & dog, cozy, on a soft mat with a warm spotlight. */}
        <div
          className="relative flex items-center justify-center"
          aria-hidden="true"
        >
          <div
            className="absolute h-72 w-72 rounded-full"
            style={{
              background:
                "radial-gradient(closest-side, var(--color-primary-soft), transparent)",
            }}
          />
          <div className="js-hero-pets relative flex items-end justify-center gap-3">
            <Icon
              as={Cat}
              weight="duotone"
              className="h-40 w-40 text-app-peach"
            />
            <Icon
              as={Dog}
              weight="duotone"
              className="h-48 w-48 text-app-teal"
            />
            <div className="absolute -bottom-3 left-1/2 h-4 w-56 -translate-x-1/2 rounded-pill bg-surface-2 shadow-soft" />
          </div>
        </div>
      </div>
    </section>
  );
}
