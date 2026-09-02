import { igemStatic } from "@/config/igemStatic";

const sunsetDuoUrl = igemStatic.illustrations.sunsetDuo;

/**
 * GPT Image redraw of the closing scene. The transparent WebP lets the
 * section's responsive sunset gradient and notebook grid remain live while
 * the hills, setting sun, clouds, paw trail, and back-view mascot duo carry
 * the same colored-pencil, wax-crayon, and charcoal texture as the HEAL banner.
 */
export function SunsetDuo({ className = "" }: { className?: string }) {
  return (
    <img
      src={sunsetDuoUrl}
      alt=""
      aria-hidden="true"
      width={2172}
      height={724}
      loading="lazy"
      decoding="async"
      draggable={false}
      className={`object-bottom ${className}`}
    />
  );
}
