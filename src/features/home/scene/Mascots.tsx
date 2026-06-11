/**
 * Inline-SVG cat & dog mascots (cozy Animal Crossing register, brand palette).
 *
 * iGEM forbids binary media in the repo, so the pets are authored entirely as
 * SVG. Each mascot is a self-contained `<g>` (with its own gradient `<defs>`,
 * id-prefixed so multiple instances on one page never collide) drawn in a shared
 * 720x600 scene coordinate space. Sub-groups carry `.js-*` sentinels so the GSAP
 * layer can turn heads, flop ears, sway tails, and blink without touching markup.
 *
 * Used by the hero (Act 0, via `HeroPetScene`) and by the scroll theatre (Act 1,
 * via `CatMascot` / `DogMascot` re-positioned inside the stage SVG).
 */

const CAT_OUTLINE = "#7a5230";
const DOG_OUTLINE = "#27695a";

interface MascotProps {
  /** Unique prefix so gradient ids do not collide across instances. */
  idPrefix: string;
}

export function CatMascot({ idPrefix }: MascotProps) {
  const body = `${idPrefix}-cat-body`;
  return (
    <g
      className="js-cat"
      stroke={CAT_OUTLINE}
      strokeWidth={4}
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      <defs>
        <linearGradient id={body} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ec9b80" />
          <stop offset="100%" stopColor="#e18c6f" />
        </linearGradient>
      </defs>

      {/* tail (left, clean curl — no pale tip blob) */}
      <g className="js-cat-tail">
        <path
          d="M214 474 C 142 492 100 414 138 362 C 160 332 212 342 214 380 C 182 374 154 404 162 438 C 170 470 200 478 232 462 Z"
          fill={`url(#${body})`}
        />
      </g>

      {/* body (short, round, chibi) */}
      <path
        d="M204 322 C 184 352 180 448 198 484 C 210 506 290 506 302 484 C 320 448 316 352 296 322 Z"
        fill={`url(#${body})`}
      />
      <path
        d="M226 360 C 216 404 220 456 236 480 C 250 494 250 494 264 480 C 280 456 284 404 274 360 Z"
        fill="#f8e0d1"
        stroke="none"
      />
      <path
        d="M250 320 C 232 330 230 360 250 374 C 270 360 268 330 250 320 Z"
        fill="#fdf3ec"
        stroke="none"
      />

      {/* front paws + toe beans */}
      <ellipse cx="230" cy="488" rx="23" ry="16" fill="#f3cab4" />
      <ellipse cx="270" cy="488" rx="23" ry="16" fill="#f3cab4" />
      <path
        d="M224 488 v 8 M236 488 v 8 M264 488 v 8 M276 488 v 8"
        stroke="#cf9a82"
        strokeWidth={2.5}
      />

      {/* bell collar */}
      <path
        d="M212 314 C 228 336 272 336 288 314"
        fill="none"
        stroke="#f3899a"
        strokeWidth={11}
      />
      <circle
        cx="250"
        cy="332"
        r="10"
        fill="#f6c453"
        stroke={CAT_OUTLINE}
        strokeWidth={3}
      />
      <path d="M244 330 h 12" stroke={CAT_OUTLINE} strokeWidth={2.5} />
      <circle cx="250" cy="336" r="2" fill={CAT_OUTLINE} stroke="none" />

      <g className="js-cat-head">
        {/* ears */}
        <path d="M206 200 L 188 118 L 258 166 Z" fill={`url(#${body})`} />
        <path d="M294 200 L 312 118 L 242 166 Z" fill={`url(#${body})`} />
        <path d="M214 192 L 203 140 L 246 168 Z" fill="#f4a9b8" stroke="none" />
        <path d="M286 192 L 297 140 L 254 168 Z" fill="#f4a9b8" stroke="none" />

        {/* head (big = cute) */}
        <circle cx="250" cy="242" r="84" fill={`url(#${body})`} />

        {/* tabby forehead stripes */}
        <path
          d="M250 162 q 8 18 0 36"
          fill="none"
          stroke="#d07c5c"
          strokeWidth={5.5}
        />
        <path
          d="M226 170 q 6 16 0 30"
          fill="none"
          stroke="#d07c5c"
          strokeWidth={5.5}
        />
        <path
          d="M274 170 q -6 16 0 30"
          fill="none"
          stroke="#d07c5c"
          strokeWidth={5.5}
        />

        {/* soft muzzle */}
        <ellipse
          cx="250"
          cy="282"
          rx="32"
          ry="21"
          fill="#f9e8db"
          stroke="none"
        />

        {/* cheeks */}
        <circle
          cx="200"
          cy="270"
          r="17"
          fill="#f0967f"
          stroke="none"
          opacity="0.65"
        />
        <circle
          cx="300"
          cy="270"
          r="17"
          fill="#f0967f"
          stroke="none"
          opacity="0.65"
        />

        {/* eyes (big + sparkle) */}
        <ellipse
          className="js-cat-eye"
          cx="224"
          cy="250"
          rx="12"
          ry="16"
          fill="#43321f"
          stroke="none"
        />
        <ellipse
          className="js-cat-eye"
          cx="276"
          cy="250"
          rx="12"
          ry="16"
          fill="#43321f"
          stroke="none"
        />
        <circle cx="228" cy="244" r="5" fill="#fff" stroke="none" />
        <circle cx="280" cy="244" r="5" fill="#fff" stroke="none" />
        <circle
          cx="220"
          cy="256"
          r="2.4"
          fill="#fff"
          stroke="none"
          opacity="0.8"
        />
        <circle
          cx="272"
          cy="256"
          r="2.4"
          fill="#fff"
          stroke="none"
          opacity="0.8"
        />

        {/* heart nose + :3 mouth */}
        <path
          d="M250 286 C 245 279 238 279 238 285 C 238 290 245 292 250 296 C 255 292 262 290 262 285 C 262 279 255 279 250 286 Z"
          fill="#db6f6f"
          stroke="none"
        />
        <path
          d="M250 296 q -8 9 -15 3 M250 296 q 8 9 15 3"
          fill="none"
          stroke="#9c6a44"
          strokeWidth={3}
        />

        {/* whiskers */}
        <path
          d="M198 278 L 150 270 M200 290 L 152 298 M302 278 L 350 270 M300 290 L 348 298"
          fill="none"
          stroke="#c2a087"
          strokeWidth={2.5}
        />
      </g>
    </g>
  );
}

