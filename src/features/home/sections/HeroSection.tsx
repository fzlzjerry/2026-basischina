import { Link } from "react-router-dom";
import { PawPrint, UsersThree } from "@phosphor-icons/react";
import { Icon } from "@/shared/components/Icon";
import { SectionDivider } from "@/shared/components/SectionDivider";
import { ctaClasses, stickerStyleRaw } from "@/shared/styles/heal";
import bannerUrl from "@/assets/brand/heal-banner.webp";

/**
 * Homepage hero (§20), HEAL register. The hand-drawn HEAL banner is the main
 * visual, pasted onto an open lab-notebook page: a punched binding margin runs
 * down the left, a strip of washi tape holds the banner, and a handwritten note
 * points at it. Below sit the value-prop tagline and the two sticker CTAs. The
 * section always fills the first screen (dynamic viewport minus the sticky nav).
 * An sr-only h1 carries the page title so the decorative banner stays out of the
 * accessibility tree; the margin / tape / note are all aria-hidden.
 */
export function HeroSection() {
  return (
    <section className="relative flex min-h-[calc(100dvh-3.5rem)] flex-col overflow-hidden bg-page heal-grid">
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

      {/* handwritten annotation pointing at the banner (desktop only) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[7%] top-[18%] hidden -rotate-6 text-right lg:block"
      >
        <span className="font-hand text-xl text-ink-muted">our project!</span>
        <svg
          viewBox="0 0 90 64"
          className="ml-auto h-12 w-20"
          fill="none"
          stroke="var(--color-ink-muted)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M82 8 C 54 6 22 18 12 52" />
          <path d="M4 40 L 12 54 L 26 48" />
        </svg>
      </div>

      <div className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col items-center justify-center gap-7 px-4 pb-14 pt-8 sm:px-6 lg:px-12">
        {/* banner + tape */}
        <div className="relative w-full max-w-5xl">
          <div
            aria-hidden="true"
            className="absolute -top-3 left-1/2 h-7 w-28 -translate-x-1/2 -rotate-3 rounded-[3px] bg-app-orange/55 shadow-sm"
          />
          <img
            src={bannerUrl}
            alt=""
            width={1600}
            height={622}
            className="h-auto w-full"
            style={{ filter: "drop-shadow(5px 7px 0 rgb(47 36 23 / 0.16))" }}
          />
        </div>

        {/* value-prop tagline */}
        <p className="max-w-xl text-center font-hand text-xl text-ink-soft sm:text-2xl">
          Gentle, bio-made care for the cats and dogs we love.
        </p>

        {/* sticker CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4">
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

      <SectionDivider
        fill="var(--color-primary-soft)"
        className="absolute inset-x-0 bottom-0 z-20"
      />
    </section>
  );
}
