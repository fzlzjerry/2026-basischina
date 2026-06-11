import type { RefObject } from "react";
import {
  gsap,
  ScrollTrigger,
  SplitText,
  registerGsap,
  useGSAP,
} from "@/shared/motion/gsap";

/**
 * Hero on-load entrance + idle life + pupil tracking. The entrance is
 * restrained and FOUC-safe (transform-only, opacity stays 1 above the fold):
 * the headline reveals from a line mask, the room settles in, subhead + CTA
 * rise. After it lands, a looping idle timeline gives the pets quiet life
 * (head bob, tail sway, blink), paused whenever the hero scrolls out of view.
 * On fine pointers the pets' pupils follow the cursor. Everything is gated
 * behind prefers-reduced-motion; no scroll pin.
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

        const tl = gsap.timeline({
          defaults: { ease: "power3.out" },
          // Revert the split once the entrance lands: restores clean markup,
          // releases the line-mask overflow wrappers (so the "happier"
          // squiggle, which hangs below the em box, can never stay clipped),
          // and makes any late webfont swap harmless.
          onComplete: () => split.revert(),
        });
        tl.from(split.lines, {
          yPercent: 120,
          stagger: 0.08,
          duration: 0.7,
          clearProps: "transform",
        })
          .from(
            ".js-hero-pets",
            {
              y: 28,
              scale: 0.985,
              transformOrigin: "50% 100%",
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
        // (plain y translate), tails sway (rotation around a bbox-percentage
        // origin — svgOrigin coordinates don't survive the scene's nested
        // scale, percentages do), and eyes blink (scaleY).
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
            ".js-cat-tail",
            {
              rotation: 5,
              transformOrigin: "92% 85%",
              duration: 2.6,
              ease: "sine.inOut",
              repeat: -1,
              yoyo: true,
            },
            0.3,
          )
          .to(
            ".js-dog-tail",
            {
              rotation: -7,
              transformOrigin: "10% 80%",
              duration: 2.2,
              ease: "sine.inOut",
              repeat: -1,
              yoyo: true,
            },
            0,
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

      // Pupil tracking: desktop fine pointers only, and only when motion is
      // welcome. quickTo gives the eased organic follow; offsets are in SVG
      // user units (±5 ≈ ±4-6 screen px after the scene scaling), so the
      // clamp is resolution-independent.
      mm.add(
        "(prefers-reduced-motion: no-preference) and (pointer: fine)",
        () => {
          const section = root.current;
          if (!section) return;
          const pupils = gsap.utils.toArray<SVGGElement>(
            ".js-cat-pupil, .js-dog-pupil",
            section,
          );
          if (pupils.length === 0) return;
          const xTo = pupils.map((p) =>
            gsap.quickTo(p, "x", { duration: 0.4, ease: "power2.out" }),
          );
          const yTo = pupils.map((p) =>
            gsap.quickTo(p, "y", { duration: 0.4, ease: "power2.out" }),
          );
          const onMove = (e: PointerEvent) => {
            const r = section.getBoundingClientRect();
            const nx = gsap.utils.clamp(
              -1,
              1,
              ((e.clientX - r.left) / r.width) * 2 - 1,
            );
            const ny = gsap.utils.clamp(
              -1,
              1,
              ((e.clientY - r.top) / r.height) * 2 - 1,
            );
            for (const f of xTo) f(nx * 5);
            for (const f of yTo) f(ny * 3.5);
          };
          const onLeave = () => {
            for (const f of xTo) f(0);
            for (const f of yTo) f(0);
          };
          section.addEventListener("pointermove", onMove);
          section.addEventListener("pointerleave", onLeave);
          return () => {
            section.removeEventListener("pointermove", onMove);
            section.removeEventListener("pointerleave", onLeave);
          };
        },
      );

      return () => mm.revert();
    },
    { scope: root },
  );
}