export function DogMascot({ idPrefix }: MascotProps) {
  const body = `${idPrefix}-dog-body`;
  return (
    <g
      className="js-dog"
      stroke={DOG_OUTLINE}
      strokeWidth={4}
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      <defs>
        <linearGradient id={body} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#92ddc6" />
          <stop offset="100%" stopColor="#82d5bb" />
        </linearGradient>
      </defs>

      {/* tail */}
      <path
        className="js-dog-tail"
        d="M470 450 C 540 458 580 410 600 372 C 610 354 596 342 580 352 C 556 372 520 405 470 410"
        fill={`url(#${body})`}
      />

      {/* body */}
      <path
        d="M404 332 C 388 364 384 440 394 484 C 402 512 540 512 548 484 C 558 440 554 364 538 332 Z"
        fill={`url(#${body})`}
      />
      <path
        d="M430 372 C 420 414 422 460 440 484 C 460 498 482 498 502 484 C 520 460 522 414 512 372 Z"
        fill="#d6f1e6"
        stroke="none"
      />

      {/* paws */}
      <ellipse cx="430" cy="492" rx="24" ry="17" fill="#bfe7d6" />
      <ellipse cx="512" cy="492" rx="24" ry="17" fill="#bfe7d6" />

      {/* collar */}
      <path
        d="M414 338 C 446 360 496 360 528 338"
        fill="none"
        stroke="#e18c6f"
        strokeWidth={13}
      />
      <circle
        cx="471"
        cy="356"
        r="11"
        style={{ fill: "var(--color-primary)" }}
        stroke={DOG_OUTLINE}
        strokeWidth={3}
      />

      <g className="js-dog-head">
        {/* floppy ears */}
        <path
          className="js-dog-ear"
          d="M404 214 C 366 224 356 300 380 344 C 404 356 424 330 424 296 C 424 256 420 226 404 214 Z"
          fill="#6fc6ac"
        />
        <path
          className="js-dog-ear"
          d="M540 214 C 578 224 588 300 564 344 C 540 356 520 330 520 296 C 520 256 524 226 540 214 Z"
          fill="#6fc6ac"
        />

        {/* head */}
        <circle cx="472" cy="262" r="84" fill={`url(#${body})`} />

        {/* eye patch */}
        <ellipse
          cx="446"
          cy="252"
          rx="26"
          ry="30"
          fill="#6fc6ac"
          stroke="none"
        />

        {/* muzzle */}
        <ellipse
          cx="472"
          cy="300"
          rx="46"
          ry="34"
          fill="#eafaf3"
          stroke="none"
        />

        {/* cheeks */}
        <circle
          cx="424"
          cy="296"
          r="15"
          fill="#6fc6ac"
          stroke="none"
          opacity="0.6"
        />
        <circle
          cx="520"
          cy="296"
          r="15"
          fill="#6fc6ac"
          stroke="none"
          opacity="0.6"
        />

        {/* eyes */}
        <ellipse
          className="js-dog-eye"
          cx="446"
          cy="256"
          rx="11"
          ry="15"
          fill="#3a2e22"
          stroke="none"
        />
        <ellipse
          className="js-dog-eye"
          cx="498"
          cy="256"
          rx="11"
          ry="15"
          fill="#3a2e22"
          stroke="none"
        />
        <circle cx="450" cy="250" r="5" fill="#fff" stroke="none" />
        <circle cx="502" cy="250" r="5" fill="#fff" stroke="none" />
        <circle
          cx="442"
          cy="261"
          r="2.2"
          fill="#fff"
          stroke="none"
          opacity="0.8"
        />
        <circle
          cx="494"
          cy="261"
          r="2.2"
          fill="#fff"
          stroke="none"
          opacity="0.8"
        />

        {/* nose */}
        <ellipse
          cx="472"
          cy="288"
          rx="13"
          ry="10"
          fill="#33473f"
          stroke="none"
        />

        {/* mouth + tongue */}
        <path
          d="M472 298 L 472 312 M472 312 q -14 14 -26 2 M472 312 q 14 14 26 2"
          fill="none"
          stroke={DOG_OUTLINE}
          strokeWidth={3}
        />
        <path d="M464 316 q 8 16 16 0 Z" fill="#ef8fa0" stroke="none" />
      </g>
    </g>
  );
}

/**
 * Full hero scene: warm spotlight + soft mat + both mascots, sized to its 720x600
 * viewBox. Decorative, so the whole SVG is aria-hidden (the headline carries the
 * meaning). Wrap it in an element tagged `.js-hero-pets` for the entrance tween.
 */
export function HeroPetScene({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 720 600"
      role="img"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="hero-spot" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#fff3e2" />
          <stop offset="55%" stopColor="#fdeede" />
          <stop offset="100%" stopColor="#f8f8f0" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="360" cy="280" r="300" fill="url(#hero-spot)" />
      <ellipse cx="360" cy="520" rx="270" ry="42" fill="#efe7d3" />
      <ellipse cx="360" cy="516" rx="250" ry="34" fill="#f7f3df" />
      <CatMascot idPrefix="hero" />
      <DogMascot idPrefix="hero" />
    </svg>
  );
}
