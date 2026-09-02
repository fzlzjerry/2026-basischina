import type { HomeGpuInputs } from "../types";

export interface KineticTextInkInputs extends HomeGpuInputs {
  drive: number;
  maskVersion: number;
}

export function createKineticTextInkInputs(): KineticTextInkInputs {
  return { drive: 0, maskVersion: 0, inView: false };
}
