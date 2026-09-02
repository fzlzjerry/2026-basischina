/**
 * Drop public binaries that now live on static.igem.wiki so the GitLab Pages
 * artifact stays under gitlab.igem.org's 10 MiB cap. Source files are not
 * deleted. The 404 clip stays: the uploads API rejects video/mp4.
 */
import { unlink } from "node:fs/promises";
import { join } from "node:path";

const DIST_DIR = join(process.cwd(), "dist");
const OMIT = [
  "favicon-heal.png",
  "assets/dry-lab-cover-v2.webp",
  "assets/dry-lab-cover.webp",
  "assets/engagement-cover-v2.webp",
  "assets/engagement-cover.webp",
  "assets/markdown-demo-figure.svg",
  "assets/og-default.png",
  "assets/project-cover.webp",
  "assets/team-cover.webp",
  "assets/wet-lab-cover.jpg",
  "assets/wet-lab-cover.webp",
];

let removed = 0;
for (const rel of OMIT) {
  try {
    await unlink(join(DIST_DIR, rel));
    removed += 1;
    console.log(`  omitted ${rel}`);
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code !== "ENOENT") throw error;
  }
}

console.log(`✓ Omitted ${removed} CDN-hosted public files from dist/.`);
