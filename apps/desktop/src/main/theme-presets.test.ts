import { describe, expect, test } from "vitest";

import { themePresets } from "../renderer/preferences";
import { foundationStyles, styles } from "./layout-test-sources";

const expectedThemes = [
  { id: "light", labelKey: "defaultLightTheme", tone: "light" },
  { id: "dark", labelKey: "defaultDarkTheme", tone: "dark" },
  { id: "codex", labelKey: "codexTheme", tone: "codex" },
  { id: "vscode", labelKey: "vscodeTheme", tone: "vscode" },
  { id: "idea", labelKey: "ideaTheme", tone: "idea" }
] as const;

const retiredThemeIds = ["notion", "vercel", "solarized", "rose-pine", "raycast", "vscode-plus", "xcode"];
const themeTokens = [
  "--bg:",
  "--surface:",
  "--surface-2:",
  "--text:",
  "--muted:",
  "--line:",
  "--accent:",
  "--accent-2:",
  "--warn:",
  "--code-bg:",
  "--code-text:",
  "--code-muted:",
  "--code-control-bg:",
  "--code-active-bg:",
  "--code-active-gutter-bg:"
] as const;

const getThemeBlock = (themeId: string) => {
  const selectorStart = foundationStyles.indexOf(`data-theme="${themeId}"`);
  expect(selectorStart).toBeGreaterThanOrEqual(0);
  const blockEnd = foundationStyles.indexOf("\n}", selectorStart);
  expect(blockEnd).toBeGreaterThan(selectorStart);
  return foundationStyles.slice(selectorStart, blockEnd);
};

describe("theme presets", () => {
  test("keeps the public theme set intentionally small", () => {
    expect(themePresets).toEqual(expectedThemes);
    expect(themePresets).toHaveLength(5);
    expect(new Set(themePresets.map((theme) => theme.id)).size).toBe(themePresets.length);
  });

  test("removes retired experimental themes from presets and CSS", () => {
    const themeIds = themePresets.map((theme) => theme.id);
    for (const themeId of retiredThemeIds) {
      expect(themeIds).not.toContain(themeId);
      expect(styles).not.toContain(`data-theme="${themeId}"`);
    }
  });

  test("defines full editor color tokens for every built-in theme", () => {
    for (const theme of themePresets) {
      const themeBlock = getThemeBlock(theme.id);
      for (const token of themeTokens) {
        expect(themeBlock).toContain(token);
      }
    }
  });

  test("uses a softer neutral foreground for the default light theme", () => {
    const lightTheme = getThemeBlock("light");
    expect(lightTheme).toContain("--text: #2b2b2b;");
    expect(lightTheme).not.toContain("--text: #111111;");
  });

  test("keeps default light editor copy slightly stronger than sidebar text", () => {
    expect(foundationStyles).toContain(
      ':root[data-theme="light"] :is(.milkdown-host .ProseMirror, .plain-text-editor) {'
    );
    expect(foundationStyles).toMatch(
      /:root\[data-theme="light"\] :is\(\.milkdown-host \.ProseMirror, \.plain-text-editor\) \{[\s\S]*color: #484848 !important;/
    );
  });

  test("uses true dark treatment only for black and VS Code themes", () => {
    const darkThemeIds = themePresets.filter((theme) => theme.tone === "dark" || theme.tone === "vscode").map((theme) => theme.id);
    expect(darkThemeIds).toEqual(["dark", "vscode"]);
    for (const themeId of darkThemeIds) {
      expect(getThemeBlock(themeId)).toContain("color-scheme: dark;");
    }
    expect(styles).toContain(':root[data-theme="vscode"] .milkdown-host .milkdown');
    expect(styles).toContain(':root[data-theme="vscode"] .editor-outline');
  });

  test("gives each theme a menu swatch class", () => {
    for (const theme of themePresets) {
      expect(styles).toContain(`.theme-swatch.${theme.tone}`);
    }
  });
});
