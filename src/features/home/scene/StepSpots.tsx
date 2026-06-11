/**
 * Spot illustrations for the Approach steps (§20) — same hand-drawn register
 * as the hero mascots (warm outlines, round shapes, brand palette). Each is a
 * self-contained 120x120 SVG. Decorative: the step titles carry the meaning.
 * Bright teal (var(--color-primary)) appears only as decoration, per the
 * two-teal rule.
 */

const OUTLINE = "#7a5230";

function SpotSvg({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <svg
      viewBox="0 0 120 120"
      role="img"
      aria-label={label}
      className="h-full w-full"
      xmlns="http://www.w3.org/2000/svg"
    >
      {children}
    </svg>
  );
}

/** Step 1 — Understand: a magnifier over a paw print. */
export function UnderstandSpot() {
  return (
    <SpotSvg label="A magnifying glass over a paw print">
      <g strokeLinecap="round" strokeLinejoin="round">
        <path
          d="M79 75 L 103 99"
          stroke="#b06a4a"
          strokeWidth="12"
          fill="none"
        />
        <circle
          cx="54"
          cy="50"
          r="33"
          fill="#f4fbf8"
          stroke="#c9a47c"
          strokeWidth="9"
        />
        <circle
          cx="54"
          cy="50"
          r="37.5"
          fill="none"
          stroke={OUTLINE}
          strokeWidth="3"
        />
        <ellipse cx="54" cy="59" rx="11.5" ry="9" fill="#e18c6f" />
        <circle cx="40" cy="46" r="5" fill="#e18c6f" />
        <circle cx="54" cy="40" r="5" fill="#e18c6f" />
        <circle cx="68" cy="46" r="5" fill="#e18c6f" />
        <path
          d="M36 31 q 8 -9 19 -8"
          stroke="#fff"
          strokeWidth="4"
          opacity="0.8"
          fill="none"
        />
      </g>
    </SpotSvg>
  );
}

/** Step 2 — Engineer: a round flask of friendly mint culture. */
export function EngineerSpot() {
  return (
    <SpotSvg label="A round flask with gently bubbling mint-green culture">
      <defs>
        <clipPath id="spot-flask-clip">
          <circle cx="60" cy="74" r="27" />
        </clipPath>
      </defs>
      <g strokeLinecap="round" strokeLinejoin="round">
        <circle
          cx="60"
          cy="74"
          r="30"
          fill="#f4fbf8"
          stroke={OUTLINE}
          strokeWidth="3.5"
        />
        <rect
          x="52"
          y="16"
          width="16"
          height="34"
          fill="#f4fbf8"
          stroke={OUTLINE}
          strokeWidth="3.5"
        />
        <g clipPath="url(#spot-flask-clip)">
          <rect
            x="28"
            y="76"
            width="64"
            height="30"
            style={{ fill: "var(--color-primary)" }}
          />
          <path
            d="M30 78 Q 45 72 60 77 T 92 76"
            fill="none"
            stroke="#5fe0d2"
            strokeWidth="4"
          />
          <circle cx="50" cy="88" r="3.4" fill="#eafaf3" opacity="0.9" />
          <circle cx="66" cy="94" r="2.6" fill="#eafaf3" opacity="0.9" />
        </g>
        <circle cx="60" cy="62" r="2.8" fill="#5fe0d2" />
        <circle cx="68" cy="55" r="2.2" fill="#5fe0d2" />
        <rect
          x="46"
          y="11"
          width="28"
          height="9"
          rx="4.5"
          fill="#c9a47c"
          stroke={OUTLINE}
          strokeWidth="3"
        />
      </g>
    </SpotSvg>
  );
}

/** Step 3 — Care: a cat napping under a little teal blanket. */
export function CareSpot() {
  return (
    <SpotSvg label="A cat sleeping peacefully under a small blanket">
      <g strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="58" cy="98" rx="38" ry="7" fill="#9c6a44" opacity="0.15" />
        <path
          d="M30 86 C 28 96 46 102 62 99"
          stroke="#e18c6f"
          strokeWidth="10"
          fill="none"
        />
        <circle
          cx="56"
          cy="72"
          r="29"
          fill="#ec9b80"
          stroke={OUTLINE}
          strokeWidth="3.5"
        />
        <path
          d="M70 30 L 64 44 L 78 46 Z"
          fill="#ec9b80"
          stroke={OUTLINE}
          strokeWidth="3.5"
        />
        <path
          d="M96 34 L 86 44 L 100 50 Z"
          fill="#ec9b80"
          stroke={OUTLINE}
          strokeWidth="3.5"
        />
        <circle
          cx="82"
          cy="54"
          r="19"
          fill="#ec9b80"
          stroke={OUTLINE}
          strokeWidth="3.5"
        />
        <path
          d="M72 54 q 4 3.5 8 0 M88 54 q 4 3.5 8 0"
          stroke="#43321f"
          strokeWidth="2.6"
          fill="none"
        />
        <circle cx="70" cy="62" r="4.5" fill="#f0967f" opacity="0.7" />
        <circle cx="94" cy="62" r="4.5" fill="#f0967f" opacity="0.7" />
        <path
          d="M28 72 Q 54 58 80 74 L 78 90 Q 54 78 32 88 Z"
          style={{ fill: "var(--color-app-teal)" }}
          stroke="#27695a"
          strokeWidth="3.5"
        />
        <path
          d="M36 78 q 8 -3 16 -1 M38 84 q 10 -3 18 0"
          stroke="#27695a"
          strokeWidth="2"
          opacity="0.55"
          fill="none"
        />
      </g>
    </SpotSvg>
  );
}
