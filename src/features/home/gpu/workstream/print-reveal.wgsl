struct Params {
  drive: f32,
  source_aspect: f32,
  canvas_aspect: f32,
  pad: f32,
  source_texel: vec2f,
}

struct Palette {
  paper: vec4f,
  ink: vec4f,
}

@group(0) @binding(0) var<uniform> params: Params;
@group(0) @binding(1) var<uniform> palette: Palette;
@group(0) @binding(2) var artwork: texture_2d<f32>;
@group(0) @binding(3) var artwork_sampler: sampler;

fn contain_uv(uv: vec2f) -> vec3f {
  if (params.canvas_aspect > params.source_aspect) {
    let width = params.source_aspect / params.canvas_aspect;
    let left = (1.0 - width) * 0.5;
    let inside = select(0.0, 1.0, uv.x >= left && uv.x <= left + width);
    return vec3f((uv.x - left) / max(width, 0.0001), uv.y, inside);
  }
  let height = params.canvas_aspect / params.source_aspect;
  let top = (1.0 - height) * 0.5;
  let inside = select(0.0, 1.0, uv.y >= top && uv.y <= top + height);
  return vec3f(uv.x, (uv.y - top) / max(height, 0.0001), inside);
}

fn hash21(point: vec2f) -> f32 {
  return fract(sin(dot(point, vec2f(127.1, 311.7))) * 43758.5453);
}

fn luminance(color: vec3f) -> f32 {
  return dot(color, vec3f(0.2126, 0.7152, 0.0722));
}

@fragment
fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let mapped = contain_uv(uv);
  if (mapped.z < 0.5) {
    return palette.paper;
  }

  let image_uv = clamp(mapped.xy, params.source_texel * 0.5, vec2f(1.0) - params.source_texel * 0.5);
  let sample = textureSampleLevel(artwork, artwork_sampler, image_uv, 0.0);
  let source_color = mix(palette.paper.rgb, sample.rgb, sample.a);
  let centre = luminance(source_color);
  let left = luminance(mix(palette.paper.rgb, textureSampleLevel(artwork, artwork_sampler, image_uv - vec2f(params.source_texel.x, 0.0), 0.0).rgb, sample.a));
  let right = luminance(mix(palette.paper.rgb, textureSampleLevel(artwork, artwork_sampler, image_uv + vec2f(params.source_texel.x, 0.0), 0.0).rgb, sample.a));
  let up = luminance(mix(palette.paper.rgb, textureSampleLevel(artwork, artwork_sampler, image_uv - vec2f(0.0, params.source_texel.y), 0.0).rgb, sample.a));
  let down = luminance(mix(palette.paper.rgb, textureSampleLevel(artwork, artwork_sampler, image_uv + vec2f(0.0, params.source_texel.y), 0.0).rgb, sample.a));
  let edge = clamp((abs(right - left) + abs(down - up)) * 4.8 + abs(sample.a - 1.0) * 0.2, 0.0, 1.0);
  let charcoal = mix(palette.paper.rgb, palette.ink.rgb, clamp(edge * 0.9 + (1.0 - centre) * 0.18, 0.0, 0.88));

  let grid = image_uv * vec2f(88.0, 62.0);
  let cell = floor(grid);
  let local = fract(grid) - 0.5;
  let noise = hash21(cell);
  let travel = image_uv.x * 0.52 + (1.0 - image_uv.y) * 0.2 + noise * 0.16;
  let front = smoothstep(-0.055, 0.055, params.drive * 0.98 - travel);
  let radius = mix(0.05, 0.68, front);
  let dot_reveal = 1.0 - smoothstep(radius, radius + 0.085, length(local));
  var reveal = max(front * 0.34, dot_reveal * front);
  reveal = mix(reveal, 1.0, smoothstep(0.9, 1.0, params.drive));

  let developed = mix(charcoal, source_color, reveal);

  // A developed leaf remains a physical print instead of snapping back to the
  // untouched source image. Fine registered ink survives on edges and midtone
  // screen dots after the moving reveal front has passed.
  let print_dot = 1.0 - smoothstep(0.13, 0.24, length(local));
  let shadow_coverage = clamp((1.0 - centre) * 0.72 + edge * 0.45, 0.0, 1.0);
  let retained_ink = clamp(
    edge * 0.32 + print_dot * shadow_coverage * 0.12,
    0.0,
    0.34
  );
  let fibre = (hash21(floor(image_uv * vec2f(360.0, 248.0))) - 0.5) * 0.018;
  let settled_print = clamp(
    mix(source_color, palette.ink.rgb, retained_ink) + vec3f(fibre),
    vec3f(0.0),
    vec3f(1.0)
  );
  let settled = smoothstep(0.82, 1.0, params.drive);
  let color = mix(developed, settled_print, settled);
  return vec4f(clamp(color, vec3f(0.0), vec3f(1.0)), 1.0);
}
