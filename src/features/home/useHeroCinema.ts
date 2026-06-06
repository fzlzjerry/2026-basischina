import type { RefObject } from "react";
import { gsap, SplitText, registerGsap, useGSAP } from "@/shared/motion/gsap";

/**
 * Hero on-load entrance — restrained and FOUC-safe (transform-only, opacity
 * stays 1 above the fold). Headline reveals from a line mask, the pets settle
 * in, subhead + CTA rise. Gated behind prefers-reduced-motion; no scroll pin.
 */
export function useHeroCinema(root: RefObject<HTMLElement>): void {
  useGSAP(
    () => {
      registerGsap();

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const split = SplitText.create(".js-hero-h1", {
          type: "lines",
          mask: "lines",
          aria: "auto",
        });

        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        tl.from(split.lines, {
          yPercent: 120,
          stagger: 0.08,
          duration: 0.7,
          clearProps: "transform",
        })
          .from(
            ".js-hero-pets",
            {
              scale: 0.9,
              duration: 0.8,
              ease: "power4.out",
              clearProps: "transform",
            },
            "-=0.5",
          )
          .from(
            ".js-hero-sub",
            { y: 16, duration: 0.6, clearProps: "transform" },
            "-=0.6",
          )
          .from(
            ".js-hero-cta > *",
            { y: 16, duration: 0.5, stagger: 0.08, clearProps: "transform" },
            "-=0.4",
          );

        return () => {
          split.revert();
        };
      });

      return () => mm.revert();
    },
    { scope: root },
  );
}
