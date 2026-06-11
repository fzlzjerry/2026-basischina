import { useRef } from "react";
import { Link } from "react-router-dom";
import { PawPrint, UsersThree } from "@phosphor-icons/react";
import { Icon } from "@/shared/components/Icon";
import { buttonClasses } from "@/shared/components/Button";
import { gsap, registerGsap, useGSAP } from "@/shared/motion/gsap";

/**
 * Closing band (§20, Act 4): a warm sign-off into the project and team. CTA
 * labels match the hero (one label per intent). Reveal is gated for reduced
 * motion.
 */
export function ClosingCtaSection() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      registerGsap();
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".js-closing", {
          y: 28,
          opacity: 0,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.12,
          clearProps: "all",
          scrollTrigger: {
            trigger: root.current,
            start: "top 80%",
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
      <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6 lg:px-8">
        <span
          className="js-closing ac-polka mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-soft text-primary-deep"
          aria-hidden="true"
        >
          <Icon as={PawPrint} weight="fill" size="lg" />
        </span>
        <h2 className="js-closing mt-6 text-3xl font-black tracking-tight text-ink sm:text-5xl">
          Come hang out with us.
        </h2>
        <p className="js-closing mx-auto mt-5 max-w-xl text-lg text-ink-soft">
          We are a team of students engineering biology for the animals we love.
          Have a look around the project, or come say hello.
        </p>
        <div className="js-closing mt-10 flex flex-wrap justify-center gap-4">
          <Link
            to="/description"
            className={buttonClasses("primary", "lg", "group")}
          >
            <Icon as={PawPrint} weight="fill" />
            <span>Explore the project</span>
          </Link>
          <Link to="/team" className={buttonClasses("secondary", "lg")}>
            <Icon as={UsersThree} />
            <span>Meet the team</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
