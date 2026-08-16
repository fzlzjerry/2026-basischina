import { useEffect, useId, useRef, type ButtonHTMLAttributes } from "react";
import type { ButtonSketch, DrawablyButtonState } from "drawably";
import { attachInkButton, type InkAttachOptions } from "./attach";
import { INK_BUTTON_VARIANT, seedFrom } from "./defaults";

export interface InkButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  seed?: number;
  sketchVariant?: InkAttachOptions["variant"];
  state?: DrawablyButtonState;
  tone?: InkAttachOptions["tone"];
}

export function InkButton({
  seed,
  sketchVariant = INK_BUTTON_VARIANT,
  state = "idle",
  tone,
  className,
  type = "button",
  children,
  ...rest
}: InkButtonProps) {
  const reactId = useId();
  const resolvedSeed = seed ?? seedFrom(reactId);
  const sketchRef = useRef<ButtonSketch | null>(null);
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const sketch = attachInkButton(ref.current, {
      seed: resolvedSeed,
      variant: sketchVariant,
      tone,
      state,
    });
    sketchRef.current = sketch;
    return () => {
      sketch.destroy();
      sketchRef.current = null;
    };
    // `state` is applied in the effect below via setState so the sketch stays put.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedSeed, sketchVariant, tone, className]);

  useEffect(() => {
    sketchRef.current?.setState(state);
  }, [state]);

  return (
    <button
      ref={ref}
      type={type}
      className={["ink-button", className].filter(Boolean).join(" ")}
      {...rest}
    >
      {children}
    </button>
  );
}
