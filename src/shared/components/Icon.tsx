import type { ComponentType } from "react";
import type { IconProps as PhosphorIconProps } from "@phosphor-icons/react";

export type IconSize = "xs" | "sm" | "md" | "lg";

const SIZES: Record<IconSize, number> = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
};

export interface IconProps extends Omit<
  PhosphorIconProps,
  "size" | "weight" | "ref"
> {
  /** A named Phosphor component, e.g. `import { PawPrint } from "@phosphor-icons/react"`. */
  as: ComponentType<PhosphorIconProps>;
  size?: IconSize;
  weight?: PhosphorIconProps["weight"];
  className?: string;
  /** When set, the icon is announced: `role="img"` + `aria-label`. Otherwise `aria-hidden`. */
  title?: string;
}

export function Icon({
  as: Glyph,
  size = "sm",
  weight = "duotone",
  className,
  title,
  ...rest
}: IconProps) {
  const labelled = title !== undefined;
  return (
    <Glyph
      size={SIZES[size]}
      weight={weight}
      className={className}
      color="currentColor"
      aria-hidden={labelled ? undefined : true}
      role={labelled ? "img" : undefined}
      aria-label={labelled ? title : undefined}
      {...rest}
    />
  );
}
