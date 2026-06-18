# iGEM 2026 Wiki Compliance Audit: BASIS-China

First audited 2026-06-18. Updated same day after deep slug verification and a round
of fixes (see section 8, Changelog). Cross-references the official iGEM 2026
requirements (verified web research, sources at the end) against this repository.

Status tokens: **PASS** (compliant now), **RISK** (likely non-compliant, verify),
**GAP** (required item missing), **ACTION** (your content/process work, not a code bug).

---

## 1. Verdict

The **technical chassis is in good shape**: the source makes no non-iGEM runtime
references (the foundation of the hardest iGEM rule), CC BY 4.0 license plus repo link
in the footer of every page, third-party asset credits in the footer, static
pre-rendered pages, and (verified) every page route already matching its canonical
2026 Standard URL slug.

The **dominant remaining blocker is content**: the 18 markdown pages and the team
roster are still placeholder templates with zero real project data, and the
Attributions form itself must be filled out in the iGEM dashboard. Judges cannot award
criteria for empty templates. That work needs the team's real data and is out of scope
for code changes.

Two deploy-time items remain to verify on the live wiki (External Content Check and the
asset-hosting question, row 1).

---

## 2. What iGEM 2026 requires (verified)

- **The wiki is a mandatory Competition Deliverable** (with Safety Forms, Judging
  Form, Presentation Video, Judging Session).
- **Standard URL Pages.** Each judging criterion maps to a specific designated URL
  (form `2026.igem.wiki/<team-name>/<page>`) that is auto-linked to the Judging Form.
  "Regardless of how you style your Wiki, you will need to preserve the designated
  URLs," and "If your documentation for an award is not on the page encoded by the
  static link, your team may not be judged for that prize." Dynamic-link web builders
  are explicitly unsupported. (This wiki pre-renders one static HTML file per route, so
  the designated URLs resolve correctly.)
- **Attribution (Bronze #2).** Teams document what team members did and what others
  did via the standardized **Project Attributions Form**, which is hosted by iGEM and
  must be **embedded on the `.../attributions` page through an iframe**
  (`https://teams.igem.org/wiki/<teamID>/attributions`, element id
  `igem-attribution-form`). Only the embedded form is judged; a hand-written
  attributions table is not accepted. The form is filled in the iGEM Deliverables
  dashboard. teams.igem.org is an `*.igem.org` subdomain, and iGEM explicitly allows
  iframes to its own servers, so the embed passes the External Content Check.
- **External Content Check** (`tools.igem.org/wiki/external-content-check`). Fails any
  wiki that makes runtime requests to servers other than `*.igem.org` and `*.igem.wiki`.
  All images, documents (.pdf, .csv), fonts, CSS, and JavaScript must be hosted on
  iGEM's CDN (`static.igem.wiki` via `tools.igem.org/uploads`). Videos must use the
  iGEM Video Universe. Iframes to non-iGEM content count as cheating and trigger medal
  disqualification. Failing the check disqualifies from Best Wiki and Best Software
  Tool.
- **Licensing and credit (both required).** (1) The team's own work is CC BY 4.0, with
  that notice plus a `gitlab.igem.org` repo link in the footer of every page. (2)
  Borrowed third-party assets (fonts, icons, images, code) must be openly licensed and
  visibly credited. Placement of asset credits is the team's choice (footer, a
  references section, captions) but must NOT sit on `/attributions`, whose non-form
  content is not judged.
- **Medals (new in 2026).** Bronze and Silver are per-criterion yes/no votes. Gold is
  derived from three Special Awards the team selects on its Judging Form (at least one
  General Bio Engineering, at least one Specialization, third from either). Fewer than
  three selected means no Gold.

---

## 3. Compliance matrix

