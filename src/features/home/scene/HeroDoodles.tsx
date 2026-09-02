import { igemStatic } from "@/config/igemStatic";

const heroLabPawUrl = igemStatic.illustrations.heroLabPaw;

/**
 * GPT Image redraw of the hero's lab-to-pet margin note. The transparent WebP
 * keeps the flask, paw, and orange pencil underline as one authored vignette,
 * with the same dry colored-pencil and charcoal texture as the HEAL banner.
 * The caller owns the paste-in motion and marks the illustration decorative.
 */
export function HeroSketch() {
  return (
    <img
      src={heroLabPawUrl}
      alt=""
      aria-hidden="true"
      width={700}
      height={500}
      decoding="async"
      draggable={false}
      className="h-full w-full object-contain"
    />
  );
}
