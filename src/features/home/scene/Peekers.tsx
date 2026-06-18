/**
 * Small mascot cameos that keep the cat & dog IP alive below the fold —
 * a cat peeking over a tile edge and a big soft paw resting on a corner. All
 * decorative (aria-hidden) and drawn in the same warm-outline register as the
 * hero mascots.
 *
 * The cat carries quiet idle life (a slow bob + occasional blink), driven by the
 * consuming section's GSAP block. The outer <svg> keeps its Tailwind placement
 * transform; GSAP only ever touches the inner `js-*` groups, so the two
 * transform owners never fight (see DESIGN.md). PawCorner stays static.
 */

const CAT_OUTLINE = "#7a5230";

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
