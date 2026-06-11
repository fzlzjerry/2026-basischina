/**
 * Closing-band scene (§20): the cat & dog from behind, sitting shoulder to
 * shoulder on a hill watching the sun go down — the emotional bookend to the
 * golden-hour hero. Back view = simple shapes (rounded backs, ears, tails),
 * no faces; the pair touch (bodies overlap, heads lean together) so the beat
 * reads as togetherness, and the dog's floppy ears break the head silhouette
 * so the species stays readable from behind. `.js-duo-tail` wags. Decorative.
 *
 * Sized by CSS height + `preserveAspectRatio="xMidYMax slice"`: on narrow
 * viewports the sides crop away while the sun and the duo stay in frame and
 * the hills always reach the bottom edge. The duo sits high enough that the
 * footer's scalloped brown edge (which bites into this section's bottom on
 * the homepage) never covers them.
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
        d="M -40 300 L -40 262 Q 300 188 760 228 Q 1100 256 1480 238 L 1480 300 Z"
        fill="#f2bd7d"
      />
      <path
        d="M -40 300 L -40 278 Q 420 224 840 240 Q 1140 252 1480 246 L 1480 300 Z"
        style={{ fill: "var(--color-sunset-deep)" }}
      />

      {/* the duo, shifted up-left so neither viewport crops nor the footer
          scallop ever cut into them */}
      <g transform="translate(-22 -26)">
        {/* seated shadows */}
        <ellipse
          cx="880"
          cy="266"
          rx="56"
          ry="9"
          fill="#8a4f1d"
          opacity="0.22"
        />
        <ellipse
          cx="952"
          cy="268"
          rx="66"
          ry="10"
          fill="#8a4f1d"
          opacity="0.22"
        />

        {/* the cat, leaning toward the dog */}
        <g
          stroke="#7a5230"
          strokeWidth="3.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        >
          <path
            d="M859 254 C 829 258 811 246 805 230 C 801 219 812 213 819 220 C 829 232 843 244 859 246 Z"
            fill="#e18c6f"
          />
          <path
            d="M856 196 C 843 210 837 246 843 262 C 847 270 913 270 917 262 C 923 246 917 210 904 196 Z"
            fill="#e18c6f"
          />
          <path
            d="M867 214 q 14 6 26 0 M863 230 q 16 7 30 0"
            fill="none"
            stroke="#d07c5c"
            strokeWidth="4"
          />
          <path d="M877 158 L 871 132 L 895 148 Z" fill="#e18c6f" />
          <path d="M907 160 L 913 134 L 889 148 Z" fill="#e18c6f" />
          <circle cx="891" cy="176" r="27" fill="#e18c6f" />
        </g>

        {/* the dog, leaning toward the cat; floppy ears drape down the sides
            of the head and break its outline; tail wags */}
        <g
          stroke="#27695a"
          strokeWidth="3.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        >
          <g className="js-duo-tail">
            <path
              d="M991 246 C 1013 240 1023 222 1019 204 C 1017 194 1005 196 1003 206 C 999 224 993 234 983 240 Z"
              fill="#82d5bb"
            />
          </g>
          <path
            d="M923 188 C 909 204 903 248 909 264 C 913 272 991 272 995 264 C 1001 248 995 204 981 188 Z"
            fill="#82d5bb"
          />
          <path
            d="M931 214 q 18 8 36 0"
            fill="none"
            stroke="#6fc6ac"
            strokeWidth="4"
          />
          <circle cx="938" cy="166" r="32" fill="#82d5bb" />
          <path
            d="M912 142 C 900 150 894 170 898 190 C 906 198 916 190 916 172 C 916 160 915 148 912 142 Z"
            fill="#6fc6ac"
          />
          <path
            d="M964 142 C 976 150 982 170 978 190 C 970 198 960 190 960 172 C 960 160 961 148 964 142 Z"
            fill="#6fc6ac"
          />
        </g>
      </g>
    </svg>
  );
}
