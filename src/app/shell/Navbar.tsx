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
  // Which mobile group is expanded (single-open accordion). Multi-page groups
  // collapse so the panel is a scannable list of 6 sections, not ~25 links.
  const [openMobileGroup, setOpenMobileGroup] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);
  // Disclosure triggers, so Escape can hand keyboard focus back instead of
  // dropping it to <body> when the focused menu unmounts.
  const groupButtonRefs = useRef(new Map<string, HTMLButtonElement | null>());
  const mobileToggleRef = useRef<HTMLButtonElement>(null);
  const { pathname } = useLocation();

  // Scroll-progress bar: a scroll-linked indicator (not autonomous motion), so
  // it stays on for everyone. The header itself never animates in — it paints
  // static with the prerendered HTML (content never translates on load).
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

      return () => {
        window.removeEventListener("load", onLoad);
      };
    },
    { scope: navRef },
  );

  // The persistent shell never remounts, so recalc trigger positions whenever
  // the route (and therefore page height) changes — and dismiss any open
  // disclosure, which would otherwise float over the new page.
  useEffect(() => {
    registerGsap();
    setOpenGroup(null);
    setMobileOpen(false);
    setOpenMobileGroup(null);
    const id = window.requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => window.cancelAnimationFrame(id);
  }, [pathname]);

  // When the mobile menu opens, expand the group that holds the current page so
  // the visitor lands oriented instead of on a wall of collapsed sections.
  useEffect(() => {
    if (!mobileOpen) return;
    const active = groups.find((group) =>
      group.pages.some((page) => page.path === pathname),
    );
    setOpenMobileGroup(active && active.pages.length > 1 ? active.key : null);
  }, [mobileOpen, pathname]);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenGroup(null);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      // Hand focus back to the disclosure's trigger, but only when the menu
      // being dismissed actually contains focus (never steal it otherwise).
      const active = document.activeElement;
      if (openGroup) {
        const trigger = groupButtonRefs.current.get(openGroup);
        if (trigger?.closest("li")?.contains(active)) trigger.focus();
      }
      if (
        mobileOpen &&
        document.getElementById("mobile-nav")?.contains(active)
      ) {
        mobileToggleRef.current?.focus();
      }
      setOpenGroup(null);
      setMobileOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [openGroup, mobileOpen]);

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
          className="flex items-center gap-2.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
        >
          <span className="font-script text-[2rem] font-bold leading-none text-ink">
            {wikiEnv.teamName}
          </span>
          {/* Heal project logo (decorative; the wordmark above is the link name) */}
          <img src={logoUrl} alt="" className="hidden h-9 w-auto sm:block" />
        </NavLink>

        {/* Desktop navigation */}
        <ul className="hidden items-center gap-1.5 lg:flex">
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
              <li
                key={group.key}
                className="relative"
                // Close the disclosure when focus moves past its last item
                // (Tab out), matching the APG disclosure-navigation pattern.
                onBlur={(event) => {
                  if (
                    !event.currentTarget.contains(
                      event.relatedTarget as Node | null,
                    )
                  ) {
                    setOpenGroup(null);
                  }
                }}
              >
                <button
                  ref={(el) => {
                    groupButtonRefs.current.set(group.key, el);
                  }}
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={`nav-group-${group.key}`}
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
                    id={`nav-group-${group.key}`}
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
          ref={mobileToggleRef}
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
          className="max-h-[calc(100dvh-4.25rem)] overflow-y-auto overscroll-contain border-t-[3px] border-sticker-ink bg-page px-4 py-3 lg:hidden"
        >
          {groups.map((group) => {
            // Single-page groups (e.g. Home) stay flat links, mirroring desktop.
            if (group.pages.length === 1) {
              const page = group.pages[0];
              return (
                <div
                  key={group.key}
                  className="border-b border-sticker-ink/10 py-1 last:border-b-0"
                >
                  <NavLink
                    to={page.path}
                    end={page.path === "/"}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) => mobileLinkClasses(isActive)}
                  >
                    {navLabelFor(page)}
                  </NavLink>
                </div>
              );
            }
            const isOpen = openMobileGroup === group.key;
            const groupActive = group.pages.some((p) => pathname === p.path);
            return (
              <div
                key={group.key}
                className="border-b border-sticker-ink/10 py-1 last:border-b-0"
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={`mobile-group-${group.key}`}
                  onClick={() =>
                    setOpenMobileGroup((current) =>
                      current === group.key ? null : group.key,
                    )
                  }
                  className={`flex w-full items-center justify-between rounded-[12px] px-3 py-2 font-hand text-base leading-none transition hover:bg-app-orange-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring ${groupActive ? "text-app-orange-ink" : "text-sticker-ink"}`}
                >
                  <span>{group.label}</span>
                  <Icon
                    as={CaretDown}
                    size="xs"
                    className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
                    aria-hidden="true"
                  />
                </button>
                {isOpen ? (
                  <ul
                    id={`mobile-group-${group.key}`}
                    className="mt-0.5 flex flex-col gap-0.5 pb-1 pl-2"
                  >
                    {group.pages.map((page) => (
                      <li key={page.path}>
                        <NavLink
                          to={page.path}
                          end={page.path === "/"}
                          onClick={() => setMobileOpen(false)}
                          className={({ isActive }) =>
                            mobileLinkClasses(isActive)
                          }
                        >
                          {navLabelFor(page)}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : null}
    </header>
  );
}
