import type { ButtonHTMLAttributes } from "react";
import {
  buttonClasses,
  inkTone,
  type ButtonFocusContext,
  type ButtonSize,
  type ButtonVariant,
} from "@/shared/components/buttonStyles";
import { InkButton } from "@/shared/drawably/InkButton";

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
    <InkButton
      type={type}
      tone={inkTone(variant)}
      className={buttonClasses(variant, size, className, focusContext)}
      {...rest}
    >
      {children}
    </InkButton>
  );
}
