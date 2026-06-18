import { SectionDivider } from "@/shared/components/SectionDivider";
import bannerUrl from "@/assets/brand/heal-banner.webp";

/**
 * Homepage hero (§20), HEAL register. The hand-drawn HEAL banner is the main
 * visual, pasted onto the lab-notebook grid (a drop-shadow follows the torn-
 * paper alpha for the sticker look). The section always fills the first screen:
 * min-height is the dynamic viewport minus the sticky navbar (~3.5rem, kept a
 * touch under the real nav height so the next section never peeks), and the
 * banner is centred in the remaining space. An sr-only h1 carries the page
 * title so the decorative banner stays out of the accessibility tree.
 */
export function HeroSection() {
  return (
    <section className="relative flex min-h-[calc(100dvh-3.5rem)] flex-col overflow-hidden bg-page heal-grid">
      <h1 className="sr-only">
        HEAL: healthier, happier companions, by BASIS-China
      </h1>
      <div className="mx-auto flex w-full max-w-[1400px] flex-1 items-center justify-center px-4 pb-14 pt-8 sm:px-6 lg:px-12">
        <img
          src={bannerUrl}
          alt=""
          width={1600}
          height={622}
          className="h-auto w-full max-w-6xl"
          style={{ filter: "drop-shadow(5px 7px 0 rgb(47 36 23 / 0.16))" }}
        />
      </div>

      <SectionDivider
        fill="var(--color-primary-soft)"
        className="absolute inset-x-0 bottom-0 z-20"
      />
    </section>
  );
}
