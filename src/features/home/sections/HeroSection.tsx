import { useRef } from "react";
import { Link } from "react-router-dom";
import { PawPrint, UsersThree } from "@phosphor-icons/react";
import { Icon } from "@/shared/components/Icon";
import { SectionDivider } from "@/shared/components/SectionDivider";
import { WashiTape } from "@/shared/components/WashiTape";
import { ctaClasses, stickerStyleRaw } from "@/shared/styles/heal";
import {
  gsap,
  ScrollTrigger,
  registerGsap,
  useGSAP,
} from "@/shared/motion/gsap";
import { HeroSketch } from "../scene/HeroDoodles";
import bannerUrl from "@/assets/brand/heal-banner.webp";

/**
 * Homepage hero (§20), HEAL register. The hand-drawn HEAL banner is the main
 * visual, pasted onto an open lab-notebook page: a punched binding margin runs
 * down the left, a strip of washi tape holds the banner, a handwritten note
 * points at it, and a small hand-drawn lab sketch (bubbling flask beside a paw)
 * sits annotated in the lower-right corner. Below the banner sit the value-prop
 * tagline and the two sticker CTAs. The section always fills the first screen
 * (dynamic viewport minus the sticky nav). An sr-only h1 carries the page title
 * so the decorative banner stays out of the accessibility tree; margin / tape /
 * note / swash / sketch are all aria-hidden.
 *
 * Motion (§20): CONTENT NEVER MOVES. The banner, tagline, and CTAs paint
 * static in the prerendered HTML and are never animation targets — a hard
 * refresh shows zero displacement (on first load the static HTML paints long
 * before hydration, so any client-set from-state would visibly jump). The only
 * entrance is the aria-hidden annotation layer "pasting in" — the notebook page
 * annotating itself: the tape presses on, the note fades in, the arrow and the
 * marker swash under the motto draw themselves, the corner sketch pastes on and
 * its caption underline draws. Every hidden start state is markup-baked via
 * `.heal-paste-in` (html.js + no-preference media query in main.css), so
 * hydration never hides something already painted. Afterwards the hero keeps one
 * quiet life beat — the flask's culture bubbles bob (a `.to()` idle, paused when
 * the hero scrolls off-screen). All of it is gated behind prefers-reduced-motion
 * and reverted on unmount; reduced-motion / no-JS visitors get the complete,
 * still page from the first frame.
 */
