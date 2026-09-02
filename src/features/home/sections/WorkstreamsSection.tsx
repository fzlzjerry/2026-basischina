import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { PawPrint } from "@phosphor-icons/react";
import { Icon } from "@/shared/components/Icon";
import { WashiTape } from "@/shared/components/WashiTape";
import { resolveAssetUrl } from "@/shared/utils/assetUrl";
import { gsap, registerGsap, useGSAP } from "@/shared/motion/gsap";
import { WorkstreamPrintSurface } from "../components/WorkstreamPrintSurface";
import { createWorkstreamPrintInputs } from "../gpu/workstream/types";
import type { GpuEffectHandle } from "../gpu/types";

const WORKSTREAMS = [
  {
    title: "Project",
    cue: "from need to direction",
    line: "Map the need. Frame the idea. Keep the animal in view.",
    to: "/description",
    image: "assets/project-cover.webp",
    width: 1600,
    height: 800,
    alt: "A cat and dog mapping a pet-care project from need to testing",
    tone: "project",
  },
  {
    title: "Wet lab",
    cue: "from bench to evidence",
    line: "Build carefully. Measure honestly. Leave a readable trail.",
    to: "/experiments",
    image: "assets/wet-lab-cover.jpg",
    alt: "Two calico cats explore a wet-lab bench with test tubes and a gel tray",
    width: 1527,
    height: 1079,
    tone: "wet",
  },
  {
    title: "Dry lab",
    cue: "from model to decision",
    line: "Use computation to ask sharper questions of the biology.",
    to: "/model",
    image: "assets/dry-lab-cover.webp",
    alt: "Cats troubleshoot overlapping computer windows while another naps beside a plotted line",
    width: 1600,
    height: 1132,
    tone: "dry",
  },
  {
    title: "Engagement",
    cue: "listen together",
    line: "Bring the work outside the lab and let people reshape it.",
    to: "/human-practices",
    image: "assets/engagement-cover.webp",
    alt: "Four calico cats collaborate among notes, speech bubbles, and a chart",
    width: 1800,
    height: 1193,
    tone: "engagement",
  },
] as const;

/**
 * Four notebook leaves stack over one another on desktop scroll. Each leaf
 * is a real route into that workstream — the pin is the motion, the link
 * is the index.
 */
