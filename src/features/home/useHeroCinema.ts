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

          // --- Pinned, scrubbed master timeline (Beats 1-3) ---
          const progress = el.querySelector<HTMLElement>(".js-hero-progress");
          // Start the construct stroke empty so it never flashes fully-drawn
          // before Beat 3 redraws it (the fromTo below uses immediateRender:false).
          gsap.set(".js-hero-construct", { drawSVG: "0%" });

          const tl = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: el,
              start: "top top",
              end: "+=200%",
              pin: true,
              scrub: 0.5,
              anticipatePin: 1,
              onUpdate: (self) => {
                if (progress) gsap.set(progress, { scaleY: self.progress });
              },
            },
          });

          tl
            // Beat 1 — look closer: push in + dim + iris open + caption 1
            .to(".js-hero-scene", { scale: 1.3, duration: 1 })
            .to(".js-hero-veil", { autoAlpha: 0.45, duration: 1 }, "<")
            .set(".js-hero-panel", { visibility: "visible" }, "<")
            .fromTo(
              ".js-hero-panel",
              { clipPath: "inset(0 50% 0 50% round 28px)" },
              {
                clipPath: "inset(0 0% 0 0% round 28px)",
                duration: 1,
                immediateRender: false,
              },
              "<",
            )
            .to(".js-hero-caption-1", { autoAlpha: 1, duration: 0.5 }, "<0.3")
            // Beat 2 — the imbalance: caption 1 out, caption 2 in
            .to(".js-hero-caption-1", { autoAlpha: 0, duration: 0.3 }, ">0.4")
            .to(".js-hero-caption-2", { autoAlpha: 1, duration: 0.5 }, "<")
            // Beat 3 — engineer + bloom
            .to(".js-hero-caption-2", { autoAlpha: 0, duration: 0.3 }, ">0.4")
            .fromTo(
              ".js-hero-construct",
              { drawSVG: "0%" },
              { drawSVG: "100%", duration: 1, immediateRender: false },
              "<",
            )
            .to(".js-hero-cell", { opacity: 1, duration: 0.6 }, "<0.2")
            .to(".js-hero-veil", { autoAlpha: 0, duration: 0.8 }, "<")
            .to(".js-hero-scene", { scale: 1, duration: 0.8 }, "<")
            .to(".js-hero-caption-3", { autoAlpha: 1, duration: 0.5 }, "<0.2");

          if (document.fonts?.ready) {
            document.fonts.ready.then(() => ScrollTrigger.refresh());
          }

          return () => {
            split.revert();
          };
        },
      );

      mm.add(
        "(prefers-reduced-motion: no-preference) and (pointer: coarse)",
        () => {
          // Mobile: a clean entrance only — no pin (a pin fighting the mobile
          // address-bar resize / touch momentum is janky).
          const split = SplitText.create(".js-hero-h1", {
            type: "lines",
            mask: "lines",
            aria: "auto",
          });
          gsap
            .timeline({ defaults: { ease: "power3.out" } })
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
