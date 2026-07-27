# PRODUCT.md — BASIS-China iGEM 2026 Wiki

register: brand

## What this is

The competition wiki for BASIS-China's iGEM 2026 team. The team's synthetic-biology
project is a **platform for gentle, bio-made pet-care products** (first example:
化毛膏, a cat hairball-relief paste). The wiki must communicate warm, credible
science to iGEM judges, while feeling like a consumer-grade pet brand, not an
abstract "DNA / code of life" science site.

## Users

- iGEM judges (skim many wikis fast; need clear navigation and real content).
- Students/parents/community partners (consumer audience; design-literate owner).

## Brand & tone

- **Identity: the cat (peach) & dog (teal) mascot duo IS the brand.** They
  appear in the hero scene and recur as cameos through the page (peeking over
  tiles, sunset duo).
- **Visual register (homepage, since 2026-06-18): hand-drawn "HEAL" lab-notebook**
  — graph-paper canvas (synbio = lab notebook), Caveat/Gochi-Hand hand-lettering,
  sticker-cutout shapes (bold outline, hard offset shadow, wonky radius). Since
  2026-06-18 the content pages adopt the same register in their CHROME (Caveat
  page titles, sticker category chips / roster cards / TOC, grid backdrop) while
  the prose body keeps its readable Animal-Crossing markdown styling. See
  DESIGN.md.
- Voice: warm, plain-language, gently playful. "Healthier, happier companions."
- 温暖友好 (warm & friendly), genuinely 可爱 (cute) AND 有设计感 (designed):
  committed color, depth/overlap in scenes, big rounded display type.

## Anti-references (user-rejected; do not reintroduce)

- DNA double-helix motifs anywhere. Reads gimmicky and is not the product.
- Prominent product shots/tubes in the hero (tacky; this is a platform).
- Floating sparkles/hearts decorations; scattered paw confetti.
- Generic abstract scroll theatre that could belong to any biotech site. The
  homepage may use a pinned sequence only when it stays inside the HEAL
  notebook/pasted-paper language and advances the real project verbs.
- Flat clip-art-in-a-void minimalism ("taming" decorations away made it worse).

## Strategic principles

- Generative fixes over subtractive: add depth, environment, committed color.
- The homepage Hero is intentionally scroll-directed: pin beneath the sticky
  nav, unfold Understand → Engineer → Care, then release cleanly into the page.
  Never create a nested scrollbar, trap keyboard focus, or pin under reduced
  motion.
- The homepage is a long-form project tour rather than a short landing page:
  Hero cinema → three-step approach → kinetic mission statement → four
  full-screen workstream leaves → route index → team send-off. The cinematic
  workstream preview stays outside the accessibility tree because the
  immediately following route index carries the same destinations as real
  links.
- Mascot IP must survive below the fold (cameos, not just the hero).
- Per iGEM rules: no external CDNs/fonts at runtime. Fonts + favicon and all
  illustration assets are bundled locally in the repo (`src/assets/fonts/`,
  `src/assets/brand/illustrations/`, `public/`).
- Accessibility is non-negotiable: WCAG AA, reduced-motion gates on all motion.
