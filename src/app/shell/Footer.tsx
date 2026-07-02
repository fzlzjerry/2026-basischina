import { Link } from "react-router-dom";
import { wikiEnv } from "@/config/env";
import { footerPages, getNavGroups, navLabelFor } from "@/config/navigation";
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

/**
 * Footer (§14). Link columns derive from the page registry. The Creative Commons
 * license notice and the link to the GitLab repository are required on every
 * iGEM wiki page.
 */
export function Footer() {
  return (
    <footer className="text-footer-text">
      {/* Scalloped ground edge into the brown footer. No top margin: on the
          homepage the sunset band sits flush above the scallop, and content
          pages bring their own bottom padding. */}
      <SectionDivider variant="scallop" fill="var(--color-footer)" />
      <div className="bg-footer">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="font-script text-3xl leading-none text-page">
                <Link
                  to="/"
                  className="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-on-dark"
                >
                  {wikiEnv.teamName}
                </Link>
              </p>
              <p className="mt-2 text-sm text-footer-text-muted">
                iGEM {wikiEnv.teamYear}. Engineering biology for healthier,
                happier companions.
              </p>
            </div>
            {footerGroups.map((group) => (
              <nav key={group.key} aria-label={group.label}>
                {/* Hand-printed column headers (Gochi), not uppercase tracked
                    scaffolding — the footer keeps the notebook's voice. */}
                <p className="font-hand text-lg leading-none text-footer-text-muted">
                  {group.label}
                </p>
                <ul className="mt-3 space-y-2">
                  {group.pages.map((page) => (
                    <li key={page.path}>
                      <Link
                        to={page.path}
                        className="text-sm text-footer-text transition hover:text-page hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-on-dark"
                      >
                        {navLabelFor(page)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>

          {/* Hand-ruled divider (mask takes its colour from the bg utility). */}
          <hr className="heal-rule my-8 h-2 border-0 bg-footer-divider" />

          {/* Required on every iGEM wiki page: license + repository link.
              Full-strength footer text: the muted tone sits below AA at this
              size. */}
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
              </a>
              .
            </p>
            <p>
              The repository used to create this website is available at{" "}
              <a
                className="font-medium text-page underline transition hover:text-page focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-on-dark"
                href={`https://gitlab.igem.org/${wikiEnv.teamYear}/${teamSlug}`}
                rel="noopener noreferrer"
                target="_blank"
              >
                gitlab.igem.org/{wikiEnv.teamYear}/{teamSlug}
              </a>
              .
            </p>
            {/* Credit for reused third-party assets (iGEM requires borrowed,
                openly-licensed content to be attributed). Kept here, not on the
                Attributions page, whose form is the only judged content. */}
            <p>
              Built with{" "}
              <a
                className="font-medium text-page underline transition hover:text-page focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-on-dark"
                href="https://phosphoricons.com/"
                rel="noopener noreferrer"
                target="_blank"
              >
                Phosphor Icons
              </a>{" "}
              (MIT) and the Caveat, Gochi Hand, and Nunito typefaces (SIL Open
              Font License).
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
