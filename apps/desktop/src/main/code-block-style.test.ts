import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

const desktopSrc = resolve(__dirname, "..");
const rendererSrc = resolve(desktopSrc, "renderer");
const readText = (path: string) => (existsSync(path) ? readFileSync(path, "utf8") : "");
const readRenderer = (file: string) => readText(resolve(rendererSrc, file));
const readStyles = (file: string) => readText(resolve(rendererSrc, file));

const settingsModal = readRenderer("SettingsModal.tsx");
const writingSettings = readRenderer("WritingSettings.tsx");
const codeBlockStyle = readRenderer("code-block-style.ts");
const rendererMain = readRenderer("main.tsx");
const stylesIndex = readRenderer("styles.css");
const codeBlockStyles = readStyles("styles/code-block.css");

describe("code block styles", () => {
  test("lets users choose a persisted code block style from writing settings", () => {
    expect(settingsModal).toContain("<WritingSettings");
    expect(writingSettings).toContain("codeBlockStylePresets");
    expect(writingSettings).toContain("getCodeBlockStyle()");
    expect(writingSettings).toContain("setCodeBlockStyle(nextStyle)");
    expect(writingSettings).toContain("{t.codeBlockStyle}");
    expect(writingSettings).toContain('className="code-block-style-list"');
    expect(writingSettings).toContain("aria-pressed={preset.id === codeBlockStyle}");
    expect(codeBlockStyle).toContain("tickpad:code-block-style");
    expect(codeBlockStyle).toContain("documentElement.dataset.codeBlockStyle");
    expect(rendererMain).toContain("applyCodeBlockStyle(getCodeBlockStyle())");
  });

  test("defines built-in code block styles through CSS variables", () => {
    expect(stylesIndex).toContain('@import "./styles/code-block.css";');
    expect(codeBlockStyle).toContain('id: "soft"');
    expect(codeBlockStyle).toContain('id: "editor"');
    expect(codeBlockStyle).toContain('id: "terminal"');
    expect(codeBlockStyles).toContain(':root[data-code-block-style="soft"]');
    expect(codeBlockStyles).toContain(':root[data-code-block-style="editor"]');
    expect(codeBlockStyles).toContain(':root[data-code-block-style="terminal"]');
    expect(codeBlockStyles).toContain("--code-block-bg");
    expect(codeBlockStyles).toContain("--code-block-text");
    expect(codeBlockStyles).toContain(".milkdown-host .milkdown-code-block");
  });
});
