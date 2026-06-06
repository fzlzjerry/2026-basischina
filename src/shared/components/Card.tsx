import type { ReactNode } from "react";

export type CardVariant = "plain" | "polka" | "interactive";
export type CardAccent =
  | "teal"
  | "blue"
  | "purple"
  | "green"
  | "peach"
  | "pink";

const VARIANTS: Record<CardVariant, string> = {
  plain: "shadow-soft",
  polka: "shadow-soft ac-polka",
  interactive:
    "shadow-soft transition hover:-translate-y-0.5 hover:shadow-card-lift focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-focus-ring",
};

const ACCENTS: Record<CardAccent, string> = {
  teal: "border-l-4 border-app-teal",
  blue: "border-l-4 border-app-blue",
  purple: "border-l-4 border-app-purple",
  green: "border-l-4 border-app-green",
  peach: "border-l-4 border-app-peach",
  pink: "border-l-4 border-app-pink",
};

function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export interface CardProps {
  variant?: CardVariant;
  accent?: CardAccent;
  compact?: boolean;
  className?: string;
  children?: ReactNode;
}

export function Card({
  variant = "plain",
  accent,
  compact = false,
  className,
  children,
}: CardProps) {
  return (
    <div
      className={cx(
        "bg-surface rounded-card border-2 border-border text-ink",
        compact ? "p-4" : "p-8",
        VARIANTS[variant],
        accent && ACCENTS[accent],
        className,
      )}
    >
      {children}
    </div>
  );
}
