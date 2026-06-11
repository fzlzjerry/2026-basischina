import { useRef } from "react";
import { Link } from "react-router-dom";
import { PawPrint, UsersThree } from "@phosphor-icons/react";
import { wikiEnv } from "@/config/env";
import { Icon } from "@/shared/components/Icon";
import { buttonClasses } from "@/shared/components/Button";
import { SectionDivider } from "@/shared/components/SectionDivider";
import { HeroRoom } from "../scene/HeroRoom";
import { useHeroCinema } from "../useHeroCinema";

/**
 * Homepage hero (§20). The whole section IS the room: the warm gradient is the
 * wall, a CSS band is the floor (full-bleed on lg, scene-local on mobile), and
 * the SVG scene (window + big pets + props) anchors to the bottom-right so the
 * room bleeds off the right edge of the viewport. Copy sits left in the normal
 * content column. Product-free and DNA-free. Motion is a restrained on-load
 * entrance + quiet idle + pupil tracking, gated for reduced motion. No pin.
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
          "radial-gradient(1100px 560px at 22% -8%, #fff3d9 0%, rgba(255,243,217,0) 60%), linear-gradient(168deg, #fcefd4 0%, #f8e6c4 55%, #f6ecd8 100%)",
      }}
    >
      {/* full-bleed floor band (lg): the room's architecture runs under the copy too */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 hidden lg:block"
        style={{
          height: "18%",
          background: "var(--color-room-floor)",
          borderTop: "6px solid var(--color-room-floor-deep)",
        }}
      />

      {/* copy */}
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="pt-14 text-center sm:pt-16 lg:flex lg:min-h-[660px] lg:max-w-[33rem] lg:flex-col lg:justify-center lg:py-16 lg:text-left">
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-primary-deep sm:text-sm sm:tracking-[0.16em]">
            iGEM {wikiEnv.teamYear} · Synthetic biology
          </p>
          <h1 className="js-hero-h1 mt-5 font-display text-[clamp(2.55rem,1.3rem+4.6vw,5.25rem)] font-black leading-[1.04] tracking-tight text-ink">
            Healthier,{" "}
            <em className="relative inline-block not-italic text-app-peach-ink">
              happier
              <svg
                aria-hidden="true"
                viewBox="0 0 120 12"
                preserveAspectRatio="none"
                className="absolute -bottom-[0.06em] left-0 h-[0.18em] w-full"
              >
                <path
                  d="M2 8 Q 14 2 26 7 T 50 7 T 74 7 T 98 7 T 118 5"
                  fill="none"
                  style={{ stroke: "var(--color-app-peach)" }}
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
            </em>{" "}
            companions.
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
      </div>

      {/* scene: in flow on mobile, glued to the section's bottom-right on lg.
          Mobile bottom padding keeps the pets' feet clear of the wave divider
          that overlays the section bottom. */}
      <div className="relative mx-auto mt-6 w-full max-w-xl px-4 pb-12 sm:px-0 lg:absolute lg:inset-y-0 lg:right-0 lg:mt-0 lg:w-[50vw] lg:max-w-none lg:px-0 lg:pb-0">
        {/* scene-local floor band (mobile only; lg uses the section band above) */}
        <div
          aria-hidden="true"
          className="absolute bottom-0 left-[-50vw] right-[-50vw] lg:hidden"
          style={{
            height: "18%",
            background: "var(--color-room-floor)",
            borderTop: "5px solid var(--color-room-floor-deep)",
          }}
        />
        <HeroRoom className="js-hero-pets relative block h-auto w-full lg:absolute lg:inset-0 lg:h-full" />
      </div>

      <SectionDivider
        fill="var(--color-primary-soft)"
        className="absolute inset-x-0 bottom-0 z-20"
      />
    </section>
  );
}
