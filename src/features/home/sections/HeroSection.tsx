import { useRef } from "react";
import { Link } from "react-router-dom";
import { PawPrint, UsersThree } from "@phosphor-icons/react";
import { Icon } from "@/shared/components/Icon";
import { SectionDivider } from "@/shared/components/SectionDivider";
import { WashiTape } from "@/shared/components/WashiTape";
import { ctaClasses, stickerStyleRaw } from "@/shared/styles/heal";
import { gsap, registerGsap, useGSAP } from "@/shared/motion/gsap";
import { HeroSketch } from "../scene/HeroDoodles";
import { CareSpot, EngineerSpot, UnderstandSpot } from "../scene/StepSpots";
import bannerUrl from "@/assets/brand/heal-banner.webp";

const CHAPTERS = [
  {
    number: "01",
    verb: "Understand",
    cue: "OBSERVE / LISTEN / LEARN",
    note: "Begin with the animal, not the answer.",
    tone: "understand",
    Spot: UnderstandSpot,
  },
  {
    number: "02",
    verb: "Engineer",
    cue: "DESIGN / TEST / REFINE",
    note: "Turn biology into something gentle.",
    tone: "engineer",
    Spot: EngineerSpot,
  },
  {
    number: "03",
    verb: "Care",
    cue: "MAKE / SHARE / LIVE",
    note: "Bring the science into everyday life.",
    tone: "care",
    Spot: CareSpot,
  },
] as const;

/**
 * Homepage hero. The first fold is a complete static project cover for no-JS
 * and reduced-motion visitors. With motion enabled, vertical scrolling holds
 * that cover below the navigation and opens a three-screen horizontal field
 * notebook: Understand, Engineer, Care.
 *
 * The cinematic layer never enlarges the HEAL banner beyond its authored
 * composition. It replaces the previous zoom-and-swash treatment with
 * full-viewport chapters, typographic scale, colour changes, and a long,
 * legible progress rail.
 */
