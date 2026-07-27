import { useRef } from "react";
import { Link } from "react-router-dom";
import { PawPrint, UsersThree } from "@phosphor-icons/react";
import { Icon } from "@/shared/components/Icon";
import { ctaClasses, stickerStyleRaw } from "@/shared/styles/heal";
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
          "linear-gradient(180deg, var(--color-sunset-sky) 0%, var(--color-sunset) 62%, var(--color-sunset-deep) 100%)",
      }}
    >
      {/* Notebook grid over the sunset gradient (multiply), so this band sits
          on the same graph paper as every other section; the scene and copy
          are positioned above it, pasted onto the page. */}
      <div
        aria-hidden="true"
        className="heal-grid pointer-events-none absolute inset-0 mix-blend-multiply"
      />
      <div className="relative mx-auto max-w-3xl px-4 pt-20 text-center sm:px-6 sm:pt-24">
        <h2 className="js-closing pb-1 font-script text-[clamp(2.8rem,1.8rem+3.2vw,4.5rem)] font-bold leading-[1.04] text-ink">
          {"Come hang out with\u00A0us."}
        </h2>
        <p className="js-closing mx-auto mt-5 max-w-xl text-lg text-ink-soft">
          We are a team of students engineering biology for the animals we love.
          Have a look around the project, or come say hello.
        </p>
        <div className="js-closing mt-9 flex flex-wrap justify-center gap-4">
          <Link
            to="/description"
            className={ctaClasses("primary")}
            style={stickerStyleRaw(
              "-1deg",
              "16px 11px 18px 9px / 10px 17px 10px 16px",
            )}
          >
            <Icon as={PawPrint} weight="fill" />
            <span>Explore the project</span>
          </Link>
          <Link
            to="/team"
            className={ctaClasses("secondary")}
            style={stickerStyleRaw(
              "1.2deg",
              "11px 17px 10px 16px / 16px 9px 18px 11px",
            )}
          >
            <Icon as={UsersThree} />
            <span>Meet the team</span>
          </Link>
        </div>
      </div>

      <SunsetDuo className="js-closing relative mt-6 block h-56 w-full object-cover sm:h-72 lg:h-auto lg:object-contain" />
    </section>
  );
}
