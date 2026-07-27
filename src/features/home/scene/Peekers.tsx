import peekingCatUrl from "@/assets/brand/illustrations/peeking-cat.webp";
import pawCornerUrl from "@/assets/brand/illustrations/paw-corner.webp";

/**
 * GPT Image mascot cameos that carry the HEAL banner's real pencil/crayon
 * texture below the fold. Both are decorative; layout and the peeking cat's
 * quiet bob are owned by the consuming section.
 */
export function PeekingCat({ className = "" }: { className?: string }) {
  return (
    <span aria-hidden="true" className={`block overflow-hidden ${className}`}>
      <img
        src={peekingCatUrl}
        alt=""
        width={768}
        height={477}
        decoding="async"
        draggable={false}
        className="js-peek-cat block h-auto w-full object-contain"
      />
    </span>
  );
}

export function PawCorner({ className = "" }: { className?: string }) {
  return (
    <img
      src={pawCornerUrl}
      alt=""
      aria-hidden="true"
      width={512}
      height={512}
      decoding="async"
      draggable={false}
      className={`object-contain ${className}`}
    />
  );
}
