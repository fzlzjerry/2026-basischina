interface NavigatorPerformanceHints extends Navigator {
  connection?: {
    saveData?: boolean;
    effectiveType?: string;
  };
  deviceMemory?: number;
}

export const HOME_GPU_MIN_WIDTH = 640;
export const HOME_GPU_MOTION_QUERY = "(prefers-reduced-motion: no-preference)";

/**
 * Fail-closed capability gate. Every VGPU canvas has an authored CSS/SVG
 * baseline, so constrained devices lose no content or navigation.
 */
export function canMountHomeGpu(minWidth = HOME_GPU_MIN_WIDTH): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return false;
  }
  if (!window.matchMedia(`(min-width: ${minWidth}px)`).matches) return false;
  if (!window.matchMedia(HOME_GPU_MOTION_QUERY).matches) return false;
  if (navigator.gpu == null) return false;

  const hints = navigator as NavigatorPerformanceHints;
  const connection = hints.connection;
  const constrainedNetwork =
    connection?.saveData === true ||
    connection?.effectiveType === "slow-2g" ||
    connection?.effectiveType === "2g";
  const constrainedMemory =
    typeof hints.deviceMemory === "number" && hints.deviceMemory <= 4;
  const constrainedCpu =
    navigator.hardwareConcurrency > 0 && navigator.hardwareConcurrency <= 4;

  return !constrainedNetwork && !constrainedMemory && !constrainedCpu;
}
