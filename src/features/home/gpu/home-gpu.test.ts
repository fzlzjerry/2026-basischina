import { expect, test } from "bun:test";
import { fileURLToPath } from "node:url";
import { resolveShader } from "@vgpu/wgsl/runtime";
import { effect, init, sampler, target, type Gpu } from "vgpu/node";

const shaderPath = (relative: string) =>
  fileURLToPath(new URL(relative, import.meta.url));

async function resolved(relative: string) {
  return (
    await resolveShader({
      entry: shaderPath(relative),
    })
  ).wgsl;
}

function pixel(
  bytes: Uint8Array,
  width: number,
  x: number,
  y: number,
): [number, number, number, number] {
  const offset = (y * width + x) * 4;
  return [
    bytes[offset],
    bytes[offset + 1],
    bytes[offset + 2],
    bytes[offset + 3],
  ];
}

function createRgbaTexture(
  gpu: Gpu,
  width: number,
  height: number,
  colorAt: (x: number, y: number) => readonly [number, number, number, number],
) {
  const texture = gpu.device.createTexture({
    size: [width, height],
    format: "rgba8unorm",
    usage: ["copy_dst", "texture_binding"],
  });
  const bytesPerRow = Math.ceil((width * 4) / 256) * 256;
  const bytes = new Uint8Array(bytesPerRow * height);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const offset = y * bytesPerRow + x * 4;
      bytes.set(colorAt(x, y), offset);
    }
  }

  gpu.gpu.queue.writeTexture(
    { texture: texture.gpu },
    bytes,
    { bytesPerRow, rowsPerImage: height },
    { width, height },
  );
  return texture;
}

function meanRgbDistance(first: Uint8Array, second: Uint8Array): number {
  let total = 0;
  for (let index = 0; index < first.length; index += 4) {
    total += Math.abs(first[index] - second[index]);
    total += Math.abs(first[index + 1] - second[index + 1]);
    total += Math.abs(first[index + 2] - second[index + 2]);
  }
  return total / ((first.length / 4) * 3);
}

function meanChroma(bytes: Uint8Array): number {
  let total = 0;
  for (let index = 0; index < bytes.length; index += 4) {
    const red = bytes[index];
    const green = bytes[index + 1];
    const blue = bytes[index + 2];
    total += Math.max(red, green, blue) - Math.min(red, green, blue);
  }
  return total / (bytes.length / 4);
}

function meanRegionRgb(
  bytes: Uint8Array,
  width: number,
  xStart: number,
  xEnd: number,
  yStart: number,
  yEnd: number,
): [number, number, number] {
  const total = [0, 0, 0];
  let count = 0;
  for (let y = yStart; y < yEnd; y += 1) {
    for (let x = xStart; x < xEnd; x += 1) {
      const sample = pixel(bytes, width, x, y);
      total[0] += sample[0];
      total[1] += sample[1];
      total[2] += sample[2];
      count += 1;
    }
  }
  return [total[0] / count, total[1] / count, total[2] / count];
}

function regionLumaDeviation(
  bytes: Uint8Array,
  width: number,
  xStart: number,
  xEnd: number,
  yStart: number,
  yEnd: number,
): number {
  const luminances: number[] = [];
  for (let y = yStart; y < yEnd; y += 1) {
    for (let x = xStart; x < xEnd; x += 1) {
      const sample = pixel(bytes, width, x, y);
      luminances.push(
        sample[0] * 0.2126 + sample[1] * 0.7152 + sample[2] * 0.0722,
      );
    }
  }
  const mean =
    luminances.reduce((total, luminance) => total + luminance, 0) /
    luminances.length;
  const variance =
    luminances.reduce(
      (total, luminance) => total + (luminance - mean) ** 2,
      0,
    ) / luminances.length;
  return Math.sqrt(variance);
}

function changedPixelFraction(
  first: Uint8Array,
  second: Uint8Array,
  minimumRgbDistance: number,
): number {
  let changed = 0;
  for (let index = 0; index < first.length; index += 4) {
    const distance =
      Math.abs(first[index] - second[index]) +
      Math.abs(first[index + 1] - second[index + 1]) +
      Math.abs(first[index + 2] - second[index + 2]);
    if (distance >= minimumRgbDistance) changed += 1;
  }
  return changed / (first.length / 4);
}

function alphaCoverage(
  bytes: Uint8Array,
  width: number,
  yStart = 0,
  yEnd = bytes.length / 4 / width,
): number {
  let filled = 0;
  let total = 0;
  for (let y = yStart; y < yEnd; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (pixel(bytes, width, x, y)[3] > 24) filled += 1;
      total += 1;
    }
  }
  return filled / total;
}

