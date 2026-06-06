import { MoleculeViewer } from "@/features/molecule/MoleculeViewer";
import { Title } from "@/shared/components/Title";

// A small, valid inline SDF (water) so the demo works with no network or asset
// dependency. Replace `sdfData` with `sdfUrl="assets/molecules/your.sdf"` (place
// the file in public/assets/molecules/) to show your project's molecule.
const SAMPLE_MOLECULE = `Water
  BASIS-China

  3  2  0  0  0  0  0  0  0  0999 V2000
    0.0000    0.0000    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0
    0.7572    0.5860    0.0000 H   0  0  0  0  0  0  0  0  0  0  0  0
   -0.7572    0.5860    0.0000 H   0  0  0  0  0  0  0  0  0  0  0  0
  1  2  1  0  0  0  0
  1  3  1  0  0  0  0
M  END
$$$$
`;

/**
 * Homepage molecule section (§20). Composes the isolated molecule feature; the
 * viewer only loads 3Dmol when scrolled into view.
 */
export function MoleculeSection() {
  return (
    <section className="bg-page">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <Title level="h2">Molecules in motion</Title>
          <p className="mt-4 text-ink-soft">
            Synthetic biology is the engineering of molecular machines. Drag to
            rotate the interactive model — a placeholder we will replace with
            the key molecules from our project.
          </p>
          <p className="mt-4 text-sm text-ink-soft">
            The 3D viewer is loaded only when this section scrolls into view,
            and auto-rotation pauses for visitors who prefer reduced motion.
          </p>
        </div>
        <MoleculeViewer
          label="Interactive 3D model of a water molecule"
          sdfData={SAMPLE_MOLECULE}
          format="sdf"
          autoRotate
        />
      </div>
    </section>
  );
}
