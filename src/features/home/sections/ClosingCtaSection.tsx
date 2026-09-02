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
 * Closing band: a drenched sunset send-off. The duo sits on a hill; the
 * drawing carries the warmth — no notebook grid printed over the sky.
 */
export function ClosingCtaSection() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      registerGsap();
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        scrollFadeIn(".js-closing", {
          trigger: root.current,
          stagger: 0.12,
        });
        gsap.set(".js-closing-scene", {
          scale: 1.08,
          yPercent: 7,
          transformOrigin: "50% 100%",
        });
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
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      className="relative -mb-10 overflow-hidden sm:-mb-14"
      style={{
        background:
          "linear-gradient(180deg, var(--color-sunset-sky) 0%, var(--color-sunset-sky) 42%, var(--color-sunset) 72%, var(--color-sunset-deep) 100%)",
      }}
    >
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
