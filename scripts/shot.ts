/**
 * Dependency-free headless screenshot tool.
 *
 * Drives the system Google Chrome over the DevTools Protocol (CDP) using only
 * node/bun built-ins (no puppeteer/playwright). Captures FULL-PAGE PNGs at
 * desktop and mobile widths. `prefers-reduced-motion: reduce` is forced so GSAP
 * idle / entrance motion stays static and the capture is stable and complete
 * (mobile needs CDP device-metrics emulation; the plain `--screenshot` flag
 * clamps width and only grabs the viewport, which is why we speak CDP directly).
 *
 * Usage:
 *   bun scripts/shot.ts <baseUrl> <outDir> <label> <route> [route...]
 * Example (after `bun run build:fast && bun run preview`):
 *   bun scripts/shot.ts http://localhost:4173/basis-china screenshots before / /description
 *
 * Output: <outDir>/<label>-<routeSlug>-<desktop|mobile>.png
 */

import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { Buffer } from "node:buffer";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

interface Viewport {
  name: string;
  width: number;
  height: number;
  dsf: number;
  mobile: boolean;
}

const VIEWPORTS: Viewport[] = [
  { name: "desktop", width: 1440, height: 900, dsf: 2, mobile: false },
  { name: "mobile", width: 390, height: 844, dsf: 3, mobile: true },
];

type Params = Record<string, unknown>;
type Handler = (params: unknown, sessionId?: string) => void;

class CDP {
  private ws: WebSocket;
  private id = 0;
  private pending = new Map<
    number,
    { resolve: (v: unknown) => void; reject: (e: Error) => void }
  >();
  private listeners = new Map<string, Set<Handler>>();

  constructor(ws: WebSocket) {
    this.ws = ws;
    ws.onmessage = (ev: MessageEvent) => {
      const msg = JSON.parse(ev.data as string) as {
        id?: number;
        method?: string;
        params?: unknown;
        sessionId?: string;
        result?: unknown;
        error?: unknown;
      };
      if (typeof msg.id === "number" && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id)!;
        this.pending.delete(msg.id);
        if (msg.error) reject(new Error(JSON.stringify(msg.error)));
        else resolve(msg.result);
      } else if (msg.method) {
        for (const h of this.listeners.get(msg.method) ?? [])
          h(msg.params, msg.sessionId);
      }
    };
  }

  send<T = unknown>(method: string, params: Params = {}, sessionId?: string) {
    const id = ++this.id;
    return new Promise<T>((resolve, reject) => {
      this.pending.set(id, {
        resolve: resolve as (v: unknown) => void,
        reject,
      });
      this.ws.send(JSON.stringify({ id, method, params, sessionId }));
    });
  }

  private on(method: string, handler: Handler) {
    if (!this.listeners.has(method)) this.listeners.set(method, new Set());
    this.listeners.get(method)!.add(handler);
  }

  private off(method: string, handler: Handler) {
    this.listeners.get(method)?.delete(handler);
  }

  once(method: string, predicate?: (p: unknown, s?: string) => boolean) {
    return new Promise<unknown>((resolve) => {
      const handler: Handler = (params, sessionId) => {
        if (!predicate || predicate(params, sessionId)) {
          this.off(method, handler);
          resolve(params);
        }
      };
      this.on(method, handler);
    });
  }
}

