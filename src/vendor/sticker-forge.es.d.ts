export interface StickerForgeController {
  setSource: (source: {
    type: "image";
    src: string;
    name: string;
    padding?: number;
  }) => Promise<void>;
  setOptions: (options: Record<string, unknown>) => void;
  setPeelProgress: (
    progress: number,
    direction?: {
      origin: { x: number; y: number };
      target: { x: number; y: number };
    },
  ) => void;
  getState: () => { dragging: boolean; progress: number; ready: boolean };
  destroy: () => void;
}

export function createSticker(
  target: HTMLElement,
  options: Record<string, unknown>,
): Promise<StickerForgeController>;
