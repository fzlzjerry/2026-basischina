import { useRef } from "react";
import { useLocation } from "react-router-dom";
import { PawPrint } from "@phosphor-icons/react";
import { gsap, registerGsap, useGSAP } from "@/shared/motion/gsap";

// Back-to-front cover order (later siblings paint on top). The front (peach)
// panel is what the viewer sees covering, then the curtain peels front-first.
const PANEL_COLORS = [
  "var(--color-surface)",
  "var(--color-app-teal)",
  "var(--color-app-peach)",
];

/**
 * Full-bleed page-transition curtain. Mounted once in AppShell as a sibling of
 * <main>, so it survives route changes and stays out of the focus / scroll /
 * Suspense path.
 *
 * Reveal-only by necessity: react-router's data router has already swapped
 * <Outlet/> by the time this layout effect runs, so there is no outgoing DOM to
 * animate. Instead we instant-cover the freshly-mounted incoming page, then lift
 * a three-panel theatre curtain to reveal it.
 *
 * SSG-safe: the overlay ships idle/hidden in the prerendered HTML (inline
 * opacity/visibility), there is no transition on first load (first-render skip),
 * and all motion is gated behind prefers-reduced-motion and torn down on every
 * navigation + unmount.
 */
export function PageTransition() {
  const overlayRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);
  const { pathname } = useLocation();

  useGSAP(
    () => {
      registerGsap();

      // No curtain on the SSG paint / hydration — only on later client navs.
      if (isFirstRender.current) {
        isFirstRender.current = false;
        return;
      }

      const overlay = overlayRef.current;
      if (!overlay) return;

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const panels =
          overlay.querySelectorAll<HTMLElement>(".js-curtain-panel");
        const paws = overlay.querySelector<HTMLElement>(".js-curtain-paws");

        // CRITICAL: a standalone, synchronous cover. matchMedia's add() callback
        // runs synchronously inside useGSAP's layout effect, so these gsap.set()
        // calls write inline styles before the browser paints — the just-swapped
        // page is covered in the same frame it mounts (no one-frame flash of the
        // raw page). A timeline .set() would defer to the next rAF and flash;
        // hence a standalone set, not the first step of the animated timeline.
        // will-change is promoted here (not inline in the JSX, where GSAP could
        // never clear it) and reset to "auto" once the lift completes.
        gsap.set(overlay, { autoAlpha: 1 });
        gsap.set(panels, {
          scaleY: 1,
          transformOrigin: "top center",
          willChange: "transform",
        });
        if (paws) {
          gsap.set(paws, {
            yPercent: 0,
            autoAlpha: 1,
            willChange: "transform",
          });
        }

        const settle = () => {
          gsap.set(panels, { clearProps: "transform", willChange: "auto" });
          if (paws) {
            gsap.set(paws, { clearProps: "transform", willChange: "auto" });
          }
        };

        const tl = gsap.timeline({
          onComplete: () => {
            gsap.set(overlay, { autoAlpha: 0 });
            settle();
          },
        });

        // Paws sweep up and fade as the curtain begins to lift.
        if (paws) {
          tl.to(
            paws,
            { yPercent: -130, autoAlpha: 0, duration: 0.4, ease: "power2.in" },
            0,
          );
        }
        // Theatre lift: front panel first (from "end") so the peach / mint /
        // cream layers peel away in sequence — scaleY -> 0 from the top, like
        // blinds rising. Transforms + opacity only: compositor-only, ~0.67s.
        tl.to(
          panels,
          {
            scaleY: 0,
            transformOrigin: "top center",
            duration: 0.5,
            ease: "power3.inOut",
            stagger: { each: 0.07, from: "end" },
          },
          0.03,
        );

        return () => {
          tl.kill();
          gsap.set(overlay, { autoAlpha: 0 });
          settle();
        };
      });

      return () => mm.revert();
    },
    { dependencies: [pathname], scope: overlayRef, revertOnUpdate: true },
  );

  return (
    <div
      ref={overlayRef}
      aria-hidden="true"
      className="js-page-transition pointer-events-none fixed inset-0 z-[45] overflow-hidden"
      style={{ opacity: 0, visibility: "hidden" }}
    >
      {PANEL_COLORS.map((color) => (
        <div
          key={color}
          className="js-curtain-panel absolute inset-0"
          style={{
            transform: "scaleY(1)",
            transformOrigin: "top center",
            backgroundColor: color,
            borderBottomLeftRadius: "var(--radius-card)",
            borderBottomRightRadius: "var(--radius-card)",
          }}
        />
      ))}
      <div className="js-curtain-paws absolute inset-x-0 bottom-[14vh] flex items-center justify-center gap-7">
        {[0, 1, 2, 3, 4].map((i) => (
          <PawPrint
            key={i}
            weight="fill"
            size={36}
            color="var(--color-primary)"
            className={i % 2 === 0 ? "translate-y-2" : "-translate-y-1"}
          />
        ))}
      </div>
    </div>
  );
}
