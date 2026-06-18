import { useRef } from "react";
import { MoleculeViewer } from "@/features/molecule/MoleculeViewer";
import { SectionDivider } from "@/shared/components/SectionDivider";
import {
  gsap,
  ScrollTrigger,
  registerGsap,
  useGSAP,
} from "@/shared/motion/gsap";
import { HomeSectionHeader } from "../components/HomeSectionHeader";
import { PeekingDog } from "../scene/Peekers";

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
 * Homepage molecule section (§20). The 3D viewer sits inside a round porthole
 * window that echoes the hero's arched window (same wood, same sky), with the
 * dog peeking around the rim — "look closer" as a literal window into the
 * molecular world. The viewer only loads 3Dmol when scrolled into view.
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

        // PeekingDog at the porthole gets this section's one quiet idle beat:
        // a slow bob plus an occasional blink, mirroring the highlights cat.
        // GSAP touches only the inner js- groups; paused unless on screen.
        const idle = gsap.timeline({ paused: true });
        idle
          .to(
            ".js-peek-dog",
            { y: 3, duration: 3.2, ease: "sine.inOut", repeat: -1, yoyo: true },
            0,
          )
          .to(
            ".js-peek-dog-eyes",
            {
              scaleY: 0.1,
              transformOrigin: "50% 50%",
              duration: 0.09,
              ease: "power1.inOut",
              repeat: -1,
              repeatDelay: 4,
              yoyo: true,
            },
            1.4,
          );
        const idleVis = ScrollTrigger.create({
          trigger: root.current,
          start: "top bottom",
          end: "bottom top",
          onToggle: (self) => (self.isActive ? idle.play() : idle.pause()),
        });

        return () => {
          idle.kill();
          idleVis.kill();
        };
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} className="bg-room-wall heal-grid">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-20 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div className="js-reveal-up">
          <HomeSectionHeader
            title="Molecules in motion"
            lede="Synthetic biology is the engineering of molecular machines. Drag the model to rotate it and explore the structure from any angle."
          />
        </div>

        <div className="js-reveal-up relative mx-auto w-full max-w-sm lg:max-w-md">
          <div className="relative aspect-square">
            {/* porthole: wood ring + sunset-sky glass, echoing the hero window */}
            <div
              className="absolute inset-0 rounded-full border-[8px] border-sticker-ink"
              style={{
                // Hard colour bands (no continuous blend) so the porthole reads
                // as a drawn window, matching the flat sticker fills elsewhere.
                // Sky band echoes the hero window's #bcd3ea; warm bands reuse
                // sunset tokens.
                background:
                  "linear-gradient(180deg, #bcd3ea 0 46%, var(--color-sunset-sky) 46% 78%, var(--color-sunset) 78% 100%)",
                boxShadow: "var(--shadow-sticker-hover)",
              }}
            >
              <div className="absolute inset-0 overflow-hidden rounded-full">
                <MoleculeViewer
                  frameless
                  label="Interactive 3D model of a water molecule"
                  sdfData={SAMPLE_MOLECULE}
                  format="sdf"
                  autoRotate
                />
              </div>
            </div>
            <PeekingDog className="pointer-events-none absolute -left-10 bottom-6 w-36 -rotate-6" />
          </div>
          <p className="mt-5 text-center text-sm text-ink-soft">
            A water molecule, to start small. Drag it around.
          </p>
        </div>
      </div>
      <SectionDivider fill="var(--color-sunset-sky)" flip />
    </section>
  );
}
