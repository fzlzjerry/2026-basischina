import type { ReactNode } from "react";

export type TitleLevel = "h1" | "h2" | "h3";
export type TitleAlign = "left" | "center";

const SIZES: Record<TitleLevel, string> = {
  h1: "text-3xl sm:text-4xl",
  h2: "text-2xl sm:text-3xl",
  h3: "text-xl sm:text-2xl",
};

const ALIGN: Record<TitleAlign, string> = {
  left: "text-left",
  center: "text-center",
};

function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export interface TitleProps {
  level?: TitleLevel;
  align?: TitleAlign;
  className?: string;
  children?: ReactNode;
}

export function Title({
  level = "h2",
  align = "left",
  className,
  children,
}: TitleProps) {
  const Heading = level;
  return (
    <Heading className={cx(SIZES[level], ALIGN[align], className)}>
      <span className="ac-ribbon">{children}</span>
    </Heading>
  );
}
