import { useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { CaretDown, List, X } from "@phosphor-icons/react";
import { Icon } from "@/shared/components/Icon";
import { wikiEnv } from "@/config/env";
import { getNavGroups, navLabelFor } from "@/config/navigation";
import type { PageDataItem } from "@/config/pageData";
import {
  gsap,
  ScrollTrigger,
  registerGsap,
  useGSAP,
} from "@/shared/motion/gsap";

const groups = getNavGroups();

function linkClasses(isActive: boolean): string {
  return [
    "inline-flex rounded-pill px-3 py-2 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring",
    isActive
      ? "bg-primary-soft text-primary-deep"
      : "text-ink-soft hover:bg-hover hover:text-ink hover:-translate-y-px",
  ].join(" ");
}

function NavbarLink({
  page,
  onNavigate,
}: {
  page: PageDataItem;
  onNavigate?: () => void;
}) {
  return (
    <NavLink
      to={page.path}
      end={page.path === "/"}
      onClick={onNavigate}
      className={({ isActive }) => linkClasses(isActive)}
    >
      {navLabelFor(page)}
    </NavLink>
  );
}

/**
 * Site navigation (§14/§23): links derived from the page registry, keyboard-
 * accessible dropdowns with aria-expanded, and a mobile disclosure panel.
 */
export function Navbar() {
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const { pathname } = useLocation();

  // Scroll-progress bar + a one-time, subtle entrance for the header. The
  // progress bar is a scroll-linked indicator (not autonomous motion), so it
  // stays on for everyone; the entrance is gated behind reduced-motion.
  useGSAP(
    () => {
      registerGsap();
      gsap.set(".js-scroll-progress", { transformOrigin: "left center" });
      gsap.to(".js-scroll-progress", {
        scaleX: 1,
        ease: "none",
        scrollTrigger: { start: 0, end: "max", scrub: 0.3 },
      });

      // Late layout shifts (font swap, lazy media) move the page height, which
      // the progress bar's `end: "max"` depends on.
      const onLoad = () => ScrollTrigger.refresh();
      window.addEventListener("load", onLoad);

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".js-nav-animate", {
          y: -12,
          duration: 0.6,
          ease: "power3.out",
          stagger: 0.08,
          clearProps: "transform",
        });
      });

      return () => {
        window.removeEventListener("load", onLoad);
        mm.revert();
      };
    },
    { scope: navRef },
  );

  // The persistent shell never remounts, so recalc trigger positions whenever
  // the route (and therefore page height) changes.
  useEffect(() => {
    registerGsap();
    const id = window.requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => window.cancelAnimationFrame(id);
  }, [pathname]);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenGroup(null);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpenGroup(null);
        setMobileOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <header
      ref={navRef}
      className="sticky top-0 z-40 border-b-2 border-border bg-page/90 backdrop-blur"
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8"
      >
        <NavLink
          to="/"
          end
          className="js-nav-animate text-lg font-bold tracking-tight text-ink"
        >
          {wikiEnv.teamName}
          <span className="ml-1 font-normal text-primary-deep">
            iGEM {wikiEnv.teamYear}
          </span>
        </NavLink>

        {/* Desktop navigation */}
        <ul className="js-nav-animate hidden items-center gap-1 lg:flex">
          {groups.map((group) => {
            if (group.pages.length === 1) {
              return (
                <li key={group.key}>
                  <NavbarLink page={group.pages[0]} />
                </li>
              );
            }
            const isOpen = openGroup === group.key;
            return (
              <li key={group.key} className="relative">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-haspopup="true"
                  onClick={() =>
                    setOpenGroup((current) =>
                      current === group.key ? null : group.key,
                    )
                  }
                  className="inline-flex items-center gap-1 rounded-pill px-3 py-2 text-sm font-medium text-ink-soft shadow-soft transition hover:-translate-y-px hover:bg-hover hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
                >
                  {group.label}
                  <Icon
                    as={CaretDown}
                    size="xs"
                    className="text-primary-deep"
                    aria-hidden="true"
                  />
                </button>
                {isOpen ? (
                  <ul className="absolute left-0 mt-1 min-w-48 rounded-card border-2 border-border bg-page p-1 shadow-card-lift">
                    {group.pages.map((page) => (
                      <li key={page.path}>
                        <NavbarLink
                          page={page}
                          onNavigate={() => setOpenGroup(null)}
                        />
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            );
          })}
        </ul>

        {/* Mobile toggle */}
        <button
          type="button"
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav"
          onClick={() => setMobileOpen((value) => !value)}
          className="js-nav-animate rounded-pill p-2.5 text-primary-deep transition hover:bg-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring lg:hidden"
        >
          <span className="sr-only">Toggle navigation</span>
          <Icon as={mobileOpen ? X : List} size="md" aria-hidden="true" />
        </button>
      </nav>

      {/* Reading-progress indicator, scrubbed to page scroll. */}
      <span
        aria-hidden="true"
        style={{ transform: "scaleX(0)", transformOrigin: "left center" }}
        className="js-scroll-progress pointer-events-none absolute inset-x-0 bottom-0 h-0.5 bg-primary"
      />

      {/* Mobile panel */}
      {mobileOpen ? (
        <div
          id="mobile-nav"
          className="border-t-2 border-border bg-page px-4 py-3 lg:hidden"
        >
          {groups.map((group) => (
            <div key={group.key} className="py-2">
              <p className="px-3 text-xs font-semibold uppercase tracking-wide text-ink-soft">
                {group.label}
              </p>
              <ul className="mt-1 flex flex-col">
                {group.pages.map((page) => (
                  <li key={page.path}>
                    <NavbarLink
                      page={page}
                      onNavigate={() => setMobileOpen(false)}
                    />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : null}
    </header>
  );
}