export function HeroSection() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      registerGsap();
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Paste-up entrance, annotation layer only (~1.3s) — the notebook page
        // annotating itself. fromTo (not from) on the pasted nodes: the hidden
        // start state already lives in CSS (.heal-paste-in), so each tween
        // declares both ends explicitly and finishes with inline autoAlpha:1,
        // which out-cascades the CSS hide. NEVER clearProps opacity/visibility
        // on these nodes or the hide returns — clearProps transform only.
        const tl = gsap.timeline();
        // Washi tape presses on — fade + sub-100% scale settle, no overshoot.
        tl.fromTo(
          ".js-hero-tape",
          { autoAlpha: 0, scale: 0.92 },
          {
            autoAlpha: 1,
            scale: 1,
            duration: 0.35,
            ease: "power3.out",
            clearProps: "transform",
          },
          0,
        )
          // Handwritten note fades in place (desktop-only node; on mobile it
          // is display:none and this is a harmless no-op).
          .fromTo(
            ".js-hero-note",
            { autoAlpha: 0 },
            { autoAlpha: 1, duration: 0.35, ease: "power2.out" },
            0.25,
          )
          // The arrow draws itself: curve first, then the head. drawSVG's
          // hidden start applies at tween creation, under cover of the note
          // container's markup-baked hide.
          .from(
            ".js-hero-arrow",
            { drawSVG: 0, duration: 0.4, stagger: 0.12, ease: "power2.inOut" },
            0.4,
          )
          // The motto's marker swash: the <svg> reveals (autoAlpha, uncovering
          // its markup-baked hide) and its stroke draws by length. Shown at all
          // breakpoints — the hero's one hand-drawn beat that reaches mobile.
          .fromTo(
            ".js-hero-swash",
            { autoAlpha: 0 },
            { autoAlpha: 1, duration: 0.3, ease: "power2.out" },
            0.45,
          )
          .from(
            ".js-hero-swash-stroke",
            { drawSVG: 0, duration: 0.5, ease: "power2.inOut" },
            0.55,
          )
          // The corner lab sketch pastes on (fade + sub-100% scale settle,
          // clearProps restores its Tailwind tilt); its caption underline then
          // draws itself. Desktop-only node; a no-op on mobile.
          .fromTo(
            ".js-hero-sketch",
            { autoAlpha: 0, scale: 0.94 },
            {
              autoAlpha: 1,
              scale: 1,
              duration: 0.4,
              ease: "power3.out",
              clearProps: "transform",
            },
            0.6,
          )
          .from(
            ".js-hero-underline",
            { drawSVG: 0, duration: 0.5, ease: "power2.inOut" },
            0.85,
          );

        // The one quiet life beat: the flask's culture bubbles bob. A `.to()`
        // loop (content never translates via from/fromTo; idle .to() is the
        // legal way to move a node), paused unless the hero is on screen, and
        // never created under reduced motion. Its resting state is the static
        // bubble positions, so no-JS / reduced-motion see a settled flask.
        const idle = gsap.timeline({ paused: true });
        idle.to(".js-hero-bubble", {
          y: -6,
          duration: 1.6,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          stagger: { each: 0.4, from: "start" },
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
    <section
      ref={root}
      className="relative flex min-h-[calc(100dvh-3.5rem)] flex-col overflow-hidden bg-page heal-grid"
    >
      <h1 className="sr-only">
        HEAL: healthier, happier companions, by BASIS-China
      </h1>

      {/* notebook binding margin: punched holes + red rule (desktop only) */}
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

      <div className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col items-center justify-center gap-6 px-4 pb-14 pt-8 sm:px-6 lg:px-12">
        {/* banner + tape */}
        <div className="relative w-full max-w-5xl">
          <WashiTape className="js-hero-tape heal-paste-in -top-3 left-1/2 w-28 -translate-x-1/2 -rotate-3" />
          <img
            src={bannerUrl}
            alt=""
            width={1600}
            height={622}
            className="h-auto w-full"
            style={{ filter: "drop-shadow(5px 7px 0 rgb(47 36 23 / 0.16))" }}
          />
        </div>

        {/* HEAL expansion + value-prop, as one tight text block. The expansion
            surfaces the sr-only h1's meaning for sighted readers (aria-hidden
            here so the h1 stays the single spoken page title). Static paint:
            content never animates on load. */}
        <div className="flex flex-col items-center gap-2.5">
          {/* The motto, given a quick highlighter swipe — the marker swash that
              is this site's section-header grammar, brought to the hero. The
              swash <svg> shrink-wraps to the motto via the inline-flex column,
              so the stroke spans exactly the words. It draws itself in on load;
              reduced-motion / no-JS get the complete stroke. */}
          <span className="relative inline-flex flex-col items-center">
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
          {/* The hero's message-in-text — its de-facto headline, since the
              visible wordmark is the raster banner and the h1 is sr-only. Given
              the heading ink + a display weight + tight leading so it reads as a
              headline (not body copy at a big size), while staying on the
              legible face, NOT font-hand (Gochi's capital G reads as a numeral
              6). Static paint: content never animates on load. */}
          <p className="max-w-2xl text-balance text-center text-2xl font-semibold leading-tight text-ink sm:text-3xl">
            Gentle, bio-made care for the cats and dogs we love.
          </p>
        </div>

        {/* sticker CTAs. The hand-drawn note is anchored to this row (not the
            banner) so it points at the primary action and tracks the button
            regardless of hero height. */}
        <div className="relative flex flex-wrap items-center justify-center gap-4">
          {/* "our project!" annotation aimed at Explore (desktop only).
              aria-hidden decoration; pastes in on load via .heal-paste-in. */}
          <div
            aria-hidden="true"
            className="js-hero-note heal-paste-in pointer-events-none absolute -top-16 left-0 hidden -translate-x-[80%] -rotate-6 text-right lg:block"
          >
            <span className="font-hand text-xl text-ink-muted">
              our project!
            </span>
            <svg
              viewBox="0 0 96 72"
              className="ml-auto h-14 w-24"
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
      </div>

      {/* corner lab sketch: bubbling flask + paw, pasted into the lower-right of
          the notebook page (desktop). aria-hidden decoration; pastes in on load
          via .heal-paste-in and keeps a quiet bubble idle after. Sits above the
          section divider seam. */}
      <div
        aria-hidden="true"
        className="js-hero-sketch heal-paste-in pointer-events-none absolute bottom-24 right-6 z-10 hidden h-28 w-36 -rotate-3 lg:block xl:right-12"
      >
        <HeroSketch />
      </div>

      <SectionDivider
        fill="var(--color-primary-soft)"
        className="absolute inset-x-0 bottom-0 z-20"
      />
    </section>
  );
}
