/**
 * Washi tape strip (HEAL register). The collage motif that "holds" pasted
 * things onto the notebook: translucent, faintly striped, with torn short
 * edges (`.heal-tape` in main.css). Purely decorative and aria-hidden — the
 * caller positions it (usually straddling the top edge of a cutout) and MUST
 * pass a width plus tilt, e.g. `w-28 -top-3 left-1/2 -translate-x-1/2
 * -rotate-3`. The base deliberately sets no `w-*`: conflicting Tailwind
 * utilities resolve by stylesheet order (not class order), so a base width
 * would silently override every caller's.
 *
 * Recurrence is the point: tape on the hero banner, the team roster cards,
 * and the TOC aside makes the paste-up conceit a system instead of a one-off.
 */

const TONE: Record<"orange" | "teal", string> = {
  orange: "bg-app-orange/55",
  teal: "bg-app-teal/55",
};

interface WashiTapeProps {
  tone?: keyof typeof TONE;
  /** Width + position + tilt classes from the caller (a `w-*` is required). */
  className: string;
}

export function WashiTape({ tone = "orange", className }: WashiTapeProps) {
  return (
    <span
      aria-hidden="true"
      className={`heal-tape pointer-events-none absolute block h-7 ${TONE[tone]} ${className}`}
    />
  );
}
