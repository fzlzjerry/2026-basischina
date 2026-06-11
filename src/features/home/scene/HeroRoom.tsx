import { CatMascot, DogMascot } from "./Mascots";

/**
 * Hero scene (§20): the cat & dog at golden hour in a real room — big arched
 * window BEHIND them, light shaft pooling on the floor, shelf, yarn ball, a
 * shared food bowl, and a foreground plant for depth.
 *
 * The SVG background is TRANSPARENT: the wall is the page's warm gradient and
 * the floor is a CSS band painted by HeroSection (full-bleed on lg, local on
 * mobile), so the scene melts into the page with no box edges at any viewport.
 * Ground references for that band: baseboard zone ≈ y 590–656, object ground
 * line ≈ y 700–760 (of the 800-tall viewBox).
 *
 * `preserveAspectRatio="xMaxYMax meet"` keeps everything visible, anchored to
 * the bottom-right so the floor line stays glued to the section bottom and the
 * plant bleeds toward the right edge. Tag the wrapper `.js-hero-pets` for the
 * entrance tween.
 */
export function HeroRoom({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 1000 800"
      preserveAspectRatio="xMaxYMax meet"
      role="img"
      aria-label="A cat and dog sitting side by side on a rug in a warm room at golden hour, beneath a big arched window, with a shared food bowl, a yarn ball, and plants around them."
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
        <radialGradient id="hero-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#ffe3b0" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#ffe3b0" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="hero-shaft" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffeac0" stopOpacity="0.62" />
          <stop offset="100%" stopColor="#ffeac0" stopOpacity="0.1" />
        </linearGradient>
        <radialGradient id="hero-pool" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#ffeac0" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#ffeac0" stopOpacity="0" />
        </radialGradient>
        <clipPath id="hero-winclip">
          <rect x="388" y="118" width="344" height="444" rx="172" />
        </clipPath>
      </defs>

      {/* warm light bleeding around the window onto the wall */}
      <ellipse cx="560" cy="340" rx="350" ry="310" fill="url(#hero-glow)" />

      {/* big arched window, BEHIND the pets */}
      <rect
        x="370"
        y="100"
        width="380"
        height="480"
        rx="190"
        style={{ fill: "var(--color-room-frame)" }}
      />
      <g clipPath="url(#hero-winclip)">
        <rect x="388" y="118" width="344" height="444" fill="url(#hero-sky)" />
        <circle cx="560" cy="330" r="130" fill="url(#hero-sun)" />
        <circle cx="560" cy="332" r="48" fill="#fff2cf" />
        <ellipse cx="470" cy="566" rx="190" ry="92" fill="#bcd9a6" />
        <ellipse cx="655" cy="586" rx="205" ry="104" fill="#a9cf92" />
      </g>
      <rect
        x="553"
        y="118"
        width="14"
        height="444"
        style={{ fill: "var(--color-room-frame)" }}
      />
      <rect
        x="388"
        y="302"
        width="344"
        height="14"
        style={{ fill: "var(--color-room-frame)" }}
      />
      <rect
        x="388"
        y="118"
        width="344"
        height="444"
        rx="172"
        fill="none"
        strokeWidth="14"
        style={{ stroke: "var(--color-room-frame)" }}
      />
      <rect x="336" y="556" width="448" height="24" rx="12" fill="#b98e63" />

      {/* golden light shaft from the window, pooling on the floor */}
      <path
        d="M 410 568 L 262 800 L 878 800 L 728 568 Z"
        fill="url(#hero-shaft)"
      />
      <ellipse cx="545" cy="716" rx="300" ry="52" fill="url(#hero-pool)" />

      {/* wall shelf with a small plant and a framed paw photo */}
      <g>
        <rect
          x="196"
          y="150"
          width="64"
          height="66"
          rx="8"
          fill="#fdf3e2"
          stroke="#b98e63"
          strokeWidth="6"
        />
        <ellipse cx="228" cy="192" rx="10" ry="8" fill="#d9a06b" />
        <circle cx="214" cy="178" r="4.5" fill="#d9a06b" />
        <circle cx="228" cy="172" r="4.5" fill="#d9a06b" />
        <circle cx="242" cy="178" r="4.5" fill="#d9a06b" />
        <g stroke="#5f9d5f" strokeWidth="2.5">
          <path d="M132 214 C 128 196 130 180 136 166" fill="none" />
          <path d="M132 214 C 140 198 148 190 156 184" fill="none" />
          <path
            d="M136 166 C 146 158 150 144 144 132 C 132 138 128 152 136 166 Z"
            fill="#8ac68a"
          />
          <path
            d="M156 184 C 168 180 174 170 172 158 C 160 162 154 172 156 184 Z"
            fill="#9ccf9c"
          />
        </g>
        <path
          d="M116 214 h 38 l -5 26 h -28 Z"
          fill="#d98b69"
          stroke="#b06a4a"
          strokeWidth="3"
        />
        <rect
          x="76"
          y="216"
          width="240"
          height="16"
          rx="8"
          fill="#c9a47c"
          stroke="#b98e63"
          strokeWidth="3"
        />
        <path
          d="M104 232 l 10 22 M288 232 l -10 22"
          stroke="#b98e63"
          strokeWidth="6"
          strokeLinecap="round"
        />
      </g>

      {/* rug grounds the duo */}
      <ellipse cx="530" cy="706" rx="330" ry="56" fill="#f6e2c8" />
      <ellipse
        cx="530"
        cy="706"
        rx="296"
        ry="47"
        fill="none"
        stroke="#d9b67f"
        strokeWidth="4"
        strokeDasharray="14 12"
        opacity="0.8"
      />
      <ellipse cx="530" cy="706" rx="250" ry="40" fill="#efd2b0" />

      {/* yarn ball with a thread running to the cat */}
      <g>
        <path
          d="M 232 722 C 274 738 302 726 336 718"
          fill="none"
          stroke="#f3899a"
          strokeWidth="3"
        />
        <circle
          cx="205"
          cy="712"
          r="30"
          fill="#f3899a"
          stroke="#d96f85"
          strokeWidth="3"
        />
        <path
          d="M182 700 q 24 -8 46 4 M179 716 q 26 -6 50 6 M188 730 q 22 -4 40 2"
          fill="none"
          stroke="#d96f85"
          strokeWidth="2.5"
        />
      </g>

      {/* soft cast shadows bind the pets to the rug */}
      <ellipse
        cx="415"
        cy="714"
        rx="122"
        ry="18"
        fill="#9c6a44"
        opacity="0.22"
      />
      <ellipse
        cx="678"
        cy="718"
        rx="140"
        ry="20"
        fill="#9c6a44"
        opacity="0.22"
      />

      {/* the pets (large — faces are the point) */}
      <g transform="translate(118 116) scale(1.18)">
        <CatMascot idPrefix="hero" />
        <DogMascot idPrefix="hero" />
      </g>

      {/* shared food bowl between them, in front */}
      <g>
        <path
          d="M 488 722 Q 532 766 576 722 Z"
          fill="#d98b69"
          stroke="#b06a4a"
          strokeWidth="3"
        />
        <ellipse
          cx="532"
          cy="722"
          rx="44"
          ry="11"
          fill="#e79a78"
          stroke="#b06a4a"
          strokeWidth="3"
        />
        <circle cx="518" cy="720" r="4" fill="#b06a4a" />
        <circle cx="534" cy="723" r="4" fill="#b06a4a" />
        <circle cx="548" cy="719" r="4" fill="#b06a4a" />
      </g>

      {/* potted plant in front of the dog: depth layer */}
      <g transform="translate(130 -40) scale(1.25)">
        <ellipse
          cx="616"
          cy="648"
          rx="76"
          ry="13"
          fill="#e0bd92"
          opacity="0.5"
        />
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
      </g>

      {/* foreground leaves sweep in from the corner: nearest depth layer */}
      <g stroke="#3f7a4a" strokeWidth="2.5">
        <g transform="translate(968 808) rotate(-38) scale(3.2)">
          <path
            d="M0 0 C 18 -12 18 -44 0 -64 C -18 -44 -18 -12 0 0 Z"
            fill="#4e8b58"
          />
          <path d="M0 -6 L 0 -54" fill="none" />
        </g>
        <g transform="translate(1010 742) rotate(-64) scale(2.6)">
          <path
            d="M0 0 C 18 -12 18 -44 0 -64 C -18 -44 -18 -12 0 0 Z"
            fill="#438350"
          />
          <path d="M0 -6 L 0 -54" fill="none" />
        </g>
        <g transform="translate(922 818) rotate(-14) scale(2.3)">
          <path
            d="M0 0 C 18 -12 18 -44 0 -64 C -18 -44 -18 -12 0 0 Z"
            fill="#5a9a64"
          />
          <path d="M0 -6 L 0 -54" fill="none" />
        </g>
      </g>
    </svg>
  );
}
