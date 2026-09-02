import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { CaretDown } from "@phosphor-icons/react";
import { wikiEnv } from "@/config/env";
import { igemStatic } from "@/config/igemStatic";
import { footerPages, getNavGroups, navLabelFor } from "@/config/navigation";
import { Icon } from "@/shared/components/Icon";
import { SectionDivider } from "@/shared/components/SectionDivider";

const footerGroups = getNavGroups()
  .map((group) => ({
    ...group,
    pages: group.pages.filter((page) => footerPages.includes(page)),
  }))
  .filter((group) => group.pages.length > 0)
  // A labeled column holding only the Home link is dead weight; the brand
  // name in the first cell links home instead.
  .filter(
    (group) => !(group.pages.length === 1 && group.pages[0]?.path === "/"),
  );

const teamSlug = wikiEnv.basePath.replace(/^\/+|\/+$/g, "");

const linkClass =
  "flex min-h-11 w-full max-w-full items-center text-sm text-footer-text transition [overflow-wrap:anywhere] hover:text-page hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-on-dark";

/**
 * Footer (§14). Link columns derive from the page registry. The Creative Commons
 * license notice and the link to the GitLab repository are required on every
 * iGEM wiki page.
 */
export function Footer() {
  const { pathname } = useLocation();
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  return (
    // relative z-10 so the scallop paints ABOVE the homepage's
    // position:relative sunset band (its -mb pulls the footer's divider zone
    // underneath it, which would otherwise flatten the hand-cut edge).
    <footer
      data-site-chrome="footer"
      data-nav-ink=""
      className="relative z-10 text-footer-text"
    >
      {/* Scalloped ground edge into the brown footer. No top margin: on the
          homepage the sunset band sits flush above the scallop, and content
          pages bring their own bottom padding. */}
      <SectionDivider variant="scallop" fill="var(--color-footer)" />
      <div className="bg-footer">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="font-script text-3xl leading-none text-page">
                <Link
                  to="/"
                  className="inline-flex min-h-11 items-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-on-dark"
                >
                  {wikiEnv.teamName}
                </Link>
              </p>
              <p className="mt-2 max-w-xs text-sm text-footer-text-muted">
                iGEM {wikiEnv.teamYear}. Engineering biology for healthier,
                happier companions.
              </p>
            </div>

            <ul
              aria-label="Affiliations"
              className="flex flex-col items-start gap-5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-8 sm:gap-y-4"
            >
              <li>
                {/* Crop window: the uploaded WebP is padded; CSS clips to the mark. */}
                <span className="footer-affil-org">
                  <img
                    src={igemStatic.affiliations.org}
                    alt="Avant Academy"
                    width={3508}
                    height={2481}
                    decoding="async"
                    loading="lazy"
                  />
                </span>
              </li>
              <li className="max-w-full">
                <img
                  src={igemStatic.affiliations.school}
                  alt="BASIS International & Bilingual Schools · China"
                  width={2237}
                  height={296}
                  decoding="async"
                  loading="lazy"
                  className="h-auto w-full max-w-[22.5rem] sm:h-10 sm:w-auto sm:max-w-none"
                />
              </li>
            </ul>
          </div>

          <div className="hidden gap-8 xl:grid xl:grid-cols-5">
            {footerGroups.map((group) => (
              <nav key={group.key} aria-label={group.label}>
                <p className="font-hand text-lg leading-none text-footer-text-muted [overflow-wrap:anywhere]">
                  {group.label}
                </p>
                <ul className="mt-3">
                  {group.pages.map((page) => (
                    <li key={page.path}>
                      <Link to={page.path} className={linkClass}>
                        {navLabelFor(page)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>

          <div className="xl:hidden">
            {footerGroups.map((group) => {
              const isOpen = openGroup === group.key;
              const groupActive = group.pages.some(
                (page) => page.path === pathname,
              );
              return (
                <nav
                  key={group.key}
                  aria-label={group.label}
                  className="border-b border-footer-divider/60 last:border-b-0"
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`footer-group-${group.key}`}
                    onClick={() =>
                      setOpenGroup((current) =>
                        current === group.key ? null : group.key,
                      )
                    }
                    className="flex min-h-11 w-full items-center justify-between py-2 text-left font-hand text-lg leading-none text-footer-text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-on-dark"
                  >
                    <span>
                      {group.label}
                      {groupActive ? (
                        <span className="sr-only">, current section</span>
                      ) : null}
                    </span>
                    <Icon
                      as={CaretDown}
                      size="xs"
                      className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
                      aria-hidden="true"
                    />
                  </button>
                  {isOpen ? (
                    <ul id={`footer-group-${group.key}`} className="pb-2">
                      {group.pages.map((page) => (
                        <li key={page.path}>
                          <Link to={page.path} className={linkClass}>
                            {navLabelFor(page)}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </nav>
              );
            })}
          </div>

          <hr className="heal-rule my-8 h-2 border-0 bg-footer-divider" />

          <div className="space-y-2 text-xs text-footer-text">
            <p>
              © {wikiEnv.teamYear} {wikiEnv.teamName}. Content on this site is
              licensed under a{" "}
              <a
                className="font-medium text-page underline transition hover:text-page focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-on-dark"
                href="https://creativecommons.org/licenses/by/4.0/"
                rel="license noopener noreferrer"
                target="_blank"
              >
                Creative Commons Attribution 4.0 International license
                <span className="sr-only"> (opens in new tab)</span>
              </a>
              .
            </p>
            <p>
              The repository used to create this website is available at{" "}
              <a
                className="font-medium text-page underline transition [overflow-wrap:anywhere] hover:text-page focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-on-dark"
                href={`https://gitlab.igem.org/${wikiEnv.teamYear}/${teamSlug}`}
                rel="noopener noreferrer"
                target="_blank"
              >
                gitlab.igem.org/{wikiEnv.teamYear}/{teamSlug}
                <span className="sr-only"> (opens in new tab)</span>
              </a>
              .
            </p>
            <p>
              Built with{" "}
              <a
                className="font-medium text-page underline transition hover:text-page focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-on-dark"
                href="https://phosphoricons.com/"
                rel="noopener noreferrer"
                target="_blank"
              >
                Phosphor Icons
                <span className="sr-only"> (opens in new tab)</span>
              </a>{" "}
              (MIT),{" "}
              <a
                className="font-medium text-page underline transition hover:text-page focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-on-dark"
                href="https://github.com/Danilaa1/drawably"
                rel="noopener noreferrer"
                target="_blank"
              >
                drawably
                <span className="sr-only"> (opens in new tab)</span>
              </a>{" "}
              (MIT), and the Caveat, Gochi Hand, and Nunito typefaces (SIL Open
              Font License).
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
