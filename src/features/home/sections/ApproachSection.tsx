import { useRef } from "react";
import {
  drawIn,
  gsap,
  inViewAtInit,
  registerGsap,
  useGSAP,
} from "@/shared/motion/gsap";
import { HomeSectionHeader } from "../components/HomeSectionHeader";
import { UnderstandSpot, EngineerSpot, CareSpot } from "../scene/StepSpots";

/**
 * Compact three-spot row: the only telling of Understand / Engineer / Care.
 * No numbered badges, no cinema restatement. The paw trail is decorative.
 */

interface Step {
  Spot: typeof UnderstandSpot;
  title: string;
  body: string;
}

const STEPS: Step[] = [
  {
    Spot: UnderstandSpot,
    title: "Understand",
    body: "We learn what keeps cats and dogs healthy, comfortable, and happy at home.",
  },
  {
    Spot: EngineerSpot,
    title: "Engineer",
    body: "We use synthetic biology to design gentle, effective ingredients from friendly microbes.",
  },
  {
    Spot: CareSpot,
    title: "Care",
    body: "We turn them into everyday products our pets actually enjoy.",
  },
];

const TRAIL_D = "M 96 70 C 290 36 330 168 480 178 C 630 188 690 84 836 96";

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
        drawIn(".js-swash", {
          trigger: root.current,
          start: "top 78%",
          delay: 0.2,
        });
        if (!inViewAtInit(root.current)) {
          gsap.fromTo(
            ".js-paw-trail",
            { drawSVG: 0 },
            {
              drawSVG: "100%",
              ease: "none",
              scrollTrigger: {
                trigger: root.current,
                start: "top 82%",
                end: "bottom 48%",
                scrub: 0.55,
              },
            },
          );
        }
        if (!inViewAtInit(root.current)) {
          gsap.from(".js-paw-stamp", {
            scale: 0.6,
            opacity: 0,
            transformOrigin: "50% 50%",
            duration: 0.45,
            ease: "power2.out",
            stagger: 0.3,
            delay: 0.35,
            scrollTrigger: {
              trigger: root.current,
              start: "top 70%",
              once: true,
            },
          });
        }
        gsap.utils
          .toArray<HTMLElement>(".js-approach-spot")
          .forEach((spot, index) => {
            gsap.fromTo(
              spot,
              {
                scale: 0.82,
                rotation: index % 2 === 0 ? -7 : 7,
              },
              {
                scale: 1,
                rotation: 0,
                ease: "none",
                scrollTrigger: {
                  trigger: spot,
                  start: "top 92%",
                  end: "top 48%",
                  scrub: 0.65,
                },
              },
            );
          });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} className="bg-primary-soft heal-grid">
      <div className="mx-auto max-w-5xl px-4 pt-16 sm:px-6 sm:pt-20 lg:px-8">
        <HomeSectionHeader
          title="From biology to belly rubs."
          lede="How a synthetic-biology idea becomes gentle, everyday care for the animals we live with."
        />

        <div className="relative mt-10 pb-12 lg:mt-14">
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

          <ol className="relative grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-8">
            {STEPS.map((step, i) => (
              <li
                key={step.title}
                className="flex flex-col items-center text-center"
              >
                {i > 0 ? (
                  <svg
                    aria-hidden="true"
                    className="-mt-4 mb-4 h-10 w-2 text-app-teal sm:hidden"
                    viewBox="0 0 8 48"
                    fill="none"
                  >
                    <path
                      d="M4 1 V47"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeDasharray="1 8"
                    />
                  </svg>
                ) : null}
                <span className="js-approach-spot h-24 w-24 sm:h-28 sm:w-28">
                  <step.Spot />
                </span>
                <h3 className="mt-4 font-hand text-2xl leading-none text-ink">
                  {step.title}
                </h3>
                <p className="mt-2 max-w-[34ch] text-balance text-ink-soft">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
