import { useId } from "react";
import { use3DMolViewer } from "./use3DMolViewer";
import type { MoleculeViewerOptions } from "./types";

type MoleculeViewerProps = Omit<MoleculeViewerOptions, "elementId"> & {
  /** Accessible label describing the molecule being shown. */
  label: string;
  className?: string;
  /**
   * Render without the card chrome and figcaption: a bare, full-size canvas
   * host for callers that provide their own frame (e.g. the homepage
   * porthole). The label stays on the canvas element for assistive tech.
   */
  frameless?: boolean;
};

/**
 * Molecule viewer component (§19): owns only markup. All script loading, viewer
 * lifecycle, and cleanup live in use3DMolViewer.
 */
export function MoleculeViewer({
  label,
  className,
  frameless = false,
  ...options
}: MoleculeViewerProps) {
  const elementId = `mol-${useId().replace(/:/g, "")}`;
  const { loading, error, ready } = use3DMolViewer({ ...options, elementId });

  const overlays = (
    <>
      {!ready && !error ? (
        <span className="absolute inset-0 flex items-center justify-center text-sm text-ink-muted">
          {loading ? "Loading 3D viewer…" : "Scroll to load 3D viewer"}
        </span>
      ) : null}
      {error ? (
        <span className="absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-ink-muted">
          {error}
        </span>
      ) : null}
    </>
  );

  if (frameless) {
    return (
      <div
        id={elementId}
        role="img"
        aria-label={label}
        data-print-hide
        className={`relative h-full w-full ${className ?? ""}`}
      >
        {overlays}
      </div>
    );
  }

  return (
    <figure className={className} data-print-hide>
      <div
        id={elementId}
        role="img"
        aria-label={label}
        className="relative mx-auto aspect-square w-full max-w-md rounded-card border-2 border-border bg-page"
      >
        {overlays}
      </div>
      <figcaption className="mt-3 text-center text-sm text-ink-soft">
        {label}
      </figcaption>
    </figure>
  );
}
