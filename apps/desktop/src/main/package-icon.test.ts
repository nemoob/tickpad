import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

const desktopRoot = resolve(__dirname, "../..");

describe("package icon", () => {
  test("uses the custom Tickpad app icon for macOS packaging", async () => {
    const packageJson = JSON.parse(await readFile(resolve(desktopRoot, "package.json"), "utf8")) as {
      build?: { mac?: { icon?: string } };
    };
    const iconPath = packageJson.build?.mac?.icon;

    expect(iconPath).toBe("build/icon.icns");
    expect(existsSync(resolve(desktopRoot, iconPath ?? ""))).toBe(true);
  });
});
