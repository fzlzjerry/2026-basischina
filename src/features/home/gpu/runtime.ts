import { clock, frame, init, type Frame, type Gpu } from "vgpu";
import { gsap } from "@/shared/motion/gsap";
import type { GpuEffectHandle } from "./types";

interface RuntimeJob {
  isVisible(): boolean;
  /** Return true when another frame is required without a new invalidation. */
  render(currentFrame: Frame, deltaSeconds: number): boolean;
  onFailure(): void;
}

interface JobState {
  job: RuntimeJob;
  dirty: boolean;
  disposed: boolean;
}

const MAX_DELTA_SECONDS = 1 / 20;

class HomeGpuRuntime {
  readonly gpu: Gpu;

  private readonly jobs = new Set<JobState>();
  private readonly gpuClock;
  private tickerAttached = false;
  private disposed = false;
  private readonly releaseErrorListener: () => void;

  constructor(gpu: Gpu) {
    this.gpu = gpu;
    this.gpuClock = clock(gpu);
    this.releaseErrorListener = gpu.onError(() => this.fail());

    void gpu.gpu.lost.then(() => this.fail());
    document.addEventListener("visibilitychange", this.onVisibilityChange);
  }

  register(job: RuntimeJob): GpuEffectHandle {
    if (this.disposed) {
      job.onFailure();
      return { invalidate() {}, dispose() {} };
    }

    const state: JobState = { job, dirty: true, disposed: false };
    this.jobs.add(state);
    this.ensureTicker();

    return {
      invalidate: () => {
        if (state.disposed || this.disposed) return;
        state.dirty = true;
        this.ensureTicker();
      },
      dispose: () => {
        if (state.disposed) return;
        state.disposed = true;
        this.jobs.delete(state);
        if (this.jobs.size === 0) this.dispose();
      },
    };
  }

  private readonly onVisibilityChange = () => {
    if (document.hidden) {
      this.detachTicker();
      return;
    }

    for (const state of this.jobs) state.dirty = true;
    this.ensureTicker();
  };

  private readonly tick = (_time: number, deltaMs: number) => {
    if (this.disposed || document.hidden) {
      this.detachTicker();
      return;
    }

    const runnable = [...this.jobs].filter(
      (state) => !state.disposed && state.dirty && state.job.isVisible(),
    );

    if (runnable.length === 0) {
      this.detachTicker();
      return;
    }

    const deltaSeconds = Math.min(
      Math.max(deltaMs / 1000, 0),
      MAX_DELTA_SECONDS,
    );

    for (const state of runnable) state.dirty = false;

    try {
      this.gpuClock.advance(deltaSeconds);
      frame(this.gpu, (currentFrame) => {
        for (const state of runnable) {
          if (state.job.render(currentFrame, deltaSeconds)) state.dirty = true;
        }
      });
    } catch {
      this.fail();
      return;
    }

    if (![...this.jobs].some((state) => state.dirty)) this.detachTicker();
  };

  private ensureTicker() {
    if (this.disposed || this.tickerAttached || document.hidden) return;
    this.tickerAttached = true;
    gsap.ticker.add(this.tick);
  }

  private detachTicker() {
    if (!this.tickerAttached) return;
    this.tickerAttached = false;
    gsap.ticker.remove(this.tick);
  }

  private fail() {
    if (this.disposed) return;
    for (const state of this.jobs) state.job.onFailure();
    this.dispose();
  }

  private dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.detachTicker();
    document.removeEventListener("visibilitychange", this.onVisibilityChange);
    this.releaseErrorListener();
    this.jobs.clear();
    this.gpu.dispose();
    releaseRuntime(this);
  }
}

let runtime: HomeGpuRuntime | null = null;
let runtimePromise: Promise<HomeGpuRuntime | null> | null = null;

async function createRuntime(): Promise<HomeGpuRuntime | null> {
  try {
    const gpu = await init({
      powerPreference: "low-power",
      label: "heal-homepage",
    });
    runtime = new HomeGpuRuntime(gpu);
    return runtime;
  } catch {
    runtimePromise = null;
    return null;
  }
}

function releaseRuntime(value: HomeGpuRuntime) {
  if (runtime !== value) return;
  runtime = null;
  runtimePromise = null;
}

export function acquireHomeGpuRuntime(): Promise<HomeGpuRuntime | null> {
  if (runtime) return Promise.resolve(runtime);
  runtimePromise ??= createRuntime();
  return runtimePromise;
}

export type { HomeGpuRuntime, RuntimeJob };
