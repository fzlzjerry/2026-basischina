import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { PageHead } from "@/shared/components/PageHead";
import { WashiTape } from "@/shared/components/WashiTape";
import { stickerStyle, stickerStyleRaw } from "@/shared/styles/heal";
import { getNavGroups } from "@/config/navigation";
import { resolveAssetUrl } from "@/shared/utils/assetUrl";

// Six tidy destinations instead of the full 22-page sitemap dump: one sticker
// per nav GROUP (still derived from the registry — never a second route list),
// each landing on the group's first page.
const groups = getNavGroups();

// `#t=0.01` parks the element on a decoded frame the moment metadata lands, so
// the plate is never an empty box: no-JS visitors, reduced-motion visitors and
// anyone whose browser refuses an unattended play() still get the composed
// still. Nothing on this page waits for the clip to load or finish.
const CLIP_SRC = `${resolveAssetUrl("assets/not-found-cat.mp4")}#t=0.01`;

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

/**
 * Play the reveal once, from the top. Deliberately never `loop`: the clip is
 * 13 frames of tail flick (0.87s) that ends on the frame it started from, so
 * looping it would idle at ~69 restarts a minute beside the copy — a nervous
 * tic, not ambience. Ending on the opening frame is exactly what makes the
 * one-shot safe: the plate settles back into its composed resting state.
 */
function playFromStart(video: HTMLVideoElement) {
  // React assigns `muted` as a DOM property and never serialises it into the
  // prerendered HTML, so re-assert it here: muted is what makes an unattended
  // play() legal under browser autoplay policy.
  video.muted = true;
  if (video.readyState > 0) video.currentTime = 0;
  void video.play().catch(() => {
    // Refused or interrupted — the parked frame already covers that case.
  });
}

/**
 * 404 page (§11), HEAL register: a found-footage plate — the missing cat
 * caught walking its own error code off the page — taped into the notebook on
 * the left, with the actual entry (code, heading, explanation, registry-derived
 * exits) written up the right-hand side. The artwork carries the display
 * numeral so the live text can stay a calm, legible record instead of a second
 * giant 404 shouting over the first. Marked noindex so search engines do not
 * surface it.
 *
 * The clip is decorative and silent: aria-hidden, muted, playsInline, one shot
 * on arrival, replayed only when a pointer wanders onto the plate. Autonomous
 * motion runs solely under `prefers-reduced-motion: no-preference` and stops
 * (rewinding to the composed frame) the instant that preference flips.
 */
export function NotFoundPage() {
  const clip = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = clip.current;
    if (!video || typeof window.matchMedia !== "function") return;

    const query = window.matchMedia(REDUCED_MOTION);
    const sync = () => {
      if (query.matches) {
        video.pause();
        if (video.readyState > 0) video.currentTime = 0;
        return;
      }
      playFromStart(video);
    };

    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  // Pointer-only encore: the cat flicks its tail again when you point at the
  // plate. Intentionally NOT a control — it conveys nothing, so it earns no
  // focus stop, no label, and no behaviour at all under reduced motion.
  const flickAgain = () => {
    const video = clip.current;
    if (!video || window.matchMedia(REDUCED_MOTION).matches) return;
    playFromStart(video);
  };

  return (
    <>
      <PageHead
        path="/404"
        title="Page not found"
        seo={{
          title: "Page not found · BASIS-China 2026 iGEM",
          description: "The requested page could not be found.",
          keywords: ["404", "not found"],
          robots: "noindex, follow",
        }}
      />
      <section className="min-h-screen bg-page heal-grid">
        {/* Explicit row/column placement, not source order: the record reads
            first on a phone (message before punchline), while lg puts the
            plate down the left and stacks the entry beside it. minmax(0,…)
            keeps the 3520px-wide clip from blowing the track out.

            From lg the grid claims exactly the post-nav viewport (the sticky
            navbar measures 4.75rem, 4.5rem from xl — the same figures the
            workstream stage uses) and content-centres its rows inside it, so
            the cluster sits in the optical middle instead of hugging the top.
            min-height, not height: on a short laptop the rows simply outgrow
            the box, free space hits zero, and the balanced lg padding keeps
            its full clearance below the nav. */}
        <div className="mx-auto grid max-w-6xl gap-y-10 px-4 pb-24 pt-28 sm:px-6 sm:pt-32 lg:min-h-[calc(100svh-4.75rem)] lg:grid-cols-[minmax(0,1.28fr)_minmax(0,1fr)] lg:content-center lg:items-start lg:gap-x-14 lg:gap-y-8 lg:px-8 lg:py-16 xl:min-h-[calc(100svh-4.5rem)]">
          <div className="lg:col-start-2 lg:row-start-1">
            <p className="font-hand text-base tracking-[0.28em] text-app-orange-ink">
              MISSING · 404
            </p>
            <h1 className="mt-2 pb-1 font-script text-[clamp(2.35rem,1.8rem+2.4vw,3.4rem)] font-bold leading-[1.02] text-ink">
              Page not found
            </h1>
            <p className="mt-3 max-w-prose text-ink-soft">
              {
                "This page doesn't exist, or it wandered off. Check the address, or start again from one of the sections below."
              }
            </p>
          </div>

          {/* The plate: a print mounted on card stock. The clip multiplies onto
              that card, so its near-white ground disappears into the paper and
              the ink and fur read as drawn straight onto the mount — no seam,
              no floating rectangle, no second card inside the first. */}
          <div className="lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:self-center">
            <div
              className="heal-cutout relative bg-surface-2 p-3 sm:p-4"
              style={stickerStyleRaw(
                "-1.4deg",
                "18px 13px 20px 15px / 14px 20px 13px 18px",
              )}
              onMouseEnter={flickAgain}
            >
              <WashiTape className="z-10 -top-3.5 left-[11%] w-24 -rotate-2 sm:w-28" />
              <WashiTape
                tone="teal"
                className="z-10 -bottom-3.5 right-[9%] w-20 rotate-2 sm:w-24"
              />
              <div className="relative">
                <video
                  ref={clip}
                  src={CLIP_SRC}
                  width={3520}
                  height={2488}
                  muted
                  playsInline
                  preload="auto"
                  disablePictureInPicture
                  aria-hidden="true"
                  className="block h-auto w-full mix-blend-multiply"
                />
                {/* The artwork keeps its lower-left quadrant clear in every
                    frame, so from sm up the poster's fine print sits in that
                    negative space under the painted numeral instead of being
                    boxed off below the plate. */}
                <p className="mt-2 font-hand text-base text-app-orange-ink sm:absolute sm:bottom-[8%] sm:left-[6%] sm:mt-0 sm:w-[38%] sm:text-lg">
                  Reward: belly rubs.
                </p>
              </div>
            </div>
          </div>

          <nav
            aria-label="Suggested pages"
            className="lg:col-start-2 lg:row-start-2"
          >
            <div
              aria-hidden="true"
              className="heal-rule-dash h-2 w-full bg-sticker-ink/40"
            />
            <h2 className="mt-3 font-hand text-base text-app-orange-ink">
              Try one of these
            </h2>
            <ul className="mt-4 flex flex-wrap gap-3">
              {groups.map((group, index) => (
                <li key={group.key}>
                  <Link
                    to={group.pages[0].path}
                    className={`heal-sticker inline-flex min-h-11 items-center px-5 py-2.5 font-hand text-base leading-none text-sticker-ink transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring ${
                      group.key === "home"
                        ? "bg-app-orange"
                        : "bg-surface-2 hover:bg-app-orange-soft"
                    }`}
                    style={stickerStyle(index)}
                  >
                    {group.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </section>
    </>
  );
}
