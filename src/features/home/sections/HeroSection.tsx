import { useRef } from "react";
import { Link } from "react-router-dom";
import { Cat, Dog, PawPrint, UsersThree } from "@phosphor-icons/react";
import { wikiEnv } from "@/config/env";
import { Icon } from "@/shared/components/Icon";
import { buttonClasses } from "@/shared/components/Button";
import { useHeroCinema } from "../useHeroCinema";

/**
 * Homepage hero (§20) — cinematic scrollytelling "From Companion to Cure".
 * This component is markup only: Beat 0 (the legible resting scene + headline +
 * subhead + CTA) is what prerenders and what no-JS / reduced-motion visitors
 * see. The cinematic layers (veil, inner-world panel, captions, progress rail)
 * ship inline-hidden and are activated client-side by `useHeroCinema`.
 */
export function HeroSection() {
  const root = useRef<HTMLElement>(null);
  useHeroCinema(root);

  return (
    <section
      ref={root}
      className="js-hero relative flex min-h-[88vh] items-center overflow-hidden bg-gradient-to-b from-page to-surface"
    >
      {/* Left-edge pin-progress hairline (idle hidden; scaled by scroll). */}
      <span
        aria-hidden="true"
        className="js-hero-progress pointer-events-none absolute left-0 top-0 hidden h-full w-1 origin-top bg-primary/60 lg:block"
        style={{ transform: "scaleY(0)" }}
      />

      {/* Dimming veil over the scene (opacity cross-fade, never a filter). */}
      <div
        aria-hidden="true"
        className="js-hero-veil pointer-events-none absolute inset-0 bg-ink/40"
        style={{ opacity: 0, visibility: "hidden" }}
      />

      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8">
        {/* Text column (z-10 so it stays legible above the veil). */}
        <div className="relative z-10 text-center lg:text-left">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary-deep">
            iGEM {wikiEnv.teamYear}
          </p>
          <h1 className="js-hero-h1 mt-4 text-4xl font-black leading-tight tracking-tight text-ink sm:text-6xl">
            {wikiEnv.teamName}
          </h1>
          <p className="js-hero-sub mx-auto mt-6 max-w-xl text-lg text-ink-soft lg:mx-0">
            Engineering biology for healthier companions.
          </p>

          {/* Scrolly captions: stacked, inline-hidden, cross-faded by beat. */}
          <div className="relative mt-6 h-7" aria-hidden="true">
            <p
              className="js-hero-caption js-hero-caption-1 absolute inset-x-0 text-base font-semibold text-primary-deep"
              style={{ opacity: 0, visibility: "hidden" }}
            >
              Health begins where you can&rsquo;t see.
            </p>
            <p
              className="js-hero-caption js-hero-caption-2 absolute inset-x-0 text-base font-semibold text-primary-deep"
              style={{ opacity: 0, visibility: "hidden" }}
            >
              Sometimes the smallest things fall out of balance.
            </p>
            <p
              className="js-hero-caption js-hero-caption-3 absolute inset-x-0 text-base font-semibold text-primary-deep"
              style={{ opacity: 0, visibility: "hidden" }}
            >
              We engineer biology to help them thrive.
            </p>
          </div>

          <div className="js-hero-cta mt-10 flex flex-wrap justify-center gap-4 lg:justify-start">
            <Link
              to="/description"
              className={buttonClasses("primary", "lg", "group")}
            >
              <Icon as={PawPrint} weight="fill" />
              <span>Explore the project</span>
            </Link>
            <Link to="/team" className={buttonClasses("secondary", "lg")}>
              <Icon as={UsersThree} />
              <span>Meet the team</span>
            </Link>
          </div>
        </div>

        {/* Scene column: cat + dog + island + heartbeat, with the inner-world panel. */}
        <div
          className="relative flex items-center justify-center"
          aria-hidden="true"
        >
          <div className="js-hero-scene relative flex items-end justify-center gap-2">
            <Icon
              as={Cat}
              weight="duotone"
              className="h-40 w-40 text-app-peach"
            />
            <Icon
              as={Dog}
              weight="duotone"
              className="h-44 w-44 text-app-teal"
            />

            {/* island shelf */}
            <div className="absolute -bottom-4 h-6 w-72 rounded-pill bg-surface-2 shadow-soft" />

            {/* resting heartbeat line (drawn on in Beat 0) */}
            <svg
              className="absolute -bottom-12 h-10 w-72"
              viewBox="0 0 240 40"
              fill="none"
            >
              <path
                className="js-hero-ekg"
                d="M0 20 H60 l8 -14 l10 28 l8 -14 H140 l8 -10 l8 20 l8 -10 H240"
                stroke="var(--color-primary)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            {/* inner-world panel (irises open during the pin) */}
            <div
              className="js-hero-panel absolute inset-0 flex items-center justify-center rounded-card border-2 border-border bg-surface"
              style={{
                clipPath: "inset(0 50% 0 50% round 28px)",
                visibility: "hidden",
              }}
            >
              <svg
                viewBox="0 0 200 200"
                className="h-full w-full p-6"
                fill="none"
              >
                <g className="js-hero-cell" style={{ opacity: 0.35 }}>
                  <circle cx="70" cy="80" r="7" fill="var(--color-app-green)" />
                  <circle cx="112" cy="70" r="6" fill="var(--color-app-blue)" />
                  <circle
                    cx="132"
                    cy="112"
                    r="8"
                    fill="var(--color-app-teal)"
                  />
                  <circle
                    cx="84"
                    cy="122"
                    r="6"
                    fill="var(--color-app-purple)"
                  />
                  <circle
                    cx="104"
                    cy="100"
                    r="5"
                    fill="var(--color-app-green)"
                  />
                </g>
                <path
                  className="js-hero-construct"
                  d="M30 150 C 60 90, 140 90, 170 150"
                  stroke="var(--color-primary-deep)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
