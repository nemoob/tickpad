import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

import { appSource, styles } from "./layout-test-sources";

const desktopRoot = resolve(__dirname, "../..");
const desktopPackage = JSON.parse(readFileSync(resolve(desktopRoot, "package.json"), "utf8")) as {
  dependencies?: Record<string, string>;
};

describe("mermaid support", () => {
  test("ships an editor-side Mermaid renderer", () => {
    expect(desktopPackage.dependencies).toHaveProperty("mermaid");
    expect(existsSync(resolve(__dirname, "../renderer/mermaid-support.ts"))).toBe(true);
    expect(appSource).toContain("renderMermaidCodeBlocks");
  });

  test("includes a Mermaid sample and diagram styles", () => {
    expect(appSource).toContain("```mermaid");
    expect(styles).toContain(".mermaid-preview");
  });

  test("shows Mermaid diagrams as preview-first blocks", () => {
    expect(appSource).toContain("mermaid-code-block");
    expect(appSource).toContain("mermaid-source-visible");
    expect(appSource).toContain('preview.addEventListener("click"');
    expect(appSource).toContain('block.addEventListener("focusin"');
    expect(styles).toContain(".mermaid-code-block:not(.mermaid-source-visible) .cm-editor");
    expect(styles).toContain(".mermaid-code-block:not(.mermaid-source-visible) .language-button");
    expect(styles).toContain(".mermaid-code-block.mermaid-source-visible .mermaid-preview");
  });

  test("keeps preview-only Mermaid blocks spaced below preceding content", () => {
    expect(styles).toMatch(
      /\.milkdown-host \.mermaid-code-block:not\(\.mermaid-source-visible\) \{\s*margin-top: 16px;\s*padding: 0 !important;\s*background: transparent !important;/
    );
    expect(styles).toMatch(
      /\.milkdown-host \.mermaid-code-block:not\(\.mermaid-source-visible\) \.mermaid-preview \{\s*margin: 0;\s*padding: 24px 18px;/
    );
  });

  test("keeps Mermaid available in the code block language picker", () => {
    expect(appSource).toContain("LanguageDescription.of");
    expect(appSource).toContain('name: "Mermaid"');
    expect(appSource).toContain('alias: ["mermaid", "mmd"]');
    expect(appSource).toContain("[CrepeFeature.CodeMirror]");
  });
});
