/**
 * Hero notebook doodles (§20). A small hand-drawn "lab annotation" pasted into
 * the corner of the hero notebook page: a round flask of gently bubbling culture
 * beside a paw print — the platform's whole idea (friendly biology becomes a
 * happy pet) sketched in one margin note, under a scribbled caption underline. Same warm
 * hand-drawn register as the Approach step spots (outline #7a5230, brand palette,
 * bright teal culture as decoration-only per the two-teal rule). Purely
 * decorative; the caller renders it inside an aria-hidden `.heal-paste-in`
 * wrapper.
 *
 * Motion: the caller pastes the whole cluster in on load (autoAlpha + sub-100%
 * scale settle); the caption underline draws itself (`js-hero-underline`), and
 * the three culture bubbles keep a quiet idle bob afterwards (`js-hero-bubble`,
 * a `.to()` loop — the one sustained life beat in the hero). With reduced motion
 * or no JS the cluster is painted complete and still from the first frame.
 */

const OUTLINE = "#7a5230";

export function HeroSketch() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 168 120"
      className="h-full w-full"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <clipPath id="hero-flask-clip">
          <circle cx="46" cy="74" r="23" />
        </clipPath>
      </defs>
      <g strokeLinecap="round" strokeLinejoin="round">
        {/* round-bottom flask */}
        <circle
          cx="46"
          cy="74"
          r="26"
          fill="#f4fbf8"
          stroke={OUTLINE}
          strokeWidth="3.2"
        />
        <rect
          x="39"
          y="30"
          width="14"
          height="28"
          fill="#f4fbf8"
          stroke={OUTLINE}
          strokeWidth="3.2"
        />
        {/* mint culture (clipped to the body) */}
        <g clipPath="url(#hero-flask-clip)">
          <rect
            x="20"
            y="76"
            width="52"
            height="24"
            style={{ fill: "var(--color-primary)" }}
          />
          <path
            d="M20 78 Q 33 73 46 78 T 72 77"
            fill="none"
            stroke="#5fe0d2"
            strokeWidth="3.4"
          />
        </g>
        {/* rising bubbles (idle) */}
        <g className="js-hero-bubble">
          <circle cx="46" cy="60" r="2.6" fill="#5fe0d2" />
        </g>
        <g className="js-hero-bubble">
          <circle cx="53" cy="52" r="2" fill="#5fe0d2" />
        </g>
        <g className="js-hero-bubble">
          <circle cx="39" cy="49" r="1.6" fill="#5fe0d2" />
        </g>
        {/* cap */}
        <rect
          x="34"
          y="25"
          width="24"
          height="8"
          rx="4"
          fill="#c9a47c"
          stroke={OUTLINE}
          strokeWidth="2.6"
        />
        {/* paw print */}
        <g
          transform="translate(122 64)"
          fill="#e18c6f"
          stroke={OUTLINE}
          strokeWidth="2.4"
        >
          <ellipse cx="0" cy="9" rx="11" ry="8.5" />
          <ellipse cx="-12" cy="-4" rx="4.2" ry="5" />
          <ellipse cx="-1" cy="-10" rx="4.2" ry="5" />
          <ellipse cx="11" cy="-5" rx="4.2" ry="5" />
        </g>
        {/* scribbled caption underline that ties the little vignette together
            (draws in) */}
        <path
          className="js-hero-underline"
          d="M16 107 C 50 103 92 110 116 105 C 133 102 147 107 151 105"
          fill="none"
          stroke="var(--color-app-orange)"
          strokeWidth="3.6"
        />
      </g>
    </svg>
  );
}
