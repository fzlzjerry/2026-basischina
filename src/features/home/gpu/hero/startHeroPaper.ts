import { effect, surface } from "vgpu";
import { acquireHomeGpuRuntime } from "../runtime";
import type {
  GpuEffectHandle,
  HomeGpuRenderer,
  HeroPaperInputs,
} from "../types";
import heroPaperShader from "./hero-paper.wgsl";

const UNDERSTAND = [0.984, 0.89, 0.776, 1] as const;
const ENGINEER = [0.184, 0.141, 0.09, 1] as const;
const CARE = [0.902, 0.976, 0.965, 1] as const;

function grainScale(canvas: HTMLCanvasElement): number {
  return Math.min(92, Math.max(38, canvas.clientHeight / 9));
}

export const heroPaperRenderer: HomeGpuRenderer<HeroPaperInputs> = {
  async start(canvas, inputs, lifecycle) {
    const runtime = await acquireHomeGpuRuntime();
    if (!runtime) {
      lifecycle.onFailure();
      return null;
    }

    let disposed = false;
    let live = false;
    let jobHandle: GpuEffectHandle | null = null;
    let unsubscribeResize: (() => void) | null = null;

    try {
      const canvasSurface = surface(runtime.gpu, canvas, {
        dpr: [1, 1.5],
        alphaMode: "opaque",
        clearColor: [...UNDERSTAND],
        label: "heal-hero-paper",
      });
      const paper = effect(runtime.gpu, heroPaperShader, {
        label: "heal-hero-paper",
        set: {
          params: {
            track: inputs.track,
            wet: inputs.wet,
            grain: grainScale(canvas),
            texel: canvasSurface.texelSize,
          },
          papers: {
            understand: [...UNDERSTAND],
            engineer: [...ENGINEER],
            care: [...CARE],
          },
        },
      });

      unsubscribeResize = canvasSurface.onResize(() => {
        paper.set({
          params: {
            grain: grainScale(canvas),
            texel: canvasSurface.texelSize,
          },
        });
        jobHandle?.invalidate();
      });

      await paper.compile({ colors: [canvasSurface.format] });
      if (disposed) {
        unsubscribeResize();
        canvasSurface.dispose();
        return null;
      }

      jobHandle = runtime.register({
        isVisible: () => !disposed && inputs.inView,
        render: (currentFrame) => {
          paper.set({
            params: {
              track: inputs.track,
              wet: inputs.wet,
            },
          });
          currentFrame.pass(canvasSurface, paper);
          if (!live) {
            live = true;
            lifecycle.onLive();
          }
          return false;
        },
        onFailure: () => lifecycle.onFailure(),
      });

      const handle: GpuEffectHandle = {
        invalidate: () => jobHandle?.invalidate(),
        dispose: () => {
          if (disposed) return;
          disposed = true;
          unsubscribeResize?.();
          unsubscribeResize = null;
          canvasSurface.dispose();
          jobHandle?.dispose();
          jobHandle = null;
          lifecycle.onFailure();
        },
      };
      handle.invalidate();
      return handle;
    } catch {
      disposed = true;
      unsubscribeResize?.();
      jobHandle?.dispose();
      lifecycle.onFailure();
      return null;
    }
  },
};
