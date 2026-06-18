import { useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { CaretDown, List, X } from "@phosphor-icons/react";
import { Icon } from "@/shared/components/Icon";
import { wikiEnv } from "@/config/env";
import { getNavGroups, navLabelFor } from "@/config/navigation";
import { stickerStyle } from "@/shared/styles/heal";
import logoUrl from "@/assets/brand/heal-logo.webp";
import {
  gsap,
  ScrollTrigger,
  registerGsap,
  useGSAP,
} from "@/shared/motion/gsap";

const groups = getNavGroups();

function pillClasses(isActive: boolean): string {
  return [
    "heal-sticker inline-flex items-center gap-1 px-3.5 py-1.5 font-hand text-[15px] leading-none text-sticker-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring",
    isActive ? "bg-app-orange" : "bg-surface-2 hover:bg-app-orange-soft",
  ].join(" ");
}

function dropdownLinkClasses(isActive: boolean): string {
  return [
    "block rounded-[10px] px-3 py-2 font-hand text-[15px] leading-snug transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring",
    isActive
      ? "bg-app-orange-soft font-bold text-sticker-ink"
      : "text-sticker-ink hover:bg-hover",
  ].join(" ");
}

function mobileLinkClasses(isActive: boolean): string {
  return [
    "block rounded-[12px] px-3 py-2 font-hand text-base leading-snug transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring",
    isActive
      ? "bg-app-orange font-bold text-sticker-ink"
      : "text-sticker-ink hover:bg-app-orange-soft",
  ].join(" ");
}

/**
 * Site navigation (§14/§23), HEAL hand-drawn register: a Caveat wordmark and
 * Gochi Hand sticker-cutout pills (bold outline, wonky radius, hand-pasted tilt,
 * hard offset shadow). The current page reads as a filled-orange sticker. Links
 * derive from the page registry; keyboard-accessible dropdowns keep
 * aria-expanded, and the mobile disclosure panel is unchanged in behaviour.
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
        // y-only entrance with clearProps: the sticker pills' rotate() lives in
        // CSS, so clearing GSAP's inline transform restores each pill's tilt.
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
      className="sticky top-0 z-40 border-b-[3px] border-sticker-ink bg-page/90 backdrop-blur"
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8"
      >
        <NavLink
          to="/"
          end
          className="js-nav-animate flex items-center gap-2.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
        >
          <span className="font-script text-[2rem] font-bold leading-none text-ink">
            {wikiEnv.teamName}
          </span>
          {/* Heal project logo (decorative; the wordmark above is the link name) */}
          <img src={logoUrl} alt="" className="hidden h-9 w-auto sm:block" />
        </NavLink>

        {/* Desktop navigation */}
        <ul className="js-nav-animate hidden items-center gap-1.5 lg:flex">
          {groups.map((group, i) => {
            if (group.pages.length === 1) {
              const page = group.pages[0];
              return (
                <li key={group.key}>
                  <NavLink
                    to={page.path}
                    end={page.path === "/"}
                    className={({ isActive }) => pillClasses(isActive)}
                    style={stickerStyle(i)}
                  >
                    {navLabelFor(page)}
                  </NavLink>
                </li>
              );
            }
            const isOpen = openGroup === group.key;
            const groupActive = group.pages.some((p) => pathname === p.path);
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
                  className={pillClasses(groupActive)}
                  style={stickerStyle(i)}
                >
                  {group.label}
                  <Icon
                    as={CaretDown}
                    size="xs"
                    className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
                    aria-hidden="true"
                  />
                </button>
                {isOpen ? (
                  <ul
                    className="heal-sticker absolute left-0 z-50 mt-2 min-w-52 bg-page p-1.5"
                    style={stickerStyle(0, "0deg")}
                  >
                    {group.pages.map((page) => (
                      <li key={page.path}>
                        <NavLink
                          to={page.path}
                          end={page.path === "/"}
                          onClick={() => setOpenGroup(null)}
                          className={({ isActive }) =>
                            dropdownLinkClasses(isActive)
                          }
                        >
                          {navLabelFor(page)}
                        </NavLink>
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
          className="heal-sticker bg-surface-2 p-2.5 text-sticker-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring lg:hidden"
          style={stickerStyle(0, "-1.5deg")}
        >
          <span className="sr-only">Toggle navigation</span>
          <Icon as={mobileOpen ? X : List} size="md" aria-hidden="true" />
        </button>
      </nav>

      {/* Reading-progress indicator, scrubbed to page scroll. */}
      <span
        aria-hidden="true"
        style={{ transform: "scaleX(0)", transformOrigin: "left center" }}
        className="js-scroll-progress pointer-events-none absolute inset-x-0 bottom-[-3px] h-1 rounded-r-full bg-primary"
      />

      {/* Mobile panel */}
      {mobileOpen ? (
        <div
          id="mobile-nav"
          className="border-t-[3px] border-sticker-ink bg-page px-4 py-3 lg:hidden"
        >
          {groups.map((group) => (
            <div key={group.key} className="py-2">
              <p className="px-3 font-hand text-sm uppercase tracking-wide text-app-orange-ink">
                {group.label}
              </p>
              <ul className="mt-1 flex flex-col gap-0.5">
                {group.pages.map((page) => (
                  <li key={page.path}>
                    <NavLink
                      to={page.path}
                      end={page.path === "/"}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) => mobileLinkClasses(isActive)}
                    >
                      {navLabelFor(page)}
                    </NavLink>
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
