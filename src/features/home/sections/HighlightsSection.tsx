import { useRef } from "react";
import { Link } from "react-router-dom";
import { PawPrint } from "@phosphor-icons/react";
import type { PageCategory } from "@/config/pageData";
import {
  pageCategoryMeta,
  type CategoryAccent,
} from "@/config/pageCategoryMeta";
import { Icon } from "@/shared/components/Icon";
import { SectionDivider } from "@/shared/components/SectionDivider";
import {
  gsap,
  ScrollTrigger,
  registerGsap,
  useGSAP,
} from "@/shared/motion/gsap";
import { stickerStyle } from "@/shared/styles/heal";
import { HomeSectionHeader } from "../components/HomeSectionHeader";
import { PeekingCat, PawCorner } from "../scene/Peekers";

interface Tile {
  category: PageCategory;
  title: string;
  description: string;
  to: string;
  wide?: boolean;
  /** Watermark icon corner (background diversity without identical tiles). */
  watermark?: "br" | "tl";
  /** Mascot cameo on this tile. */
  cameo?: "cat" | "paw";
}

// Two wide tiles (Project, Team) bookend a row of three. Rhythm, exact cell
// count, no identical grid; cameos keep the mascots present below the fold.
const TILES: Tile[] = [
  {
    category: "project",
    title: "The project",
    description:
      "Why we chose our challenge, the science behind our solution, and where the work is headed.",
    to: "/description",
    wide: true,
    watermark: "br",
    cameo: "cat",
  },
  {
    category: "wet-lab",
    title: "Wet lab",
    description: "Experiments, measurement, and the lab notebook.",
    to: "/experiments",
    watermark: "br",
  },
  {
    category: "dry-lab",
    title: "Dry lab",
    description: "Modeling, software, and hardware.",
    to: "/model",
    watermark: "br",
  },
  {
    category: "human-practices",
    title: "Engagement",
    description: "Human practices, education, inclusivity, sustainability.",
    to: "/human-practices",
    watermark: "br",
  },
  {
    category: "team",
    title: "The team",
    description:
      "The students, instructors, and advisors who made this season happen.",
    to: "/team",
    wide: true,
    cameo: "paw",
  },
];

// Literal class strings (Tailwind only generates classes it can see in source).
// The sticker outline owns the edge now, so each tile carries only its solid
// pastel fill — a colourful sticky note pasted on the notebook grid.
const ACCENT: Record<CategoryAccent, { tile: string; chip: string }> = {
  teal: { tile: "bg-app-teal-soft", chip: "bg-app-teal text-app-teal-ink" },
  blue: { tile: "bg-app-blue-soft", chip: "bg-app-blue text-app-blue-ink" },
  purple: {
    tile: "bg-app-purple-soft",
    chip: "bg-app-purple text-app-purple-ink",
  },
  green: { tile: "bg-app-green-soft", chip: "bg-app-green text-app-green-ink" },
  peach: { tile: "bg-app-peach-soft", chip: "bg-app-peach text-app-peach-ink" },
  pink: { tile: "bg-app-pink-soft", chip: "bg-app-pink text-app-pink-ink" },
};

