import { useRef } from "react";
import { MagnifyingGlass, Flask, Heart } from "@phosphor-icons/react";
import { Icon } from "@/shared/components/Icon";
import { Title } from "@/shared/components/Title";
import { gsap, registerGsap, useGSAP } from "@/shared/motion/gsap";

/**
 * Approach section (§20). The platform story in three warm, plain-language
 * steps — understand pets, engineer gentle biology, turn it into everyday care.
 * No DNA, no product shot; icons carry the rhythm, not boxed cards. Reveal is
 * gated for reduced motion.
 */

interface Step {
  Icon: typeof MagnifyingGlass;
  title: string;
  body: string;
}

const STEPS: Step[] = [
  {
    Icon: MagnifyingGlass,
    title: "Understand",
    body: "We learn what keeps cats and dogs healthy, comfortable, and happy at home.",
  },
  {
    Icon: Flask,
    title: "Engineer",
    body: "We use synthetic biology to design gentle, effective ingredients from friendly microbes.",
  },
  {
    Icon: Heart,
    title: "Care",
    body: "We turn them into everyday products our pets actually enjoy.",
  },
];

export function ApproachSection() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      registerGsap();
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".js-approach-reveal", {
          y: 28,
          opacity: 0,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.12,
          clearProps: "all",
          scrollTrigger: {
            trigger: root.current,
            start: "top 78%",
            once: true,
          },
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} className="bg-surface">
      <div className="mx-auto max-w-5xl px-4 py-24 text-center sm:px-6 lg:px-8">
        <Title level="h2" align="center" className="js-approach-reveal">
          From biology to belly rubs.
        </Title>
        <p className="js-approach-reveal mx-auto mt-5 max-w-xl text-lg text-ink-soft">
          How a synthetic-biology idea becomes gentle, everyday care for the
          animals we live with.
        </p>

        <ol className="mt-16 grid grid-cols-1 gap-12 text-left sm:grid-cols-3 sm:gap-8">
          {STEPS.map((step, i) => (
            <li
              key={step.title}
              className="js-approach-reveal flex flex-col items-center text-center sm:items-start sm:text-left"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-card bg-primary-soft text-primary-deep">
                <Icon as={step.Icon} size="lg" weight="duotone" />
              </span>
              <h3 className="mt-5 flex items-baseline gap-2 text-xl font-black text-ink">
                <span className="text-base font-bold text-ink-secondary">
                  {i + 1}
                </span>
                {step.title}
              </h3>
              <p className="mt-2 max-w-[34ch] text-ink-soft">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
