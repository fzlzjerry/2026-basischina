/**
 * Closing-band scene (§20): the cat & dog from behind, sitting shoulder to
 * shoulder on a hill watching the sun go down — the emotional bookend to the
 * homepage. Back view = simple shapes (rounded backs, ears, tails), no faces;
 * the pair touch (bodies overlap, heads lean together) so the beat reads as
 * togetherness, and the dog's floppy ears break the head silhouette so the
 * species stays readable from behind. `.js-duo-tail` wags. Decorative.
 *
 * HEAL register: the scene is DRAWN, not vector-clean — the sun wears a
 * hand-traced outline arc and marker rays, clouds are lobed doodles, the
 * hill crests meander like the hand-cut dividers, and the slope carries
 * grass tufts, pebbles and a paw trail walking up to the pair (the same
 * trail motif as the Approach section). The section lays `.heal-grid`
 * under this SVG, so its transparent sky reads as graph paper.
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
      {/* lobed doodle clouds, flat-bottomed, with a soft warm outline */}
      <g
        fill="#fffaf0"
        fillOpacity="0.55"
        stroke="#e8b877"
        strokeOpacity="0.4"
        strokeWidth="2.5"
        strokeLinejoin="round"
      >
        <path d="M 190 84 Q 195 63 220 65 Q 231 47 257 53 Q 281 45 291 62 Q 311 62 307 81 Q 299 92 281 88 Q 250 96 222 90 Q 199 94 190 84 Z" />
        <path d="M 1096 62 Q 1101 46 1121 48 Q 1130 34 1151 39 Q 1170 33 1178 47 Q 1194 48 1190 63 Q 1183 72 1168 69 Q 1143 76 1121 71 Q 1103 74 1096 62 Z" />
        <path d="M 1222 102 Q 1226 90 1241 92 Q 1249 82 1264 86 Q 1277 83 1282 93 Q 1292 95 1288 105 Q 1281 112 1270 109 Q 1251 114 1236 110 Q 1225 112 1222 102 Z" />
      </g>

      {/* distant gulls: two quick marker strokes each */}
      <g
        fill="none"
        stroke="#8a5a30"
        strokeOpacity="0.5"
        strokeWidth="2.5"
        strokeLinecap="round"
      >
        <path d="M 412 92 q 8 -7 16 0 q 8 -7 16 0" />
        <path d="M 476 70 q 6 -5 12 0 q 6 -5 12 0" />
        <path d="M 1040 96 q 7 -6 14 0 q 7 -6 14 0" />
      </g>

      {/* the sun, settling: soft glow discs stay smooth, but the rim is
          hand-traced in two broken arcs and marker rays fan out above */}
      <circle cx="620" cy="218" r="170" fill="#ffedc4" opacity="0.45" />
      <circle cx="620" cy="218" r="120" fill="#ffedc4" />
      <circle cx="620" cy="218" r="78" fill="#fff3d6" />
      <g
        fill="none"
        stroke="#e89a4f"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeOpacity="0.85"
      >
        {/* traced rim, drawn in two passes with a gap (never a perfect circle) */}
        <path d="M 508 167 C 520 120 574 92 651 98" />
        <path d="M 692 114 C 730 128 745 164 742 206" />
        {/* rays: irregular angles and lengths */}
        <path d="M 488 142 L 457 124" />
        <path d="M 533 94 L 515 69" />
        <path d="M 594 70 L 586 26" />
        <path d="M 647 65 L 652 36" />
        <path d="M 706 95 L 729 62" />
        <path d="M 751 136 L 777 120" />
        <path d="M 769 197 L 796 193" />
      </g>
      {/* horizon haze: two loose strokes beside the sun */}
      <g
        fill="none"
        stroke="#e89a4f"
        strokeWidth="3"
        strokeLinecap="round"
        strokeOpacity="0.3"
      >
        <path d="M 396 196 q 42 -5 84 0" />
        <path d="M 1004 206 q 36 -4 72 0" />
      </g>

      {/* hills: crests meander like the hand-cut dividers, never one smooth
          sweep */}
      <path
        d="M -40 300 L -40 260 C 80 244 180 226 300 212 C 380 203 440 203 520 207 C 600 211 660 218 760 226 C 860 234 960 242 1060 242 C 1160 242 1240 234 1330 229 C 1390 226 1440 227 1480 225 L 1480 300 Z"
        fill="#f2bd7d"
      />
      {/* details on the back slope, in the strip the front hill leaves open */}
      <g fill="none" stroke="#c9863f" strokeWidth="2.5" strokeLinecap="round">
        <path d="M 180 236 c -1 -5 -3 -8 -6 -10 M 180 236 c 0 -6 0 -9 1 -12 M 180 236 c 2 -5 4 -7 6 -9" />
        <path d="M 398 230 c -1 -5 -3 -8 -6 -10 M 398 230 c 0 -6 0 -9 1 -12 M 398 230 c 2 -5 4 -7 6 -9" />
      </g>
      <path
        d="M -40 300 L -40 276 C 60 268 150 258 250 252 C 310 248 340 252 410 244 C 470 238 520 240 600 236 C 660 233 700 238 760 238 C 830 238 880 234 950 238 C 1020 243 1060 250 1130 249 C 1200 248 1260 241 1330 244 C 1380 246 1430 245 1480 243 L 1480 300 Z"
        style={{ fill: "var(--color-sunset-deep)" }}
      />

      {/* paw trail walking up the slope to the pair (Approach motif) */}
      <g fill="#8a4f1d" fillOpacity="0.38">
        {[
          { x: 500, y: 288, s: 1.05, r: -14 },
          { x: 575, y: 279, s: 0.95, r: 12 },
          { x: 648, y: 269, s: 0.85, r: -10 },
          { x: 718, y: 259, s: 0.78, r: 14 },
          { x: 782, y: 250, s: 0.7, r: -8 },
        ].map((p) => (
          <g
            key={`${p.x}-${p.y}`}
            transform={`translate(${p.x} ${p.y}) rotate(${p.r}) scale(${p.s})`}
          >
            <ellipse cx="0" cy="6" rx="8" ry="6" />
            <circle cx="-9" cy="-3" r="3.4" />
            <circle cx="0" cy="-7" r="3.4" />
            <circle cx="9" cy="-3" r="3.4" />
          </g>
        ))}
      </g>

      {/* grass tufts + pebbles scattered on the front slope */}
      <g
        fill="none"
        stroke="#a2622a"
        strokeOpacity="0.8"
        strokeWidth="2.5"
        strokeLinecap="round"
      >
        <path d="M 120 268 c -1 -6 -4 -10 -7 -12 M 120 268 c 0 -7 0 -11 1 -14 M 120 268 c 2 -6 5 -9 8 -11" />
        <path d="M 214 284 c -1 -6 -4 -10 -7 -12 M 214 284 c 0 -7 0 -11 1 -14 M 214 284 c 2 -6 5 -9 8 -11" />
        <path d="M 332 262 c -1 -5 -3 -8 -6 -10 M 332 262 c 0 -6 0 -10 1 -12 M 332 262 c 2 -5 4 -8 7 -10" />
        <path d="M 452 256 c -1 -5 -3 -8 -6 -10 M 452 256 c 0 -6 0 -10 1 -12 M 452 256 c 2 -5 4 -8 7 -10" />
        <path d="M 748 256 c -1 -5 -3 -8 -6 -10 M 748 256 c 0 -6 0 -10 1 -12 M 748 256 c 2 -5 4 -8 7 -10" />
        <path d="M 1024 254 c -1 -5 -3 -8 -6 -10 M 1024 254 c 0 -6 0 -10 1 -12 M 1024 254 c 2 -5 4 -8 7 -10" />
        <path d="M 1108 264 c -1 -6 -4 -10 -7 -12 M 1108 264 c 0 -7 0 -11 1 -14 M 1108 264 c 2 -6 5 -9 8 -11" />
        <path d="M 1226 274 c -1 -6 -4 -10 -7 -12 M 1226 274 c 0 -7 0 -11 1 -14 M 1226 274 c 2 -6 5 -9 8 -11" />
        <path d="M 1342 260 c -1 -5 -3 -8 -6 -10 M 1342 260 c 0 -6 0 -10 1 -12 M 1342 260 c 2 -5 4 -8 7 -10" />
      </g>
      <g
        fill="#d98a48"
        fillOpacity="0.55"
        stroke="#8a4f1d"
        strokeOpacity="0.3"
        strokeWidth="2"
      >
        <ellipse cx="282" cy="291" rx="9" ry="5" />
        <ellipse cx="1152" cy="287" rx="7" ry="4.5" />
        <ellipse cx="1396" cy="291" rx="10" ry="5" />
      </g>

      {/* the duo, shifted up-left so neither viewport crops nor the footer
          scallop ever cut into them. x-52 keeps the wagging tail inside the
          xMidYMax slice window down to 375px-wide viewports (h-56 shows
          ~502 viewBox units centered on 720). */}
      <g transform="translate(-52 -26)">
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
          {/* tail stripes, same deep coral as the back stripes */}
          <path
            d="M836 241 q 1 7 -2 11 M818 226 q 2 6 -1 10"
            fill="none"
            stroke="#d07c5c"
            strokeWidth="3.5"
          />
          <path d="M877 158 L 871 132 L 895 148 Z" fill="#e18c6f" />
          <path d="M907 160 L 913 134 L 889 148 Z" fill="#e18c6f" />
          {/* inner ears */}
          <path
            d="M879 151 L 875 137 L 889 147 Z"
            fill="#d07c5c"
            stroke="none"
          />
          <path
            d="M905 153 L 909 139 L 895 148 Z"
            fill="#d07c5c"
            stroke="none"
          />
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
          {/* cowlick tuft */}
          <path
            d="M934 136 q 1 -8 -3 -12 M940 135 q 2 -8 7 -11"
            fill="none"
            strokeWidth="3"
          />
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
