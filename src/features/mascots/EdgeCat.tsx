import { useRef } from "react";
import { useLocation } from "react-router-dom";
import { gsap, registerGsap, useGSAP } from "@/shared/motion/gsap";
import { resolveEdgeCatVariant, type EdgeCatColor } from "./edgeCatConfig";

/**
 * Edge cat — a decorative desktop-pet that peeks in from whichever screen edge
 * the cursor approaches. At rest (cursor not near any edge) the cat tucks
 * itself mostly off-screen so only the tips of its ears show; when the cursor
 * enters the edge hover-zone (top/bottom/left/right) the cat slides out to
 * reveal its whole head + tail. One cat per page (color / mood / home corner
 * vary by route via edgeCatConfig). Purely decorative on touch / small
 * viewports — gated by `gsap.matchMedia` for reduced-motion, `lg+` width and
 * fine pointer.
 *
 * Motion follows the repo GSAP contract: everything lives inside `useGSAP`
 * (client-only, never during the vite-react-ssg prerender), with `mm.revert()`
 * cleanup, and GSAP owns transforms on the animated nodes (the outer wrapper's
 * translate/rotate plus the inner `.js-edge-cat-*` sentinels) — no Tailwind
 * transforms there.
 */

const OUTLINE = "#7a5230";

// Rendered cat size (px). The SVG viewBox is 160x200 so this keeps proportions.
const CAT_W = 120;
const CAT_H = 160;

// Cursor distance (px) from any screen edge that activates the peek.
const EDGE_THRESHOLD = 76;
// How far the cat retracts off-screen when idle, as a fraction of its size.
// 0.84 means only ~16% (ear tips + top of head) stays visible -- "a small part of head".
const RETRACT = 0.84;
// Margin from the viewport corner for the resting (home) position.
const HOME_MARGIN = 24;

type Edge = "top" | "bottom" | "left" | "right";

interface ColorScheme {
  body: string;
  body2: string;
  stripe: string;
  paw: string;
  innerEar: string;
  cheek: string;
}

const COLOR_SCHEMES: Record<EdgeCatColor, ColorScheme> = {
  peach: {
    body: "#ec9b80",
    body2: "#e18c6f",
    stripe: "#d07c5c",
    paw: "#f3cab4",
    innerEar: "#f4a9b8",
    cheek: "#f0967f",
  },
  ginger: {
    body: "#e8a87c",
    body2: "#d68f5c",
    stripe: "#b8703c",
    paw: "#f0c8a8",
    innerEar: "#f4b8a0",
    cheek: "#e88f6a",
  },
  cream: {
    body: "#f9e8db",
    body2: "#ead7c2",
    stripe: "#c9b496",
    paw: "#fdf3ec",
    innerEar: "#f4d9c6",
    cheek: "#e8c9b0",
  },
  grey: {
    body: "#c4b8a8",
    body2: "#a89a86",
    stripe: "#8a7e6a",
    paw: "#d8d0c4",
    innerEar: "#d4c8b8",
    cheek: "#b8a896",
  },
};

interface EdgeLayout {
  rotation: number;
  cx: (vw: number, vh: number, peek: number) => number;
  cy: (vw: number, vh: number, peek: number) => number;
}

/**
 * Per-edge placement. cx/cy return the cat's center as a function of viewport
 * size + peek (0..1). peek=1 = fully on-screen (popped); peek=0 = mostly pushed
 * off-screen beyond that edge so only ~16% (the head/ears side) stays visible.
 * The cat SVG is drawn head-up, so rotation orients the head to point inward
 * for each edge.
 */
