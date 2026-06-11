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
        frameless ? (
          // Friendly placeholder so the porthole is never an empty circle
          // with utility text: a static water molecule in the house art
          // style, swapped out when the 3D canvas renders.
          <span className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-sm font-semibold text-ink-soft">
            <svg viewBox="0 0 120 90" aria-hidden="true" className="w-24">
              <g strokeLinecap="round">
                <path
                  d="M60 52 L 30 30 M60 52 L 90 30"
                  stroke="#7a5230"
                  strokeWidth="5"
                />
                <circle
                  cx="28"
                  cy="27"
                  r="14"
                  style={{ fill: "var(--color-app-teal)" }}
                  stroke="#27695a"
                  strokeWidth="3.5"
                />
                <circle
                  cx="92"
                  cy="27"
                  r="14"
                  style={{ fill: "var(--color-app-teal)" }}
                  stroke="#27695a"
                  strokeWidth="3.5"
                />
                <circle
                  cx="60"
                  cy="54"
                  r="22"
                  fill="#fdf3e2"
                  stroke="#7a5230"
                  strokeWidth="3.5"
                />
              </g>
            </svg>
            {loading ? "Waking it up…" : "A tiny molecule lives here"}
          </span>
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-sm text-ink-muted">
            {loading ? "Loading 3D viewer…" : "Scroll to load 3D viewer"}
          </span>
        )
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
