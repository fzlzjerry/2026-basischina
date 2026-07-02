import { useRef } from "react";
import { SectionDivider } from "@/shared/components/SectionDivider";
import { stickerStyle } from "@/shared/styles/heal";
import {
  gsap,
  ScrollTrigger,
  registerGsap,
  useGSAP,
} from "@/shared/motion/gsap";
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
        // Calm rise (text register): headers + step copy lift together.
        gsap.from(".js-approach-reveal", {
          y: 28,
          opacity: 0,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.12,
          clearProps: "transform",
          scrollTrigger: {
            trigger: root.current,
            start: "top 78%",
            once: true,
          },
        });
        // The header's marker swash draws itself a beat after the header lands
        // (hand register: strokes draw by length, they don't fade).
        gsap.from(".js-swash", {
          drawSVG: 0,
          duration: 0.55,
          ease: "power2.inOut",
          delay: 0.35,
          scrollTrigger: {
            trigger: root.current,
            start: "top 78%",
            once: true,
          },
        });
        // The numbered 1·2·3 badges rise in a beat after their steps — calm,
        // no scale, no overshoot. clearProps restores each badge's CSS tilt.
        gsap.from(".js-step-badge", {
          y: 10,
          opacity: 0,
          duration: 0.45,
          ease: "power3.out",
          stagger: 0.18,
          delay: 0.25,
          clearProps: "transform",
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
        // NO clearProps: the stamps are SVG <g>s placed via the transform
        // ATTRIBUTE with an inline-style fill — GSAP's clearProps on SVG
        // removes the transform attribute and wipes style.cssText, collapsing
        // them into an unstyled pile. A from-tween ends at the authored state.
        // Scale-in stays BELOW 100% the whole way (no overshoot anywhere).
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

        // The sleeping cat in step 3 breathes: the one quiet idle beat in this
        // section. Paused unless the section is on screen; reduced motion skips it.
        const idle = gsap.timeline({ paused: true });
        idle.to(".js-nap-cat", {
          scaleY: 1.04,
          scaleX: 1.015,
          transformOrigin: "50% 100%",
          duration: 3.4,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });
        const idleVis = ScrollTrigger.create({
          trigger: root.current,
          start: "top bottom",
          end: "bottom top",
          onToggle: (self) => (self.isActive ? idle.play() : idle.pause()),
        });

        return () => {
          idle.kill();
          idleVis.kill();
        };
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} className="bg-primary-soft heal-grid">
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
                <span
                  className="js-step-badge heal-sticker mt-4 inline-flex h-9 w-9 items-center justify-center bg-app-orange font-hand text-lg leading-none text-sticker-ink"
                  style={stickerStyle(i)}
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
                <h3 className="mt-3 font-hand text-2xl leading-none text-ink">
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
