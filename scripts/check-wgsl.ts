import { readdir } from "node:fs/promises";
import { join, resolve } from "node:path";

const root = process.cwd();
const shaderRoot = resolve(root, "src/features/home/gpu");
const executable = resolve(root, "node_modules/.bin/vgpu");

async function collectShaders(directory: string): Promise<string[]> {
  const files: string[] = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await collectShaders(path)));
    else if (entry.name.endsWith(".wgsl")) files.push(path);
  }
  return files.sort();
}

const shaders = await collectShaders(shaderRoot);
if (shaders.length === 0) {
  console.error("No homepage WGSL files were found.");
  process.exit(1);
}

for (const shader of shaders) {
  const child = Bun.spawn(
    [executable, "check", shader, "--require-validation"],
    { cwd: root, stdout: "pipe", stderr: "pipe" },
  );
  const [exitCode, stdout, stderr] = await Promise.all([
    child.exited,
    new Response(child.stdout).text(),
    new Response(child.stderr).text(),
  ]);

  if (exitCode !== 0) {
    console.error(stdout);
    console.error(stderr);
    process.exit(exitCode);
  }

  const result = JSON.parse(stdout) as {
    diagnostics?: unknown[];
    validation?: { ok?: boolean };
  };
  if (result.validation?.ok !== true || (result.diagnostics?.length ?? 0) > 0) {
    console.error(stdout);
    process.exit(1);
  }
  console.log(`[ok] ${shader.slice(root.length + 1)}`);
}

console.log(`Validated ${shaders.length} homepage WGSL files.`);