function edgeLayout(edge: Edge, homeLeft: boolean): EdgeLayout {
  switch (edge) {
    case "bottom":
      return {
        rotation: 0,
        cx: (vw) =>
          homeLeft ? HOME_MARGIN + CAT_W / 2 : vw - HOME_MARGIN - CAT_W / 2,
        cy: (_vw, vh, peek) => vh - CAT_H / 2 + (1 - peek) * CAT_H * RETRACT,
      };
    case "top":
      return {
        rotation: 180,
        cx: (vw) => vw / 2,
        cy: (_vw, _vh, peek) => CAT_H / 2 - (1 - peek) * CAT_H * RETRACT,
      };
    case "left":
      return {
        rotation: 90,
        cx: (_vw, _vh, peek) => CAT_W / 2 - (1 - peek) * CAT_W * RETRACT,
        cy: (_vw, vh) => vh / 2,
      };
    case "right":
      return {
        rotation: -90,
        cx: (vw, _vh, peek) => vw - CAT_W / 2 + (1 - peek) * CAT_W * RETRACT,
        cy: (_vw, vh) => vh / 2,
      };
  }
}

export function EdgeCat() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const location = useLocation();
  const variant = resolveEdgeCatVariant(location.pathname);
  const colors = COLOR_SCHEMES[variant.colors];
  const homeLeft = variant.side === "left";
  const sleepy = variant.mood === "sleepy";

  useGSAP(
    () => {
      registerGsap();
      const wrap = wrapRef.current;
      const svg = svgRef.current;
      if (!wrap || !svg) return;

      const mm = gsap.matchMedia();

      mm.add(
        "(prefers-reduced-motion: no-preference) and (min-width: 1024px) and (pointer: fine)",
        () => {
          const cleanups: Array<() => void> = [];

          // --- Placement state ---
          let currentEdge: Edge = "bottom";
          const proxy = { peek: 0 }; // 0 = retracted, 1 = popped out
          const activeEdge = { current: null as Edge | null };
          let popTween: gsap.core.Tween | null = null;

          const apply = () => {
            const vw = window.innerWidth;
            const vh = window.innerHeight;
            const lay = edgeLayout(currentEdge, homeLeft);
            const cx = lay.cx(vw, vh, proxy.peek);
            const cy = lay.cy(vw, vh, proxy.peek);
            gsap.set(wrap, {
              x: cx - CAT_W / 2,
              y: cy - CAT_H / 2,
              rotation: lay.rotation,
              transformOrigin: "50% 50%",
            });
            // Only catch clicks when popped enough; retracted = no interference.
            svg.style.pointerEvents = proxy.peek > 0.6 ? "auto" : "none";
          };
          apply();
          // Reveal (was visibility:hidden in markup to avoid prerender flash).
          gsap.set(wrap, { autoAlpha: 1 });

          // --- Idle micro-animations (head bob + tail sway) ---
          const idle = gsap.timeline({ repeat: -1 });
          idle
            .to(
              ".js-edge-cat-head",
              {
                y: -3,
                duration: 2.4,
                ease: "sine.inOut",
                yoyo: true,
                repeat: 1,
              },
              0,
            )
            .to(
              ".js-edge-cat-tail",
              {
                rotation: sleepy ? 4 : 7,
                duration: sleepy ? 3.2 : 1.7,
                ease: "sine.inOut",
                yoyo: true,
                repeat: 1,
                transformOrigin: "bottom left",
              },
              0,
            );

          // --- Blink (alert) or floating z (sleepy) ---
          let blink: gsap.core.Timeline | null = null;
          if (!sleepy) {
            blink = gsap.timeline({
              repeat: -1,
              repeatDelay: gsap.utils.random(2.6, 4.6),
            });
            blink
              .to(".js-edge-cat-eye", {
                scaleY: 0.12,
                duration: 0.08,
                ease: "power2.in",
                transformOrigin: "center",
              })
              .to(".js-edge-cat-eye", {
                scaleY: 1,
                duration: 0.1,
                ease: "power2.out",
                transformOrigin: "center",
              });
          } else {
            const z = gsap.timeline({ repeat: -1, repeatDelay: 1.4 });
            z.fromTo(
              ".js-edge-cat-z",
              { y: 0, autoAlpha: 0, scale: 0.7 },
              {
                y: -14,
                autoAlpha: 1,
                scale: 1,
                duration: 1.6,
                ease: "sine.out",
              },
            ).to(".js-edge-cat-z", {
              autoAlpha: 0,
              duration: 0.6,
              ease: "power2.in",
            });
          }

          // --- Pupil cursor-tracking (only at bottom edge, natural orientation) ---
          let pupilX: ((v: number) => void) | null = null;
          let pupilY: ((v: number) => void) | null = null;
          if (!sleepy) {
            pupilX = gsap.quickTo(".js-edge-cat-pupil", "x", {
              duration: 0.4,
              ease: "power2.out",
            });
            pupilY = gsap.quickTo(".js-edge-cat-pupil", "y", {
              duration: 0.4,
              ease: "power2.out",
            });
          }

          // --- Edge change: pop out / retract ---
          const onEdgeChange = (next: Edge | null) => {
            if (next) {
              const switching = next !== currentEdge;
              if (switching) {
                // Crossfade masks the position/rotation snap to the new edge.
                gsap.to(wrap, {
                  autoAlpha: 0,
                  duration: 0.1,
                  onComplete: () => {
                    currentEdge = next;
                    apply();
                  },
                });
                gsap.to(wrap, { autoAlpha: 1, duration: 0.22, delay: 0.1 });
              }
              popTween?.kill();
              popTween = gsap.to(proxy, {
                peek: 1,
                duration: 0.45,
                delay: switching ? 0.1 : 0,
                ease: "power3.out",
                onUpdate: apply,
              });
              // Hover behaviors: ears perk + tail swish + faster blink.
              gsap.to(".js-edge-cat-ear", {
                y: -2,
                duration: 0.25,
                ease: "power2.out",
                stagger: 0.04,
              });
              gsap.to(".js-edge-cat-tail", {
                rotation: sleepy ? 10 : 16,
                duration: 0.4,
                ease: "power2.out",
                transformOrigin: "bottom left",
              });
              if (blink) blink.timeScale(2.6);
            } else {
              // Retract in place (keep currentEdge); only ear tips remain.
              popTween?.kill();
              popTween = gsap.to(proxy, {
                peek: 0,
                duration: 0.5,
                ease: "power3.in",
                onUpdate: apply,
              });
              gsap.to(".js-edge-cat-ear", {
                y: 0,
                duration: 0.3,
                ease: "power2.out",
              });
              gsap.to(".js-edge-cat-tail", {
                rotation: 0,
                duration: 0.4,
                ease: "power2.out",
                transformOrigin: "bottom left",
              });
              if (blink) blink.timeScale(1);
            }
          };

          // --- Pointer move: edge detection + pupil tracking ---
          const onPointerMove = (e: PointerEvent) => {
            const vw = window.innerWidth;
            const vh = window.innerHeight;
            const dt = e.clientY;
            const db = vh - e.clientY;
            const dl = e.clientX;
            const dr = vw - e.clientX;
            const min = Math.min(dt, db, dl, dr);
            let next: Edge | null = null;
            if (min <= EDGE_THRESHOLD) {
              if (min === dt) next = "top";
              else if (min === db) next = "bottom";
              else if (min === dl) next = "left";
              else next = "right";
            }
            if (next !== activeEdge.current) {
              activeEdge.current = next;
              onEdgeChange(next);
            }
            if (pupilX && pupilY && currentEdge === "bottom") {
              const rect = svg.getBoundingClientRect();
              const cxr = rect.left + rect.width / 2;
              const cyr = rect.top + rect.height / 2;
              const dx = (e.clientX - cxr) / rect.width;
              const dy = (e.clientY - cyr) / rect.height;
              pupilX(gsap.utils.clamp(-3, 3, dx * 6));
              pupilY(gsap.utils.clamp(-2, 2, dy * 4));
            }
          };
          window.addEventListener("pointermove", onPointerMove, {
            passive: true,
          });
          cleanups.push(() =>
            window.removeEventListener("pointermove", onPointerMove),
          );

          // --- Recompute on resize (viewport-dependent placement) ---
          const onResize = () => apply();
          window.addEventListener("resize", onResize);
          cleanups.push(() => window.removeEventListener("resize", onResize));

          // --- Click: stretch-hop (only meaningful when popped out) ---
          let stretching = false;
          const onClick = () => {
            if (stretching) return;
            stretching = true;
            const tl = gsap.timeline({
              onComplete: () => {
                stretching = false;
              },
            });
            tl.to(
              ".js-edge-cat-paws",
              { y: 7, duration: 0.18, ease: "power2.out" },
              0,
            )
              .to(
                ".js-edge-cat-head",
                {
                  y: 6,
                  scaleY: 0.94,
                  duration: 0.2,
                  ease: "power2.out",
                  transformOrigin: "bottom center",
                },
                0,
              )
              .to(
                ".js-edge-cat",
                { y: -10, duration: 0.18, ease: "power2.out" },
                0.06,
              )
              .to(".js-edge-cat", {
                y: 0,
                duration: 0.5,
                ease: "bounce.out",
              })
              .to(
                ".js-edge-cat-head",
                {
                  y: 0,
                  scaleY: 1,
                  duration: 0.3,
                  ease: "power2.out",
                  transformOrigin: "bottom center",
                },
                "<",
              )
              .to(
                ".js-edge-cat-paws",
                { y: 0, duration: 0.3, ease: "power2.out" },
                "<",
              );
          };
          svg.addEventListener("click", onClick);
          cleanups.push(() => svg.removeEventListener("click", onClick));

          return () => {
            idle.kill();
            blink?.kill();
            cleanups.forEach((fn) => fn());
          };
        },
      );

      return () => mm.revert();
    },
    {
      scope: wrapRef,
      dependencies: [variant.colors, variant.side, variant.mood],
    },
  );

  const eyeStyle = {
    transformBox: "fill-box" as const,
    transformOrigin: "center" as const,
  };

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-30 hidden select-none lg:block"
    >
      <div
        ref={wrapRef}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: CAT_W,
          height: CAT_H,
          visibility: "hidden",
          willChange: "transform",
        }}
      >
        <svg
          ref={svgRef}
          viewBox="0 0 160 200"
          className="h-full w-full"
          style={{ pointerEvents: "none" }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <g
            className="js-edge-cat"
            stroke={OUTLINE}
            strokeWidth={4}
            strokeLinejoin="round"
            strokeLinecap="round"
          >
            {/* tail — curls up the left side */}
            <g className="js-edge-cat-tail">
              <path
                d="M40 182 C 8 162 4 110 28 92 C 41 84 53 96 46 111 C 38 127 41 151 58 168 Z"
                fill={colors.body}
              />
            </g>

            {/* ears */}
            <g className="js-edge-cat-ear">
              <path d="M52 56 L 44 12 L 84 38 Z" fill={colors.body} />
              <path d="M108 56 L 116 12 L 76 38 Z" fill={colors.body} />
              <path
                d="M56 50 L 52 22 L 78 40 Z"
                fill={colors.innerEar}
                stroke="none"
              />
              <path
                d="M104 50 L 108 22 L 82 40 Z"
                fill={colors.innerEar}
                stroke="none"
              />
            </g>

            {/* head */}
            <g className="js-edge-cat-head">
              <circle cx={80} cy={70} r={50} fill={colors.body} />
              {/* tabby forehead stripes */}
              <path
                d="M80 30 q 6 12 0 22"
                fill="none"
                stroke={colors.stripe}
                strokeWidth={4}
              />
              <path
                d="M62 34 q 5 10 0 18"
                fill="none"
                stroke={colors.stripe}
                strokeWidth={4}
              />
              <path
                d="M98 34 q -5 10 0 18"
                fill="none"
                stroke={colors.stripe}
                strokeWidth={4}
              />
              {/* cheeks */}
              <circle
                cx={44}
                cy={84}
                r={13}
                fill={colors.cheek}
                stroke="none"
                opacity={0.6}
              />
              <circle
                cx={116}
                cy={84}
                r={13}
                fill={colors.cheek}
                stroke="none"
                opacity={0.6}
              />
              {/* muzzle */}
              <ellipse
                cx={80}
                cy={90}
                rx={26}
                ry={18}
                fill="#f9e8db"
                stroke="none"
              />

              {sleepy ? (
                /* closed, content eyes (^_^) for the dozing mood */
                <g stroke={OUTLINE} strokeWidth={3.5} fill="none">
                  <path d="M54 78 q 8 8 16 0" />
                  <path d="M90 78 q 8 8 16 0" />
                </g>
              ) : (
                <>
                  {/* eyes: pupil group (cursor-tracking x/y) > eye group (blink scaleY) */}
                  <g className="js-edge-cat-pupil">
                    <g className="js-edge-cat-eye" style={eyeStyle}>
                      <ellipse
                        cx={62}
                        cy={76}
                        rx={8}
                        ry={11}
                        fill="#43321f"
                        stroke="none"
                      />
                      <circle
                        cx={65}
                        cy={72}
                        r={3.4}
                        fill="#fff"
                        stroke="none"
                      />
                      <circle
                        cx={59}
                        cy={80}
                        r={1.8}
                        fill="#fff"
                        stroke="none"
                        opacity={0.8}
                      />
                    </g>
                  </g>
                  <g className="js-edge-cat-pupil">
                    <g className="js-edge-cat-eye" style={eyeStyle}>
                      <ellipse
                        cx={98}
                        cy={76}
                        rx={8}
                        ry={11}
                        fill="#43321f"
                        stroke="none"
                      />
                      <circle
                        cx={101}
                        cy={72}
                        r={3.4}
                        fill="#fff"
                        stroke="none"
                      />
                      <circle
                        cx={95}
                        cy={80}
                        r={1.8}
                        fill="#fff"
                        stroke="none"
                        opacity={0.8}
                      />
                    </g>
                  </g>
                </>
              )}

              {/* heart nose */}
              <path
                d="M80 92 C 76 88 72 90 73 94 C 74 97 78 97 80 100 C 82 97 86 97 87 94 C 88 90 84 88 80 92 Z"
                fill="#db6f6f"
                stroke="none"
              />
              {/* :3 mouth */}
              <path
                d="M80 100 q -6 6 -11 2 M80 100 q 6 6 11 2"
                fill="none"
                stroke="#9c6a44"
                strokeWidth={2.5}
              />
              {/* whiskers */}
              <path
                d="M48 92 L 14 86 M50 98 L 16 100 M112 92 L 146 86 M110 98 L 144 100"
                fill="none"
                stroke="#c2a087"
                strokeWidth={2}
              />

              {/* floating "z" for the sleepy mood */}
              {sleepy && (
                <text
                  className="js-edge-cat-z"
                  x={120}
                  y={40}
                  fontFamily="Caveat, cursive"
                  fontSize={26}
                  fontStyle="italic"
                  fill={OUTLINE}
                  stroke="none"
                  style={{ opacity: 0 }}
                >
                  z
                </text>
              )}
            </g>

            {/* front paws resting on the edge */}
            <g className="js-edge-cat-paws">
              <ellipse cx={56} cy={182} rx={22} ry={14} fill={colors.paw} />
              <ellipse cx={104} cy={182} rx={22} ry={14} fill={colors.paw} />
              <path
                d="M48 182 v 8 M56 182 v 8 M64 182 v 8 M96 182 v 8 M104 182 v 8 M112 182 v 8"
                stroke="#cf9a82"
                strokeWidth={2.5}
              />
            </g>
          </g>
        </svg>
      </div>
    </div>
  );
}

export default EdgeCat;
