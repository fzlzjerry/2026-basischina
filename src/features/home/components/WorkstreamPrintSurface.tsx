import { useCallback, useRef, useState } from "react";
import { LazyGpuCanvas } from "../gpu/LazyGpuCanvas";
import type { GpuEffectHandle, HomeGpuRenderer } from "../gpu/types";
import type {
  WorkstreamPrintInputs,
  WorkstreamPrintTone,
} from "../gpu/workstream/types";

interface WorkstreamPrintSurfaceProps {
  inputs: WorkstreamPrintInputs;
  onHandle?: (handle: GpuEffectHandle | null) => void;
  src: string;
  alt: string;
  width: number;
  height: number;
  tone: WorkstreamPrintTone;
  className?: string;
  preload?: boolean;
}

export function WorkstreamPrintSurface({
  inputs,
  onHandle,
  src,
  alt,
  width,
  height,
  tone,
  className = "",
  preload = false,
}: WorkstreamPrintSurfaceProps) {
  const root = useRef<HTMLDivElement>(null);
  const image = useRef<HTMLImageElement>(null);
  const [live, setLive] = useState(false);

  const loadRenderer = useCallback(async () => {
    const source = image.current;
    if (!source) throw new Error("Workstream artwork is not mounted.");
    const module = await import("../gpu/workstream/startWorkstreamPrint");
    return module.createWorkstreamPrintRenderer(
      source,
      tone,
    ) as HomeGpuRenderer<WorkstreamPrintInputs>;
  }, [tone]);

  return (
    <div
      ref={root}
      className={`${className}${live ? " is-print-live" : ""}`}
      data-print-tone={tone}
    >
      <img
        ref={image}
        crossOrigin="anonymous"
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="workstream-print-image"
        loading={preload ? "eager" : "lazy"}
        decoding="async"
      />
      <LazyGpuCanvas
        hostRef={root}
        inputs={inputs}
        load={loadRenderer}
        className="workstream-print-canvas"
        preload={preload}
        onHandle={onHandle}
        onLiveChange={setLive}
      />
    </div>
  );
}