test("hero paper keeps the three chapter colors world-locked", async () => {
  const gpu = await init();
  try {
    const width = 96;
    const height = 48;
    const output = target(gpu, { size: [width, height] });
    const paper = effect(gpu, await resolved("./hero/hero-paper.wgsl"), {
      set: {
        params: {
          track: 0,
          wet: 0.5,
          grain: 44,
          texel: output.texelSize,
        },
        papers: {
          understand: [0.984, 0.89, 0.776, 1],
          engineer: [0.184, 0.141, 0.09, 1],
          care: [0.902, 0.976, 0.965, 1],
        },
      },
    });

    const samples: Array<[number, number, number]> = [];
    for (const track of [0, 1, 2]) {
      paper.set({ params: { track } });
      paper.draw(output);
      const bytes = await output.read();
      samples.push(
        pixel(bytes, width, width >> 1, height >> 1).slice(0, 3) as [
          number,
          number,
          number,
        ],
      );
    }

    expect(samples[0][0]).toBeGreaterThan(samples[0][2]);
    expect(Math.max(...samples[1])).toBeLessThan(130);
    expect(samples[2][1]).toBeGreaterThan(samples[2][0]);
    expect(samples[2][2]).toBeGreaterThan(samples[2][0]);
  } finally {
    gpu.dispose();
  }
});

test("workstream print develops deterministically from charcoal into source color", async () => {
  const gpu = await init();
  const sourceWidth = 64;
  const sourceHeight = 48;
  const artwork = createRgbaTexture(gpu, sourceWidth, sourceHeight, (x, y) => {
    const paperGrain = (x * 13 + y * 7) % 19;
    return x < sourceWidth / 2
      ? [238 - paperGrain, 82 + paperGrain, 43 + paperGrain, 255]
      : [25 + paperGrain, 185 - paperGrain, 171 - paperGrain, 255];
  });

  try {
    const width = 64;
    const height = 48;
    const output = target(gpu, { size: [width, height] });
    const print = effect(
      gpu,
      await resolved("./workstream/print-reveal.wgsl"),
      {
        set: {
          params: {
            drive: 0,
            source_aspect: sourceWidth / sourceHeight,
            canvas_aspect: width / height,
            pad: 0,
            source_texel: [1 / sourceWidth, 1 / sourceHeight],
          },
          palette: {
            paper: [0.984, 0.89, 0.776, 1],
            ink: [0.184, 0.141, 0.09, 1],
          },
          artwork,
          artwork_sampler: sampler(gpu, {
            minFilter: "nearest",
            magFilter: "nearest",
          }),
        },
      },
    );

    print.draw(output);
    const charcoal = await output.read();

    print.set({ params: { drive: 0.52 } });
    print.draw(output);
    const developing = await output.read();

    print.set({ params: { drive: 1 } });
    print.draw(output);
    const developed = await output.read();
    print.draw(output);
    const repeated = await output.read();

    const developingDistance = meanRgbDistance(charcoal, developing);
    const developedDistance = meanRgbDistance(charcoal, developed);
    expect(developingDistance).toBeGreaterThan(8);
    expect(developedDistance).toBeGreaterThan(developingDistance + 10);
    expect(meanChroma(developed)).toBeGreaterThan(meanChroma(charcoal) + 55);

    const orange = pixel(developed, width, width >> 2, height >> 1);
    const teal = pixel(developed, width, (width * 3) >> 2, height >> 1);
    expect(orange[0]).toBeGreaterThan(190);
    expect(orange[0]).toBeGreaterThan(orange[1] + 90);
    expect(teal[1]).toBeGreaterThan(130);
    expect(teal[2]).toBeGreaterThan(teal[0] + 90);
    expect(Array.from(repeated)).toEqual(Array.from(developed));
  } finally {
    artwork.dispose();
    gpu.dispose();
  }
});

test("workstream completed print keeps visible material without losing source colors", async () => {
  const gpu = await init();
  const width = 64;
  const height = 48;
  const orangeSource = [238, 82, 43, 255] as const;
  const tealSource = [25, 185, 171, 255] as const;
  const sourceColorAt = (x: number) =>
    x < width / 2 ? orangeSource : tealSource;
  const artwork = createRgbaTexture(gpu, width, height, (x) =>
    sourceColorAt(x),
  );
  const source = new Uint8Array(width * height * 4);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      source.set(sourceColorAt(x), (y * width + x) * 4);
    }
  }

  try {
    const output = target(gpu, { size: [width, height] });
    const print = effect(
      gpu,
      await resolved("./workstream/print-reveal.wgsl"),
      {
        set: {
          params: {
            drive: 1,
            source_aspect: width / height,
            canvas_aspect: width / height,
            pad: 0,
            source_texel: [1 / width, 1 / height],
          },
          palette: {
            paper: [0.984, 0.89, 0.776, 1],
            ink: [0.184, 0.141, 0.09, 1],
          },
          artwork,
          artwork_sampler: sampler(gpu, {
            minFilter: "nearest",
            magFilter: "nearest",
          }),
        },
      },
    );

    print.draw(output);
    const completed = await output.read();

    // A completed reveal must not collapse to a plain copy of the source.
    // Flat source regions make the retained print/charcoal texture measurable.
    const sourceDistance = meanRgbDistance(completed, source);
    const materialCoverage = changedPixelFraction(completed, source, 6);
    const orangeTexture = regionLumaDeviation(
      completed,
      width,
      4,
      width / 2 - 4,
      4,
      height - 4,
    );
    const tealTexture = regionLumaDeviation(
      completed,
      width,
      width / 2 + 4,
      width - 4,
      4,
      height - 4,
    );
    expect(sourceDistance).toBeGreaterThan(0.8);
    expect(sourceDistance).toBeLessThan(24);
    expect(materialCoverage).toBeGreaterThan(0.08);
    expect(orangeTexture).toBeGreaterThan(0.65);
    expect(tealTexture).toBeGreaterThan(0.65);

    // The material may modulate the image, but both semantic source colors
    // still need to read immediately after the scroll animation completes.
    const orange = meanRegionRgb(
      completed,
      width,
      4,
      width / 2 - 4,
      4,
      height - 4,
    );
    const teal = meanRegionRgb(
      completed,
      width,
      width / 2 + 4,
      width - 4,
      4,
      height - 4,
    );
    expect(orange[0]).toBeGreaterThan(190);
    expect(orange[0]).toBeGreaterThan(orange[1] + 90);
    expect(teal[1]).toBeGreaterThan(135);
    expect(teal[2]).toBeGreaterThan(teal[0] + 85);
  } finally {
    artwork.dispose();
    gpu.dispose();
  }
});

