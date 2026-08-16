import { useEffect, useRef, type RefObject } from "react";
import type { Sketch } from "drawably";

/** Attach a drawably sketch after mount and destroy it on teardown. */
export function useInkSketch<T extends HTMLElement>(
  attach: (el: T) => Sketch,
  deps: readonly unknown[],
): RefObject<T> {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!ref.current) return;
    const sketch = attach(ref.current);
    return () => sketch.destroy();
    // Caller owns the dependency list — same contract as drawably/react.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return ref;
}
