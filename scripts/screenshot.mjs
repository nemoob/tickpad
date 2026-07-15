import { chromium } from "@playwright/test";
import { spawn } from "node:child_process";
import { mkdir, rm } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const port = 4187;
const outDir = join(root, "test-results", "screenshots");
await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });

const server = spawn("pnpm", ["--filter", "@tickpad/desktop", "dev:web", "--port", String(port)], {
  cwd: root,
  stdio: ["ignore", "pipe", "pipe"]
});

const url = `http://127.0.0.1:${port}`;

async function waitForServer() {
  const started = Date.now();
  while (Date.now() - started < 30000) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return;
      }
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  }
  throw new Error(`Timed out waiting for ${url}`);
}

try {
  await waitForServer();
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 920 }, deviceScaleFactor: 1 });
  await page.addInitScript(() => localStorage.setItem("tickpad:theme", "dark"));
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForSelector(".app-shell");
  await page.waitForFunction(() => document.documentElement.dataset.theme === "dark");
  await page.getByTitle("Mermaid.md").click();
  await page.waitForSelector(".mermaid-preview svg", { timeout: 10000 });
  await page.screenshot({ path: join(outDir, "tickpad-desktop.png"), fullPage: true });
  await page.locator(".editor-pane").screenshot({ path: join(outDir, "tickpad-editor.png") });
  await browser.close();
} finally {
  server.kill("SIGTERM");
}

console.log(`Screenshots written to ${outDir}`);