export function WorkstreamsSection() {
  const root = useRef<HTMLElement>(null);
  const [nearViewport, setNearViewport] = useState(false);
  const [preloadThrough, setPreloadThrough] = useState(1);
  const printInputs = useRef(
    WORKSTREAMS.map(() => createWorkstreamPrintInputs()),
  );
  const printHandles = useRef<Array<GpuEffectHandle | null>>(
    WORKSTREAMS.map(() => null),
  );
  const printHandleCallbacks = useRef(
    WORKSTREAMS.map((_, index) => (handle: GpuEffectHandle | null) => {
      printHandles.current[index] = handle;
    }),
  );

  useEffect(() => {
    const section = root.current;
    if (!section) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        setNearViewport(true);
        observer.disconnect();
      },
      { rootMargin: "70% 0px" },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useGSAP(
    () => {
      registerGsap();
      const mm = gsap.matchMedia();

      mm.add(
        "(min-width: 640px) and (prefers-reduced-motion: no-preference)",
        () => {
          const cards = gsap.utils.toArray<HTMLElement>(".js-workstream-card");
          const accessHandoffs: number[] = [];
          let activeCard = -1;
          const setActiveCard = (next: number) => {
            if (next === activeCard) return;
            activeCard = next;
            setPreloadThrough((current) =>
              Math.max(current, Math.min(cards.length - 1, next + 1)),
            );
            cards.forEach((card, index) => {
              const isActive = index === next;
              card.inert = !isActive;
              if (isActive) card.removeAttribute("aria-hidden");
              else card.setAttribute("aria-hidden", "true");
            });
          };
          const navHeight = () =>
            document.querySelector("header")?.getBoundingClientRect().height ??
            64;
          const pinDistance = () =>
            Math.round(
              window.innerHeight * (window.innerWidth >= 768 ? 4.5 : 3.4),
            );
          const firstRevealDuration = 0.34;
          const firstSlideAt = 0.48;
          const cardCycle = 0.82;
          const cardSlideDuration = 0.32;
          const printRevealDuration = 0.34;
          const finalHoldDuration = 0.18;

          cards.slice(1).forEach((card, index) => {
            gsap.set(card, {
              yPercent: 108,
              rotation: index % 2 === 0 ? 2.4 : -2.2,
              transformOrigin: "50% 100%",
            });
            gsap.set(card.querySelector(".workstream-copy"), { autoAlpha: 0 });
          });
          gsap.set(".js-workstream-progress", {
            scaleX: 0.25,
            transformOrigin: "left center",
          });

          printInputs.current.forEach((input) => {
            input.drive = 0;
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

          timeline.to(
            printInputs.current[0],
            {
              drive: 1,
              duration: firstRevealDuration,
              onUpdate: () => printHandles.current[0]?.invalidate(),
            },
            0,
          );

          cards.slice(1).forEach((card, index) => {
            const position = firstSlideAt + index * cardCycle;
            const revealAt = position + cardSlideDuration;
            accessHandoffs.push(position + cardSlideDuration * 0.62);
            const previous = cards[index];
            const currentImage = card.querySelector(".js-workstream-image");
            const previousImage = previous.querySelector(
              ".js-workstream-image",
            );
            const previousCopy = previous.querySelector(".workstream-copy");
            const currentCopy = card.querySelector(".workstream-copy");

            timeline
              .to(
                printInputs.current[index + 1],
                {
                  drive: 1,
                  duration: printRevealDuration,
                  onUpdate: () => printHandles.current[index + 1]?.invalidate(),
                },
                revealAt,
              )
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
                  duration: cardSlideDuration,
                  ease: "power4.inOut",
                },
                position,
              )
              .fromTo(
                currentImage,
                { scale: 1.04 },
                {
                  scale: 1,
                  duration: cardSlideDuration,
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

          const lastRevealEnd =
            firstSlideAt +
            (cards.length - 2) * cardCycle +
            cardSlideDuration +
            printRevealDuration;
          timeline.to(
            { value: 0 },
            { value: 1, duration: finalHoldDuration },
            lastRevealEnd,
          );

          setActiveCard(0);
          timeline.eventCallback("onUpdate", () => {
            const time = timeline.time();
            let next = 0;
            accessHandoffs.forEach((handoff, index) => {
              if (time >= handoff) next = index + 1;
            });
            setActiveCard(next);
          });

          return () => {
            cards.forEach((card) => {
              card.inert = false;
              card.removeAttribute("aria-hidden");
            });
          };
        },
      );

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      className="workstreams-section"
      aria-labelledby="workstreams-heading"
    >
      <h2 id="workstreams-heading" className="sr-only">
        Inside the HEAL project
      </h2>

      <div className="workstream-stage">
        {WORKSTREAMS.map((stream, index) => (
          <Link
            key={stream.title}
            to={stream.to}
            className={`js-workstream-card workstream-card workstream-card-${stream.tone} outline-focus-ring focus-visible:outline-2 focus-visible:outline-offset-[-6px]`}
            style={{ zIndex: index + 1 }}
          >
            <WashiTape
              tone={index % 2 === 0 ? "orange" : "teal"}
              className={`top-6 left-[16%] z-[5] w-32 ${index % 2 === 0 ? "-rotate-2" : "rotate-3"}`}
            />
            <WorkstreamPrintSurface
              src={resolveAssetUrl(stream.image)}
              alt={stream.alt}
              width={stream.width}
              height={stream.height}
              tone={stream.tone}
              inputs={printInputs.current[index]}
              onHandle={printHandleCallbacks.current[index]}
              className="js-workstream-image workstream-image"
              preload={nearViewport && index <= preloadThrough}
            />

            <div className="workstream-copy">
              <span className="workstream-cue">{stream.cue}</span>
              <h3>{stream.title}</h3>
              <p>{stream.line}</p>
              <span className="workstream-open">
                Open
                <Icon as={PawPrint} weight="fill" />
              </span>
            </div>
          </Link>
        ))}

        <div className="workstream-chrome" aria-hidden="true">
          <span className="workstream-progress-track heal-rule">
            <span className="js-workstream-progress workstream-progress" />
          </span>
        </div>
      </div>
    </section>
  );
}
