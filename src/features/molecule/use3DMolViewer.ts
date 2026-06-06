import { useEffect, useRef, useState } from "react";
import { useScript } from "@/shared/hooks/useScript";
import { resolveAssetUrl } from "@/shared/utils/assetUrl";
import type {
  Mol3D,
  MoleculeViewerOptions,
  MoleculeViewerState,
} from "./types";

// 3Dmol is loaded from CDN on demand so it never enters the main bundle (§19).
const MOL3D_SRC = "https://3dmol.org/build/3Dmol-min.js";

function get3Dmol(): Mol3D | undefined {
  return (globalThis as unknown as { $3Dmol?: Mol3D }).$3Dmol;
}

/**
 * Drive a 3Dmol viewer (§19). Owns script loading, viewport-triggered
 * initialization, molecule loading, reduced-motion handling, and cleanup of the
 * animation/viewer on unmount. The component only renders the container.
 */
export function use3DMolViewer(
  options: MoleculeViewerOptions,
): MoleculeViewerState {
  const { elementId, sdfUrl, sdfData, format = "sdf", autoRotate } = options;
  const [inView, setInView] = useState(false);
  const [state, setState] = useState<MoleculeViewerState>({
    loading: false,
    error: null,
    ready: false,
  });
  const initialized = useRef(false);

  // Only load the script once the viewer scrolls into view.
  const scriptStatus = useScript(inView ? MOL3D_SRC : null);

  // Observe the container's visibility.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const element = document.getElementById(elementId);
    if (!element) return;
    if (!("IntersectionObserver" in window)) {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [elementId]);

  useEffect(() => {
    if (scriptStatus === "loading") setState((s) => ({ ...s, loading: true }));
    if (scriptStatus === "error") {
      setState({
        loading: false,
        ready: false,
        error: "Failed to load the 3D viewer library.",
      });
    }
  }, [scriptStatus]);

  useEffect(() => {
    if (!inView || scriptStatus !== "ready" || initialized.current) return;
    const $3Dmol = get3Dmol();
    const element = document.getElementById(elementId);
    if (!$3Dmol || !element) return;

    initialized.current = true;
    let disposed = false;
    let viewer: ReturnType<Mol3D["createViewer"]> | null = null;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    async function render() {
      setState({ loading: true, error: null, ready: false });
      try {
        const data = sdfData
          ? sdfData
          : sdfUrl
            ? await fetch(resolveAssetUrl(sdfUrl)).then((res) => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.text();
              })
            : "";
        if (disposed || !element || !$3Dmol) return;
        if (!data.trim()) throw new Error("No molecule data provided.");

        viewer = $3Dmol.createViewer(element, {
          backgroundColor: "white",
          backgroundAlpha: 0,
        });
        viewer.addModel(data, format);
        viewer.setStyle(
          {},
          { stick: { radius: 0.12 }, sphere: { scale: 0.28 } },
        );
        viewer.zoomTo();
        viewer.render();
        if (autoRotate && !prefersReducedMotion) viewer.spin("y", 0.5);
        setState({ loading: false, error: null, ready: true });
      } catch (error) {
        if (disposed) return;
        setState({
          loading: false,
          ready: false,
          error:
            error instanceof Error
              ? `Could not render molecule: ${error.message}`
              : "Could not render molecule.",
        });
      }
    }

    void render();

    return () => {
      disposed = true;
      if (viewer) {
        try {
          viewer.spin(false);
          viewer.clear();
        } catch {
          // Viewer may already be torn down; ignore.
        }
      }
    };
  }, [inView, scriptStatus, elementId, sdfUrl, sdfData, format, autoRotate]);

  return state;
}