function slug(route: string): string {
  const s = route.replace(/^\/+|\/+$/g, "").replace(/\//g, "-");
  return s === "" ? "home" : s;
}

async function shoot(
  cdp: CDP,
  baseUrl: string,
  route: string,
  vp: Viewport,
  outPath: string,
) {
  const { targetId } = await cdp.send<{ targetId: string }>(
    "Target.createTarget",
    { url: "about:blank" },
  );
  const { sessionId } = await cdp.send<{ sessionId: string }>(
    "Target.attachToTarget",
    { targetId, flatten: true },
  );
  const s = <T = unknown>(method: string, params?: Params) =>
    cdp.send<T>(method, params, sessionId);

  await s("Page.enable");
  // Reduced motion is forced by default so GSAP idle/entrance stays static and
  // the capture is stable + complete. Set SHOT_MOTION=1 to capture the motion-on
  // state instead (entrances play; pair with SHOT_EVAL scroll to fire reveals).
  if (!process.env.SHOT_MOTION) {
    await s("Emulation.setEmulatedMedia", {
      features: [{ name: "prefers-reduced-motion", value: "reduce" }],
    });
  }
  await s("Emulation.setDeviceMetricsOverride", {
    width: vp.width,
    height: vp.height,
    deviceScaleFactor: vp.dsf,
    mobile: vp.mobile,
  });

  const loaded = cdp.once(
    "Page.loadEventFired",
    (_p, sid) => sid === sessionId,
  );
  await s("Page.navigate", { url: baseUrl + route });
  await Promise.race([loaded, sleep(15000)]);
  await sleep(1300); // settle: webfonts, layout, any sync paint

  // Optional pre-capture interaction for state QA. SHOT_EVAL runs arbitrary JS in
  // the page (open a dropdown, force a scroll/hover state); SHOT_CLICK is the
  // shorthand for clicking a selector's first match.
  const evalExpr =
    process.env.SHOT_EVAL ??
    (process.env.SHOT_CLICK
      ? `document.querySelector(${JSON.stringify(process.env.SHOT_CLICK)})?.click()`
      : "");
  if (evalExpr) {
    await s("Runtime.evaluate", { expression: evalExpr });
    await sleep(500);
  }

  // SHOT_CLIP="x,y,w,h" captures just that page-coordinate region (e.g. a
  // navbar close-up); otherwise capture the full scrollable page.
  const clip = process.env.SHOT_CLIP
    ? (() => {
        const [x, y, width, height] =
          process.env.SHOT_CLIP.split(",").map(Number);
        return { x, y, width, height, scale: 1 };
      })()
    : undefined;
  const { data } = await s<{ data: string }>("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: !clip,
    ...(clip ? { clip } : {}),
  });
  await writeFile(outPath, Buffer.from(data, "base64"));
  await cdp.send("Target.closeTarget", { targetId });
  console.log(`  ${outPath}`);
}

async function main() {
  const [baseUrl, outDir, label, ...routes] = process.argv.slice(2);
  if (!baseUrl || !outDir || !label || routes.length === 0) {
    console.error(
      "Usage: bun scripts/shot.ts <baseUrl> <outDir> <label> <route> [route...]",
    );
    process.exit(1);
  }

  await mkdir(outDir, { recursive: true });

  const port = 9300 + Math.floor(Math.random() * 400);
  const userDataDir = `/tmp/shot-chrome-${port}`;
  const proc = spawn(
    CHROME,
    [
      "--headless=new",
      `--remote-debugging-port=${port}`,
      `--user-data-dir=${userDataDir}`,
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-gpu",
      "--hide-scrollbars",
      "--force-color-profile=srgb",
      "about:blank",
    ],
    { stdio: "ignore" },
  );

  try {
    let wsUrl = "";
    for (let i = 0; i < 80; i++) {
      try {
        const res = await fetch(`http://127.0.0.1:${port}/json/version`);
        wsUrl = ((await res.json()) as { webSocketDebuggerUrl: string })
          .webSocketDebuggerUrl;
        if (wsUrl) break;
      } catch {
        /* not up yet */
      }
      await sleep(100);
    }
    if (!wsUrl) throw new Error("Chrome DevTools endpoint never came up");

    const ws = new WebSocket(wsUrl);
    await new Promise<void>((resolve, reject) => {
      ws.onopen = () => resolve();
      ws.onerror = () => reject(new Error("WebSocket connection failed"));
    });
    const cdp = new CDP(ws);

    for (const route of routes) {
      console.log(`${route}`);
      for (const vp of VIEWPORTS) {
        const out = `${outDir}/${label}-${slug(route)}-${vp.name}.png`;
        await shoot(cdp, baseUrl, route, vp, out);
      }
    }
    ws.close();
  } finally {
    proc.kill();
    await sleep(200);
  }
}

main();
