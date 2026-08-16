export type ButtonVariant = "primary" | "danger" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";
export type ButtonFocusContext = "light" | "dark";

const BASE =
  "inline-flex min-h-11 items-center justify-center gap-2 font-hand leading-none text-sticker-ink disabled:cursor-not-allowed disabled:opacity-60";

const SIZES: Record<ButtonSize, string> = {
  sm: "px-3.5 py-2 text-sm",
  md: "px-5 py-2.5 text-base",
  lg: "px-6 py-3 text-lg",
};

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "",
  danger: "",
  secondary: "",
  ghost: "ink-button--ghost",
};

export function inkTone(
  variant: ButtonVariant,
): "neutral" | "danger" | undefined {
  if (variant === "danger") return "danger";
  if (variant === "secondary" || variant === "ghost") return "neutral";
  return undefined;
}

/**
 * Layout classes for an ink-layer button. Pair with `<Button>`, `<InkButton>`,
 * or `<InkLink>` so drawably can draw the stroke — do not use as a standalone
 * filled pill.
 */
export function buttonClasses(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  extra?: string,
  focusContext: ButtonFocusContext = "light",
): string {
  const focusClass =
    focusContext === "dark"
      ? "focus-visible:outline-focus-on-dark"
      : "focus-visible:outline-focus-ring";

  return [BASE, SIZES[size], VARIANTS[variant], focusClass, extra]
    .filter(Boolean)
    .join(" ");
}
