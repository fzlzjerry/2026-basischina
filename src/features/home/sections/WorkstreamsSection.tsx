import { useRef } from "react";
import { WashiTape } from "@/shared/components/WashiTape";
import { stickerStyle } from "@/shared/styles/heal";
import { resolveAssetUrl } from "@/shared/utils/assetUrl";
import { gsap, registerGsap, useGSAP } from "@/shared/motion/gsap";

const WORKSTREAMS = [
  {
    folio: "one",
    title: "Project",
    cue: "from need to direction",
    line: "Map the need. Frame the idea. Keep the animal in view.",
    image: "assets/project-cover.webp",
    width: 1600,
    height: 800,
    alt: "A cat and dog mapping a pet-care project from need to testing",
    tone: "project",
  },
  {
    folio: "two",
    title: "Wet lab",
    cue: "from bench to evidence",
    line: "Build carefully. Measure honestly. Leave a readable trail.",
    image: "assets/wet-lab-cover.jpg",
    alt: "Two calico cats explore a wet-lab bench with test tubes and a gel tray",
    width: 1527,
    height: 1079,
    tone: "wet",
  },
  {
    folio: "three",
    title: "Dry lab",
    cue: "from model to decision",
    line: "Use computation to ask sharper questions of the biology.",
    image: "assets/dry-lab-cover.webp",
    alt: "Cats troubleshoot overlapping computer windows while another naps beside a plotted line",
    width: 1600,
    height: 1132,
    tone: "dry",
  },
  {
    folio: "four",
    title: "Engagement",
    cue: "listen together",
    line: "Bring the work outside the lab and let people reshape it.",
    image: "assets/engagement-cover.webp",
    alt: "Four calico cats collaborate among notes, speech bubbles, and a chart",
    width: 1800,
    height: 1193,
    tone: "engagement",
  },
] as const;

/**
 * Four full-screen notebook leaves stack over one another as the visitor keeps
 * scrolling. The deck is an expressive preview; the semantic, keyboard-
 * accessible route index remains the Highlights section immediately below.
 */
export function WorkstreamsSection() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      registerGsap();
      const mm = gsap.matchMedia();

      mm.add(
        "(min-width: 640px) and (prefers-reduced-motion: no-preference)",
        () => {
          const cards = gsap.utils.toArray<HTMLElement>(".js-workstream-card");
          const navHeight = () =>
            document.querySelector("header")?.getBoundingClientRect().height ??
            64;
          const pinDistance = () =>
            Math.round(
              window.innerHeight * (window.innerWidth >= 768 ? 3.8 : 2.8),
            );

          cards.slice(1).forEach((card, index) => {
            gsap.set(card, {
              yPercent: 108,
              rotation: index % 2 === 0 ? 2.4 : -2.2,
              transformOrigin: "50% 100%",
              visibility: "visible",
            });
            gsap.set(card.querySelector(".workstream-copy"), { autoAlpha: 0 });
          });
          gsap.set(".js-workstream-progress", {
            scaleX: 0.25,
            transformOrigin: "left center",
          });

          const timeline = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: root.current,
              start: () => `top top+=${navHeight()}`,
              end: () => `+=${pinDistance()}`,
              pin: true,
              pinSpacing: true,
              scrub: 0.95,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          });

          cards.slice(1).forEach((card, index) => {
            const position = index * 0.3;
            const previous = cards[index];
            const currentImage = card.querySelector(".js-workstream-image");
            const previousImage = previous.querySelector(
              ".js-workstream-image",
            );
            const previousCopy = previous.querySelector(".workstream-copy");
            const currentCopy = card.querySelector(".workstream-copy");

            timeline
              .to(
                previousCopy,
                {
                  autoAlpha: 0,
                  duration: 0.07,
                  ease: "power2.in",
                },
                position + 0.04,
              )
              .to(
                previousImage,
                {
                  scale: 0.97,
                  duration: 0.24,
                  ease: "power2.inOut",
                },
                position,
              )
              .to(
                card,
                {
                  yPercent: 0,
                  rotation: 0,
                  duration: 0.3,
                  ease: "power4.inOut",
                },
                position,
              )
              .fromTo(
                currentImage,
                { scale: 1.04 },
                {
                  scale: 1,
                  duration: 0.3,
                  ease: "power3.out",
                },
                position,
              )
              .to(
                currentCopy,
                {
                  autoAlpha: 1,
                  duration: 0.08,
                  ease: "power2.out",
                },
                position + 0.22,
              )
              .to(
                ".js-workstream-progress",
                {
                  scaleX: (index + 2) / cards.length,
                  duration: 0.28,
                },
                position,
              );
          });
        },
      );

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} className="workstreams-section">
      <h2 className="sr-only">Inside the HEAL project</h2>

      <div aria-hidden="true" className="workstream-stage">
        {WORKSTREAMS.map((stream, index) => (
          <article
            key={stream.title}
            className={`js-workstream-card workstream-card workstream-card-${stream.tone}`}
            style={{ zIndex: index + 1 }}
          >
            <WashiTape
              tone={index % 2 === 0 ? "orange" : "teal"}
              className={`top-6 left-[16%] z-[5] w-32 ${index % 2 === 0 ? "-rotate-2" : "rotate-3"}`}
            />
            <img
              src={resolveAssetUrl(stream.image)}
              alt={stream.alt}
              width={stream.width}
              height={stream.height}
              className="js-workstream-image workstream-image"
              loading="lazy"
              decoding="async"
            />

            <div className="workstream-copy">
              <span className="workstream-cue">{stream.cue}</span>
              <span
                className="workstream-folio heal-cutout"
                style={stickerStyle(index)}
              >
                {stream.folio}
              </span>
              <h3>{stream.title}</h3>
              <p>{stream.line}</p>
            </div>
          </article>
        ))}

        <div className="workstream-chrome">
          <span>inside the notebook</span>
          <span className="workstream-progress-track heal-rule">
            <span className="js-workstream-progress workstream-progress" />
          </span>
          <span>four pages</span>
        </div>
      </div>
    </section>
  );
}
