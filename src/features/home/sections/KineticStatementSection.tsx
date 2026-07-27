import { useCallback, useRef } from "react";
import {
  PeelableHealSticker,
  type StickerForgeController,
} from "@/features/home/components/PeelableHealSticker";
import { gsap, registerGsap, useGSAP } from "@/shared/motion/gsap";

/**
 * A long typographic breath between the introductory project loop and the
 * detailed wiki chapters. The copy is intentionally structural rather than
 * claim-heavy while project content is still being written.
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
        gsap.set(".js-kinetic-line-a", { xPercent: -9 });
        gsap.set(".js-kinetic-line-b", { xPercent: 0 });
        gsap.set(".js-kinetic-line-c", { xPercent: -6 });
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
          xPercent: 6,
          ease: "none",
          scrollTrigger: progress,
        });
        gsap.to(".js-kinetic-line-b", {
          xPercent: -6,
          ease: "none",
          scrollTrigger: progress,
        });
        gsap.to(".js-kinetic-line-c", {
          xPercent: 8,
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
    <section ref={root} className="kinetic-statement">
      <div className="kinetic-statement-sticky">
        <div className="kinetic-statement-meta">
          <span>THE HEAL LOOP</span>
          <span>ONE IDEA / THREE MOVEMENTS</span>
        </div>

        <div
          className="kinetic-statement-lines"
          aria-label="Observe the need. Engineer with care. Return it to life."
        >
          <p className="js-kinetic-line-a">
            OBSERVE
            <span className="kinetic-mobile-break">
              <br />
            </span>{" "}
            THE NEED.
          </p>
          <p className="js-kinetic-line-b">
            ENGINEER
            <span className="kinetic-mobile-break">
              <br />
            </span>{" "}
            WITH{" "}
            <span className="kinetic-statement-fill-wrap">
              CARE.
              <span
                aria-hidden="true"
                className="js-kinetic-fill kinetic-statement-fill"
              >
                CARE.
              </span>
            </span>
          </p>
          <p className="js-kinetic-line-c">
            RETURN
            <span className="kinetic-mobile-break">
              <br />
            </span>{" "}
            IT TO LIFE.
          </p>
        </div>

        <PeelableHealSticker onReady={handleStickerReady} />

        <p className="kinetic-statement-note">
          Start with a real need. Keep the biology gentle. Design for the life
          around it.
        </p>
      </div>
    </section>
  );
}
