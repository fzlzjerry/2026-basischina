import { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import { wikiEnv } from "@/config/env";
import { getNavGroups, navLabelFor } from "@/config/navigation";
import type { PageDataItem } from "@/config/pageData";

const groups = getNavGroups();

function linkClasses(isActive: boolean): string {
  return [
    "rounded-md px-3 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600",
    isActive
      ? "bg-emerald-50 text-emerald-700"
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
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
      className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur"
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8"
      >
        <NavLink
          to="/"
          end
          className="text-lg font-bold tracking-tight text-slate-900"
        >
          {wikiEnv.teamName}
          <span className="ml-1 font-normal text-emerald-600">
            iGEM {wikiEnv.teamYear}
          </span>
        </NavLink>

        {/* Desktop navigation */}
        <ul className="hidden items-center gap-1 lg:flex">
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
                  className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
                >
                  {group.label}
                  <span aria-hidden="true" className="ml-1 text-xs">
                    ▾
                  </span>
                </button>
                {isOpen ? (
                  <ul className="absolute left-0 mt-1 min-w-48 rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
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
          className="rounded-md p-2 text-slate-700 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600 lg:hidden"
        >
          <span className="sr-only">Toggle navigation</span>
          <span aria-hidden="true" className="text-xl">
            {mobileOpen ? "✕" : "☰"}
          </span>
        </button>
      </nav>

      {/* Mobile panel */}
      {mobileOpen ? (
        <div
          id="mobile-nav"
          className="border-t border-slate-200 bg-white px-4 py-3 lg:hidden"
        >
          {groups.map((group) => (
            <div key={group.key} className="py-2">
              <p className="px-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
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
