import understandUrl from "@/assets/brand/illustrations/understand.webp";
import engineerUrl from "@/assets/brand/illustrations/engineer.webp";
import careUrl from "@/assets/brand/illustrations/care.webp";

/**
 * GPT Image redraws for the three Approach steps. The transparent WebP assets
 * match the colored-pencil, wax-crayon, and charcoal texture of the HEAL
 * banner instead of reading as clean vector icons. The step titles still carry
 * the semantic meaning; concise alt text keeps each illustration useful when
 * encountered independently.
 */
function SpotImage({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <img
      src={src}
      alt={alt}
      width={512}
      height={512}
      decoding="async"
      draggable={false}
      className={`h-full w-full object-contain ${className}`}
    />
  );
}

/** Step 1 — Understand: a magnifier over a paw print. */
export function UnderstandSpot() {
  return (
    <SpotImage
      src={understandUrl}
      alt="A hand-drawn magnifying glass framing a paw print"
    />
  );
}

/** Step 2 — Engineer: a round flask of friendly mint culture. */
export function EngineerSpot() {
  return (
    <SpotImage
      src={engineerUrl}
      alt="A hand-drawn round flask with gently bubbling mint-green culture"
    />
  );
}

/** Step 3 — Care: a cat napping under a little teal blanket. */
export function CareSpot() {
  return (
    <SpotImage
      src={careUrl}
      alt="A hand-drawn cat sleeping peacefully under a teal blanket"
      className="js-nap-cat"
    />
  );
}
