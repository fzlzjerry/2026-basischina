import { useRef } from "react";
import { MoleculeViewer } from "@/features/molecule/MoleculeViewer";
import { Title } from "@/shared/components/Title";
import { gsap, registerGsap, useGSAP } from "@/shared/motion/gsap";

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
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      registerGsap();
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".js-reveal-up", {
          y: 28,
          opacity: 0,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.15,
          clearProps: "all",
          scrollTrigger: {
            trigger: root.current,
            start: "top 75%",
            once: true,
          },
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} className="bg-surface-2">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-24 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div className="js-reveal-up">
          <Title level="h2">Molecules in motion</Title>
          <p className="mt-6 text-lg text-ink-soft">
            Synthetic biology is the engineering of molecular machines. Drag the
            model to rotate it and explore the structure from any angle.
          </p>
        </div>
        <div className="js-reveal-up ac-polka rounded-card border-2 border-border bg-surface p-3 shadow-card-lift">
          <MoleculeViewer
            className="overflow-hidden rounded-min"
            label="Interactive 3D model of a water molecule"
            sdfData={SAMPLE_MOLECULE}
            format="sdf"
            autoRotate
          />
        </div>
      </div>
    </section>
  );
}