test("kinetic text mask fills the three real lines sequentially and nowhere else", async () => {
  const gpu = await init();
  const width = 64;
  const height = 48;
  const masks = createRgbaTexture(gpu, width, height, (x, y) => {
    if (x === 2 && y === 16) return [255, 0, 0, 32];
    const insideX = x >= 4 && x < width - 4;
    if (insideX && y >= 4 && y < 13) return [255, 0, 0, 255];
    if (insideX && y >= 19 && y < 29) return [0, 255, 0, 255];
    if (insideX && y >= 35 && y < 44) return [0, 0, 255, 255];
    return [0, 0, 0, 255];
  });

  try {
    const output = target(gpu, { size: [width, height] });
    const ink = effect(
      gpu,
      await resolved("./kinetic-text/kinetic-text-ink.wgsl"),
      {
        set: {
          params: {
            drive: 0,
            pad: 0,
            texel: output.texelSize,
          },
          masks,
          mask_sampler: sampler(gpu, {
            minFilter: "nearest",
            magFilter: "nearest",
          }),
        },
      },
    );

    const render = async (drive: number) => {
      ink.set({ params: { drive } });
      ink.draw(output);
      return output.read();
    };

    const empty = await render(0);
    const firstLine = await render(0.18);
    const secondLine = await render(0.5);
    const thirdLine = await render(0.8);
    const complete = await render(1);
    const repeated = await render(1);

    const coverage = [empty, firstLine, secondLine, thirdLine, complete].map(
      (frame) => alphaCoverage(frame, width),
    );
    expect(coverage[0]).toBeLessThan(0.01);
    expect(coverage[1]).toBeGreaterThan(coverage[0] + 0.08);
    expect(coverage[2]).toBeGreaterThan(coverage[1] + 0.08);
    expect(coverage[3]).toBeGreaterThan(coverage[2] + 0.08);
    expect(coverage[4]).toBeGreaterThan(coverage[3] + 0.04);

    const firstAtStart = alphaCoverage(firstLine, width, 3, 14);
    const secondAtStart = alphaCoverage(firstLine, width, 18, 30);
    const thirdAtStart = alphaCoverage(firstLine, width, 34, 45);
    expect(firstAtStart).toBeGreaterThan(0.25);
    expect(secondAtStart).toBeLessThan(0.04);
    expect(thirdAtStart).toBeLessThan(0.04);

    expect(alphaCoverage(secondLine, width, 3, 14)).toBeGreaterThan(0.75);
    expect(alphaCoverage(secondLine, width, 18, 30)).toBeGreaterThan(0.25);
    expect(alphaCoverage(secondLine, width, 34, 45)).toBeLessThan(0.04);

    const orange = pixel(complete, width, width >> 1, 8);
    const teal = pixel(complete, width, width >> 1, 23);
    const cream = pixel(complete, width, width >> 1, 39);
    const outside = pixel(complete, width, width >> 1, 0);
    const softEdge = pixel(complete, width, 2, 16);
    expect(orange[0]).toBeGreaterThan(orange[1]);
    expect(orange[1]).toBeGreaterThan(orange[2]);
    expect(teal[1]).toBeGreaterThan(teal[0] + 80);
    expect(teal[2]).toBeGreaterThan(teal[0] + 70);
    expect(cream[0]).toBeGreaterThan(cream[1]);
    expect(cream[1]).toBeGreaterThan(cream[2]);
    expect(outside[3]).toBeLessThan(8);
    expect(softEdge[3]).toBeGreaterThan(8);
    expect(softEdge[3]).toBeLessThan(80);
    expect(Array.from(repeated)).toEqual(Array.from(complete));
  } finally {
    masks.dispose();
    gpu.dispose();
  }
});
