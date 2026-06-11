import { useRef } from "react";
import { SectionDivider } from "@/shared/components/SectionDivider";
import { gsap, registerGsap, useGSAP } from "@/shared/motion/gsap";
import { HomeSectionHeader } from "../components/HomeSectionHeader";
import { UnderstandSpot, EngineerSpot, CareSpot } from "../scene/StepSpots";

/**
 * Approach section (§20). The platform story in three warm steps — understand
 * pets, engineer gentle biology, turn it into everyday care — placed on a zig
 * down the mint band, connected by a dotted paw trail on desktop. Spot
 * illustrations carry the rhythm; no boxed cards, no DNA, no product shot.
 *
 * The trail is a dashed path revealed through a MASK whose solid path is
 * DrawSVG-animated (DrawSVG can't animate dashed strokes directly); with
 * reduced motion or no JS the mask is fully drawn, so the prerendered trail is
 * always complete.
 */

interface Step {
  Spot: typeof UnderstandSpot;
  title: string;
  body: string;
  /** Zig offsets (lg only). */
  offset: string;
}

const STEPS: Step[] = [
  {
    Spot: UnderstandSpot,
    title: "Understand",
    body: "We learn what keeps cats and dogs healthy, comfortable, and happy at home.",
    offset: "lg:mt-0",
  },
  {
    Spot: EngineerSpot,
    title: "Engineer",
    body: "We use synthetic biology to design gentle, effective ingredients from friendly microbes.",
    offset: "lg:mt-24",
  },
  {
    Spot: CareSpot,
    title: "Care",
    body: "We turn them into everyday products our pets actually enjoy.",
    offset: "lg:mt-8",
  },
];

const TRAIL_D = "M 96 70 C 290 36 330 168 480 178 C 630 188 690 84 836 96";

/** Little paw stamps scattered along the trail. */
const STAMPS: { x: number; y: number; r: number }[] = [
  { x: 252, y: 92, r: 24 },
  { x: 558, y: 172, r: -12 },
  { x: 742, y: 110, r: 18 },
];

export function ApproachSection() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      registerGsap();
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".js-approach-reveal", {
          y: 28,
          opacity: 0,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.12,
          clearProps: "all",
          scrollTrigger: {
            trigger: root.current,
            start: "top 78%",
            once: true,
          },
        });
        gsap.from(".js-paw-trail", {
          drawSVG: 0,
          duration: 1.6,
          ease: "power2.inOut",
          scrollTrigger: {
            trigger: root.current,
            start: "top 70%",
            once: true,
          },
        });
        gsap.from(".js-paw-stamp", {
          scale: 0,
          opacity: 0,
          transformOrigin: "50% 50%",
          duration: 0.45,
          ease: "back.out(2)",
          stagger: 0.3,
          delay: 0.35,
          clearProps: "all",
          scrollTrigger: {
            trigger: root.current,
            start: "top 70%",
            once: true,
          },
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} className="bg-primary-soft">
      <div className="mx-auto max-w-5xl px-4 pt-20 sm:px-6 lg:px-8">
        <HomeSectionHeader
          className="js-approach-reveal"
          title="From biology to belly rubs."
          lede="How a synthetic-biology idea becomes gentle, everyday care for the animals we live with."
        />

        <div className="relative mt-12 pb-20 lg:mt-16">
          {/* dotted paw trail weaving through the steps (desktop) */}
          <svg
            aria-hidden="true"
            viewBox="0 0 960 240"
            className="pointer-events-none absolute inset-x-0 -top-8 hidden h-60 w-full lg:block"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <mask id="approach-trail-mask">
                <path
                  className="js-paw-trail"
                  d={TRAIL_D}
                  fill="none"
                  stroke="#fff"
                  strokeWidth="16"
                />
              </mask>
            </defs>
            <path
              d={TRAIL_D}
              fill="none"
              style={{ stroke: "var(--color-primary)" }}
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray="0.1 21"
              mask="url(#approach-trail-mask)"
            />
            {STAMPS.map((s) => (
              <g
                key={`${s.x}-${s.y}`}
                className="js-paw-stamp"
                transform={`translate(${s.x} ${s.y}) rotate(${s.r})`}
                style={{ fill: "var(--color-primary-deep)" }}
              >
                <ellipse cx="0" cy="6" rx="8" ry="6" />
                <circle cx="-9" cy="-3" r="3.4" />
                <circle cx="0" cy="-7" r="3.4" />
                <circle cx="9" cy="-3" r="3.4" />
              </g>
            ))}
          </svg>

          <ol className="relative grid grid-cols-1 gap-12 sm:grid-cols-3 sm:gap-8">
            {STEPS.map((step, i) => (
              <li
                key={step.title}
                className={`js-approach-reveal flex flex-col items-center text-center ${step.offset}`}
              >
                {i > 0 ? (
                  // Mobile-only dotted connector so the trail idea survives
                  // the stacked layout (the SVG trail is desktop-only).
                  <div
                    aria-hidden="true"
                    className="-mt-6 mb-6 h-12 border-l-4 border-dotted border-app-teal sm:hidden"
                  />
                ) : null}
                <span className="h-28 w-28">
                  <step.Spot />
                </span>
                <h3 className="mt-4 flex items-baseline gap-2 font-display text-2xl font-black text-ink">
                  <span className="text-base font-bold text-primary-deep">
                    {i + 1}
                  </span>
                  {step.title}
                </h3>
                <p className="mt-2 max-w-[34ch] text-ink-soft">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
      <SectionDivider fill="var(--color-page)" flip />
    </section>
  );
}
