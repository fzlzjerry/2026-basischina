import { useId } from "react";
import { use3DMolViewer } from "./use3DMolViewer";
import type { MoleculeViewerOptions } from "./types";

type MoleculeViewerProps = Omit<MoleculeViewerOptions, "elementId"> & {
  /** Accessible label describing the molecule being shown. */
  label: string;
  className?: string;
};

/**
 * Molecule viewer component (§19): owns only markup. All script loading, viewer
 * lifecycle, and cleanup live in use3DMolViewer.
 */
export function MoleculeViewer({
  label,
  className,
  ...options
}: MoleculeViewerProps) {
  const elementId = `mol-${useId().replace(/:/g, "")}`;
  const { loading, error, ready } = use3DMolViewer({ ...options, elementId });

  return (
    <figure className={className} data-print-hide>
      <div
        id={elementId}
        role="img"
        aria-label={label}
        className="relative mx-auto aspect-square w-full max-w-md rounded-card border-2 border-border bg-page"
      >
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
      </div>
      <figcaption className="mt-3 text-center text-sm text-ink-soft">
        {label}
      </figcaption>
    </figure>
  );
}
