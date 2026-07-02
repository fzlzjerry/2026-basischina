/**
 * Organic section boundary (wave or scallop), the cozy alternative to a hard
 * straight seam between stacked sections. Pure SVG, zero JS, SSG-rendered.
 *
 * HEAL register: both edges are HAND-CUT. The paths are baked constants
 * generated once from a seeded meander (varied segment lengths, jittered
 * amplitude, no repeating period), so each section reads as a strip of
 * coloured paper cut out with scissors and pasted onto the notebook — never a
 * mathematically smooth wave or a perfect scallop repeat. Baked literals keep
 * SSG and hydration byte-identical (no runtime randomness).
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

/** Scissor-line meander: slow drift + per-point jitter, Catmull-Rom smoothed. */
const WAVE_PATH =
  "M0 26.1 C 23 29.2 100.1 43.7 138 44.3 C 176 45 195.6 33.5 227.5 30.2 C 259.4 26.9 301.2 27.1 329.5 24.5 C 357.9 22 374.5 14.3 397.8 15 C 421.1 15.7 440.8 24.2 469.6 28.5 C 498.3 32.7 540.6 39.2 570 40.5 C 599.4 41.8 622.2 38 646 36.5 C 669.9 35 685.1 35.2 713.3 31.6 C 741.4 28 775.8 15.6 814.8 15 C 853.9 14.4 906.5 24.7 947.4 27.8 C 988.3 30.9 1019.2 31.2 1060.2 33.6 C 1101.3 35.9 1159.7 42 1193.5 41.9 C 1227.4 41.8 1242.3 35.3 1263.4 33 C 1284.5 30.6 1296.3 30 1320.1 27.8 C 1344 25.5 1386.5 19.1 1406.5 19.7 C 1426.5 20.3 1434.4 29.6 1440 31.6 L 1440 64 L 0 64 Z";

/** Rolling ground bumps, hand-cut: every bump has its own width and height. */
const SCALLOP_PATH =
  "M0 37.6 Q 63.7 13.4 128.5 39.4 Q 207.6 20.4 290.4 39.1 Q 370.5 12.3 443.7 39.1 Q 496.8 11.2 564.2 44.2 Q 632.1 19.9 700.7 36.5 Q 747.9 16.6 813.1 40.2 Q 890 19.7 958.2 44.1 Q 1024.5 12.2 1097.4 39 Q 1153.9 17.6 1215.8 39.8 Q 1291.9 17 1380.3 42.8 Q 1411.8 21.1 1440 43.2 L 1440 64 L 0 64 Z";

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
