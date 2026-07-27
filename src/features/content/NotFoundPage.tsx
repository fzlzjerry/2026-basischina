import { useRef } from "react";
import { Link } from "react-router-dom";
import { PageHead } from "@/shared/components/PageHead";
import { WashiTape } from "@/shared/components/WashiTape";
import { PeekingCat } from "@/features/home/scene/Peekers";
import { stickerStyle, stickerStyleRaw } from "@/shared/styles/heal";
import { getNavGroups } from "@/config/navigation";
import { gsap, registerGsap, useGSAP } from "@/shared/motion/gsap";

// Six tidy destinations instead of the full 22-page sitemap dump: one sticker
// per nav GROUP (still derived from the registry — never a second route list),
// each landing on the group's first page.
const groups = getNavGroups();

/** Paw stamps wandering from the poster down to the suggestions. */
const TRAIL_STAMPS: { x: number; y: number; r: number }[] = [
  { x: 38, y: 14, r: 16 },
  { x: 68, y: 38, r: 30 },
  { x: 48, y: 64, r: 8 },
];

/**
 * 404 page (§11), HEAL register: a MISSING poster taped to the notebook — the
 * perfect lost-page gag for a pet-care wiki — while the "missing" cat peeks
 * over the poster's top edge, hiding in plain sight. A little paw trail
 * wanders from the poster down to the suggestion stickers. Marked noindex so
 * search engines do not surface it.
 *
 * Motion (gated behind prefers-reduced-motion, reverted on unmount): the
 * poster settles transform-only (above the fold), the tape presses on, the cat
 * rises from behind the poster into its resting peek, paw stamps appear along
 * the trail, and the suggestion stickers rise in last. The cat then keeps the
 * same quiet slow bob it has on the homepage.
 */
export function NotFoundPage() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      registerGsap();
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        tl.from(".js-nf-poster", { y: 14, scale: 0.985, duration: 0.6 }, 0)
          .from(
            ".js-nf-tape",
            {
              scale: 0.75,
              duration: 0.5,
              ease: "power3.out",
              clearProps: "transform",
            },
            0.05,
          )
          // The raster cat emerges from behind the poster edge into its resting
          // peek. One hundred CSS pixels pushes the 96–112px-wide illustration
          // beneath the paper edge before it rises into place.
          .from(".js-peek-cat", { y: 100, duration: 0.8 }, 0.35)
          // NO clearProps here: these are SVG <g>s whose placement lives in the
          // transform ATTRIBUTE (and fill in inline style) — GSAP's clearProps
          // on SVG removes the transform attribute and wipes style.cssText,
          // which would collapse the stamps into an unstyled pile at the
          // origin. A from-tween already ends at the authored state.
          .from(
            ".js-nf-stamp",
            {
              scale: 0,
              transformOrigin: "50% 50%",
              duration: 0.4,
              ease: "power2.out",
              stagger: 0.14,
            },
            0.5,
          )
          // Suggestion pills settle with a calm rise — no scale, no overshoot.
          .from(
            ".js-nf-pill",
            {
              y: 12,
              duration: 0.45,
              ease: "power3.out",
              stagger: 0.06,
              clearProps: "transform",
            },
            0.65,
          );

        // Same quiet idle the cat carries on the homepage tile. Paused until
        // the entrance rise finishes so the two never fight over the group's y.
        const idle = gsap.to(".js-peek-cat", {
          y: 3,
          duration: 3,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          paused: true,
        });
        tl.call(() => idle.play(), [], 1.2);
        return () => {
          idle.kill();
        };
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <>
      <PageHead
        path="/404"
        title="Page not found"
        seo={{
          title: "Page not found · BASIS-China 2026 iGEM",
          description: "The requested page could not be found.",
          keywords: ["404", "not found"],
          robots: "noindex, follow",
        }}
      />
      <section ref={root} className="min-h-screen bg-page heal-grid">
        <div className="mx-auto max-w-2xl px-4 pb-24 pt-28 text-center sm:pt-32">
          {/* The MISSING poster. The cat lives INSIDE the tilted card so it
              shares the card's rotation and its paws grip the actual paper
              edge; its wrapper clips the rise-from-behind entrance. */}
          <div className="mx-auto max-w-md">
            <div
              className="js-nf-poster heal-cutout relative bg-surface px-6 pb-7 pt-9 sm:px-10"
              style={stickerStyleRaw(
                "-1.6deg",
                "22px 17px 24px 15px / 16px 24px 15px 22px",
              )}
            >
              <PeekingCat className="pointer-events-none absolute bottom-full right-7 w-24 translate-y-[6px] sm:right-10 sm:w-28" />
              {/* Tape rides left of centre so it never crowds the cat's paws,
                  even on narrow cards — deliberate collage asymmetry. */}
              <WashiTape className="js-nf-tape -top-3.5 left-[32%] w-20 -translate-x-1/2 -rotate-2 sm:left-[40%] sm:w-24" />
              <p className="font-hand text-base tracking-[0.3em] text-app-orange-ink">
                MISSING
              </p>
              <p className="mt-1 font-script text-[clamp(4.5rem,3.5rem+5vw,7rem)] font-bold leading-none text-ink">
                404
              </p>
              <h1 className="mt-1 pb-1 font-script text-[clamp(1.9rem,1.5rem+1.6vw,2.6rem)] font-bold leading-[1.05] text-ink">
                Page not found
              </h1>
              <p className="mt-2 text-ink-soft">
                {"This page doesn't exist, or it wandered off."}
              </p>
              <div
                aria-hidden="true"
                className="heal-rule-dash mx-auto mt-5 h-2 w-4/5 bg-sticker-ink/40"
              />
              <p className="mt-4 font-hand text-base text-app-orange-ink">
                Reward: belly rubs.
              </p>
            </div>
          </div>

          {/* Paw trail wandering off the poster toward the suggestions. */}
          <svg
            aria-hidden="true"
            viewBox="0 0 110 84"
            className="mx-auto mb-1 mt-3 h-20 w-24"
            xmlns="http://www.w3.org/2000/svg"
          >
            {TRAIL_STAMPS.map((s) => (
              <g
                key={`${s.x}-${s.y}`}
                className="js-nf-stamp"
                transform={`translate(${s.x} ${s.y}) rotate(${s.r})`}
                style={{ fill: "var(--color-primary-deep)" }}
              >
                <ellipse cx="0" cy="5" rx="6.5" ry="5" />
                <circle cx="-7.5" cy="-2.5" r="2.8" />
                <circle cx="0" cy="-6" r="2.8" />
                <circle cx="7.5" cy="-2.5" r="2.8" />
              </g>
            ))}
          </svg>

          <nav aria-label="Suggested pages">
            <h2 className="font-hand text-base text-app-orange-ink">
              Try one of these
            </h2>
            <ul className="mt-4 flex flex-wrap justify-center gap-3">
              {groups.map((group, index) => (
                <li key={group.key}>
                  <Link
                    to={group.pages[0].path}
                    className={`js-nf-pill heal-sticker inline-flex items-center px-5 py-2.5 font-hand text-base leading-none text-sticker-ink transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring ${
                      group.key === "home"
                        ? "bg-app-orange"
                        : "bg-surface-2 hover:bg-app-orange-soft"
                    }`}
                    style={stickerStyle(index)}
                  >
                    {group.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </section>
    </>
  );
}
