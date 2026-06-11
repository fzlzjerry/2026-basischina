import { useRef } from "react";
import { Link } from "react-router-dom";
import { PawPrint } from "@phosphor-icons/react";
import type { PageCategory } from "@/config/pageData";
import {
  pageCategoryMeta,
  type CategoryAccent,
} from "@/config/pageCategoryMeta";
import { Icon } from "@/shared/components/Icon";
import { Title } from "@/shared/components/Title";
import {
  gsap,
  ScrollTrigger,
  registerGsap,
  useGSAP,
} from "@/shared/motion/gsap";

interface Tile {
  category: PageCategory;
  title: string;
  description: string;
  to: string;
  wide?: boolean;
}

// Two wide tiles (Project, Team) bookend a row of three. Rhythm, exact cell
// count, no identical grid.
const TILES: Tile[] = [
  {
    category: "project",
    title: "The project",
    description:
      "Why we chose our challenge, the science behind our solution, and where the work is headed.",
    to: "/description",
    wide: true,
  },
  {
    category: "wet-lab",
    title: "Wet lab",
    description: "Experiments, measurement, and the lab notebook.",
    to: "/experiments",
  },
  {
    category: "dry-lab",
    title: "Dry lab",
    description: "Modeling, software, and hardware.",
    to: "/model",
  },
  {
    category: "human-practices",
    title: "Engagement",
    description: "Human practices, education, inclusivity, sustainability.",
    to: "/human-practices",
  },
  {
    category: "team",
    title: "The team",
    description:
      "The students, instructors, and advisors who made this season happen.",
    to: "/team",
    wide: true,
  },
];

// Literal class strings (Tailwind only generates classes it can see in source).
const ACCENT: Record<CategoryAccent, { tile: string; chip: string }> = {
  teal: {
    tile: "bg-app-teal/10 border-app-teal/45",
    chip: "bg-app-teal text-app-teal-ink",
  },
  blue: {
    tile: "bg-app-blue/10 border-app-blue/45",
    chip: "bg-app-blue text-app-blue-ink",
  },
  purple: {
    tile: "bg-app-purple/10 border-app-purple/45",
    chip: "bg-app-purple text-app-purple-ink",
  },
  green: {
    tile: "bg-app-green/12 border-app-green/45",
    chip: "bg-app-green text-app-green-ink",
  },
  peach: {
    tile: "bg-app-peach/12 border-app-peach/45",
    chip: "bg-app-peach text-app-peach-ink",
  },
  pink: {
    tile: "bg-app-pink/12 border-app-pink/45",
    chip: "bg-app-pink text-app-pink-ink",
  },
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
        gsap.set(".js-bento", { autoAlpha: 0, y: 30 });
        ScrollTrigger.batch(".js-bento", {
          start: "top 88%",
          onEnter: (els) =>
            gsap.to(els, {
              autoAlpha: 1,
              y: 0,
              stagger: 0.1,
              duration: 0.6,
              ease: "power3.out",
              overwrite: true,
            }),
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      className="mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:px-8"
    >
      <Title level="h2" align="center" className="js-reveal-title">
        Start exploring
      </Title>

      <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {TILES.map((tile) => {
          const meta = pageCategoryMeta[tile.category];
          const accent = ACCENT[meta.accent];
          return (
            <Link
              key={tile.to}
              to={tile.to}
              className={[
                "js-bento group relative overflow-hidden rounded-card border-2 outline-focus-ring focus-visible:outline-2 focus-visible:outline-offset-2",
                accent.tile,
                tile.wide ? "p-8 sm:col-span-2 lg:col-span-3" : "p-6",
              ].join(" ")}
            >
              {/* watermark icon for background diversity */}
              <meta.Icon
                aria-hidden="true"
                weight="duotone"
                className="pointer-events-none absolute -bottom-6 -right-4 h-32 w-32 text-ink opacity-[0.06]"
              />

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
                    className={`font-black text-ink ${tile.wide ? "text-2xl" : "text-xl"}`}
                  >
                    {tile.title}
                  </h3>
                  <p className="mt-2 max-w-prose text-ink-soft">
                    {tile.description}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-2 font-semibold text-primary-deep">
                    Open
                    <Icon
                      as={PawPrint}
                      weight="fill"
                      className="transition group-hover:translate-x-1"
                    />
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
