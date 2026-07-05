/**
 * Renders the OpenGraph share card (scripts/og/og-card.html) to
 * public/assets/og-default.png at exactly 1200x630.
 *
 * Same dependency-free CDP approach as scripts/shot.ts: drives the system
 * Google Chrome headlessly over the DevTools Protocol with node/bun built-ins
 * only. The art board is a static local file (fonts + banner load via relative
 * paths), so the capture needs no dev server and no network.
 *
 * Usage:
 *   bun scripts/generate-og.ts
 *
 * The PNG is committed to the repo: the iGEM/CI build environment has no
 * Chrome, so the image is a checked-in asset (like favicon-heal.png), not a
 * build product. Re-run this script after editing og-card.html.
 */

import { spawn } from "node:child_process";
import { stat, writeFile } from "node:fs/promises";
import { Buffer } from "node:buffer";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const WIDTH = 1200;
const HEIGHT = 630;

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const cardPath = resolve(repoRoot, "scripts/og/og-card.html");
const outPath = resolve(repoRoot, "public/assets/og-default.png");

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

type Params = Record<string, unknown>;

class CDP {
  private ws: WebSocket;
  private id = 0;
  private pending = new Map<
    number,
    { resolve: (v: unknown) => void; reject: (e: Error) => void }
  >();

  constructor(ws: WebSocket) {
    this.ws = ws;
    ws.onmessage = (ev: MessageEvent) => {
      const msg = JSON.parse(ev.data as string) as {
        id?: number;
        result?: unknown;
        error?: unknown;
      };
      if (typeof msg.id === "number" && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id)!;
        this.pending.delete(msg.id);
        if (msg.error) reject(new Error(JSON.stringify(msg.error)));
        else resolve(msg.result);
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
}

async function main() {
  const port = 9300 + Math.floor(Math.random() * 400);
  const proc = spawn(
    CHROME,
    [
      "--headless=new",
      `--remote-debugging-port=${port}`,
      `--user-data-dir=/tmp/og-chrome-${port}`,
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-gpu",
      "--hide-scrollbars",
      "--force-color-profile=srgb",
      "--allow-file-access-from-files",
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
    await new Promise<void>((resolvePromise, reject) => {
      ws.onopen = () => resolvePromise();
      ws.onerror = () => reject(new Error("WebSocket connection failed"));
    });
    const cdp = new CDP(ws);

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
    await s("Emulation.setDeviceMetricsOverride", {
      width: WIDTH,
      height: HEIGHT,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await s("Page.navigate", { url: `file://${cardPath}` });
    await sleep(1500); // settle: webfonts + banner decode + paint

    const { data } = await s<{ data: string }>("Page.captureScreenshot", {
      format: "png",
      clip: { x: 0, y: 0, width: WIDTH, height: HEIGHT, scale: 1 },
    });
    await writeFile(outPath, Buffer.from(data, "base64"));
    await cdp.send("Target.closeTarget", { targetId });
    ws.close();

    const { size } = await stat(outPath);
    console.log(
      `${outPath} (${WIDTH}x${HEIGHT}, ${Math.round(size / 1024)}KB)`,
    );
  } finally {
    proc.kill();
    await sleep(200);
  }
}

main();
