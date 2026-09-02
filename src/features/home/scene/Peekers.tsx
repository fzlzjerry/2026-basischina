import { igemStatic } from "@/config/igemStatic";

const peekingCatUrl = igemStatic.illustrations.peekingCat;
const pawCornerUrl = igemStatic.illustrations.pawCorner;

/**
 * GPT Image mascot cameos that carry the HEAL banner's real pencil/crayon
 * texture below the fold. Both are decorative and intentionally static: the
 * page spends its motion budget on the hero and scroll narrative, not idle
 * mascot bobbing.
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
        className="block h-auto w-full object-contain"
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
