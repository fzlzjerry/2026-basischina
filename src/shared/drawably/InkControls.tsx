import { useId, type InputHTMLAttributes, type HTMLAttributes } from "react";
import {
  attachInkCheckbox,
  attachInkDivider,
  attachInkInput,
  attachInkRadio,
  attachInkToggle,
} from "./attach";
import { seedFrom } from "./defaults";
import { useInkSketch } from "./useInkSketch";

type InkFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  seed?: number;
};

function fieldClassName(className?: string): string {
  return ["ink-field", className].filter(Boolean).join(" ");
}

export function InkCheckbox({ seed, className, ...rest }: InkFieldProps) {
  const reactId = useId();
  const resolvedSeed = seed ?? seedFrom(reactId, "checkbox");
  const ref = useInkSketch<HTMLSpanElement>(
    (el) => attachInkCheckbox(el, { seed: resolvedSeed }),
    [resolvedSeed, className],
  );

  return (
    <span ref={ref} className={fieldClassName(className)}>
      <input {...rest} type="checkbox" />
    </span>
  );
}

export function InkRadio({ seed, className, ...rest }: InkFieldProps) {
  const reactId = useId();
  const resolvedSeed = seed ?? seedFrom(reactId, "radio");
  const ref = useInkSketch<HTMLSpanElement>(
    (el) => attachInkRadio(el, { seed: resolvedSeed }),
    [resolvedSeed, className],
  );

  return (
    <span ref={ref} className={fieldClassName(className)}>
      <input {...rest} type="radio" />
    </span>
  );
}

export function InkToggle({ seed, className, ...rest }: InkFieldProps) {
  const reactId = useId();
  const resolvedSeed = seed ?? seedFrom(reactId, "toggle");
  const ref = useInkSketch<HTMLSpanElement>(
    (el) => attachInkToggle(el, { seed: resolvedSeed }),
    [resolvedSeed, className],
  );

  return (
    <span ref={ref} className={fieldClassName(className)}>
      <input {...rest} type="checkbox" role="switch" />
    </span>
  );
}

export function InkInput({ seed, className, ...rest }: InkFieldProps) {
  const reactId = useId();
  const resolvedSeed = seed ?? seedFrom(reactId, "input");
  const ref = useInkSketch<HTMLSpanElement>(
    (el) => attachInkInput(el, { seed: resolvedSeed }),
    [resolvedSeed, className],
  );

  return (
    <span ref={ref} className={fieldClassName(className)}>
      <input {...rest} />
    </span>
  );
}

type InkDividerProps = HTMLAttributes<HTMLHRElement> & { seed?: number };

export function InkDivider({ seed, className, ...rest }: InkDividerProps) {
  const reactId = useId();
  const resolvedSeed = seed ?? seedFrom(reactId, "divider");
  const ref = useInkSketch<HTMLHRElement>(
    (el) => attachInkDivider(el, { seed: resolvedSeed }),
    [resolvedSeed, className],
  );

  return <hr ref={ref} className={className} {...rest} />;
}
