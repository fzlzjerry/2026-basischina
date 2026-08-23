import { useCallback, useRef } from "react";
import {
  PeelableHealSticker,
  type StickerForgeController,
} from "@/features/home/components/PeelableHealSticker";
import { gsap, registerGsap, useGSAP } from "@/shared/motion/gsap";

/**
 * A long typographic breath between the project loop and the wiki chapters.
 * Three handwritten lines fill the dark notebook — the same thought, not a
 * third restatement of Understand / Engineer / Care.
 */
export function KineticStatementSection() {
  const root = useRef<HTMLElement>(null);
  const sticker = useRef<StickerForgeController | null>(null);
  const peelProgress = useRef(0);

  const applyPeelProgress = useCallback(() => {
    const element = sticker.current;
    if (!element || element.getState().dragging) return;

    element.setPeelProgress(peelProgress.current, {
      origin: { x: 0.94, y: 0.12 },
      target: { x: 0.58, y: 0.42 },
    });
  }, []);
  const handleStickerReady = useCallback(
    (element: StickerForgeController | null) => {
      sticker.current = element;
      applyPeelProgress();
    },
    [applyPeelProgress],
  );

  useGSAP(
    () => {
      registerGsap();
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set(".js-kinetic-line-a", { xPercent: -3 });
        gsap.set(".js-kinetic-line-b", { xPercent: 3 });
        gsap.set(".js-kinetic-line-c", { xPercent: -3 });
        gsap.set(".js-kinetic-fill", {
          clipPath: "inset(0 100% 0 0)",
        });

        const progress = {
          trigger: root.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        };

        gsap.to(".js-kinetic-line-a", {
          xPercent: 3,
          ease: "none",
          scrollTrigger: progress,
        });
        gsap.to(".js-kinetic-line-b", {
          xPercent: -3,
          ease: "none",
          scrollTrigger: progress,
        });
        gsap.to(".js-kinetic-line-c", {
          xPercent: 3,
          ease: "none",
          scrollTrigger: progress,
        });
        gsap.to(peelProgress, {
          current: 0.18,
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top 84%",
            end: "top 18%",
            scrub: 0.65,
          },
          onUpdate: applyPeelProgress,
        });
        gsap.to(".js-kinetic-fill", {
          clipPath: "inset(0 0% 0 0)",
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top 82%",
            end: "top 22%",
            scrub: 0.5,
          },
        });
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      className="kinetic-statement"
      aria-labelledby="heal-loop-heading"
    >
      <h2 id="heal-loop-heading" className="sr-only">
        Start with a real need. Keep the biology gentle. Design for the life
        around it.
      </h2>
      <div className="kinetic-statement-sticky">
        <div className="kinetic-statement-lines" aria-hidden="true">
          <p className="js-kinetic-line-a">Start with a real need.</p>
          <p className="js-kinetic-line-b">
            Keep the biology{" "}
            <span className="kinetic-statement-fill-wrap">
              gentle.
              <span
                aria-hidden="true"
                className="js-kinetic-fill kinetic-statement-fill"
              >
                gentle.
              </span>
            </span>
          </p>
          <p className="js-kinetic-line-c">Design for the life around it.</p>
        </div>

        <PeelableHealSticker onReady={handleStickerReady} />
      </div>
    </section>
  );
}