| # | Requirement | Status | Evidence / action |
|---|---|---|---|
| 1 | No external runtime requests (External Content Check) | **CONDITIONAL (verify on deploy)** | The built output is self-contained: fonts/JS/CSS/images are local hashed assets, and the only external runtime `src` is the iGEM Attributions iframe (`teams.igem.org`, an allowed `*.igem.org` host). Every other external URL in the HTML is an `<a href>` link, which makes no request. Two things to settle on the live wiki: (a) confirm `dist/` assets deploy under `2026.igem.wiki/basis-china/...` so they stay same-origin; (b) iGEM states fonts/images/docs "must be uploaded to `static.igem.wiki` via `tools.igem.org/uploads`", so confirm whether co-located bundled assets are accepted or need uploading. There is no deploy/upload step in the repo yet (`build` only emits `dist/`). Then run the official tool on the live build. |
| 2 | Standard URL slugs match iGEM designations | **PASS (verified)** | Every current route matches the canonical 2026 slug, confirmed against the official 2026 Example repo (`gitlab.igem.org/2026/example` `src/pages.ts`), the 2025 Judge Handbook Standard-Pages tables, and 16+ live team wikis. Notably `/safety-and-security` is correct (the bare `/safety` 404s on 2025 wikis and is absent from the 2026 route table); `/inclusivity` is correct (not `/inclusion`); `/team`, `/contribution` (singular), `/model`, `/attributions` (plural) all correct. The earlier "rename to /safety" flag was wrong and is retracted. |
| 3 | CC BY 4.0 + repo link in footer of every page | **PASS** | `src/app/shell/Footer.tsx`; renders site-wide via the shell. |
| 4 | Third-party asset credit (icons, fonts) | **PASS** | Footer now credits Phosphor Icons (MIT) and the Caveat / Gochi Hand / Nunito typefaces (SIL OFL). Placed in the footer, deliberately not on `/attributions`. |
| 5 | Attributions page embeds the iGEM form | **PASS (form must be filled)** | `/attributions` is now a React page embedding the official iframe `https://teams.igem.org/wiki/6123/attributions` (id `igem-attribution-form`) with iGEM's origin-checked resize behavior. The iframe is in the prerendered HTML. Remaining ACTION: fill the Attributions Form in the iGEM Deliverables dashboard so the embed shows real content. Note: teams.igem.org may refuse framing on `localhost`; it renders on the deployed `igem.wiki` origin. |
| 6 | Parts documentation | **PASS (Registry is authoritative)** | Parts are judged from the iGEM Registry, not a wiki page. Added an optional `/parts` summary page that points to the Registry (convention, like UCalgary/Utrecht). The real part records and part numbers go on the Registry and the Judging Form. |
| 7 | Collaborations page | **PASS (optional/convention)** | Added `/collaborations` (the dominant plural convention; also fixes the former dangling link). Not a handbook Standard URL, so treat as a community page. |
| 8 | Implementation / Proof of Concept pages | **N/A for 2026** | Verified NOT standalone Standard URLs in 2026 (absent from the 2026 Example route table; "proposed implementation" folds into Human Practices and proof-of-concept into Results). Deliberately not added. |
| 9 | Real documented work on every criterion page | **ACTION (dominant blocker)** | All 18 markdown pages and `teamData.ts` are placeholders. Fill with real project data before judging. |
| 10 | No external iframes (YouTube, Bilibili, Drive) | **PASS** | Only the iGEM-hosted attributions iframe exists. Embed any video via the iGEM Video Universe. |
| 11 | Team slug matches registered name | **VERIFY** | Base path `/basis-china/`, team id 6123. Confirm `basis-china` is the exact registered team slug so Standard URLs and the attributions iframe line up. |
| 12 | Optional 2026 page: Alternative Platform | **OPTIONAL** | The 2026 Example adds `/alternative-platform` (for non-standard chassis work). Add only if relevant to the project. |

---

## 4. Attribution deep dive (Bronze #2)

The rule: document what team members did versus what others did, via the standardized
Project Attributions Form, embedded on `/attributions`. Only the embedded form is
judged; self-written tables are not accepted.

Current state after this pass:

- **Embed: done.** `/attributions` is a React page (`src/features/attributions/AttributionsPage.tsx`)
  rendering the exact iGEM iframe (`teams.igem.org/wiki/6123/attributions`, id
  `igem-attribution-form`) with the origin-checked postMessage resize iGEM ships. The
  prior hand-written markdown table was removed because it would not have been judged.
