import type { RefObject } from "react";
import {
  gsap,
  ScrollTrigger,
  SplitText,
  registerGsap,
  useGSAP,
} from "@/shared/motion/gsap";

/**
 * All hero GSAP lives here so `HeroSection` stays declarative. Two motion
 * branches (gated by `gsap.matchMedia`): a desktop pinned/scrubbed cinema
 * (Task 4) and a touch scroll-reveal (Task 5). Reduced-motion adds NOTHING —
 * the inline-hidden cinematic layers stay hidden and Beat 0 shows as prerendered.
 */
export function useHeroCinema(root: RefObject<HTMLElement>): void {
  useGSAP(
    () => {
      registerGsap();
      const el = root.current;
      if (!el) return;

      const mm = gsap.matchMedia();

      mm.add(
        "(prefers-reduced-motion: no-preference) and (pointer: fine)",
        () => {
          const split = SplitText.create(".js-hero-h1", {
            type: "lines",
            mask: "lines",
            aria: "auto",
          });

          const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
          intro
            .from(split.lines, {
              yPercent: 120,
              stagger: 0.08,
              duration: 0.7,
              clearProps: "transform",
            })
            .from(
              ".js-hero-ekg",
              { drawSVG: "0% 0%", duration: 1.1, ease: "power2.inOut" },
              "-=0.4",
            )
            .from(
              ".js-hero-sub",
              { y: 16, opacity: 0, duration: 0.6, clearProps: "all" },
              "-=0.7",
            );

          if (document.fonts?.ready) {
            document.fonts.ready.then(() => ScrollTrigger.refresh());
          }

          return () => {
            split.revert();
          };
        },
      );

      return () => mm.revert();
    },
    { scope: root },
  );
}
