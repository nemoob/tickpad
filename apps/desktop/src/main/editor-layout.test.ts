import { describe, expect, test } from "vitest";

import { appSource, mainSource, preloadSource, rendererMainSource, rendererTypesSource, styles } from "./layout-test-sources";

describe("editor layout", () => {
  test("lets app content cover the macOS titlebar area", () => {
    expect(mainSource).toContain('titleBarStyle: "hiddenInset"');
    expect(mainSource).toContain("trafficLightPosition");
  });

  test("switches between documents in the file rail", () => {
    expect(appSource).toContain("sampleDocuments");
    expect(appSource).toContain("selectDocument");
    expect(appSource).toContain("onClick={() => onSelectDocument(document)}");
  });

  test("shows open documents as tabs in the topbar", () => {
    expect(appSource).toContain('className="document-tabs"');
    expect(appSource).toContain('role="tablist"');
    expect(appSource).toContain('role="tab"');
    expect(appSource).toContain("aria-selected={document.id === activeDocument.id}");
    expect(appSource).toContain('className={document.id === activeDocument.id ? "document-tab active" : "document-tab"}');
    expect(appSource).not.toContain('className="document-tab-status"');
    expect(appSource).toContain("closeDocumentTab");
    expect(appSource).toContain('className="document-tab-close"');
    expect(appSource).toContain("title={t.closeDocumentTab}");
    expect(appSource).toContain("onClick={(event) => onCloseDocumentTab(event, document.id)}");
    expect(appSource).toContain("t.openDocuments");
    expect(appSource).toContain("Close tab");
    expect(styles).toContain(".document-tabs");
    expect(styles).toContain(".document-tab");
    expect(styles).toContain(".document-tab-close");
    expect(styles).toContain("overflow-x: auto;");
    expect(styles).toContain(".document-tab.active::after");
    expect(styles).toContain("border-radius: 0;");
    expect(styles).not.toContain(".document-tab-status");
  });

  test("keeps many open tabs from widening the editor workspace", () => {
    expect(styles).toMatch(/\.topbar\s*\{[\s\S]*grid-template-columns: minmax\(0, 1fr\) auto;/);
    expect(styles).toMatch(/\.topbar-left\s*\{[\s\S]*overflow: hidden;/);
    expect(styles).toMatch(/\.document-tabs\s*\{[\s\S]*max-width: 100%;/);
  });

  test("does not clip the theme menu below the topbar", () => {
    expect(styles).toMatch(/\.topbar\s*\{[\s\S]*overflow: visible;/);
    expect(styles).toMatch(/\.theme-menu\s*\{[\s\S]*position: absolute;/);
    expect(styles).toMatch(/\.theme-menu\s*\{[\s\S]*top: calc\(100% \+ 6px\);/);
    expect(styles).toMatch(/\.theme-menu\s*\{[\s\S]*z-index: 40;/);
  });

  test("adds a file menu button inside each document tab", () => {
    expect(appSource).toContain("MoreHorizontal");
    expect(appSource).toContain('className="document-tab-menu"');
    expect(appSource).toContain("title={t.fileMenu}");
    expect(appSource).toContain('aria-label={`${t.fileMenu}: ${tabName}`}');
    expect(appSource).toContain("onOpenDocumentContextMenu(event, document)");
    expect(appSource).toContain("onOpenDocumentContextMenu={workspace.openDocumentContextMenu}");
    expect(appSource).toContain('fileMenu: "File menu"');
    expect(appSource).toContain('fileMenu: "文件菜单"');
    expect(styles).toContain(".document-tab-menu");
    expect(styles).toContain(".document-tab-menu:hover");
  });

  test("renders file rail documents as a directory tree", () => {
    expect(appSource).toContain("treePath");
    expect(appSource).toContain("buildDocumentTree");
    expect(appSource).toContain('className="document-tree"');
    expect(styles).toContain(".folder-row");
  });

  test("keeps the file rail scrollable when many files are listed", () => {
    const shellStart = styles.lastIndexOf(".app-shell {");
    const railStart = styles.indexOf(".file-rail {", shellStart);
    const railBlock = styles.slice(railStart, styles.indexOf(".file-rail.collapsed", railStart));
    const treeBlock = styles.slice(styles.indexOf(".document-tree {"), styles.indexOf(".folder-branch"));

    expect(railBlock).toContain("min-height: 0;");
    expect(railBlock).toContain("overflow: hidden;");
    expect(treeBlock).toContain("min-height: 0;");
    expect(treeBlock).toContain("overflow-y: auto;");
    expect(treeBlock).toContain("overflow-x: hidden;");
    expect(treeBlock).toContain("-webkit-app-region: no-drag;");
  });

  test("lets users create local files and folders from the file rail", () => {
    expect(appSource).toContain("FilePlus");
    expect(appSource).toContain("FolderPlus");
    expect(appSource).toContain("createLocalFile");
    expect(appSource).toContain("createLocalFolder");
    expect(appSource).toContain("tickpad:folders");
    expect(appSource).toContain("getFolders");
    expect(appSource).toContain("getCurrentFolderPath");
    expect(appSource).toContain("createUniqueName");
    expect(appSource).toContain("setActiveDocumentId(nextDocument.id)");
    expect(appSource).toContain("setOpenFolders((current) => new Set([...current, ...getDocumentFolderIds(nextDocument)]))");
    expect(appSource).toContain("buildDocumentTree(sortDocumentsForRail(documents, pinnedDocumentIdSet), folders)");
    expect(appSource).toContain('className="rail-header"');
    expect(appSource).toContain('className="rail-header-actions"');
    expect(appSource).toContain("{t.files}");
    expect(appSource).toContain('title={t.newFile}');
    expect(appSource).toContain('title={t.newFolder}');
    expect(appSource).toContain("New File");
    expect(appSource).toContain("New Folder");
    expect(styles).toContain(".rail-header");
    expect(styles).toContain(".rail-header-actions");
    expect(styles).toContain(".rail-action-button");
    expect(styles).toContain("width: 24px;");
    expect(styles).toContain("height: 24px;");
  });

  test("lets users open a folder as a workspace", () => {
    expect(mainSource).toContain('ipcMain.handle("dialog:openWorkspace"');
    expect(mainSource).toContain('properties: ["openDirectory"]');
    expect(mainSource).toContain("dialogOptions.title");
    expect(mainSource).toContain("dialogOptions.buttonLabel");
    expect(mainSource).toContain("collectWorkspaceFiles");
    expect(mainSource).toContain("relativePath");
    expect(mainSource).toContain("rootPath");
    expect(preloadSource).toContain("openWorkspace");
    expect(preloadSource).toContain("openWorkspace: (options?: OpenWorkspaceOptions)");
    expect(rendererTypesSource).toContain("type OpenWorkspaceOptions");
    expect(rendererTypesSource).toContain("openWorkspace(options?: OpenWorkspaceOptions)");
    expect(appSource).toContain("FolderOpen");
    expect(appSource).toContain("onOpenWorkspace");
    expect(appSource).toContain("workspace.openWorkspace({");
    expect(appSource).toContain("title: t.chooseWorkspaceFolder");
    expect(appSource).toContain("buttonLabel: t.chooseFolder");
    expect(appSource).toContain("createWorkspaceDocuments");
    expect(appSource).toContain("getWorkspaceFoldersFromFiles");
    expect(appSource).toContain("if (!result) {");
    expect(appSource).not.toContain("!result?.files.length");
    expect(appSource).toContain("createEmptyWorkspaceDocument");
    expect(appSource).toContain("setOpenDocumentIds([openedDocuments[0].id])");
    expect(appSource).not.toContain("setOpenDocumentIds(openedDocuments.map((document) => document.id))");
    expect(appSource).toContain("setPinnedDocumentIds([])");
    expect(appSource).toContain("t.openWorkspace");
    expect(appSource).toContain("Open Folder");
    expect(appSource).toContain("选择文件夹");
    expect(appSource).toContain("Choose Workspace Folder");
    expect(appSource).toContain("选择工作区文件夹");
  });

  test("uses an in-app prompt before replacing unsaved workspace content", () => {
    expect(appSource).not.toContain("window.confirm");
    expect(appSource).toContain("confirmWorkspaceReplace");
    expect(appSource).toContain("workspaceReplacePrompt");
    expect(appSource).toContain('className="confirm-modal"');
    expect(appSource).toContain("replaceWorkspaceTitle");
    expect(appSource).toContain("replaceWorkspaceDescription");
    expect(appSource).toContain("replaceWorkspaceConfirm");
    expect(styles).toContain(".confirm-modal");
    expect(styles).toContain(".confirm-modal-actions");
  });

  test("lets users manage files from a right-click menu", () => {
    expect(appSource).toContain("DocumentContextMenuState");
    expect(appSource).toContain("documentContextMenu");
    expect(appSource).toContain("onContextMenu={(event) => onOpenDocumentContextMenu(event, document)}");
    expect(appSource).toContain("startRenamingDocument");
    expect(appSource).toContain("commitRenamingDocument");
    expect(appSource).toContain("deleteDocument");
    expect(appSource).toContain("togglePinnedDocument");
    expect(appSource).toContain("tickpad:pinned-documents");
    expect(appSource).toContain("sortDocumentsForRail(documents, pinnedDocumentIdSet)");
    expect(appSource).toContain('className="document-context-menu"');
    expect(appSource).toContain('className="document-rename-input"');
    expect(appSource).toContain('className="document-pin-indicator"');
    expect(appSource).toContain("Rename");
    expect(appSource).toContain("Delete");
    expect(appSource).toContain("Pin to top");
    expect(styles).toContain(".document-context-menu");
    expect(styles).toContain(".document-rename-input");
    expect(styles).toContain(".document-pin-indicator");
  });

  test("lets users search and manage folders from the file rail", () => {
    expect(appSource).toContain("searchQuery");
    expect(appSource).toContain("filterDocumentTree");
    expect(appSource).toContain('className="rail-search"');
    expect(appSource).toContain('placeholder={t.searchFiles}');
    expect(appSource).toContain('onContextMenu={(event) => onOpenFolderContextMenu(event, node)}');
    expect(appSource).toContain("folderContextMenu");
    expect(appSource).toContain("startRenamingFolder");
    expect(appSource).toContain("commitRenamingFolder");
    expect(appSource).toContain("deleteFolder");
    expect(appSource).toContain("renameFolderByPath");
    expect(appSource).toContain("deleteFolderByPath");
    expect(appSource).toContain('className="document-context-menu"');
    expect(appSource).toContain('className="document-rename-input"');
    expect(appSource).toContain("Search files");
    expect(appSource).toContain("Rename folder");
    expect(appSource).toContain("Delete folder");
    expect(styles).toContain(".rail-search");
    expect(styles).toContain(".rail-search-input");
  });

  test("keeps the file rail focused on documents instead of branding", () => {
    expect(appSource).not.toContain("productInfo");
    expect(appSource).not.toContain("brand-lockup");
    expect(appSource).not.toContain("brand-mark");
    expect(styles).not.toContain(".brand-lockup");
    expect(styles).not.toContain(".brand-mark");
  });

  test("does not duplicate the current document path in the file rail", () => {
    expect(appSource).toContain("currentDocumentPath");
    expect(appSource).toContain("doc.path ?? doc.treePath");
    expect(appSource).not.toContain("Local drafts");
    expect(styles).toContain("text-overflow: ellipsis;");
    expect(appSource).not.toContain('className="rail-footer"');
    expect(styles).not.toContain(".rail-footer");
  });

  test("shows the current document path in the statusbar", () => {
    expect(appSource).toContain("formatStatusPath");
    expect(appSource).toContain("statusDocumentPath");
    expect(appSource).toContain('className="statusbar-path"');
    expect(appSource).toContain('title={currentDocumentPath}');
    expect(appSource).not.toContain("<span>{t[lastSaved]}</span>");
    expect(appSource).not.toContain("lastSaved={workspace.lastSaved}");
    expect(appSource).toContain('replace(/^\\/Users\\/[^/]+(?=\\/|$)/, "~")');
    expect(styles).toContain(".statusbar-path");
    expect(styles).toContain("padding: 0 14px 0 10px;");
    expect(styles).toContain("flex: 1;");
    expect(styles).toContain("text-overflow: ellipsis;");
  });

  test("keeps the main editor as a single WYSIWYG surface", () => {
    expect(appSource).not.toContain('aria-label="Editor mode"');
    expect(appSource).not.toContain("editorMode");
    expect(appSource).not.toContain("setEditorMode");
    expect(appSource).not.toContain('role="radiogroup"');
  });

  test("localizes the empty editor placeholder", () => {
    expect(appSource).toContain('editorPlaceholder: "Start writing..."');
    expect(appSource).toContain('editorPlaceholder: "开始写作..."');
    expect(appSource).toContain("placeholder={t.editorPlaceholder}");
    expect(appSource).toContain("placeholder: string;");
    expect(appSource).toContain("[CrepeFeature.Placeholder]");
    expect(appSource).toContain("text: placeholder");
    expect(appSource).toContain("[toolbarToolsKey, placeholder]");
  });

  test("supports plain text files without markdown rendering", () => {
    expect(mainSource).toContain('type DocumentFormat = "markdown" | "plain"');
    expect(mainSource).toContain("getDocumentFormat");
    expect(mainSource).toContain('extensions: ["md", "markdown", "txt"]');
    expect(mainSource).toContain('format: getDocumentFormat(filePath)');
    expect(mainSource).toContain("payload.format === \"plain\"");
    expect(preloadSource).toContain("format: DocumentFormat");
    expect(rendererTypesSource).toContain('format: "markdown" | "plain"');
    expect(appSource).toContain('type DocumentFormat = "markdown" | "plain"');
    expect(appSource).toContain("PlainTextSurface");
    expect(appSource).toContain("getDocumentFormat");
    expect(appSource).toContain('format: "plain"');
    expect(appSource).toContain('docFormat === "plain"');
    expect(appSource).toContain("<PlainTextSurface");
    expect(appSource).toContain("format: docFormat");
    expect(styles).toContain(".plain-text-editor");
  });

  test("uses compact navigation and balanced writing width", () => {
    expect(appSource).toContain("useState(false)");
    expect(appSource).toContain("dockOpen &&");
    expect(appSource).toContain("depth * 12");
    expect(styles).toContain("--rail-width: 228px;");
    expect(styles).toContain("gap: 6px;");
    expect(styles).toContain("height: 28px;");
    expect(styles).toContain(".content-grid.dock-open");
    expect(appSource).toContain('defaultEditorWidthPreset = "medium"');
    expect(styles).toContain("max-width: var(--editor-width);");
    expect(styles).toContain("--editor-font-size: 16px;");
    expect(styles).toContain("--editor-code-font-size: 14px;");
    expect(styles).toContain(".milkdown-host .cm-content");
  });

  test("keeps the editor canvas close to the content edges", () => {
    expect(rendererMainSource.indexOf('import "@milkdown/crepe/theme/frame.css";')).toBeLessThan(
      rendererMainSource.indexOf('import "./styles.css";')
    );
    expect(styles).toContain(".milkdown-host {");
    expect(styles).toContain("padding: 10px 12px;");
    expect(styles).toContain("padding: 10px;");
    expect(styles).not.toContain("padding: 10px 10px 0;");
    expect(styles).toContain(".milkdown-host .milkdown .ProseMirror");
    expect(styles).toContain("padding: 28px 56px 44px;");
    expect(styles).toContain(".milkdown-host .ProseMirror > :first-child");
    expect(styles).toContain("margin-top: 0;");
  });

  test("keeps the first heading stable when the virtual cursor is inserted", () => {
    expect(styles).toContain(".milkdown-host .ProseMirror > .prosemirror-virtual-cursor + :is(");
    expect(styles).toContain("h1,");
    expect(styles).toContain("margin-top: 0;");
  });

  test("keeps the slash command menu labels at normal weight", () => {
    expect(styles).toMatch(
      /\.milkdown-host \.milkdown \.milkdown-slash-menu \.tab-group li,\n\.milkdown-host \.milkdown \.milkdown-slash-menu \.menu-group h6,\n\.milkdown-host \.milkdown \.milkdown-slash-menu \.menu-group li > span \{\n  font-weight: 400 !important;\n\}/
    );
  });

  test("lets users drag the file rail within min and max widths", () => {
    expect(appSource).toContain("tickpad:rail-width");
    expect(appSource).toContain("defaultRailWidth = 228");
    expect(appSource).toContain("legacyDefaultRailWidth = 208");
    expect(appSource).toContain("minRailWidth = 168");
    expect(appSource).toContain("maxRailWidth = 360");
    expect(appSource).toContain("storedRailWidth === legacyDefaultRailWidth");
    expect(appSource).toContain("getRailWidth");
    expect(appSource).toContain("setRailWidth");
    expect(appSource).toContain("startRailResize");
    expect(appSource).toContain("onStartRailResize={startRailResize}");
    expect(appSource).toContain('className="rail-resize-handle"');
    expect(appSource).toContain('"--rail-width"');
    expect(styles).toContain("width: var(--rail-width);");
    expect(styles).toContain(".rail-resize-handle");
    expect(styles).toContain("cursor: col-resize;");
    expect(styles).toContain("body.rail-resizing");
  });

  test("keeps the file rail divider as part of the shell instead of a separate column", () => {
    expect(styles).toContain("grid-template-columns: var(--rail-width) minmax(0, 1fr);");
    expect(styles).toContain(".rail-resize-handle {");
    expect(styles).toContain("position: absolute;");
    expect(styles).toContain("left: calc(var(--rail-width) - 4px);");
    expect(styles).toContain("top: 0;");
    expect(styles).toContain("bottom: 0;");
    expect(styles).not.toContain("grid-template-columns: auto auto minmax(0, 1fr);");
  });

  test("keeps the file rail boundary free of persistent divider lines", () => {
    expect(styles).toContain("border-right: 0;");
    expect(styles).toContain("box-shadow: none;");
    expect(styles).toContain(".rail-resize-handle::before");
    expect(styles).toContain("left: 3px;");
    expect(styles).toContain("width: 1px;");
    expect(styles).not.toContain("border-right-color: var(--line);");
    expect(styles).not.toContain("inset -1px 0");
    expect(styles).not.toContain("border-right: 1px solid var(--line);");
  });

  test("rounds the main workspace shell corners", () => {
    expect(styles).toContain(".workspace {");
    expect(styles).toContain("border-radius: 12px;");
    expect(styles).toContain("overflow: hidden;");
    expect(styles).toContain(".topbar {");
    expect(styles).toContain("border-radius: 12px 12px 0 0;");
    expect(styles).toContain(".statusbar {");
    expect(styles).toContain("border-radius: 0 0 12px 12px;");
  });

  test("keeps collapsed topbar controls clear of macOS traffic lights", () => {
    expect(appSource).toContain('railOpen ? "app-shell rail-open" : "app-shell rail-collapsed"');
    expect(styles).toContain(".app-shell.rail-collapsed .topbar");
    expect(styles).toContain("padding-left: 104px;");
  });

  test("lets users choose editor writing width presets", () => {
    expect(appSource).toContain('defaultEditorWidthPreset = "medium"');
    expect(appSource).toContain("tickpad:editor-width");
    expect(appSource).toContain("editorWidthPresets");
    expect(appSource).toContain('id: "small"');
    expect(appSource).toContain('id: "medium"');
    expect(appSource).toContain('id: "large"');
    expect(appSource).toContain("ratio: 75");
    expect(appSource).toContain("ratio: 85");
    expect(appSource).toContain("ratio: 95");
    expect(appSource).toContain("Small");
    expect(appSource).toContain("Medium");
    expect(appSource).toContain("Large");
    expect(appSource).toContain("setEditorWidthPreset");
    expect(appSource).toContain("Settings");
    expect(appSource).toContain("onEditorWidthPresetChange(preset.id)");
    expect(appSource).toContain("aria-pressed={preset.id === editorWidthPreset}");
    expect(appSource).toContain("getEditorWidthPreset");
    expect(appSource).toContain("getLegacyEditorWidthPreset");
    expect(appSource).toContain('`${currentEditorWidthPreset.ratio}%`');
    expect(appSource).toContain('"--editor-width"');
    expect(styles).toContain("max-width: var(--editor-width);");
    expect(styles).toContain(".settings-modal-backdrop");
    expect(styles).toContain(".settings-modal");
    expect(styles).toContain(".settings-segmented");
    expect(styles).toContain(".settings-segment");
    expect(styles).toContain("position: fixed;");
    expect(styles).not.toContain(".settings-popover");
  });

  test("lets users switch between English and Chinese in settings", () => {
    expect(appSource).toContain("tickpad:language");
    expect(appSource).toContain("languageOptions");
    expect(appSource).toContain('id: "en"');
    expect(appSource).toContain('id: "zh"');
    expect(appSource).toContain("English");
    expect(appSource).toContain("中文");
    expect(appSource).toContain("getLanguage");
    expect(appSource).toContain("setLanguage");
    expect(appSource).toContain("translations[language]");
    expect(appSource).toContain("{t.language}");
    expect(appSource).toContain('labelKey: "openMarkdown"');
    expect(appSource).toContain("aria-pressed={option.id === language}");
  });

  test("does not expose GitHub linking as a first-level settings area yet", () => {
    expect(appSource).not.toContain('{ id: "github", labelKey: "github" }');
    expect(appSource).not.toContain('setActiveSettingsSection("github")');
    expect(appSource).not.toContain('activeSettingsSection === "github"');
    expect(appSource).not.toContain('className={githubRepository ? "icon-button selected" : "icon-button"}');
    expect(styles).not.toContain(".github-status");
  });

  test("adds plugin management to the settings modal", () => {
    expect(appSource).toContain('{ id: "plugins", labelKey: "plugins", subtitleKey: "pluginsSettingsSubtitle" }');
    expect(appSource).toContain("availablePlugins");
    expect(appSource).toContain("installedPluginIds");
    expect(appSource).toContain("getInstalledPluginIds");
    expect(appSource).toContain("getInstalledPlugins");
    expect(appSource).toContain("tickpad:installed-plugins");
    expect(appSource).toContain('activeSection === "plugins"');
    expect(appSource).toContain('className="plugin-install-panel"');
    expect(appSource).toContain('className="plugin-install-actions"');
    expect(appSource).toContain('className="plugin-install-action"');
    expect(appSource).not.toContain('className="plugin-zip-input" type="file"');
    expect(appSource).toContain("t.pluginInstallComingSoon");
    expect(appSource).toContain("t.pluginStoreInstall");
    expect(appSource).toContain("t.installFromZip");
    expect(appSource).toContain('className="plugin-settings-list"');
    expect(appSource).toContain('className="plugin-settings-action"');
    expect(appSource).toContain("plugin.manifest.name");
    expect(appSource).toContain("plugin.manifest.version");
    expect(appSource).toContain("plugin.manifest.permissions");
    expect(appSource).toContain("onTogglePluginInstall(plugin.manifest.id)");
    expect(appSource).toContain("t.installPlugin");
    expect(appSource).toContain("t.uninstallPlugin");
    expect(appSource).toContain("for (const plugin of installedPlugins)");
    expect(appSource).toContain("const commands = host.getCommands();");
    expect(appSource).toContain("const exporters = host.getExporters();");
    expect(appSource).toContain("commandCount={commands.length}");
    expect(appSource).toContain("exportCount={exporters.length}");
    expect(styles).toContain(".plugin-settings-list");
    expect(styles).toContain(".plugin-settings-card");
    expect(styles).toContain(".plugin-install-panel");
    expect(styles).toContain(".plugin-install-action");
    expect(styles).toContain(".plugin-install-action:disabled");
  });

  test("keeps keyboard shortcuts in settings instead of the topbar", () => {
    expect(appSource).toContain("Keyboard");
    expect(appSource).toContain("shortcutItems");
    expect(appSource).toContain('{ id: "shortcuts", labelKey: "shortcuts", subtitleKey: "shortcutsSettingsSubtitle" }');
    expect(appSource).toContain('setActiveSettingsSection("shortcuts")');
    expect(appSource).toContain('activeSection === "shortcuts"');
    expect(appSource).toContain('className="shortcut-settings-list"');
    expect(appSource).toContain('className="shortcut-settings-row"');
    expect(appSource).toContain("handleKeyboardShortcuts");
    expect(appSource).toContain("event.metaKey");
    expect(styles).toContain(".shortcut-settings-list");
    expect(styles).toContain(".shortcut-settings-row kbd");
  });

  test("keeps duplicate document actions out of the topbar", () => {
    const topbarActionsStart = appSource.indexOf('<div className="topbar-actions">');
    const topbarActionsEnd = appSource.indexOf("</header>", topbarActionsStart);
    const topbarActions = appSource.slice(topbarActionsStart, topbarActionsEnd);

    expect(topbarActions).not.toContain("openShortcutSettings");
    expect(topbarActions).not.toContain("setDockOpen");
    expect(topbarActions).not.toContain("openMarkdown");
    expect(topbarActions).not.toContain("saveMarkdown");
    expect(topbarActions).not.toContain("downloadHtml");
    expect(topbarActions).not.toContain("<Keyboard");
    expect(topbarActions).not.toContain("<Puzzle");
    expect(topbarActions).not.toContain("<FolderOpen");
    expect(topbarActions).not.toContain("<Save");
    expect(topbarActions).not.toContain("<Download");
    expect(topbarActions).toContain("<Settings");
    expect(topbarActions).toContain("toggleTheme");
  });
});