- **ACTION: fill the form.** The form content lives in the iGEM Deliverables dashboard,
  not in this repo. Complete it fully, accurately, and honestly: Table 1 (team member
  contributions), Table 2 (external contributions: PIs, instructors, advisors, other
  labs, sponsors, prior teams), Table 3 (timeline). It auto-populates the embed.
- **ACTION: real roster.** `src/features/team/teamData.ts` is still placeholder names;
  the Team page depends on it.

Common attribution mistakes to avoid: claiming work others did (or vice-versa),
leaving the form partially filled, omitting the PI / lab supervisor / gifted-materials
sources, and removing or altering the iframe.

---

## 5. Prioritized action list

**P0 (blocks judging): team content, needs real data**

1. Replace ALL placeholder content across the 18 markdown pages and `teamData.ts` with
   real project documentation.
2. Fill the Project Attributions Form in the iGEM Deliverables dashboard (the embed is
   already wired).

**P1 (verify)**

3. Confirm `basis-china` is the exact registered team slug.
4. Decide whether `/alternative-platform` applies to the project.

**P2 (verify on deploy)**

5. Establish the deploy path to iGEM's host; decide whether bundled fonts/images need
   uploading to `static.igem.wiki` via `tools.igem.org/uploads` versus serving
   co-located under the team path; then run the official External Content Check on the
   live build.
6. Select three Special Awards on the Judging Form to be Gold-eligible.
7. Upload any later-added images/PDFs/videos via `tools.igem.org/uploads` / the iGEM
   Video Universe, never third-party hosts.

---

## 6. Sources

- Standard URL Pages for Awards: https://competition.igem.org/judging/pages-for-awards
- Medals: https://competition.igem.org/judging/medals
- Team Wiki deliverable: https://competition.igem.org/deliverables/team-wiki
- Project Attribution deliverable: https://competition.igem.org/deliverables/project-attribution
- Part Pages deliverable: https://competition.igem.org/deliverables/part-pages
- External Content Check: https://tools.igem.org/wiki/external-content-check
- 2026 Example wiki + repo (route table): https://2026.igem.wiki/example/ and https://gitlab.igem.org/2026/example
- Official attributions iframe snippet (example): https://2025.igem.wiki/example/attributions
- iGEM Video Universe: https://video.igem.org
- CC BY 4.0: https://creativecommons.org/licenses/by/4.0/

## 7. Caveats on this audit

- The official `competition.igem.org` / `tools.igem.org` pages are JS-rendered and were
  not always fetchable byte-for-byte; rules were verified via consistent search
  renderings plus directly curl-able `igem.wiki` example/team pages and the cloned 2026
  Example repo. Re-verify against the live 2026 pages once the 2026 Judge Handbook is
  published.
- Slug verification used the 2026 Example route table plus the 2025 Judge Handbook and
  live wikis as the authoritative set; the 2026 handbook was not yet published at audit
  time, but the slugs have been stable across seasons.

## 8. Changelog (fixes applied 2026-06-18)

Addresses report issues 2 through 5 (issue 1, real content, is the team's to complete):

- **Issue 2 (slugs): no change needed.** Deep verification showed every route already
  matches its canonical 2026 slug. The earlier "rename `/safety-and-security` to
  `/safety`" recommendation was incorrect and has been retracted in this report.
- **Issue 3 (pages):** Added `/parts` (optional Registry-pointer summary,
  `src/content/articles/project/parts.md`) and `/collaborations`
  (`src/content/articles/engagement/collaborations.md`). Did NOT add
  `/implementation` or `/proof-of-concept` (verified not standalone Standard URLs in
  2026).
- **Issue 4 (Attributions form):** Converted `/attributions` from a hand-written
  markdown page to a React page embedding the required iGEM iframe with the
  origin-checked resize handler (`src/features/attributions/AttributionsPage.tsx`,
  `componentKeys.ts`, `pages.ts`, `pageData.ts`). Removed the old
  `articles/team/attributions.md`.
- **Issue 5 (credits):** Added a third-party asset credit line to the footer
  (`src/app/shell/Footer.tsx`), not on `/attributions`.
- Verified: `bun run check-all` passes (22 pages, tsc, theme audit, 0 lint errors,
  format clean) and `bun run build` prerenders all 22 pages including the new routes;
  the attributions iframe and footer credits appear in the static HTML.
