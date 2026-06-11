import type { RefObject } from "react";
import {
  gsap,
  ScrollTrigger,
  SplitText,
  registerGsap,
  useGSAP,
} from "@/shared/motion/gsap";

/**
 * Hero on-load entrance + idle life. The entrance is restrained and FOUC-safe
 * (transform-only, opacity stays 1 above the fold): the headline reveals from a
 * line mask, the pets settle in, subhead + CTA rise. After it lands, a looping
 * idle timeline gives the pets quiet life (tail sway, head bob, blink); it is
 * paused whenever the hero scrolls out of view. Everything is gated behind
 * prefers-reduced-motion; no scroll pin.
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
          // Animate the CTA container, not the buttons: the buttons carry a CSS
          // `transition` (for hover/active), which would fight GSAP frame-by-frame
          // and snap-catch-up when the tween ends. The wrapper has no transition.
          .from(
            ".js-hero-cta",
            { y: 16, duration: 0.5, clearProps: "transform" },
            "-=0.4",
          );

        // Idle life — looping, paused unless the hero is on screen. Heads bob
        // (plain y translate) and eyes blink (scaleY, fill-box origin); both are
        // safe inside the scene's scaled <g> wrapper, so no svgOrigin tail sway
        // (svgOrigin coordinates don't survive the nested transform).
        const idle = gsap.timeline({ paused: true });
        idle
          .to(
            ".js-cat-head",
            {
              y: 3,
              duration: 3.2,
              ease: "sine.inOut",
              repeat: -1,
              yoyo: true,
            },
            0,
          )
          .to(
            ".js-dog-head",
            {
              y: 4,
              duration: 2.8,
              ease: "sine.inOut",
              repeat: -1,
              yoyo: true,
            },
            0.4,
          )
          .to(
            ".js-cat-eye, .js-dog-eye",
            {
              scaleY: 0.1,
              transformOrigin: "50% 50%",
              duration: 0.09,
              ease: "power1.inOut",
              repeat: -1,
              repeatDelay: 3.8,
              yoyo: true,
            },
            1.6,
          );

        const idleVisibility = ScrollTrigger.create({
          trigger: root.current,
          start: "top bottom",
          end: "bottom top",
          onToggle: (self) => (self.isActive ? idle.play() : idle.pause()),
        });

        return () => {
          idle.kill();
          idleVisibility.kill();
          split.revert();
        };
      });

      return () => mm.revert();
    },
    { scope: root },
  );
}
