/**
 * Small mascot cameos that keep the cat & dog IP alive below the fold —
 * a cat peeking over a tile edge, a big soft paw resting on a corner, and a
 * dog peeking around the molecule porthole. All decorative (aria-hidden) and
 * drawn in the same warm-outline register as the hero mascots.
 *
 * The cat and dog carry quiet idle life (a slow bob + occasional blink), driven
 * by the consuming section's GSAP block. The outer <svg> keeps its Tailwind
 * placement transform; GSAP only ever touches the inner `js-*` groups, so the
 * two transform owners never fight (see DESIGN.md). PawCorner stays static.
 */

const CAT_OUTLINE = "#7a5230";
const DOG_OUTLINE = "#27695a";

/**
 * Cat peeking over an edge: ears + eyes + gripping paws. Place with
 * `absolute bottom-full` so the SVG's bottom edge sits exactly on the tile's
 * top border; the head's lower half is cut by the SVG viewport, which reads
 * as "hiding behind the tile".
 */
export function PeekingCat({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 112"
      aria-hidden="true"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <g
        className="js-peek-cat"
        stroke={CAT_OUTLINE}
        strokeWidth="3.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      >
        {/* ears */}
        <path d="M66 52 L 58 14 L 92 38 Z" fill="#ec9b80" />
        <path d="M134 52 L 142 14 L 108 38 Z" fill="#ec9b80" />
        <path d="M70 46 L 65 22 L 86 38 Z" fill="#f4a9b8" stroke="none" />
        <path d="M130 46 L 135 22 L 114 38 Z" fill="#f4a9b8" stroke="none" />
        {/* head, lower half hidden behind the tile edge */}
        <circle cx="100" cy="78" r="46" fill="#ec9b80" />
        <path
          d="M100 34 q 5 10 0 20 M84 38 q 4 9 0 17 M116 38 q -4 9 0 17"
          fill="none"
          stroke="#d07c5c"
          strokeWidth="4"
        />
        {/* eyes looking down into the tile */}
        <g className="js-peek-cat-eyes" stroke="none">
          <ellipse cx="84" cy="82" rx="8.5" ry="11" fill="#43321f" />
          <ellipse cx="116" cy="82" rx="8.5" ry="11" fill="#43321f" />
          <circle cx="87" cy="78" r="3.4" fill="#fff" />
          <circle cx="119" cy="78" r="3.4" fill="#fff" />
        </g>
        {/* paws gripping the edge */}
        <ellipse cx="58" cy="104" rx="17" ry="11" fill="#ec9b80" />
        <ellipse cx="142" cy="104" rx="17" ry="11" fill="#ec9b80" />
        <path
          d="M52 100 v 8 M64 100 v 8 M136 100 v 8 M148 100 v 8"
          stroke="#cf9a82"
          strokeWidth="2.5"
        />
      </g>
    </svg>
  );
}

/** A big soft paw print resting on a tile corner. */
export function PawCorner({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      aria-hidden="true"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <g
        style={{ fill: "var(--color-app-teal)" }}
        stroke="#1f7a5e"
        strokeWidth="3"
        strokeLinejoin="round"
      >
        <ellipse cx="60" cy="74" rx="26" ry="21" />
        <ellipse cx="28" cy="46" rx="11" ry="13" />
        <ellipse cx="52" cy="32" rx="11" ry="13" />
        <ellipse cx="78" cy="36" rx="11" ry="13" />
        <ellipse cx="97" cy="56" rx="10" ry="12" />
      </g>
    </svg>
  );
}

/**
 * Dog peeking in from beside a round frame: just the happy face and a floppy
 * ear. Place at a porthole's lower-left with a slight tilt.
 */
export function PeekingDog({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 150 140"
      aria-hidden="true"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <g
        className="js-peek-dog"
        stroke={DOG_OUTLINE}
        strokeWidth="3.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      >
        {/* floppy ear */}
        <path
          d="M38 42 C 18 50 14 92 30 116 C 44 122 56 106 54 84 C 52 60 50 48 38 42 Z"
          fill="#6fc6ac"
        />
        {/* head */}
        <circle cx="78" cy="78" r="48" fill="#92ddc6" />
        {/* eye patch + eyes + cheeks (both sides, so the patch reads as a
            patch and not a smudge) */}
        <ellipse cx="64" cy="70" rx="15" ry="17" fill="#6fc6ac" stroke="none" />
        <g stroke="none">
          <g className="js-peek-dog-eyes">
            <ellipse cx="64" cy="72" rx="7.5" ry="10" fill="#3a2e22" />
            <ellipse cx="96" cy="72" rx="7.5" ry="10" fill="#3a2e22" />
            <circle cx="67" cy="68" r="3" fill="#fff" />
            <circle cx="99" cy="68" r="3" fill="#fff" />
          </g>
          <circle cx="46" cy="92" r="9" fill="#6fc6ac" opacity="0.6" />
          <circle cx="112" cy="92" r="9" fill="#6fc6ac" opacity="0.6" />
        </g>
        {/* muzzle + nose + happy mouth */}
        <ellipse
          cx="82"
          cy="100"
          rx="26"
          ry="19"
          fill="#eafaf3"
          stroke="none"
        />
        <ellipse
          cx="82"
          cy="93"
          rx="8.5"
          ry="6.5"
          fill="#33473f"
          stroke="none"
        />
        <path
          d="M82 99 L 82 108 M82 108 q -9 9 -17 1 M82 108 q 9 9 17 1"
          fill="none"
          strokeWidth="3"
        />
      </g>
    </svg>
  );
}
