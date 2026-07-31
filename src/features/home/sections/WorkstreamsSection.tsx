import { useRef } from "react";
import { resolveAssetUrl } from "@/shared/utils/assetUrl";
import { gsap, registerGsap, useGSAP } from "@/shared/motion/gsap";

const WORKSTREAMS = [
  {
    number: "01",
    title: "Project",
    eyebrow: "QUESTION TO DIRECTION",
    line: "Map the need. Frame the idea. Keep the animal in view.",
    image: "assets/project-cover.webp",
    alt: "A cat and dog mapping a pet-care project from need to testing",
    tone: "project",
  },
  {
    number: "02",
    title: "Wet lab",
    eyebrow: "BENCH TO EVIDENCE",
    line: "Build carefully. Measure honestly. Leave a readable trail.",
    image: "assets/wet-lab-cover.webp",
    alt: "A cat and dog carrying out a careful wet-lab experiment",
    tone: "wet",
  },
  {
    number: "03",
    title: "Dry lab",
    eyebrow: "MODEL TO DECISION",
    line: "Use computation to ask sharper questions of the biology.",
    image: "assets/dry-lab-cover-v2.webp",
    alt: "A cat and dog collaborating on modeling, software, and hardware",
    tone: "dry",
  },
  {
    number: "04",
    title: "Engagement",
    eyebrow: "LISTEN TOGETHER",
    line: "Bring the work outside the lab and let people reshape it.",
    image: "assets/engagement-cover-v2.webp",
    alt: "A cat and dog building a community engagement board",
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

          cards.slice(1).forEach((card) => {
            gsap.set(card, { clipPath: "inset(100% 0 0 0)" });
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
                  scale: 0.94,
                  rotation: index % 2 === 0 ? -1.5 : 1.5,
                  duration: 0.24,
                  ease: "power2.inOut",
                },
                position,
              )
              .to(
                card,
                {
                  clipPath: "inset(0% 0 0 0)",
                  duration: 0.3,
                  ease: "power4.inOut",
                },
                position,
              )
              .fromTo(
                currentImage,
                { scale: 1.08, rotation: index % 2 === 0 ? 1.2 : -1.2 },
                {
                  scale: 1,
                  rotation: 0,
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
                position + 0.26,
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
            <img
              src={resolveAssetUrl(stream.image)}
              alt={stream.alt}
              width={1600}
              height={800}
              className="js-workstream-image workstream-image"
              loading="lazy"
              decoding="async"
            />

            <div className="workstream-copy">
              <span className="workstream-eyebrow">{stream.eyebrow}</span>
              <span className="workstream-number">{stream.number}</span>
              <h3>{stream.title}</h3>
              <p>{stream.line}</p>
            </div>
          </article>
        ))}

        <div className="workstream-chrome">
          <span>INSIDE THE PROJECT</span>
          <span className="workstream-progress-track">
            <span className="js-workstream-progress workstream-progress" />
          </span>
          <span>04 LEAVES</span>
        </div>
      </div>
    </section>
  );
}
