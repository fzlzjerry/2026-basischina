import { useId, type ReactNode } from "react";
import { Link, type LinkProps } from "react-router-dom";
import { attachInkButton, type InkAttachOptions } from "./attach";
import { INK_BUTTON_VARIANT, seedFrom } from "./defaults";
import { useInkSketch } from "./useInkSketch";

export interface InkLinkProps extends LinkProps {
  seed?: number;
  sketchVariant?: InkAttachOptions["variant"];
  tone?: InkAttachOptions["tone"];
  roughness?: number;
  boil?: number;
  children?: ReactNode;
}

export function InkLink({
  seed,
  sketchVariant = INK_BUTTON_VARIANT,
  tone,
  roughness,
  boil,
  className,
  children,
  ...rest
}: InkLinkProps) {
  const reactId = useId();
  const resolvedSeed = seed ?? seedFrom(reactId);
  const ref = useInkSketch<HTMLAnchorElement>(
    (el) =>
      attachInkButton(el, {
        seed: resolvedSeed,
        variant: sketchVariant,
        tone,
        roughness,
        boil,
      }),
    [resolvedSeed, sketchVariant, tone, roughness, boil, className],
  );

  return (
    <Link
      ref={ref}
      className={["ink-button", className].filter(Boolean).join(" ")}
      {...rest}
    >
      {children}
    </Link>
  );
}