export function HeroSection() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      registerGsap();
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const intro = gsap.timeline();

        intro
          .to(
            ".js-hero-shutter-left",
            {
              xPercent: -104,
              duration: 0.78,
              ease: "power4.inOut",
            },
            0,
          )
          .to(
            ".js-hero-shutter-right",
            {
              xPercent: 104,
              duration: 0.78,
              ease: "power4.inOut",
            },
            0,
          )
          .set(".js-hero-shutter", { autoAlpha: 0 })
          .fromTo(
            ".js-hero-tape",
            { autoAlpha: 0, scale: 0.9 },
            {
              autoAlpha: 1,
              scale: 1,
              duration: 0.38,
              ease: "power3.out",
              stagger: 0.08,
              clearProps: "transform",
            },
            0.34,
          )
          .fromTo(
            ".js-hero-note",
            { autoAlpha: 0 },
            { autoAlpha: 1, duration: 0.34, ease: "power2.out" },
            0.55,
          )
          .from(
            ".js-hero-arrow",
            {
              drawSVG: 0,
              duration: 0.42,
              stagger: 0.1,
              ease: "power2.inOut",
            },
            0.63,
          )
          .fromTo(
            ".js-hero-swash",
            { autoAlpha: 0 },
            { autoAlpha: 1, duration: 0.28, ease: "power2.out" },
            0.62,
          )
          .from(
            ".js-hero-swash-stroke",
            { drawSVG: 0, duration: 0.5, ease: "power2.inOut" },
            0.7,
          )
          .fromTo(
            ".js-hero-sketch",
            { autoAlpha: 0, scale: 0.94 },
            {
              autoAlpha: 1,
              scale: 1,
              duration: 0.42,
              ease: "power3.out",
              clearProps: "transform",
            },
            0.7,
          );

        const pinDistance = () =>
          Math.round(
            window.innerHeight * (window.innerWidth >= 768 ? 4.6 : 3.4),
          );
        const navHeight = () =>
          document.querySelector("header")?.getBoundingClientRect().height ??
          64;

        gsap.set(".js-hero-cinema", {
          autoAlpha: 0,
          clipPath: "inset(9% 7% round 2rem)",
        });
        gsap.set(".js-hero-progress", {
          scaleX: 0.025,
          transformOrigin: "left center",
        });
        gsap.set(".js-hero-counter-track", { yPercent: 0 });

        const scrollCinema = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: root.current,
            start: () => `top top+=${navHeight()}`,
            end: () => `+=${pinDistance()}`,
            pin: true,
            pinSpacing: true,
            anticipatePin: 1,
            scrub: 0.9,
            invalidateOnRefresh: true,
          },
        });

        scrollCinema
          // Fold the static cover away rather than zooming through it.
          .to(
            ".js-hero-copy, .js-hero-meta",
            { autoAlpha: 0, duration: 0.06 },
            0,
          )
          .to(
            ".js-hero-art",
            {
              scale: 0.62,
              rotation: -2,
              autoAlpha: 0,
              duration: 0.12,
              transformOrigin: "50% 50%",
              ease: "power3.in",
            },
            0,
          )
          .set(".js-hero-cinema", { visibility: "visible" }, 0.025)
          .to(
            ".js-hero-cinema",
            {
              autoAlpha: 1,
              clipPath: "inset(0% 0% round 0rem)",
              duration: 0.14,
              ease: "power4.inOut",
            },
            0.025,
          )
          // The rail covers the whole experience, so the length of the hijack
          // is visible from the first cinematic frame.
          .to(
            ".js-hero-progress",
            { scaleX: 1, duration: 0.9, ease: "none" },
            0.07,
          )
          // Chapter 01 settles before the horizontal camera begins to travel.
          .fromTo(
            ".js-hero-chapter-1 .js-hero-chapter-visual",
            { scale: 0.78, rotation: -8 },
            {
              scale: 1,
              rotation: -2,
              duration: 0.15,
              ease: "power3.out",
            },
            0.07,
          )
          .set(
            ".js-hero-chapter-1 .js-hero-chapter-word",
            { xPercent: 9 },
            0.065,
          )
          .to(
            ".js-hero-chapter-1 .js-hero-chapter-word",
            { xPercent: 0, duration: 0.16, ease: "power3.out" },
            0.07,
          )
          // Vertical input, horizontal story: 01 to 02.
          .to(
            ".js-hero-chapter-track",
            {
              xPercent: -33.3333,
              duration: 0.27,
              ease: "power3.inOut",
            },
            0.25,
          )
          .to(
            ".js-hero-counter-track",
            {
              yPercent: -33.3333,
              duration: 0.18,
              ease: "power3.inOut",
            },
            0.29,
          )
          .to(
            ".js-hero-chapter-1 .js-hero-chapter-visual",
            {
              scale: 0.72,
              rotation: 9,
              xPercent: -16,
              duration: 0.18,
              ease: "power2.in",
            },
            0.25,
          )
          .set(
            ".js-hero-chapter-2 .js-hero-chapter-visual",
            { scale: 0.7, rotation: -12, xPercent: 18 },
            0.29,
          )
          .to(
            ".js-hero-chapter-2 .js-hero-chapter-visual",
            {
              scale: 1,
              rotation: 2,
              xPercent: 0,
              duration: 0.22,
              ease: "power3.out",
            },
            0.33,
          )
          .set(
            ".js-hero-chapter-2 .js-hero-chapter-word",
            { xPercent: 12 },
            0.29,
          )
          .to(
            ".js-hero-chapter-2 .js-hero-chapter-word",
            { xPercent: -3, duration: 0.24, ease: "power2.out" },
            0.3,
          )
          // Chapter 02 to 03. The second move is deliberately not identical:
          // it accelerates later and lets the Care illustration lead the wipe.
          .to(
            ".js-hero-chapter-track",
            {
              xPercent: -66.6667,
              duration: 0.28,
              ease: "power4.inOut",
            },
            0.58,
          )
          .to(
            ".js-hero-counter-track",
            {
              yPercent: -66.6667,
              duration: 0.18,
              ease: "power3.inOut",
            },
            0.63,
          )
          .to(
            ".js-hero-chapter-2 .js-hero-chapter-visual",
            {
              scale: 0.74,
              rotation: -10,
              xPercent: -18,
              duration: 0.18,
              ease: "power2.in",
            },
            0.58,
          )
          .set(
            ".js-hero-chapter-3 .js-hero-chapter-visual",
            { scale: 0.68, rotation: 10, xPercent: 20 },
            0.61,
          )
          .to(
            ".js-hero-chapter-3 .js-hero-chapter-visual",
            {
              scale: 1.06,
              rotation: -2,
              xPercent: 0,
              duration: 0.24,
              ease: "power4.out",
            },
            0.65,
          )
          .set(
            ".js-hero-chapter-3 .js-hero-chapter-word",
            { xPercent: 13 },
            0.61,
          )
          .to(
            ".js-hero-chapter-3 .js-hero-chapter-word",
            { xPercent: -5, duration: 0.25, ease: "power3.out" },
            0.63,
          )
          // Hold the last composition long enough to read, then open the lower
          // edge to the real approach section in normal document flow.
          .to(
            ".js-hero-cinema-endline",
            {
              scaleX: 1,
              duration: 0.12,
              transformOrigin: "left center",
              ease: "power3.out",
            },
            0.85,
          )
          .to(
            ".js-hero-chapter-3 .js-hero-chapter-visual",
            {
              scale: 0.94,
              rotation: 0,
              duration: 0.12,
              ease: "power2.inOut",
            },
            0.88,
          );
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      className="relative flex min-h-[calc(100dvh-3.5rem)] flex-col overflow-hidden bg-page heal-grid"
    >
      <h1 className="sr-only">
        HEAL: healthier, happier companions, by BASIS-China
      </h1>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 hidden w-24 lg:block"
      >
        <div
          className="absolute inset-y-0 left-[4.5rem] w-[2px]"
          style={{ background: "#d98b86" }}
        />
        {["20%", "50%", "80%"].map((top) => (
          <span
            key={top}
            className="absolute left-6 h-6 w-6 -translate-y-1/2 rounded-full border border-border-soft"
            style={{
              top,
              background: "var(--color-surface-2)",
              boxShadow: "inset 0 2px 3px rgb(61 52 40 / 0.28)",
            }}
          />
        ))}
      </div>

      <div className="hero-layout relative mx-auto flex w-full max-w-[1360px] flex-1 flex-col justify-start px-4 pb-20 pt-14 sm:justify-center sm:px-6 sm:pt-10 lg:px-16 lg:pb-24">
        <div className="js-hero-meta mb-5 flex items-end justify-between gap-4 px-1 sm:mb-6 lg:px-8">
          <p className="font-hand text-base text-app-orange-ink sm:text-lg">
            BASIS-China · iGEM 2026
          </p>
          <p className="hidden max-w-sm text-right font-hand text-base text-primary-deep sm:block">
            Synthetic biology for everyday pet care
          </p>
        </div>

        <div className="relative isolate w-full">
          <div className="js-hero-art hero-art relative mx-auto w-full">
            <WashiTape className="js-hero-tape heal-paste-in -top-3 left-[18%] z-30 w-28 -rotate-3 sm:w-36" />
            <WashiTape
              tone="teal"
              className="js-hero-tape heal-paste-in -bottom-2 right-[14%] z-30 w-24 rotate-2 sm:w-32"
            />

            <div className="relative overflow-hidden">
              <img
                src={bannerUrl}
                alt=""
                width={1600}
                height={622}
                className="relative z-10 h-auto w-full"
                style={{
                  filter: "drop-shadow(6px 8px 0 rgb(47 36 23 / 0.18))",
                }}
              />

              <span
                aria-hidden="true"
                className="js-hero-shutter js-hero-shutter-left hero-shutter left-0 bg-app-orange-soft"
              />
              <span
                aria-hidden="true"
                className="js-hero-shutter js-hero-shutter-right hero-shutter right-0 bg-primary-soft"
              />
            </div>
          </div>
        </div>

        <div className="js-hero-copy mt-6 grid items-end gap-7 px-1 sm:mt-7 lg:grid-cols-[minmax(0,1fr)_auto] lg:px-8">
          <div className="max-w-3xl">
            <span className="relative inline-flex flex-col">
              <p
                aria-hidden="true"
                className="font-hand text-lg leading-none text-app-orange-ink sm:text-xl"
              >
                Healthier, happier companions
              </p>
              <svg
                aria-hidden="true"
                viewBox="0 0 260 12"
                preserveAspectRatio="none"
                className="js-hero-swash heal-paste-in mt-1 block h-2.5 w-full text-app-orange"
              >
                <path
                  className="js-hero-swash-stroke"
                  d="M4 8 C 46 5 88 10 132 7 C 176 4 218 9 256 6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <p className="mt-2 max-w-3xl text-balance text-[clamp(1.8rem,1.25rem+1.8vw,3.25rem)] font-bold leading-[1.02] tracking-[-0.025em] text-ink">
              Gentle, bio-made care for the cats and dogs we love.
            </p>
          </div>

          <div className="relative flex items-end justify-between gap-5 lg:justify-end">
            <div className="relative flex flex-wrap gap-3 sm:gap-4 lg:max-w-[28rem] lg:justify-end">
              <div
                aria-hidden="true"
                className="js-hero-note heal-paste-in pointer-events-none absolute -top-14 left-2 hidden -rotate-6 text-right xl:block"
              >
                <span className="font-hand text-lg text-ink-muted">
                  our project!
                </span>
                <svg
                  viewBox="0 0 96 72"
                  className="ml-auto h-11 w-20"
                  fill="none"
                  stroke="var(--color-ink-muted)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path className="js-hero-arrow" d="M6 6 C 40 8 78 22 88 60" />
                  <path className="js-hero-arrow" d="M70 54 L 89 63 L 84 43" />
                </svg>
              </div>
              <Link
                to="/description"
                className={ctaClasses("primary")}
                style={stickerStyleRaw(
                  "-1.2deg",
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
                  "1deg",
                  "11px 17px 10px 16px / 16px 9px 18px 11px",
                )}
              >
                <Icon as={UsersThree} />
                <span>Meet the team</span>
              </Link>
            </div>

            <div
              aria-hidden="true"
              className="js-hero-sketch heal-paste-in pointer-events-none absolute -bottom-32 right-1 block h-24 w-28 -rotate-3 sm:static sm:h-24 sm:w-28 xl:h-28 xl:w-36"
            >
              <HeroSketch />
            </div>
          </div>
        </div>
      </div>

      <div aria-hidden="true" className="js-hero-cinema hero-cinema-deck">
        <div className="hero-cinema-masthead">
          <span>HEAL / FIELD NOTES</span>
          <span>VERTICAL INPUT / HORIZONTAL STORY</span>
        </div>

        <div className="hero-chapter-viewport">
          <div className="js-hero-chapter-track hero-chapter-track">
            {CHAPTERS.map((chapter, index) => (
              <article
                key={chapter.verb}
                className={`js-hero-chapter-${index + 1} hero-chapter hero-chapter-${chapter.tone}`}
              >
                <span className="js-hero-chapter-word hero-chapter-word">
                  {chapter.verb}
                </span>
                <div className="hero-chapter-copy">
                  <span className="hero-chapter-kicker">{chapter.cue}</span>
                  <strong>{chapter.verb}</strong>
                  <p>{chapter.note}</p>
                </div>
                <div className="js-hero-chapter-visual hero-chapter-visual">
                  <chapter.Spot />
                </div>
                <span className="hero-chapter-index">{chapter.number}</span>
              </article>
            ))}
          </div>
        </div>

        <div className="hero-cinema-footer">
          <div className="hero-cinema-counter" aria-hidden="true">
            <span className="hero-cinema-counter-window">
              <span className="js-hero-counter-track hero-cinema-counter-track">
                <span>01</span>
                <span>02</span>
                <span>03</span>
              </span>
            </span>
            <span className="hero-cinema-counter-total">/ 03</span>
          </div>
          <span className="hero-cinema-progress-track">
            <span className="js-hero-progress hero-cinema-progress" />
          </span>
          <span className="hero-cinema-scroll-cue">KEEP SCROLLING</span>
        </div>

        <span className="js-hero-cinema-endline hero-cinema-endline" />
      </div>

      <SectionDivider
        fill="var(--color-primary-soft)"
        className="absolute inset-x-0 bottom-0 z-40"
      />
    </section>
  );
}
