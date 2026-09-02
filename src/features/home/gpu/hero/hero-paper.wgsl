import { fbmSimplex2d } from "@vgpu/wgsl-std/noise/simplex";
import { voronoi2d } from "@vgpu/wgsl-std/noise";

struct Params {
  track: f32,
  wet: f32,
  grain: f32,
  texel: vec2f,
}

struct Papers {
  understand: vec4f,
  engineer: vec4f,
  care: vec4f,
}

@group(0) @binding(0) var<uniform> params: Params;
@group(0) @binding(1) var<uniform> papers: Papers;

fn fibre_offset(y: f32, boundary: f32) -> f32 {
  let coarse = fbmSimplex2d(vec2f(y * 3.7, boundary * 9.1), 3, 2.11, 0.5);
  let cells = voronoi2d(vec2f(y * 13.0, boundary * 5.3));
  let vein = clamp((cells.f2 - cells.f1) * 1.8 - 0.25, -0.5, 0.5);
  return coarse * 0.022 + vein * 0.009;
}

fn tooth(world: vec2f) -> f32 {
  let cells = voronoi2d(world * vec2f(params.grain * 0.55, params.grain));
  let fibre = clamp((cells.f2 - cells.f1) * 2.0 - 0.5, -1.0, 1.0);
  let pulp = fbmSimplex2d(world * params.grain * 2.3, 3, 2.13, 0.5);
  return fibre * 0.32 + pulp * 0.68;
}

fn seam(world: vec2f, boundary: f32) -> vec2f {
  let centre = boundary + fibre_offset(world.y, boundary);
  let width = mix(0.026, 0.044, params.wet);
  let distance = world.x - centre;
  let amount = smoothstep(-width, width, distance);
  let edge = exp(-pow(distance / max(width * 0.72, 0.0001), 2.0));
  return vec2f(amount, edge);
}

@fragment
fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let world = vec2f(uv.x + params.track, uv.y);
  let first = seam(world, 1.0);
  let second = seam(world, 2.0);

  var color = mix(papers.understand.rgb, papers.engineer.rgb, first.x);
  color = mix(color, papers.care.rgb, second.x);

  let edge = max(first.y, second.y);
  let paper_tooth = tooth(world);
  color *= 1.0 + paper_tooth * 0.018;
  color *= 1.0 - edge * mix(0.055, 0.085, params.wet);

  let hair = fbmSimplex2d(
    world * vec2f(params.grain * 0.35, params.grain * 5.2),
    2,
    2.03,
    0.48,
  );
  color *= 1.0 + hair * 0.006;

  return vec4f(color, 1.0);
}
