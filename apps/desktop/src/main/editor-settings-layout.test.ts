import { describe, expect, test } from "vitest";

import { appSource, mainSource, preferencesSource, preloadSource, rendererMainSource, rendererTypesSource, styles } from "./layout-test-sources";

const activeAppSource = appSource.replace(/\/\*[\s\S]*?\*\//gu, "").replace(/^\s*\/\/.*$/gmu, "");

describe("editor layout settings and editor surface", () => {
  test("collects the visual tuning controls inside the settings modal", () => {
    expect(appSource).toContain("tickpad:editor-font-size");
    expect(appSource).toContain("tickpad:editor-code-font-size");
    expect(appSource).toContain("tickpad:editor-text-font");
    expect(appSource).toContain("tickpad:editor-code-font");
    expect(appSource).toContain("tickpad:shell-font");
    expect(appSource).toContain("tickpad:selection-toolbar-size");
    expect(appSource).toContain("defaultEditorFontSize = 16");
    expect(appSource).toContain("defaultCodeFontSize = 14");
    expect(appSource).toContain('defaultTextFontPreset = "system"');
    expect(appSource).toContain('defaultCodeFontPreset = "mono"');
    expect(appSource).toContain('defaultShellFontPreset = "system"');
    expect(appSource).toContain("textFontPresets");
    expect(appSource).toContain("codeFontPresets");
    expect(appSource).toContain("shellFontPresets");
    expect(appSource).toContain("defaultSelectionToolbarSize = 26");
    expect(appSource).toContain("setEditorFontSize");
    expect(appSource).toContain("setEditorCodeFontSize");
    expect(appSource).toContain("setTextFontPreset");
    expect(appSource).toContain("setCodeFontPreset");
    expect(appSource).toContain("setShellFontPreset");
    expect(appSource).toContain("setSelectionToolbarSize");
    expect(appSource).toContain("Writing");
    expect(appSource).toContain("Text size");
    expect(appSource).toContain("Code size");
    expect(appSource).toContain("Text font");
    expect(appSource).toContain("Code font");
    expect(appSource).toContain("Shell font");
    expect(appSource).toContain('className="settings-select"');
    expect(appSource).toContain("<select");
    expect(appSource).toContain("<option");
    expect(appSource).toContain("PingFang SC");
    expect(appSource).toContain("Helvetica Neue");
    expect(appSource).toContain("Menlo");
    expect(appSource).toContain("Menu size");
    expect(appSource).toContain('"--editor-font-size"');
    expect(appSource).toContain('"--editor-code-font-size"');
    expect(appSource).toContain('"--editor-text-font-family"');
    expect(appSource).toContain('"--editor-code-font-family"');
    expect(appSource).toContain('"--shell-font-family"');
    expect(appSource).toContain('"--selection-toolbar-button-size"');
    expect(styles).toContain("font-family: var(--shell-font-family);");
    expect(styles).toContain("font-family: var(--editor-text-font-family);");
    expect(styles).toContain("font-family: var(--editor-code-font-family);");
    expect(styles).toContain(".settings-header");
    expect(styles).toContain(".settings-select");
    expect(appSource).toContain('className="settings-modal"');
    expect(appSource).toContain("{t.closeSettings}");
    expect(styles).toContain("width: var(--selection-toolbar-button-size);");
    expect(styles).toContain("height: var(--selection-toolbar-button-size);");
    expect(styles).toContain("width: var(--selection-toolbar-icon-size);");
  });

  test("lays out settings with a sidebar and detail pane", () => {
    expect(appSource).toContain("settingsSections");
    expect(appSource).toContain("activeSettingsSection");
    expect(appSource).toContain("setActiveSettingsSection");
    expect(appSource).toContain('className="settings-sidebar"');
    expect(appSource).toContain('className="settings-sidebar-item"');
    expect(appSource).toContain('className="settings-content"');
    expect(appSource).toContain('className="settings-page"');
    expect(appSource).toContain('className="settings-list-row"');
    expect(styles).toContain("grid-template-columns: 220px minmax(0, 1fr);");
    expect(styles).toContain(".settings-sidebar");
    expect(styles).toContain(".settings-sidebar-item");
    expect(styles).toContain(".settings-content");
    expect(styles).toContain(".settings-list-row");
    expect(styles).toContain("min-height: 54px;");
    expect(styles).toContain("padding: 7px 0;");
    expect(styles).not.toContain("min-height: 72px;");
    expect(styles).not.toContain("padding: 12px 0;");
  });

  test("keeps the general language setting compact and non-duplicated", () => {
    expect(appSource).toContain('className="settings-row setting-label-only"');
    expect(appSource).not.toContain("<strong>{t[currentLanguageOption.labelKey]}</strong>");
    expect(styles).toContain("grid-template-columns: minmax(180px, 1fr) minmax(180px, 260px);");
    expect(styles).toContain(".settings-row.setting-label-only");
    expect(styles).toContain("min-height: 28px;");
    expect(styles).not.toContain("min-height: 34px;");
  });

  test("adds auto update checks to settings and prompts when a cloud version is newer", () => {
    expect(appSource).toContain("useAppUpdates");
    expect(appSource).toContain("tickpad:auto-update");
    expect(appSource).toContain("{t.updates}");
    expect(appSource).toContain("{t.autoUpdate}");
    expect(appSource).toContain("onAutoUpdateEnabledChange");
    expect(appSource).toContain("onCheckForUpdates");
    expect(appSource).toContain("updatePrompt");
    expect(appSource).toContain("t.updateAvailableTitle");
    expect(appSource).toContain("t.updateAvailableConfirm");
    expect(mainSource).toContain('ipcMain.handle("app:checkForUpdates"');
    expect(mainSource).toContain("TICKPAD_UPDATE_MANIFEST_URL");
    expect(mainSource).toContain("app.getVersion()");
    expect(preloadSource).toContain("checkForUpdates");
    expect(preloadSource).toContain('ipcRenderer.invoke("app:checkForUpdates"');
    expect(rendererTypesSource).toContain("checkForUpdates(): Promise<UpdateCheckResult>;");
  });

  test("keeps blockquote text comfortably spaced from the quote rail", () => {
    expect(styles).toContain(".milkdown-host .ProseMirror blockquote");
    expect(styles).toContain("padding-left: 12px;");
    expect(styles).toContain("padding-inline-start: 12px;");
    expect(styles).toContain("margin-inline-start: 0;");
    expect(styles).toContain("margin-inline-end: 0;");
    expect(styles).toContain("margin: 8px 0;");
    expect(styles).toContain(".milkdown-host .ProseMirror blockquote p");
    expect(styles).toContain("margin: 0;");
  });

  test("makes the selection toolbar compact and configurable", () => {
    expect(appSource).toContain("tickpad:selection-toolbar-tools");
    expect(appSource).toContain("defaultSelectionToolbarTools");
    expect(appSource).toContain("toggleSelectionToolbarTool");
    expect(appSource).toContain("buildToolbar");
    expect(appSource).toContain('builder.getGroup("formatting")');
    expect(appSource).toContain('builder.getGroup("function")');
    expect(appSource).toContain('addItem("copy"');
    expect(appSource).toContain("copySelectionIcon");
    expect(styles).toContain(".milkdown-host .milkdown .milkdown-toolbar");
    expect(styles).toContain("border-radius: 6px;");
    expect(styles).toContain("--selection-toolbar-button-size: 26px;");
    expect(styles).toContain("width: var(--selection-toolbar-button-size);");
    expect(styles).toContain(".settings-check");
  });

  test("prevents the selection toolbar from becoming an empty floating shell", () => {
    expect(appSource).toContain("const tools = defaultSelectionToolbarTools.filter");
    expect(appSource).toContain("return tools.length ? tools : [...defaultSelectionToolbarTools];");
    expect(appSource).toContain("current.length === 1");
    expect(appSource).toContain("current.length === 1 ? current");
    expect(appSource).toContain("disabled={selectionToolbarTools.length === 1 && selectionToolbarTools.includes(tool.id)}");
  });

  test("prevents the block handle from animating between selected blocks", () => {
    expect(styles).toContain(".milkdown-host .milkdown .milkdown-block-handle");
    expect(styles).toContain("transition: opacity 120ms ease;");
    expect(styles).toContain("will-change: opacity;");
    expect(styles).not.toContain("transition: all 0.2s;");
  });

  test("refreshes the editor when a split markdown link is normalized", () => {
    expect(appSource).toContain("normalizeSplitMarkdownLinks");
    expect(appSource).toContain("normalizeEscapedMarkdown");
    expect(appSource).toContain("editorRevision");
    expect(appSource).toContain("normalizedMarkdown !== markdown");
    expect(appSource).toContain("setEditorRevision");
    expect(appSource).toContain('key={`${doc.id}:${editorRevision}:${selectionToolbarTools.join("|")}`}');
  });

  test("opens links from editable tables through a safe external URL bridge", () => {
    expect(mainSource).toContain('ipcMain.handle("shell:openExternal"');
    expect(mainSource).toContain("new URL(url)");
    expect(mainSource).toContain('protocol === "http:" || protocol === "https:"');
    expect(mainSource).toContain("shell.openExternal");
    expect(preloadSource).toContain("openExternal");
    expect(preloadSource).toContain('ipcRenderer.invoke("shell:openExternal"');
    expect(rendererTypesSource).toContain("openExternal(url: string): Promise<void>;");
    expect(appSource).toContain("handleEditorClick");
    expect(appSource).toContain('closest("a[href]")');
    expect(appSource).toContain("window.tickpad?.openExternal");
    expect(appSource).toContain('onClick={handleEditorClick}');
  });

  test("keeps code block cursor line visually separate from real text selection", () => {
    expect(styles).toContain(".milkdown-host .milkdown-code-block .cm-activeLine {");
    expect(styles).toContain("background: transparent !important;");
    expect(styles).toContain(".milkdown-host .milkdown-code-block .cm-activeLineGutter {");
    expect(styles).toContain("color: var(--code-muted) !important;");
    expect(styles).toContain(".milkdown-host .milkdown-code-block .cm-selectionBackground");
    expect(styles).toContain("background: color-mix(in srgb, var(--accent-2) 26%, transparent) !important;");
  });

  test("themes the Milkdown writing surface in dark mode", () => {
    expect(styles).toContain(':root[data-theme="dark"] .milkdown-host .milkdown');
    expect(styles).toContain("background: var(--surface) !important;");
    expect(styles).toContain("color: var(--text) !important;");
    expect(styles).toContain("--crepe-color-background: var(--surface);");
    expect(styles).toContain("--crepe-color-on-background: var(--text);");
    expect(styles).toContain("--crepe-color-surface: var(--surface-2);");
    expect(styles).toContain("--crepe-color-outline: #686b73;");
    expect(styles).toContain(".milkdown-host .ProseMirror");
  });

  test("keeps the dark theme neutral black instead of green-tinted", () => {
    expect(styles).toContain("--bg: #08090a;");
    expect(styles).toContain("--surface: #151517;");
    expect(styles).toContain("--surface-2: #202024;");
    expect(styles).toContain("--text: #fbfbfc;");
    expect(styles).toContain("--muted: #c0c2ca;");
    expect(styles).toContain("--line: #3a3d44;");
    expect(styles).toContain("--accent: #8ab4f8;");
    expect(styles).toContain("--code-bg: #17191d;");
    expect(styles).toContain("--code-text: #f0f3f8;");
    expect(styles).toContain(':root[data-theme="dark"] .app-shell');
    expect(styles).toContain("background: var(--bg);");
    expect(styles).toContain(':root[data-theme="dark"] .topbar');
    expect(styles).toContain("background: color-mix(in srgb, var(--surface) 94%, transparent);");
    expect(styles).toContain(':root[data-theme="dark"] .file-rail');
    expect(styles).toContain("background: #101114;");
    expect(styles).toContain("box-shadow: none;");
    expect(styles).not.toContain("border-right-color: var(--line);");
    expect(styles).not.toContain("--bg: #181b18;");
    expect(styles).not.toContain("--surface: #222720;");
    expect(styles).not.toContain("--surface-2: #2b3128;");
    expect(styles).not.toContain("--line: #3a4436;");
    expect(styles).not.toContain("--accent: #81c7a7;");
  });

  test("lets users choose from classic built-in themes", () => {
    expect(appSource).toContain("themePresets");
    expect(appSource).toContain("themeMenuOpen");
    expect(appSource).toContain("currentThemePreset");
    expect(appSource).toContain("onSetTheme(preset.id)");
    expect(appSource).toContain('className="theme-picker"');
    expect(appSource).toContain('className="theme-menu"');
    expect(appSource).toContain("Default Light");
    expect(appSource).toContain("Default Dark");
    expect(appSource).toContain("Codex");
    expect(appSource).toContain("VS Code");
    expect(appSource).toContain("IDEA");
    expect(preferencesSource).not.toContain("Notion");
    expect(preferencesSource).not.toContain("Vercel");
    expect(preferencesSource).not.toContain("Solarized");
    expect(preferencesSource).not.toContain("Rose Pine");
    expect(preferencesSource).not.toContain("Raycast");
    expect(preferencesSource).not.toContain("VS Code Plus");
    expect(preferencesSource).not.toContain("Xcode");
    expect(styles).toContain(".theme-picker");
    expect(styles).toContain(".theme-menu");
    expect(styles).toContain(':root[data-theme="light"]');
    expect(styles).toContain(':root[data-theme="dark"]');
    expect(styles).toContain(':root[data-theme="codex"]');
    expect(styles).toContain(':root[data-theme="vscode"]');
    expect(styles).toContain(':root[data-theme="idea"]');
  });

  test("shows a floating document outline inside the editor pane", () => {
    expect(appSource).toContain("buildDocumentOutline");
    expect(appSource).toContain("editorOutlineItems");
    expect(appSource).toContain('className="editor-outline"');
    expect(appSource).toContain('docFormat === "plain" ? "editor-scroll plain" : "editor-scroll"');
    expect(appSource).toContain("{t.documentOutline}");
    expect(appSource).toContain('documentOutline: "Headings"');
    expect(appSource).toContain('documentOutline: "大纲"');
    expect(appSource).toContain('collapseOutline: "Collapse outline"');
    expect(appSource).toContain('expandOutline: "Expand outline"');
    expect(appSource).toContain('collapseOutline: "收起大纲"');
    expect(appSource).toContain('expandOutline: "展开大纲"');
    expect(appSource).toContain('className="editor-outline-level"');
    expect(appSource).toContain("{item.level}");
    expect(appSource).toContain("getOutlineTextStyle(item.level)");
    expect(appSource).toContain('"--outline-heading-size"');
    expect(appSource).not.toContain('"--outline-heading-weight"');
    expect(appSource).not.toContain("`H${item.level}`");
    expect(appSource).not.toContain('documentOutline: "结构"');
    expect(appSource).not.toContain('hideOutline: "隐藏大纲"');
    expect(appSource).not.toContain('showOutline: "显示大纲"');
    expect(appSource).not.toContain("<X size={14}");
    expect(appSource).not.toContain('type: "paragraph"');
    expect(appSource).not.toContain(': "P"');
    expect(appSource).not.toContain("No headings or paragraphs");
    expect(appSource).not.toContain("暂无标题或段落");
    expect(styles).toContain(".editor-pane {");
    expect(styles).toContain("position: relative;");
    expect(styles).toContain("overflow: hidden;");
    expect(styles).toContain(".editor-scroll");
    expect(styles).toContain("overflow: auto;");
    expect(styles).toContain(".editor-outline");
    expect(styles).toContain("position: absolute;");
    expect(styles).toContain("top: 16px;");
    expect(styles).toContain("right: 16px;");
    expect(styles).toContain("width: min(320px, 30vw);");
    expect(styles).toContain("min-width: 240px;");
    expect(styles).toContain("padding: 14px;");
    expect(styles).toContain("grid-template-columns: 18px minmax(0, 1fr);");
    expect(styles).toContain("min-height: 28px;");
    expect(styles).toContain("font-size: 13px;");
    expect(styles).toContain("box-shadow: 0 18px 44px rgba(15, 23, 42, 0.08);");
    expect(styles).toContain(".editor-outline-item.heading");
    expect(styles).toContain("background: transparent;");
    expect(styles).toContain(".editor-outline-item:hover");
    expect(styles).toContain(".editor-outline-level");
    expect(styles).toContain("width: 18px;");
    expect(styles).toContain("height: 18px;");
    expect(styles).toContain("font-size: var(--outline-heading-size);");
    expect(styles).toContain("font-weight: 400;");
    const outlineStylesStart = styles.indexOf(".editor-outline {");
    const outlineStylesEnd = styles.indexOf(".milkdown-host", outlineStylesStart);
    const outlineStyles = styles.slice(outlineStylesStart, outlineStylesEnd);
    expect(outlineStyles).not.toContain("border-left:");
    expect(styles).not.toContain("font-weight: var(--outline-heading-weight);");
    expect(styles).toContain(':root[data-theme="dark"] .editor-outline');
  });

  test("hides the floating document outline when the document has no headings", () => {
    expect(appSource).toContain("const hasOutlineItems = editorOutlineItems.length > 0;");
    expect(appSource).toContain('docFormat === "markdown" && hasOutlineItems && (');
    expect(appSource).not.toContain('className="editor-outline-empty"');
    expect(appSource).not.toContain("outlineEmpty");
    expect(appSource).not.toContain('outlineEmpty: "No headings"');
    expect(appSource).not.toContain('outlineEmpty: "暂无标题"');
  });

  test("lets users collapse and reopen the floating document outline", () => {
    expect(appSource).toContain("outlineOpen");
    expect(appSource).toContain("setOutlineOpen");
    expect(appSource).toContain("outlineOpen ? (");
    expect(appSource).toContain("onOutlineOpenChange(false)");
    expect(appSource).toContain("onOutlineOpenChange(true)");
    expect(appSource).toContain('title={t.collapseOutline}');
    expect(appSource).toContain('title={t.expandOutline}');
    expect(appSource).toContain('className="editor-outline-collapse"');
    expect(appSource).toContain('className="editor-outline-collapsed"');
    expect(appSource).toContain("<ChevronRight size={14}");
    expect(styles).toContain(".editor-outline-collapse");
    expect(styles).toContain(".editor-outline-collapsed");
  });

  test("lets users jump from the outline to a document heading", () => {
    expect(appSource).toContain("const scrollToOutlineItem");
    expect(appSource).toContain('querySelectorAll("h1, h2, h3, h4, h5, h6")');
    expect(appSource).toContain('scrollIntoView({ behavior: "smooth", block: "center" })');
    expect(appSource).toContain('type="button"');
    expect(appSource).toContain("onClick={() => onScrollToOutlineItem(item)}");
    expect(appSource).toContain("aria-label={`${t.documentOutline}: ${item.targetText}`}");
  });

  test("keeps the WeChat exporter source but disables its launch UI", () => {
    expect(appSource).toContain("writeClipboardHtml");
    expect(appSource).toContain('"text/html"');
    expect(appSource).toContain('item.id === "wechat-export.copyHtml"');
    expect(appSource).toContain("Copy WeChat Official Account Style");
    expect(appSource).toContain("复制公众号样式");
    expect(activeAppSource).not.toContain("{t.copyWechatHtml}");
  });
});