export function HighlightsSection() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      registerGsap();
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".js-reveal-title", {
          y: 24,
          opacity: 0,
          duration: 0.7,
          ease: "power3.out",
          clearProps: "all",
          scrollTrigger: {
            trigger: root.current,
            start: "top 80%",
            once: true,
          },
        });
        // The header's marker swash draws itself a beat after the title lands
        // (hand register: strokes draw by length, they don't fade).
        gsap.from(".js-swash", {
          drawSVG: 0,
          duration: 0.55,
          ease: "power2.inOut",
          delay: 0.35,
          scrollTrigger: {
            trigger: root.current,
            start: "top 80%",
            once: true,
          },
        });
        gsap.set(".js-bento", { autoAlpha: 0, y: 24 });
        ScrollTrigger.batch(".js-bento", {
          start: "top 88%",
          onEnter: (els) =>
            // Calm rise + fade, same register as the title — tiles never
            // scale or overshoot (no bounce eases anywhere on the site).
            gsap.to(els, {
              autoAlpha: 1,
              y: 0,
              stagger: 0.1,
              duration: 0.6,
              ease: "power3.out",
              overwrite: true,
              // Clear the inline transform so each sticker tile's CSS tilt
              // (rotate var(--rot)) and hover lift are restored after the reveal.
              clearProps: "transform",
            }),
        });

        // PeekingCat over the Project tile gets a slow bob plus an occasional
        // blink: this section's one quiet below-fold beat. GSAP touches only the
        // inner js- groups, never the Tailwind-placed <svg>. Paused off screen.
        const idle = gsap.timeline({ paused: true });
        idle
          .to(
            ".js-peek-cat",
            {
              y: 3,
              duration: 3,
              ease: "sine.inOut",
              repeat: -1,
              yoyo: true,
            },
            0,
          )
          .to(
            ".js-peek-cat-eyes",
            {
              scaleY: 0.1,
              transformOrigin: "50% 50%",
              duration: 0.09,
              ease: "power1.inOut",
              repeat: -1,
              repeatDelay: 4.2,
              yoyo: true,
            },
            1.2,
          );
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
    <section ref={root} className="bg-page heal-grid">
      <div className="mx-auto max-w-6xl px-4 pt-20 sm:px-6 lg:px-8">
        <HomeSectionHeader
          className="js-reveal-title"
          title="Start exploring"
        />

        <div className="mt-14 grid grid-cols-1 gap-6 pb-24 sm:grid-cols-2 lg:grid-cols-3">
          {TILES.map((tile, i) => {
            const meta = pageCategoryMeta[tile.category];
            const accent = ACCENT[meta.accent];
            const linkContent = (
              <>
                {tile.watermark ? (
                  <meta.Icon
                    aria-hidden="true"
                    weight="duotone"
                    className={`pointer-events-none absolute h-32 w-32 text-ink opacity-[0.07] ${
                      tile.watermark === "br"
                        ? "-bottom-6 -right-4"
                        : "-left-5 -top-6"
                    }`}
                  />
                ) : null}
                {tile.cameo === "paw" ? (
                  <PawCorner className="pointer-events-none absolute right-5 top-4 h-20 w-20 rotate-12" />
                ) : null}

                <div
                  className={
                    tile.wide
                      ? "relative flex items-start gap-5"
                      : "relative flex h-full flex-col"
                  }
                >
                  <span
                    className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-min ${accent.chip}`}
                  >
                    <Icon as={meta.Icon} size="md" weight="bold" />
                  </span>
                  <div className={tile.wide ? "" : "mt-4 flex flex-1 flex-col"}>
                    <h3
                      className={`font-hand leading-none text-ink ${tile.wide ? "text-2xl" : "text-xl"}`}
                    >
                      {tile.title}
                    </h3>
                    <p className="mt-2 max-w-prose text-ink-soft">
                      {tile.description}
                    </p>
                    <span
                      className={`inline-flex items-center gap-2 font-hand text-primary-deep ${
                        tile.wide ? "mt-4" : "mt-auto pt-4"
                      }`}
                    >
                      Open
                      <Icon
                        as={PawPrint}
                        weight="fill"
                        className="transition group-hover:translate-x-1"
                      />
                    </span>
                  </div>
                </div>
              </>
            );
            const linkClasses = [
              "group heal-sticker relative block overflow-hidden outline-focus-ring focus-visible:outline-2 focus-visible:outline-offset-2",
              accent.tile,
              tile.wide ? "p-8" : "js-bento p-6",
            ].join(" ");

            // Wide tiles get a wrapper so the peeking cat can rise above the
            // tile's top edge without being clipped by the link's own
            // overflow-hidden. The reveal sentinel moves to the wrapper so
            // the cameo enters together with its tile.
            if (tile.wide) {
              return (
                <div
                  key={tile.to}
                  className="js-bento relative sm:col-span-2 lg:col-span-3"
                >
                  <Link
                    to={tile.to}
                    className={`${linkClasses} h-full`}
                    style={stickerStyle(i)}
                  >
                    {linkContent}
                  </Link>
                  {tile.cameo === "cat" ? (
                    <PeekingCat className="pointer-events-none absolute bottom-full right-10 hidden w-32 translate-y-[7px] sm:block" />
                  ) : null}
                </div>
              );
            }
            return (
              <Link
                key={tile.to}
                to={tile.to}
                className={linkClasses}
                style={stickerStyle(i)}
              >
                {linkContent}
              </Link>
            );
          })}
        </div>
      </div>
      <SectionDivider fill="var(--color-sunset-sky)" />
    </section>
  );
}
