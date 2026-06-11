/**
 * Organic section boundary (wave or scallop), the cozy alternative to a hard
 * straight seam between stacked sections. Pure SVG, zero JS, SSG-rendered.
 *
 * Usage convention: render it as the LAST child of the upper section (outside
 * the inner max-w container) with `fill` set to the NEXT section's background
 * token, so the next section's color rises into the current one and the two
 * interlock. Height is fixed by classes (h-10 sm:h-14) + preserveAspectRatio
 * "none", so the divider can never cause layout shift. The -1px bottom margin
 * swallows subpixel seams between the path edge and the next section.
 *
 * Never a GSAP target — static Tailwind transforms (flip) are safe here.
 */

type DividerVariant = "wave" | "scallop";

interface SectionDividerProps {
  variant?: DividerVariant;
  /** Always a design token, e.g. "var(--color-primary-soft)". */
  fill: string;
  /** Mirror horizontally so consecutive waves don't repeat identically. */
  flip?: boolean;
  className?: string;
}

const WAVE_PATH =
  "M0 38 C 180 10 360 58 540 36 C 720 14 900 54 1080 30 C 1230 12 1340 34 1440 24 L 1440 64 L 0 64 Z";

/** Repeated upward bumps, like the rolling ground edges in cozy island UIs. */
const SCALLOP_PATH = (() => {
  const bumps = 12;
  const w = 1440 / bumps;
  let d = "M0 40";
  for (let i = 0; i < bumps; i += 1) {
    d += ` Q ${i * w + w / 2} 10 ${(i + 1) * w} 40`;
  }
  return `${d} L 1440 64 L 0 64 Z`;
})();

export function SectionDivider({
  variant = "wave",
  fill,
  flip = false,
  className = "",
}: SectionDividerProps) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none w-full leading-none ${className}`}
      style={{ marginBottom: -1 }}
    >
      <svg
        viewBox="0 0 1440 64"
        preserveAspectRatio="none"
        className={`block h-10 w-full sm:h-14 ${flip ? "-scale-x-100" : ""}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d={variant === "wave" ? WAVE_PATH : SCALLOP_PATH}
          style={{ fill }}
        />
      </svg>
    </div>
  );
}
