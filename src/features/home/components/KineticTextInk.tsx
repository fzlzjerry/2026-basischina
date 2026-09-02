import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import { LazyGpuCanvas } from "../gpu/LazyGpuCanvas";
import {
  canMountHomeGpu,
  HOME_GPU_MIN_WIDTH,
  HOME_GPU_MOTION_QUERY,
} from "../gpu/capability";
import type { GpuEffectHandle, HomeGpuRenderer } from "../gpu/types";
import type { KineticTextInkInputs } from "../gpu/kinetic-text/types";

interface KineticTextInkProps {
  rootRef: RefObject<HTMLElement | null>;
  stageRef: RefObject<HTMLDivElement | null>;
  inputs: KineticTextInkInputs;
  onHandle?: (handle: GpuEffectHandle | null) => void;
  onLiveChange?: (live: boolean) => void;
}

const LINE_COLORS = ["#ff0000", "#00ff00", "#0000ff"] as const;

function lineIndexFor(node: Text): number | null {
  const paragraph = node.parentElement?.closest("p");
  if (paragraph?.classList.contains("js-kinetic-line-a")) return 0;
  if (paragraph?.classList.contains("js-kinetic-line-b")) return 1;
  if (paragraph?.classList.contains("js-kinetic-line-c")) return 2;
  return null;
}

export function KineticTextInk({
  rootRef,
  stageRef,
  inputs,
  onHandle,
  onLiveChange,
}: KineticTextInkProps) {
  const mask = useRef<HTMLCanvasElement | null>(null);
  const handle = useRef<GpuEffectHandle | null>(null);
  const fontReady = useRef<Promise<void> | null>(null);
  const [armed, setArmed] = useState(false);
  const [nearViewport, setNearViewport] = useState(false);
  const [live, setLive] = useState(false);

  const rasterize = useCallback(() => {
    const stage = stageRef.current;
    const lines = stage?.querySelector<HTMLElement>(".kinetic-statement-lines");
    if (!stage || !lines) return null;
    const stageRect = stage.getBoundingClientRect();
    if (stageRect.width <= 0 || stageRect.height <= 0) return null;

    const scale = Math.min(window.devicePixelRatio || 1, 1.25);
    const canvas = mask.current ?? document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(stageRect.width * scale));
    canvas.height = Math.max(1, Math.round(stageRect.height * scale));
    mask.current = canvas;
    const context = canvas.getContext("2d");
    if (!context) return null;
    context.setTransform(scale, 0, 0, scale, 0, 0);
    context.clearRect(0, 0, stageRect.width, stageRect.height);
    context.textAlign = "left";
    context.textBaseline = "alphabetic";

    const walker = document.createTreeWalker(lines, NodeFilter.SHOW_TEXT);
    let current = walker.nextNode();
    while (current) {
      const text = current as Text;
      const parent = text.parentElement;
      const lineIndex = lineIndexFor(text);
      const hiddenAncestor = parent?.closest('[aria-hidden="true"]');
      if (
        parent &&
        lineIndex !== null &&
        (!hiddenAncestor || hiddenAncestor === lines)
      ) {
        const style = getComputedStyle(parent);
        context.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
        context.letterSpacing = style.letterSpacing;
        context.fontKerning = style.fontKerning as CanvasFontKerning;
        context.fillStyle = LINE_COLORS[lineIndex];

        const range = document.createRange();
        range.selectNodeContents(text);
        const rect = range.getBoundingClientRect();
        range.detach();
        if (rect.width > 0 && rect.height > 0) {
          const metrics = context.measureText(text.data);
          const baseline =
            rect.top -
            stageRect.top +
            (rect.height +
              metrics.fontBoundingBoxAscent -
              metrics.fontBoundingBoxDescent) /
              2;
          context.fillText(text.data, rect.left - stageRect.left, baseline);
        }
      }
      current = walker.nextNode();
    }

    inputs.maskVersion += 1;
    handle.current?.invalidate();
    return canvas;
  }, [inputs, stageRef]);

  const ensureFontReady = useCallback(async () => {
    if (!fontReady.current) {
      const stage = stageRef.current;
      const paragraph = stage?.querySelector<HTMLElement>(
        ".kinetic-statement-lines p",
      );
      if (paragraph) {
        const style = getComputedStyle(paragraph);
        const font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
        const sample =
          stage?.querySelector<HTMLElement>(".kinetic-statement-lines")
            ?.textContent ?? "HEAL";
        fontReady.current = document.fonts
          .load(font, sample)
          .then(() => document.fonts.ready)
          .then(() => undefined)
          .catch(() => undefined);
      } else {
        fontReady.current = Promise.resolve();
      }
    }
    await fontReady.current;
  }, [stageRef]);

  useEffect(() => {
    const wide = window.matchMedia(`(min-width: ${HOME_GPU_MIN_WIDTH}px)`);
    const motion = window.matchMedia(HOME_GPU_MOTION_QUERY);
    const sync = () => setArmed(canMountHomeGpu());

    sync();
    wide.addEventListener("change", sync);
    motion.addEventListener("change", sync);
    return () => {
      wide.removeEventListener("change", sync);
      motion.removeEventListener("change", sync);
    };
  }, []);

  useEffect(() => {
    const section = rootRef.current;
    if (!armed || !section) {
      setNearViewport(false);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        setNearViewport(true);
        observer.disconnect();
      },
      { rootMargin: "55% 0px" },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, [armed, rootRef]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!armed || !nearViewport || !stage) {
      mask.current = null;
      return;
    }

    let cancelled = false;
    let ready = false;
    const observer = new ResizeObserver(() => {
      if (ready) rasterize();
    });
    observer.observe(stage);
    void ensureFontReady().then(() => {
      if (cancelled) return;
      ready = true;
      rasterize();
    });

    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [armed, ensureFontReady, nearViewport, rasterize, stageRef]);

  const loadRenderer = useCallback(async () => {
    await ensureFontReady();
    rasterize();
    const module = await import("../gpu/kinetic-text/startKineticTextInk");
    return module.createKineticTextInkRenderer(
      () => mask.current,
    ) as HomeGpuRenderer<KineticTextInkInputs>;
  }, [ensureFontReady, rasterize]);

  const captureHandle = useCallback(
    (next: GpuEffectHandle | null) => {
      handle.current = next;
      onHandle?.(next);
    },
    [onHandle],
  );
  const syncLive = useCallback(
    (next: boolean) => {
      setLive(next);
      onLiveChange?.(next);
    },
    [onLiveChange],
  );

  return (
    <LazyGpuCanvas
      hostRef={rootRef}
      inputs={inputs}
      load={loadRenderer}
      className={`kinetic-text-ink-canvas${live ? " is-live" : ""}`}
      onHandle={captureHandle}
      onLiveChange={syncLive}
    />
  );
}
