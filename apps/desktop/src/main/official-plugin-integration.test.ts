import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const appRoot = join(process.cwd(), "apps/desktop/src");
const read = (path: string) => readFileSync(join(appRoot, path), "utf8");
const stripDisabledCode = (source: string) =>
  source.replace(/\/\*[\s\S]*?\*\//gu, "").replace(/^\s*\/\/.*$/gmu, "");

describe("first-release official plugins", () => {
  it("keeps the AI bridge source available but commented out", () => {
    const main = read("main/index.ts");
    const preload = read("preload/index.ts");
    const activeMain = stripDisabledCode(main);
    const activePreload = stripDisabledCode(preload);

    expect(main).toContain("safeStorage");
    expect(main).toContain('ipcMain.handle("ai:setSecret"');
    expect(main).toContain('ipcMain.handle("ai:complete"');
    expect(preload).toContain('ipcRenderer.invoke("ai:setSecret"');
    expect(preload).toContain('ipcRenderer.invoke("ai:complete"');
    expect(activeMain).not.toContain('ipcMain.handle("ai:');
    expect(activePreload).not.toContain('ipcRenderer.invoke("ai:');
  });

  it("exports structured projects through one narrow main-process capability", () => {
    const main = read("main/index.ts");
    const preload = read("preload/index.ts");

    expect(main).toContain('ipcMain.handle("dialog:exportProject"');
    expect(preload).toContain('ipcRenderer.invoke("dialog:exportProject"');
    expect(preload).toContain("ProjectExportResult");
  });

  it("keeps AI and WeChat sources while registering only launch plugins", () => {
    const app = read("renderer/App.tsx");
    const registry = read("renderer/plugin-registry.ts");
    const activeRegistry = stripDisabledCode(registry);
    const editorPane = read("renderer/EditorPane.tsx");
    const writerBar = read("renderer/AiWriterBar.tsx");
    const settings = read("renderer/PluginSettingsPage.tsx");

    expect(registry).toContain("@tickpad/plugin-ai-writer");
    expect(registry).toContain("@tickpad/plugin-wechat-export");
    expect(registry).toContain("@tickpad/plugin-vercel-templates");
    expect(activeRegistry).not.toContain("createAiWriterPlugin(aiRuntime)");
    expect(activeRegistry).not.toContain("wechatExportPlugin");
    expect(activeRegistry).toContain("vercelTemplatesPlugin");
    expect(editorPane).toContain("AiWriterBar");
    expect(writerBar).toContain("getAiMentionQuery");
    expect(writerBar).toContain("profiles.length === 0 && mentionQuery !== null");
    expect(writerBar).not.toContain("profiles.length > 0 ? (");
    expect(settings).toContain("AiProfileSettings");
    expect(settings).toContain("projectExporters");
    expect(app).toContain("workspace.updateDocumentMarkdown(markdown, true)");
  });

  it("keeps each official plugin configuration inside its plugin card", () => {
    const settings = read("renderer/PluginSettingsPage.tsx");
    const styles = read("renderer/styles/plugins.css");

    expect(settings).toContain('className="plugin-settings-configuration"');
    expect(settings).toContain('installed && plugin.manifest.id === "ai-writer"');
    expect(settings).toContain('installed && plugin.manifest.id === "vercel-templates"');
    expect(settings).not.toContain('installedPluginIdSet.has("ai-writer") &&');
    expect(settings).not.toContain('installedPluginIdSet.has("vercel-templates") &&');
    expect(styles).toMatch(/\.project-export-action\s*\{[\s\S]*font-size: 12px;/);
    expect(styles).toMatch(/\.project-export-action\s*\{[\s\S]*font-weight: 400;/);
  });
});
