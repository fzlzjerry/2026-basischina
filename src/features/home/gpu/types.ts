import type { RefObject } from "react";

export interface HomeGpuInputs {
  inView: boolean;
}

export interface HeroPaperInputs extends HomeGpuInputs {
  /** Horizontal chapter-space offset: Understand 0, Engineer 1, Care 2. */
  track: number;
  /** Overall hero cinema progress, used only to tighten the wet seam. */
  wet: number;
}

export interface GpuEffectHandle {
  invalidate(): void;
  dispose(): void;
}

export interface GpuRendererLifecycle {
  onLive(): void;
  onFailure(): void;
}

export interface HomeGpuRenderer<I extends HomeGpuInputs> {
  start(
    canvas: HTMLCanvasElement,
    inputs: I,
    lifecycle: GpuRendererLifecycle,
  ): Promise<GpuEffectHandle | null>;
}

export type HomeGpuRendererLoader<I extends HomeGpuInputs> = () => Promise<
  HomeGpuRenderer<I>
>;

export type ElementRef<T extends Element = HTMLElement> = RefObject<T | null>;

export function createHeroPaperInputs(): HeroPaperInputs {
  return { track: 0, wet: 0, inView: true };
}
