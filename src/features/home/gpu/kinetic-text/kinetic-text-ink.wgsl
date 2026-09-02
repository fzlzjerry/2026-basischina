import { fbmSimplex2d } from "@vgpu/wgsl-std/noise/simplex";

struct Params {
  drive: f32,
  pad: f32,
  texel: vec2f,
}

@group(0) @binding(0) var<uniform> params: Params;
@group(0) @binding(1) var masks: texture_2d<f32>;
@group(0) @binding(2) var mask_sampler: sampler;

fn line_front(x: f32, progress: f32, seed: f32) -> f32 {
  let fibre = fbmSimplex2d(vec2f(x * 5.2, seed), 3, 2.11, 0.5) * 0.035;
  return 1.0 - smoothstep(progress - 0.075 + fibre, progress + 0.055 + fibre, x);
}

@fragment
fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let center_sample = textureSampleLevel(masks, mask_sampler, uv, 0.0);
  let right_sample = textureSampleLevel(
    masks,
    mask_sampler,
    uv + vec2f(params.texel.x, 0.0),
    0.0
  );
  let left_sample = textureSampleLevel(
    masks,
    mask_sampler,
    uv - vec2f(params.texel.x, 0.0),
    0.0
  );
  let down_sample = textureSampleLevel(
    masks,
    mask_sampler,
    uv + vec2f(0.0, params.texel.y),
    0.0
  );
  let up_sample = textureSampleLevel(
    masks,
    mask_sampler,
    uv - vec2f(0.0, params.texel.y),
    0.0
  );
  let mask = center_sample.rgb * center_sample.a;
  let neighbour = max(
    max(right_sample.rgb * right_sample.a, left_sample.rgb * left_sample.a),
    max(down_sample.rgb * down_sample.a, up_sample.rgb * up_sample.a)
  );
  let glyph = max(mask, neighbour * 0.72);

  let first_progress = smoothstep(0.0, 0.38, params.drive) * 1.08;
  let second_progress = smoothstep(0.24, 0.72, params.drive) * 1.08;
  let third_progress = smoothstep(0.56, 1.0, params.drive) * 1.08;
  let first = glyph.r * line_front(uv.x, first_progress, 1.7);
  let second = glyph.g * line_front(1.0 - uv.x, second_progress, 4.1);
  let third = glyph.b * line_front(uv.x, third_progress, 7.3);

  let tooth = fbmSimplex2d(uv * vec2f(44.0, 76.0), 2, 2.07, 0.48);
  let first_alpha = clamp(first * (0.94 + tooth * 0.1), 0.0, 1.0);
  let second_alpha = clamp(second * (0.94 + tooth * 0.12), 0.0, 1.0);
  let third_alpha = clamp(third * (0.94 + tooth * 0.1), 0.0, 1.0);
  let alpha = max(first_alpha, max(second_alpha, third_alpha));
  if (alpha < 0.002) {
    return vec4f(0.0);
  }

  let first_color = vec3f(0.94, 0.66, 0.41);
  let second_color = vec3f(0.1, 0.78, 0.72);
  let third_color = vec3f(0.98, 0.9, 0.72);
  let weighted =
    first_color * first_alpha +
    second_color * second_alpha +
    third_color * third_alpha;
  let weight = max(first_alpha + second_alpha + third_alpha, 0.001);
  return vec4f(weighted / weight, alpha);
}
