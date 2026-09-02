import { effect, sampler, surface, type Gpu, type Surface } from "vgpu";
import { acquireHomeGpuRuntime } from "../runtime";
import type { GpuEffectHandle, HomeGpuRenderer } from "../types";
import type { WorkstreamPrintInputs, WorkstreamPrintTone } from "./types";
import printRevealShader from "./print-reveal.wgsl";

const PALETTES: Record<
  WorkstreamPrintTone,
  { paper: number[]; ink: number[] }
> = {
  project: { paper: [0.984, 0.89, 0.776, 1], ink: [0.184, 0.141, 0.09, 1] },
  wet: { paper: [0.984, 0.89, 0.776, 1], ink: [0.184, 0.141, 0.09, 1] },
  dry: { paper: [0.94, 0.9, 0.975, 1], ink: [0.29, 0.2, 0.42, 1] },
  engagement: { paper: [0.91, 0.97, 0.9, 1], ink: [0.16, 0.34, 0.18, 1] },
};

interface ArtworkTexture {
  texture: ReturnType<Gpu["gpu"]["createTexture"]>;
  width: number;
  height: number;
  dispose(): void;
}

async function uploadArtwork(
  gpu: Gpu,
  image: HTMLImageElement,
): Promise<ArtworkTexture> {
  await image.decode();
  const width = 1024;
  const height = Math.max(
    1,
    Math.round((width * image.naturalHeight) / image.naturalWidth),
  );
  const raster = document.createElement("canvas");
  raster.width = width;
  raster.height = height;
  const context = raster.getContext("2d")!;
  context.drawImage(image, 0, 0, width, height);
  const rgba = context.getImageData(0, 0, width, height).data;
  const bytesPerRow = width * 4;
  const upload = new Uint8Array(rgba);
  const texture = gpu.gpu.createTexture({
    size: [width, height],
    format: "rgba8unorm",
    usage: 0x02 | 0x04,
  });
  try {
    gpu.gpu.queue.writeTexture(
      { texture },
      upload,
      { bytesPerRow },
      { width, height },
    );
  } catch (error) {
    texture.destroy();
    throw error;
  }
  return { texture, width, height, dispose: () => texture.destroy() };
}

export function createWorkstreamPrintRenderer(
  image: HTMLImageElement,
  tone: WorkstreamPrintTone,
): HomeGpuRenderer<WorkstreamPrintInputs> {
  return {
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
      let canvasSurface: Surface | null = null;
      let artwork: ArtworkTexture | null = null;

      try {
        canvasSurface = surface(runtime.gpu, canvas, {
          dpr: [0.75, 1.25],
          alphaMode: "opaque",
          clearColor: [...PALETTES[tone].paper] as [
            number,
            number,
            number,
            number,
          ],
          label: `heal-workstream-${tone}`,
        });
        artwork = await uploadArtwork(runtime.gpu, image);
        if (disposed) {
          artwork.dispose();
          canvasSurface.dispose();
          return null;
        }

        const print = effect(runtime.gpu, printRevealShader, {
          label: `heal-workstream-${tone}`,
          set: {
            params: {
              drive: inputs.drive,
              source_aspect: artwork.width / artwork.height,
              canvas_aspect:
                canvasSurface.size[0] / Math.max(canvasSurface.size[1], 1),
              pad: 0,
              source_texel: [1 / artwork.width, 1 / artwork.height],
            },
            palette: PALETTES[tone],
            artwork: artwork.texture,
            artwork_sampler: sampler(runtime.gpu, {
              minFilter: "linear",
              magFilter: "linear",
            }),
          },
        });

        unsubscribeResize = canvasSurface.onResize(() => {
          if (!canvasSurface) return;
          print.set({
            params: {
              canvas_aspect:
                canvasSurface.size[0] / Math.max(canvasSurface.size[1], 1),
            },
          });
          jobHandle?.invalidate();
        });
        await print.compile({ colors: [canvasSurface.format] });
        if (disposed) {
          unsubscribeResize();
          artwork.dispose();
          canvasSurface.dispose();
          return null;
        }

        jobHandle = runtime.register({
          isVisible: () => !disposed && inputs.inView,
          render: (currentFrame) => {
            if (!canvasSurface) return false;
            print.set({ params: { drive: inputs.drive } });
            currentFrame.pass(canvasSurface, print);
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
            artwork?.dispose();
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
        artwork?.dispose();
        canvasSurface?.dispose();
        jobHandle?.dispose();
        lifecycle.onFailure();
        return null;
      }
    },
  };
}
