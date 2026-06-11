/**
 * Closing-band scene (§20): the cat & dog from behind, sitting together on a
 * hill watching the sun go down — the emotional bookend to the golden-hour
 * hero. Back view = simple shapes (rounded backs, ears, tails), no faces.
 * The dog's tail carries `.js-duo-tail` for a gentle wag. Decorative.
 *
 * Sized by CSS height + `preserveAspectRatio="xMidYMax slice"`: on narrow
 * viewports the sides crop away while the sun and the duo stay in frame and
 * the hills always reach the bottom edge.
 */
export function SunsetDuo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1440 300"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* soft clouds */}
      <g fill="#fff" opacity="0.35">
        <ellipse cx="250" cy="70" rx="55" ry="15" />
        <ellipse cx="305" cy="82" rx="72" ry="17" />
        <ellipse cx="1130" cy="52" rx="64" ry="15" />
        <ellipse cx="1182" cy="64" rx="48" ry="13" />
      </g>

      {/* the sun, settling */}
      <circle cx="620" cy="218" r="170" fill="#ffedc4" opacity="0.45" />
      <circle cx="620" cy="218" r="120" fill="#ffedc4" />
      <circle cx="620" cy="218" r="78" fill="#fff3d6" />

      {/* hills */}
      <path
        d="M -40 300 L -40 262 Q 300 188 760 232 Q 1100 262 1480 240 L 1480 300 Z"
        fill="#f2bd7d"
      />
      <path
        d="M -40 300 L -40 284 Q 420 236 860 262 Q 1160 278 1480 264 L 1480 300 Z"
        style={{ fill: "var(--color-sunset-deep)" }}
      />

      {/* seated shadows */}
      <ellipse cx="869" cy="266" rx="58" ry="9" fill="#8a4f1d" opacity="0.22" />
      <ellipse
        cx="962"
        cy="268"
        rx="68"
        ry="10"
        fill="#8a4f1d"
        opacity="0.22"
      />

      {/* the cat, from behind, leaning toward the dog */}
      <g
        stroke="#7a5230"
        strokeWidth="3.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      >
        <path
          d="M848 254 C 818 258 800 246 794 230 C 790 219 801 213 808 220 C 818 232 832 244 848 246 Z"
          fill="#e18c6f"
        />
        <path
          d="M845 196 C 832 210 826 246 832 262 C 836 270 902 270 906 262 C 912 246 906 210 893 196 Z"
          fill="#e18c6f"
        />
        <path
          d="M856 214 q 14 6 26 0 M852 230 q 16 7 30 0"
          fill="none"
          stroke="#d07c5c"
          strokeWidth="4"
        />
        <path d="M866 158 L 860 132 L 884 148 Z" fill="#e18c6f" />
        <path d="M896 160 L 902 134 L 878 148 Z" fill="#e18c6f" />
        <circle cx="880" cy="176" r="27" fill="#e18c6f" />
      </g>

      {/* the dog, from behind, leaning toward the cat; tail wags */}
      <g
        stroke="#27695a"
        strokeWidth="3.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      >
        <g className="js-duo-tail">
          <path
            d="M1000 246 C 1024 240 1036 220 1032 200 C 1030 190 1016 192 1014 202 C 1010 222 1002 234 992 240 Z"
            fill="#82d5bb"
          />
        </g>
        <path
          d="M932 188 C 918 204 912 248 918 264 C 922 272 1000 272 1004 264 C 1010 248 1004 204 990 188 Z"
          fill="#82d5bb"
        />
        <path
          d="M940 214 q 18 8 36 0"
          fill="none"
          stroke="#6fc6ac"
          strokeWidth="4"
        />
        <circle cx="946" cy="166" r="32" fill="#82d5bb" />
        <path
          d="M922 148 C 912 160 912 182 922 194 C 932 196 938 186 936 170 C 935 158 930 150 922 148 Z"
          fill="#6fc6ac"
        />
        <path
          d="M972 146 C 982 158 982 180 972 192 C 962 194 956 184 958 168 C 959 156 964 148 972 146 Z"
          fill="#6fc6ac"
        />
      </g>
    </svg>
  );
}
