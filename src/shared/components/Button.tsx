import type { ButtonHTMLAttributes } from "react";
import {
  buttonClasses,
  type ButtonFocusContext,
  type ButtonSize,
  type ButtonVariant,
} from "@/shared/components/buttonStyles";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  focusContext?: ButtonFocusContext;
}

export function Button({
  variant = "primary",
  size = "md",
  focusContext = "light",
  className,
  type = "button",
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClasses(variant, size, className, focusContext)}
      {...rest}
    >
      {children}
    </button>
  );
}
