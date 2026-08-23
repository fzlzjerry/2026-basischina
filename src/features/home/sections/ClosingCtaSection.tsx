import { useRef } from "react";
import { PawPrint, UsersThree } from "@phosphor-icons/react";
import { Icon } from "@/shared/components/Icon";
import { InkLink } from "@/shared/drawably/InkLink";
import { inkCtaClasses } from "@/shared/styles/heal";
import {
  gsap,
  registerGsap,
  scrollFadeIn,
  useGSAP,
} from "@/shared/motion/gsap";
import { SunsetDuo } from "../scene/SunsetDuo";

/**
 * Closing band (§20): a drenched sunset send-off — the duo sits on a hill
 * watching the sun go down, bookending the golden-hour hero. CTA labels match
 * the hero (one label per intent). Text only sits on the upper, text-safe
 * gradient stops; the deep gold is decoration. The raster scene fades in as
 * one authored illustration under reduced-motion-aware orchestration.
 */
export function ClosingCtaSection() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      registerGsap();
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Content fades in place: h2, lede, CTA cluster, then the duo. The
        // CTAs ride their parent cluster's fade — nothing translates, so the
        // pills' resting --rot tilt + hover lift are never touched.
        scrollFadeIn(".js-closing", {
          trigger: root.current,
          stagger: 0.12,
        });

        // The final illustration rises slowly into its authored resting frame
        // while the grid drifts in the opposite direction. Both movements are
        // tied to scroll and stop completely under reduced motion.
        gsap.set(".js-closing-scene", {
          scale: 1.08,
          yPercent: 7,
          transformOrigin: "50% 100%",
        });
        gsap.set(".js-closing-grid", { yPercent: -4 });
        gsap.to(".js-closing-scene", {
          scale: 1,
          yPercent: 0,
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top bottom",
            end: "bottom bottom",
            scrub: 0.8,
          },
        });
        gsap.to(".js-closing-grid", {
          yPercent: 4,
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.8,
          },
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      // The negative bottom margin pulls the footer's scalloped edge up OVER
      // this band's hills, so the brown bites straight into the sunset with
      // no page-cream stripe between them.
      className="relative -mb-10 overflow-hidden sm:-mb-14"
      style={{
        background:
          "linear-gradient(180deg, var(--color-sunset-sky) 0%, var(--color-sunset-sky) 42%, var(--color-sunset) 72%, var(--color-sunset-deep) 100%)",
      }}
    >
      {/* Notebook grid over the sunset gradient (multiply), so this band sits
          on the same graph paper as every other section; the scene and copy
          are positioned above it, pasted onto the page. */}
      <div
        aria-hidden="true"
        className="js-closing-grid heal-grid pointer-events-none absolute -inset-y-12 inset-x-0 mix-blend-multiply"
      />
      <div className="relative mx-auto max-w-3xl px-4 pb-6 pt-24 text-center sm:px-6 sm:pt-28">
        <h2 className="js-closing pb-1 font-script text-[clamp(2.8rem,1.8rem+3.2vw,4.5rem)] font-bold leading-[1.04] text-ink">
          {"Come hang out with\u00A0us."}
        </h2>
        <p className="js-closing mx-auto mt-5 max-w-xl text-lg text-ink-soft">
          We are a team of students engineering biology for the animals we love.
          Have a look around the project, or come say hello.
        </p>
        <div className="js-closing mt-9 flex flex-wrap justify-center gap-4">
          <InkLink
            to="/description"
            seed={55}
            sketchVariant="scribble"
            roughness={1.4}
            className={inkCtaClasses()}
          >
            <Icon as={PawPrint} weight="fill" />
            <span>Explore the project</span>
          </InkLink>
          <InkLink
            to="/team"
            seed={68}
            sketchVariant="outline"
            roughness={1.35}
            className={inkCtaClasses()}
          >
            <Icon as={UsersThree} />
            <span>Meet the team</span>
          </InkLink>
        </div>
      </div>

      <SunsetDuo className="js-closing js-closing-scene relative z-10 mt-6 block h-56 w-full object-cover sm:h-72 lg:h-auto lg:object-contain" />
    </section>
  );
}
