import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const appRoot = join(process.cwd(), "apps/desktop");

function collectFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const fullPath = join(dir, entry);
    return statSync(fullPath).isDirectory() ? collectFiles(fullPath) : [fullPath];
  });
}

describe("desktop security boundary", () => {
  it("keeps Electron capabilities out of the renderer", () => {
    const rendererFiles = collectFiles(join(appRoot, "src/renderer")).filter((file) => /\.(ts|tsx)$/.test(file));
    const forbidden = rendererFiles.flatMap((file) => {
      const source = readFileSync(file, "utf8");
      return [/from ["']electron["']/, /from ["']node:/, /from ["']fs["']/, /from ["']path["']/]
        .filter((pattern) => pattern.test(source))
        .map((pattern) => `${file}: ${pattern}`);
    });

    expect(forbidden).toEqual([]);
  });

  it("uses explicit hardened BrowserWindow preferences", () => {
    const source = readFileSync(join(appRoot, "src/main/index.ts"), "utf8");

    expect(source).toContain("contextIsolation: true");
    expect(source).toContain("nodeIntegration: false");
    expect(source).toContain("sandbox: true");
    expect(source).toContain("webSecurity: true");
  });

  it("packages the sandbox preload as CommonJS so the bridge runs", () => {
    const mainSource = readFileSync(join(appRoot, "src/main/index.ts"), "utf8");
    const viteConfig = readFileSync(join(appRoot, "electron.vite.config.ts"), "utf8");

    expect(mainSource).toContain('../preload/index.cjs');
    expect(viteConfig).toContain('format: "cjs"');
    expect(viteConfig).toContain('entryFileNames: "index.cjs"');
  });
});
