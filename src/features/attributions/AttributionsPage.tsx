import { useEffect, useRef } from "react";
import { wikiEnv } from "@/config/env";
import { requirePage } from "@/config/pageData";
import { PageHead } from "@/shared/components/PageHead";
import { stickerStyle } from "@/shared/styles/heal";

const page = requirePage("attributions");

/**
 * Project Attributions (iGEM Bronze medal criterion #2).
 *
 * iGEM requires that this page embed the team's standardized Project Attributions
 * Form, which is hosted by iGEM at teams.igem.org and rendered through an
 * <iframe>. ONLY the embedded form is judged: a hand-written attributions table
 * is NOT accepted, so this page deliberately carries just the heading, a one-line
 * intro, and the iframe (the iGEM template instruction is "the iframe ... and
 * nothing else"). teams.igem.org is an *.igem.org subdomain, so the embed passes
 * the iGEM External Content Check, and iGEM explicitly permits iframes to its own
 * servers.
 *
 * The iframe id and src must stay exactly as iGEM specifies. iGEM's own template
 * ships an inline script that listens for a postMessage from teams.igem.org and
 * resizes the frame to its content; that logic is reproduced here as an
 * origin-checked React effect (raw <script> tags do not run inside the prerender).
 * Third-party asset credits (icons, fonts) deliberately live in the footer, NOT
 * here, because non-form content on this page is not accepted or judged.
 */
const FORM_SRC = wikiEnv.teamId
  ? `https://teams.igem.org/wiki/${wikiEnv.teamId}/attributions`
  : null;

export function AttributionsPage() {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== "https://teams.igem.org") return;
      try {
        const { type, data } = JSON.parse(event.data as string);
        if (type === "igem-attribution-form" && iframeRef.current) {
          iframeRef.current.style.height = `${Number(data) + 100}px`;
        }
      } catch {
        // Ignore messages that are not the iGEM resize payload.
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return (
    <>
      <PageHead path={page.path} title={page.title} seo={page.seo} />
      <div className="min-h-screen bg-page heal-grid">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <header className="mb-8 border-b-2 border-dashed border-sticker-ink/40 pb-6">
            <h1 className="pb-1 font-script text-[clamp(2.6rem,2rem+2.5vw,3.9rem)] font-bold leading-[1.04] text-ink">
              {page.title}
            </h1>
            <p className="mt-4 max-w-3xl text-lg text-ink-soft">
              What each team member did, and the help we received from others,
              recorded in iGEM&apos;s standardized Project Attributions Form
              below.
            </p>
          </header>

          {FORM_SRC ? (
            <div
              className="heal-cutout bg-surface p-3 sm:p-4"
              style={stickerStyle(0)}
            >
              {/* iGEM Project Attributions Form. Keep the id and src exactly as
                  iGEM provides; the effect above resizes it to fit its content. */}
              <iframe
                ref={iframeRef}
                id="igem-attribution-form"
                title="iGEM Project Attributions Form"
                src={FORM_SRC}
                className="w-full"
                // Modest initial height so an unsubmitted form is not a giant
                // blank void; the effect above grows it to fit once the real
                // form content posts its height. id/src stay exactly as iGEM
                // specifies.
                style={{ height: "640px", border: "0" }}
              />
            </div>
          ) : (
            <div className="heal-cutout bg-surface p-6" style={stickerStyle(0)}>
              <p className="font-hand text-xl text-ink">
                Attributions form not configured
              </p>
              <p className="mt-2 text-ink-soft">
                Set VITE_TEAM_ID in the environment so the iGEM Project
                Attributions Form can be embedded here.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default AttributionsPage;
