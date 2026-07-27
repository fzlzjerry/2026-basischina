import { useEffect, useRef, useState } from "react";
import healLoopSticker from "@/assets/brand/heal-loop-sticker.webp";
import healPeelSource from "@/assets/brand/heal-peel-source.webp";

export interface StickerForgeController {
  setSource: (source: {
    type: "image";
    src: string;
    name: string;
    padding?: number;
  }) => Promise<void>;
  setOptions: (options: Record<string, unknown>) => void;
  setPeelProgress: (
    progress: number,
    direction?: {
      origin: { x: number; y: number };
      target: { x: number; y: number };
    },
  ) => void;
  getState: () => { dragging: boolean; progress: number; ready: boolean };
  destroy: () => void;
}

interface StickerForgeModule {
  createSticker: (
    target: HTMLElement,
    options: Record<string, unknown>,
  ) => Promise<StickerForgeController>;
}

interface PeelableHealStickerProps {
  onReady: (element: StickerForgeController | null) => void;
}

let stickerForgeModule: Promise<StickerForgeModule> | null = null;

function loadStickerForge() {
  if (!stickerForgeModule) {
    stickerForgeModule =
      import("@/vendor/sticker-forge.es.js") as Promise<StickerForgeModule>;
  }

  return stickerForgeModule;
}

const stickerOptions = {
  outline: { width: 18, color: "#ffffff" },
  edge: { width: 2.4, strength: 0.7 },
  shadow: {
    opacity: 0.22,
    blur: 22,
    distance: 16,
    angle: 42,
    color: "#191823",
  },
  lighting: {
    direction: { x: -0.38, y: 0.52, z: 0.76 },
    intensity: 0.8,
    ambient: 0.35,
    softness: 0.6,
  },
  peel: {
    radius: 0.12,
    stiffness: 0.72,
    grabWidth: 22,
    maxAngle: 3.55,
    release: "snap",
  },
  sound: { enabled: false, volume: 0 },
  back: { color: "#f7f5f2", gloss: 0.7, roughness: 0.3 },
  material: {
    type: "original",
    intensity: 0.86,
    scale: 1,
    holographicGrain: 0.72,
    seed: 0.37,
    holographicColors: ["#f2a7c5", "#8edfd5", "#9db4ea"],
  },
  tilt: -3,
  wind: 0.18,
  quality: "high",
};

export function PeelableHealSticker({ onReady }: PeelableHealStickerProps) {
  const root = useRef<HTMLDivElement>(null);
  const mountPoint = useRef<HTMLDivElement>(null);
  const sticker = useRef<StickerForgeController | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const host = root.current;
    if (
      !host ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    let cancelled = false;

    const mount = async () => {
      try {
        const module = await loadStickerForge();
        const target = mountPoint.current;
        if (!target || cancelled) return;

        const controller = await module.createSticker(target, {
          ...stickerOptions,
          source: {
            type: "image",
            src: healPeelSource,
            name: "heal-loop-sticker.webp",
            padding: 48,
          },
        });

        if (cancelled) {
          controller.destroy();
          return;
        }

        sticker.current = controller;
        setIsReady(true);
        onReady(controller);
      } catch {
        // Keep the pre-rendered sticker visible when WebGL is unavailable.
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        void mount();
      },
      { rootMargin: "100% 0px" },
    );

    observer.observe(host);

    return () => {
      cancelled = true;
      observer.disconnect();
      sticker.current?.destroy();
      sticker.current = null;
      onReady(null);
    };
  }, [onReady]);

  return (
    <div
      ref={root}
      className={`kinetic-badge${isReady ? " is-peel-ready" : ""}`}
    >
      <img
        src={healLoopSticker}
        alt=""
        className="kinetic-badge-art"
        draggable={false}
        loading="lazy"
      />
      <div ref={mountPoint} className="kinetic-peel-canvas" />
    </div>
  );
}
