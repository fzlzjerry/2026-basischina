import { useEffect, useRef, useState, type RefObject } from "react";
import {
  canMountHomeGpu,
  HOME_GPU_MIN_WIDTH,
  HOME_GPU_MOTION_QUERY,
} from "./capability";
import type {
  GpuEffectHandle,
  HomeGpuInputs,
  HomeGpuRendererLoader,
} from "./types";

interface LazyGpuCanvasProps<I extends HomeGpuInputs> {
  hostRef: RefObject<HTMLElement | null>;
  inputs: I;
  load: HomeGpuRendererLoader<I>;
  className: string;
  minWidth?: number;
  preload?: boolean;
  onHandle?: (handle: GpuEffectHandle | null) => void;
  onLiveChange?: (live: boolean) => void;
}

/**
 * Client-only, capacity-gated VGPU mount. It separates near-viewport loading
 * from true visibility so render jobs sleep while their section is offscreen.
 */
export function LazyGpuCanvas<I extends HomeGpuInputs>({
  hostRef,
  inputs,
  load,
  className,
  minWidth = HOME_GPU_MIN_WIDTH,
  preload = false,
  onHandle,
  onLiveChange,
}: LazyGpuCanvasProps<I>) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    const wide = window.matchMedia(`(min-width: ${minWidth}px)`);
    const motion = window.matchMedia(HOME_GPU_MOTION_QUERY);
    const sync = () => setArmed(canMountHomeGpu(minWidth));

    sync();
    wide.addEventListener("change", sync);
    motion.addEventListener("change", sync);
    return () => {
      wide.removeEventListener("change", sync);
      motion.removeEventListener("change", sync);
    };
  }, [minWidth]);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!armed || !host || !canvas) {
      inputs.inView = false;
      onHandle?.(null);
      onLiveChange?.(false);
      return;
    }

    let cancelled = false;
    let loading = false;
    let handle: GpuEffectHandle | null = null;
    let idleHandle: number | null = null;
    let timeoutHandle: number | null = null;

    const setLive = (live: boolean) => {
      if (!cancelled) onLiveChange?.(live);
    };

    const start = async () => {
      if (cancelled || loading || handle) return;
      loading = true;
      try {
        const renderer = await load();
        if (cancelled) return;
        handle = await renderer.start(canvas, inputs, {
          onLive: () => setLive(true),
          onFailure: () => setLive(false),
        });
        if (cancelled) {
          handle?.dispose();
          handle = null;
          return;
        }
        onHandle?.(handle);
        handle?.invalidate();
      } catch {
        setLive(false);
      } finally {
        loading = false;
      }
    };

    const scheduleStart = () => {
      if (loading || handle || idleHandle !== null || timeoutHandle !== null) {
        return;
      }
      if (typeof window.requestIdleCallback === "function") {
        idleHandle = window.requestIdleCallback(
          () => {
            idleHandle = null;
            void start();
          },
          { timeout: 1200 },
        );
      } else {
        timeoutHandle = window.setTimeout(() => {
          timeoutHandle = null;
          void start();
        }, 500);
      }
    };

    const visibilityObserver = new IntersectionObserver(
      (entries) => {
        inputs.inView = entries.some((entry) => entry.isIntersecting);
        handle?.invalidate();
      },
      { threshold: 0.02 },
    );
    const preloadObserver = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        preloadObserver.disconnect();
        scheduleStart();
      },
      { rootMargin: "55% 0px" },
    );

    visibilityObserver.observe(host);
    if (preload) scheduleStart();
    else preloadObserver.observe(host);

    return () => {
      cancelled = true;
      inputs.inView = false;
      visibilityObserver.disconnect();
      preloadObserver.disconnect();
      if (idleHandle !== null) window.cancelIdleCallback?.(idleHandle);
      if (timeoutHandle !== null) window.clearTimeout(timeoutHandle);
      onHandle?.(null);
      onLiveChange?.(false);
      handle?.dispose();
      handle = null;
    };
  }, [armed, hostRef, inputs, load, onHandle, onLiveChange, preload]);

  if (!armed) return null;
  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
