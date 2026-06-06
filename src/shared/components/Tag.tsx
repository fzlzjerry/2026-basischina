import type { ReactNode } from "react";

export type TagTone =
  | "teal"
  | "blue"
  | "purple"
  | "green"
  | "peach"
  | "pink"
  | "success"
  | "warning"
  | "error"
  | "info";

const TONES: Record<TagTone, string> = {
  teal: "bg-app-teal/15 text-app-teal-ink",
  blue: "bg-app-blue/15 text-app-blue-ink",
  purple: "bg-app-purple/15 text-app-purple-ink",
  green: "bg-app-green/15 text-app-green-ink",
  peach: "bg-app-peach/15 text-app-peach-ink",
  pink: "bg-app-pink/15 text-app-pink-ink",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  error: "bg-error-soft text-error",
  info: "bg-primary-soft text-primary-deep",
};

function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export interface TagProps {
  tone?: TagTone;
  className?: string;
  children?: ReactNode;
}

export function Tag({ tone = "info", className, children }: TagProps) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 rounded-badge px-2.5 py-0.5 text-xs font-semibold",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
