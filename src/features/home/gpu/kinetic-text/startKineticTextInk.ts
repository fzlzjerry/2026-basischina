import { effect, sampler, surface, type Gpu, type Surface } from "vgpu";
import { acquireHomeGpuRuntime } from "../runtime";
import type { GpuEffectHandle, HomeGpuRenderer } from "../types";
import type { KineticTextInkInputs } from "./types";
import kineticTextInkShader from "./kinetic-text-ink.wgsl";

interface MaskTexture {
  texture: ReturnType<Gpu["gpu"]["createTexture"]>;
  width: number;
  height: number;
  version: number;
  dispose(): void;
}

function uploadMask(
  gpu: Gpu,
  source: HTMLCanvasElement,
  version: number,
): MaskTexture {
  const width = source.width;
  const height = source.height;
  const context = source.getContext("2d")!;
  const rgba = context.getImageData(0, 0, width, height).data;
  const sourceBytesPerRow = width * 4;
  const bytesPerRow = Math.ceil(sourceBytesPerRow / 256) * 256;
  const upload = new Uint8Array(bytesPerRow * height);
  for (let row = 0; row < height; row += 1) {
    upload.set(
      rgba.subarray(row * sourceBytesPerRow, (row + 1) * sourceBytesPerRow),
      row * bytesPerRow,
    );
  }
  const texture = gpu.gpu.createTexture({
    size: [width, height],
    format: "rgba8unorm",
    usage: 0x02 | 0x04,
  });
  gpu.gpu.queue.writeTexture(
    { texture },
    upload,
    { bytesPerRow },
    { width, height },
  );
  return {
    texture,
    width,
    height,
    version,
    dispose: () => texture.destroy(),
  };
}

export function createKineticTextInkRenderer(
  getMask: () => HTMLCanvasElement | null,
): HomeGpuRenderer<KineticTextInkInputs> {
  return {
    async start(canvas, inputs, lifecycle) {
      const runtime = await acquireHomeGpuRuntime();
      const source = getMask();
      if (!runtime || !source) {
        lifecycle.onFailure();
        return null;
      }

      let disposed = false;
      let live = false;
      let jobHandle: GpuEffectHandle | null = null;
      let unsubscribeResize: (() => void) | null = null;
      let canvasSurface: Surface | null = null;
      let mask: MaskTexture | null = null;

      try {
        canvasSurface = surface(runtime.gpu, canvas, {
          dpr: [0.75, 1.25],
          alphaMode: "premultiplied",
          clearColor: [0, 0, 0, 0],
          label: "heal-kinetic-text-ink",
        });
        mask = uploadMask(runtime.gpu, source, inputs.maskVersion);
        const ink = effect(runtime.gpu, kineticTextInkShader, {
          label: "heal-kinetic-text-ink",
          blend: "alpha",
          set: {
            params: {
              drive: inputs.drive,
              pad: 0,
              texel: [1 / mask.width, 1 / mask.height],
            },
            masks: mask.texture,
            mask_sampler: sampler(runtime.gpu, {
              minFilter: "linear",
              magFilter: "linear",
            }),
          },
        });
        unsubscribeResize = canvasSurface.onResize(() => {
          jobHandle?.invalidate();
        });
        await ink.compile({ colors: [canvasSurface.format] });
        if (disposed) {
          unsubscribeResize();
          mask.dispose();
          canvasSurface.dispose();
          return null;
        }

        jobHandle = runtime.register({
          isVisible: () => !disposed && inputs.inView,
          render: (currentFrame) => {
            if (!canvasSurface) return false;
            const nextSource = getMask();
            if (nextSource && mask && mask.version !== inputs.maskVersion) {
              const nextMask = uploadMask(
                runtime.gpu,
                nextSource,
                inputs.maskVersion,
              );
              ink.set({
                params: { texel: [1 / nextMask.width, 1 / nextMask.height] },
                masks: nextMask.texture,
              });
              mask.dispose();
              mask = nextMask;
            }
            ink.set({ params: { drive: inputs.drive } });
            currentFrame.pass(canvasSurface, ink);
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
            mask?.dispose();
            canvasSurface?.dispose();
            jobHandle?.dispose();
            lifecycle.onFailure();
          },
        };
        handle.invalidate();
        return handle;
      } catch {
        disposed = true;
        unsubscribeResize?.();
        mask?.dispose();
        canvasSurface?.dispose();
        jobHandle?.dispose();
        lifecycle.onFailure();
        return null;
      }
    },
  };
}
