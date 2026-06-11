import { CatMascot, DogMascot } from "./Mascots";

/**
 * Hero scene (§20): the cat & dog sitting together by a golden-hour window with
 * a potted plant. Drawn EDGELESS — no card frame, no filled background panel —
 * so it blends straight into the page's warm gradient (a framed box read as a
 * sticker pasted on the page). All artwork stays inside the 760x700 viewBox so
 * nothing clips. Decorative as a whole (the headline carries the meaning), but
 * labelled for assistive tech. Tag the wrapper `.js-hero-pets` for the entrance.
 */
export function HeroRoom({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 760 700"
      role="img"
      aria-label="A cat and dog sitting together by a window at golden hour, beside a potted plant."
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="hero-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#bcd3ea" />
          <stop offset="48%" stopColor="#ffcfa0" />
          <stop offset="100%" stopColor="#ffe6ad" />
        </linearGradient>
        <radialGradient id="hero-sun" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#fff6e2" />
          <stop offset="55%" stopColor="#ffdfa1" />
          <stop offset="100%" stopColor="#ffdfa1" stopOpacity="0" />
        </radialGradient>
        <clipPath id="hero-winclip">
          <rect x="150" y="92" width="300" height="330" rx="150" />
        </clipPath>
      </defs>

      {/* arched window (a window on the page-as-wall — no separate wall panel) */}
      <rect x="132" y="74" width="336" height="366" rx="168" fill="#c9a47c" />
      <g clipPath="url(#hero-winclip)">
        <rect x="150" y="92" width="300" height="330" fill="url(#hero-sky)" />
        <circle cx="300" cy="250" r="120" fill="url(#hero-sun)" />
        <circle cx="300" cy="252" r="46" fill="#fff2cf" />
        <ellipse cx="220" cy="430" rx="150" ry="80" fill="#bcd9a6" />
        <ellipse cx="380" cy="450" rx="160" ry="90" fill="#a9cf92" />
      </g>
      <rect
        x="150"
        y="92"
        width="300"
        height="330"
        rx="150"
        fill="none"
        stroke="#c9a47c"
        strokeWidth="14"
      />
      <rect x="293" y="92" width="14" height="330" fill="#c9a47c" />
      <rect x="150" y="250" width="300" height="14" fill="#c9a47c" />
      <rect x="118" y="432" width="364" height="18" rx="9" fill="#b98e63" />

      {/* potted plant (kept fully inside the frame) */}
      <ellipse cx="616" cy="648" rx="76" ry="13" fill="#e0bd92" opacity="0.5" />
      <g>
        <path
          d="M616 552 C 608 474 606 408 616 356"
          fill="none"
          stroke="#6aa86a"
          strokeWidth="6"
        />
        <path
          d="M616 552 C 628 486 644 448 660 418"
          fill="none"
          stroke="#6aa86a"
          strokeWidth="6"
        />
        <path
          d="M616 552 C 612 492 592 458 570 440"
          fill="none"
          stroke="#6aa86a"
          strokeWidth="6"
        />
        <g stroke="#5f9d5f" strokeWidth="3">
          <g transform="translate(616 356) rotate(-3) scale(2)">
            <path
              d="M0 0 C 18 -12 18 -44 0 -64 C -18 -44 -18 -12 0 0 Z"
              fill="#8ac68a"
            />
            <path d="M0 -6 L 0 -54" fill="none" />
          </g>
          <g transform="translate(570 440) rotate(-42) scale(1.55)">
            <path
              d="M0 0 C 18 -12 18 -44 0 -64 C -18 -44 -18 -12 0 0 Z"
              fill="#7bbd7b"
            />
            <path d="M0 -6 L 0 -54" fill="none" />
          </g>
          <g transform="translate(660 418) rotate(40) scale(1.55)">
            <path
              d="M0 0 C 18 -12 18 -44 0 -64 C -18 -44 -18 -12 0 0 Z"
              fill="#7bbd7b"
            />
            <path d="M0 -6 L 0 -54" fill="none" />
          </g>
          <g transform="translate(596 382) rotate(-24) scale(1.4)">
            <path
              d="M0 0 C 18 -12 18 -44 0 -64 C -18 -44 -18 -12 0 0 Z"
              fill="#9ccf9c"
            />
            <path d="M0 -6 L 0 -54" fill="none" />
          </g>
          <g transform="translate(640 384) rotate(22) scale(1.4)">
            <path
              d="M0 0 C 18 -12 18 -44 0 -64 C -18 -44 -18 -12 0 0 Z"
              fill="#9ccf9c"
            />
            <path d="M0 -6 L 0 -54" fill="none" />
          </g>
        </g>
      </g>
      <path
        d="M572 544 h 88 l -11 86 q -2 14 -16 14 h -34 q -14 0 -16 -14 Z"
        fill="#d98b69"
        stroke="#b06a4a"
        strokeWidth="4"
      />
      <rect
        x="564"
        y="528"
        width="104"
        height="24"
        rx="12"
        fill="#e79a78"
        stroke="#b06a4a"
        strokeWidth="4"
      />

      {/* soft rug grounds the pets (no floor plane = no box edge) */}
      <ellipse cx="318" cy="612" rx="248" ry="46" fill="#efd2b0" />
      <ellipse cx="318" cy="612" rx="196" ry="34" fill="#f6e2c8" />
      <ellipse
        cx="300"
        cy="630"
        rx="180"
        ry="24"
        fill="#c79a6c"
        opacity="0.35"
      />

      {/* the pets */}
      <g transform="translate(20 150) scale(0.82)">
        <CatMascot idPrefix="hero" />
        <DogMascot idPrefix="hero" />
      </g>
    </svg>
  );
}
