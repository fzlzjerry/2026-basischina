import { useRef } from "react";
import { Link } from "react-router-dom";
import { Cat, Dog, PawPrint, UsersThree } from "@phosphor-icons/react";
import { wikiEnv } from "@/config/env";
import { Icon } from "@/shared/components/Icon";
import { buttonClasses } from "@/shared/components/Button";
import { gsap, registerGsap, useGSAP } from "@/shared/motion/gsap";

/**
 * Homepage hero (§20). Section-specific content/markup stays inside this file.
 *
 * Motion: this block is above the fold, so the entrance is transform-only
 * (opacity stays 1). The prerendered HTML paints at the natural end state, so a
 * slow cold load never flashes hidden content. The continuous pet float and the
 * entrance are gated behind `prefers-reduced-motion: no-preference`.
 */
export function HeroSection() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      registerGsap();
      // Resting tilt for the pets — instant, so it also applies for reduced
      // motion (GSAP fully owns their transform; no Tailwind rotate utilities).
      gsap.set(".js-hero-cat", { rotation: -6 });
      gsap.set(".js-hero-dog", { rotation: 6 });

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        tl.from(".js-hero-text > *", {
          y: 22,
          duration: 0.7,
          stagger: 0.1,
          clearProps: "transform",
        })
          .from(
            ".js-hero-art",
            {
              y: 18,
              scale: 0.92,
              duration: 0.8,
              ease: "power4.out",
              clearProps: "transform",
            },
            "-=0.35",
          )
          // No clearProps: the continuous float (below) owns the paw transform,
          // and the paws have no hover state to restore.
          .from(
            ".js-hero-paw",
            { scale: 0, duration: 0.5, stagger: 0.08 },
            "-=0.4",
          );

        // Gentle, low-amplitude continuous life. Starts after the entrance.
        gsap.to(".js-hero-cat", {
          y: -9,
          rotation: -10,
          duration: 3,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          delay: 0.9,
        });
        gsap.to(".js-hero-dog", {
          y: 9,
          rotation: 10,
          duration: 3.4,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          delay: 1,
        });
        gsap.to(".js-hero-paw", {
          y: -7,
          duration: 2.6,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          stagger: 0.25,
          delay: 1,
        });
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      className="relative overflow-hidden bg-gradient-to-b from-page to-surface"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-24 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div className="js-hero-text text-center lg:text-left">
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
          className="js-hero-art relative hidden items-center justify-center lg:flex"
        >
          <Icon
            as={Cat}
            weight="duotone"
            className="js-hero-cat h-44 w-44 text-app-peach"
          />
          <Icon
            as={Dog}
            weight="duotone"
            className="js-hero-dog h-48 w-48 text-app-teal"
          />
          <Icon
            as={PawPrint}
            weight="fill"
            className="js-hero-paw absolute left-4 top-6 h-8 w-8 text-app-pink/70"
          />
          <Icon
            as={PawPrint}
            weight="fill"
            className="js-hero-paw absolute bottom-8 right-6 h-10 w-10 text-app-blue/70"
          />
          <Icon
            as={PawPrint}
            weight="fill"
            className="js-hero-paw absolute right-1/3 top-2 h-6 w-6 text-app-purple/60"
          />
        </div>
      </div>
    </section>
  );
}
