import {
  drawablyButton,
  drawablyCheckbox,
  drawablyDivider,
  drawablyInput,
  drawablyRadio,
  drawablyToggle,
  type ButtonSketch,
  type DrawablyButtonOptions,
  type DrawablyOptions,
  type Sketch,
} from "drawably";
import { INK_BUTTON_VARIANT, INK_SKETCH_OPTIONS } from "./defaults";

export type InkAttachOptions = DrawablyOptions &
  Pick<DrawablyButtonOptions, "variant" | "state" | "tone">;

function sketchOptions(opts: InkAttachOptions = {}): DrawablyButtonOptions {
  return {
    ...INK_SKETCH_OPTIONS,
    variant: opts.variant ?? INK_BUTTON_VARIANT,
    seed: opts.seed,
    roughness: opts.roughness ?? INK_SKETCH_OPTIONS.roughness,
    boil: opts.boil ?? INK_SKETCH_OPTIONS.boil,
    width: opts.width ?? INK_SKETCH_OPTIONS.width,
    stroke: opts.stroke,
    fill: opts.fill,
    paper: opts.paper,
    state: opts.state,
    tone: opts.tone,
  };
}

/** Vanilla attach for client DOM (markdown Copy, etc.). */
export function attachInkButton(
  el: HTMLElement,
  opts: InkAttachOptions = {},
): ButtonSketch {
  return drawablyButton(el, sketchOptions(opts));
}

export function attachInkCheckbox(
  wrap: HTMLElement,
  opts: DrawablyOptions = {},
): Sketch {
  return drawablyCheckbox(wrap, sketchOptions(opts));
}

export function attachInkRadio(
  wrap: HTMLElement,
  opts: DrawablyOptions = {},
): Sketch {
  return drawablyRadio(wrap, sketchOptions(opts));
}

export function attachInkToggle(
  wrap: HTMLElement,
  opts: DrawablyOptions = {},
): Sketch {
  return drawablyToggle(wrap, sketchOptions(opts));
}

export function attachInkInput(
  wrap: HTMLElement,
  opts: DrawablyOptions = {},
): Sketch {
  return drawablyInput(wrap, sketchOptions(opts));
}

export function attachInkDivider(
  el: HTMLElement,
  opts: DrawablyOptions = {},
): Sketch {
  return drawablyDivider(el, sketchOptions(opts));
}
