import type { HomeGpuInputs } from "../types";

export interface WorkstreamPrintInputs extends HomeGpuInputs {
  drive: number;
}

export function createWorkstreamPrintInputs(): WorkstreamPrintInputs {
  return { drive: 0, inView: false };
}

export type WorkstreamPrintTone = "project" | "wet" | "dry" | "engagement";
