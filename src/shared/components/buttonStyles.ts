export type ButtonVariant = "primary" | "danger" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";
export type ButtonFocusContext = "light" | "dark";

const BASE =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-pill font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0";

const SIZES: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-base",
  lg: "px-7 py-3.5 text-lg",
};

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-primary-deep text-white shadow-btn-3d hover:shadow-btn-3d-hover hover:-translate-y-px active:shadow-btn-3d-active active:translate-y-0.5",
  danger:
    "bg-error text-white shadow-btn-danger hover:shadow-btn-danger-hover hover:-translate-y-px active:shadow-btn-danger-active active:translate-y-0.5",
  secondary:
    "bg-surface text-primary-deep border-2 border-border shadow-soft hover:-translate-y-px hover:shadow-soft-hover hover:border-primary-deep active:translate-y-0.5",
  ghost: "bg-transparent text-primary-deep hover:bg-primary-soft",
};

/**
 * Returns the full class string for a button surface. Use on `<Button>` or on a
 * `<Link className={buttonClasses(...)}>` that should look like a button.
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
