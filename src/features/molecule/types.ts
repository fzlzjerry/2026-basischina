export interface MoleculeViewerOptions {
  /** DOM id of the container element the viewer mounts into. */
  elementId: string;
  /** URL of an SDF/MOL/PDB file to load (resolved through resolveAssetUrl). */
  sdfUrl?: string;
  /** Inline molecule data, used instead of fetching when provided. */
  sdfData?: string;
  /** Format of sdfData/sdfUrl. Defaults to "sdf". */
  format?: "sdf" | "mol" | "pdb" | "xyz";
  /** Slowly rotate the molecule (disabled automatically for reduced motion). */
  autoRotate?: boolean;
}

export interface MoleculeViewerState {
  loading: boolean;
  error: string | null;
  ready: boolean;
}

/** Minimal structural typing for the global 3Dmol library loaded from CDN. */
export interface Mol3DViewer {
  addModel: (data: string, format: string) => void;
  setStyle: (sel: object, style: object) => void;
  zoomTo: () => void;
  render: () => void;
  spin: (axis: string | boolean, speed?: number) => void;
  clear: () => void;
  resize: () => void;
}

export interface Mol3D {
  createViewer: (
    element: HTMLElement,
    config?: { backgroundColor?: string; backgroundAlpha?: number },
  ) => Mol3DViewer;
}
