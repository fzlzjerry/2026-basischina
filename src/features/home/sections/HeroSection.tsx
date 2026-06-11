import { useRef } from "react";
import { Link } from "react-router-dom";
import { PawPrint, UsersThree } from "@phosphor-icons/react";
import { wikiEnv } from "@/config/env";
import { Icon } from "@/shared/components/Icon";
import { buttonClasses } from "@/shared/components/Button";
import { HeroRoom } from "../scene/HeroRoom";
import { useHeroCinema } from "../useHeroCinema";

/**
 * Homepage hero (§20). Asymmetric, product-free and DNA-free: a big warm
 * headline + platform message on the left, the cat & dog in a cozy golden-hour
 * room on the right. The scene is edgeless (no card frame) so it melts into the
 * page's warm gradient. Motion is a restrained on-load entrance + quiet idle,
 * gated for reduced motion.
 */
export function HeroSection() {
  const root = useRef<HTMLElement>(null);
  useHeroCinema(root);

  return (
    <section
      ref={root}
      className="relative overflow-hidden"
      style={{
        background:
          "radial-gradient(1100px 560px at 18% -8%, #fff4e0 0%, rgba(255,244,224,0) 58%), linear-gradient(165deg, #fdf3e2 0%, #faedd8 52%, #f8f8f0 100%)",
      }}
    >
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:gap-8 lg:px-8 lg:py-24">
        {/* copy */}
        <div className="text-center lg:text-left">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary-deep">
            iGEM {wikiEnv.teamYear} · Synthetic biology
          </p>
          <h1 className="js-hero-h1 mt-5 text-4xl font-black leading-[1.05] tracking-tight text-ink sm:text-6xl">
            Healthier, <em className="text-[#c2562f]">happier</em> companions.
          </h1>
          <p className="js-hero-sub mx-auto mt-6 max-w-md text-lg text-ink-soft lg:mx-0">
            We use synthetic biology to make gentler, everyday care for the cats
            and dogs we love.
          </p>
          <div className="js-hero-cta mt-9 flex flex-wrap justify-center gap-4 lg:justify-start">
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

        {/* scene */}
        <div className="relative flex items-center justify-center">
          <HeroRoom className="js-hero-pets w-full max-w-xl" />
        </div>
      </div>
    </section>
  );
}
