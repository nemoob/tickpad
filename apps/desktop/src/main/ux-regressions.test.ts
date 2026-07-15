import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

const rendererSrc = resolve(__dirname, "../renderer");
const mainSrc = resolve(__dirname, ".");
const preloadSrc = resolve(__dirname, "../preload");
const readRendererFile = (file: string) => readFileSync(resolve(rendererSrc, file), "utf8");

describe("desktop UX regressions", () => {
  test("restores one tab and keeps the active tab visible in a dense tab strip", () => {
    const workspaceSource = readRendererFile("useDocumentWorkspace.ts");
    const topbarSource = readRendererFile("Topbar.tsx");
    const styles = readRendererFile("styles/topbar.css");

    expect(workspaceSource).toContain("getInitialOpenDocumentIds(documents)");
    expect(workspaceSource).not.toContain("useState(() => documents.map((document) => document.id))");
    expect(topbarSource).toContain('scrollIntoView({ block: "nearest", inline: "nearest" })');
    expect(styles).toMatch(/\.document-tab\s*\{[\s\S]*min-width: 128px;/);
  });

  test("lets keyboard users activate a focused document tab without hijacking its child buttons", () => {
    const topbarSource = readRendererFile("Topbar.tsx");

    expect(topbarSource).toContain('event.key === "Enter" || event.key === " "');
    expect(topbarSource).toContain("event.target !== event.currentTarget");
    expect(topbarSource).toContain("onSelectDocument(document)");
  });

  test("uses empty tab-strip space as a window drag region without dragging actual tabs", () => {
    const styles = readRendererFile("styles/topbar.css");
    const tabsBlock = styles.slice(styles.indexOf(".document-tabs {"), styles.indexOf(".document-tabs::-webkit-scrollbar"));
    const tabBlock = styles.slice(styles.indexOf(".document-tab {"), styles.indexOf(".document-tab:hover"));
    const tabStripRules = tabsBlock.split("\n").map((line) => line.trim());
    const tabRules = tabBlock.split("\n").map((line) => line.trim());

    expect(tabStripRules).toContain("app-region: drag;");
    expect(tabStripRules).toContain("-webkit-app-region: drag;");
    expect(tabsBlock).not.toContain("border-left:");
    expect(tabRules).toContain("app-region: no-drag;");
    expect(tabRules).toContain("-webkit-app-region: no-drag;");
  });

  test("gives settings real modal keyboard behavior and section-specific subtitles", () => {
    const settingsSource = readRendererFile("SettingsModal.tsx");
    const preferencesSource = readRendererFile("preferences.ts");
    const translationsSource = readRendererFile("i18n.ts");

    expect(settingsSource).toContain("previouslyFocusedElementRef");
    expect(settingsSource).toContain('event.key === "Escape"');
    expect(settingsSource).toContain('event.key !== "Tab"');
    expect(settingsSource).toContain("modalRef.current?.focus()");
    expect(settingsSource).toContain("previouslyFocusedElementRef.current?.focus()");
    expect(settingsSource).toContain('aria-labelledby="settings-title"');
    expect(settingsSource).toContain('aria-describedby="settings-subtitle"');
    expect(settingsSource).toContain("activeSectionConfig.subtitleKey");
    expect(preferencesSource).toContain('subtitleKey: "pluginsSettingsSubtitle"');
    expect(translationsSource).toContain('pluginsSettingsSubtitle: "Install and manage plugins"');
    expect(translationsSource).toContain('pluginsSettingsSubtitle: "安装与管理插件"');
  });

  test("does not present unfinished plugin installation controls as working actions", () => {
    const settingsSource = `${readRendererFile("SettingsModal.tsx")}\n${readRendererFile("PluginSettingsPage.tsx")}`;
    const translationsSource = readRendererFile("i18n.ts");

    expect(settingsSource).toContain("pluginInstallComingSoon");
    expect(settingsSource).toMatch(/pluginStoreInstall}[\s\S]*disabled/);
    expect(settingsSource).toMatch(/installFromZip}[\s\S]*disabled/);
    expect(settingsSource).not.toContain('className="plugin-zip-input" type="file"');
    expect(translationsSource).toContain('pluginInstallComingSoon: "Marketplace and ZIP installation are coming soon."');
    expect(translationsSource).toContain('pluginInstallComingSoon: "插件商店和 ZIP 安装即将开放。"');
  });

  test("keeps outline and plain text scrolling inside a single usable surface", () => {
    const editorSource = readRendererFile("EditorPane.tsx");
    const styles = readRendererFile("styles/editor.css");

    expect(editorSource).toContain('docFormat === "plain" ? "editor-scroll plain" : "editor-scroll"');
    expect(styles).toMatch(/\.editor-outline-list\s*\{[\s\S]*overflow-y: auto;/);
    expect(styles).toMatch(/\.editor-scroll\.plain\s*\{[\s\S]*overflow: hidden;/);
    expect(styles).toMatch(/\.plain-text-editor\s*\{[\s\S]*min-height: 0;/);
    expect(styles).toMatch(/\.plain-text-editor\s*\{[\s\S]*overflow: auto;/);
  });

  test("keeps editor links readable across themes and long URLs", () => {
    const styles = readRendererFile("styles/content-link.css");
    const linkBlock = styles.slice(
      styles.indexOf(".milkdown-host .ProseMirror a {"),
      styles.indexOf(".milkdown-host .ProseMirror a:hover")
    );

    expect(linkBlock).toContain("color: var(--accent-2);");
    expect(linkBlock).toContain("text-decoration-thickness: 1px;");
    expect(linkBlock).toContain("text-underline-offset: 3px;");
    expect(linkBlock).toContain("overflow-wrap: anywhere;");
  });

  test("keeps explicit theme choices independent from system theme changes", () => {
    const appSource = readRendererFile("App.tsx");
    const mainSource = readFileSync(resolve(mainSrc, "index.ts"), "utf8");
    const preloadSource = readFileSync(resolve(preloadSrc, "index.ts"), "utf8");

    expect(appSource).not.toContain("onThemeChanged");
    expect(mainSource).not.toContain("nativeTheme");
    expect(mainSource).not.toContain("system:themeChanged");
    expect(preloadSource).not.toContain("onThemeChanged");
  });
});
