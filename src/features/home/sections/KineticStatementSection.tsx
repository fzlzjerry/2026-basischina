import { useCallback, useRef, useState } from "react";
import {
  PeelableHealSticker,
  type StickerForgeController,
} from "@/features/home/components/PeelableHealSticker";
import { gsap, registerGsap, useGSAP } from "@/shared/motion/gsap";
import { KineticTextInk } from "../components/KineticTextInk";
import { createKineticTextInkInputs } from "../gpu/kinetic-text/types";
import type { GpuEffectHandle } from "../gpu/types";

/**
 * The homepage signature: three handwritten lines on espresso, with a colour
 * fill on “gentle.” and a peelable HEAL seal. No pin besides the sticky type.
 */
export function KineticStatementSection() {
  const root = useRef<HTMLElement>(null);
  const sticky = useRef<HTMLDivElement>(null);
  const sticker = useRef<StickerForgeController | null>(null);
  const peelProgress = useRef(0);
  const textInkInputs = useRef(createKineticTextInkInputs());
  const textInkHandle = useRef<GpuEffectHandle | null>(null);
  const [stickerInteractive, setStickerInteractive] = useState(false);

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
  const captureTextInkHandle = useCallback((handle: GpuEffectHandle | null) => {
    textInkHandle.current = handle;
  }, []);
  const syncTextInkLive = useCallback((live: boolean) => {
    sticky.current?.classList.toggle("is-kinetic-ink-live", live);
  }, []);

  useGSAP(
    () => {
      registerGsap();
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set(".js-kinetic-fill", {
          clipPath: "inset(0 100% 0 0)",
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
        gsap.to(textInkInputs.current, {
          drive: 1,
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top 82%",
            end: "top 22%",
            scrub: 0.5,
          },
          onUpdate: () => {
            textInkHandle.current?.invalidate();
            if (textInkInputs.current.drive >= 0.98) {
              setStickerInteractive(true);
            }
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
      data-nav-ink=""
      aria-labelledby="heal-loop-heading"
    >
      <h2 id="heal-loop-heading" className="sr-only">
        Start with a real need. Keep the biology gentle. Design for the life
        around it.
      </h2>
      <div ref={sticky} className="kinetic-statement-sticky">
        <KineticTextInk
          rootRef={root}
          stageRef={sticky}
          inputs={textInkInputs.current}
          onHandle={captureTextInkHandle}
          onLiveChange={syncTextInkLive}
        />

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

        <PeelableHealSticker
          onReady={handleStickerReady}
          interactive={stickerInteractive}
        />
      </div>
    </section>
  );
}
