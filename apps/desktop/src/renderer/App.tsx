import type { CSSProperties, MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent } from "react";
import { useEffect, useState } from "react";
import { getStats } from "@tickpad/editor-core";
import { exportHtml } from "@tickpad/export";

import { cleanOutlineText, type DocumentOutlineItem } from "./document-outline";
import { ConfirmModal } from "./ConfirmModal";
import { EditorPane } from "./EditorPane";
import { FileRail } from "./FileRail";
import { getLanguage, translations, type AppLanguage } from "./i18n";
import { PluginDock } from "./PluginDock";
import { PluginSettingsPage } from "./PluginSettingsPage";
import {
  clampNumber,
  codeFontPresets,
  editorWidthPresets,
  getCodeFontPreset,
  getCodeFontSize,
  getEditorFontSize,
  getEditorWidthPreset,
  getRailWidth,
  getSelectionToolbarSize,
  getSelectionToolbarTools,
  getShellFontPreset,
  getTextFontPreset,
  getTheme,
  maxRailWidth,
  minRailWidth,
  shellFontPresets,
  textFontPresets,
  themePresets,
  type AppTheme,
  type CodeFontPresetId,
  type EditorWidthPresetId,
  type SelectionToolbarToolId,
  type SettingsSectionId,
  type ShellFontPresetId,
  type TextFontPresetId
} from "./preferences";
import { SettingsModal } from "./SettingsModal";
import { Statusbar } from "./Statusbar";
import { Topbar } from "./Topbar";
import { useAppUpdates } from "./useAppUpdates";
import { useDocumentWorkspace } from "./useDocumentWorkspace";
import { useOfficialPlugins } from "./useOfficialPlugins";

type WorkspaceReplacePrompt = {
  resolve: (confirmed: boolean) => void;
};

export default function App() {
  const [workspaceReplacePrompt, setWorkspaceReplacePrompt] = useState<WorkspaceReplacePrompt | null>(null);
  const confirmWorkspaceReplace = () =>
    new Promise<boolean>((resolve) => {
      setWorkspaceReplacePrompt({ resolve });
    });
  const workspace = useDocumentWorkspace(confirmWorkspaceReplace);
  const [theme, setTheme] = useState<AppTheme>(() => getTheme());
  const [language, setLanguage] = useState<AppLanguage>(() => getLanguage());
  const [railOpen, setRailOpen] = useState(true);
  const [railWidth, setRailWidth] = useState(() => getRailWidth());
  const [dockOpen, setDockOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [outlineOpen, setOutlineOpen] = useState(true);
  const [activeSettingsSection, setActiveSettingsSection] = useState<SettingsSectionId>("general");
  const [editorWidthPreset, setEditorWidthPreset] = useState<EditorWidthPresetId>(() => getEditorWidthPreset());
  const [textFontPreset, setTextFontPreset] = useState<TextFontPresetId>(() => getTextFontPreset());
  const [codeFontPreset, setCodeFontPreset] = useState<CodeFontPresetId>(() => getCodeFontPreset());
  const [shellFontPreset, setShellFontPreset] = useState<ShellFontPresetId>(() => getShellFontPreset());
  const [editorFontSize, setEditorFontSize] = useState(() => getEditorFontSize());
  const [editorCodeFontSize, setEditorCodeFontSize] = useState(() => getCodeFontSize());
  const [selectionToolbarSize, setSelectionToolbarSize] = useState(() => getSelectionToolbarSize());
  const [selectionToolbarTools, setSelectionToolbarTools] = useState<SelectionToolbarToolId[]>(() => getSelectionToolbarTools());
  const [activePanel, setActivePanel] = useState("word-count.panel");
  const updates = useAppUpdates();

  const t = translations[language];
  const plugins = useOfficialPlugins({
    markdown: workspace.doc.markdown,
    onMarkdownChange: (markdown) => workspace.updateDocumentMarkdown(markdown, true),
    messages: {
      aiBridgeUnavailable: t.aiBridgeUnavailable,
      apiKeyRequired: t.apiKeyRequired,
      apiKeyEndpointChanged: t.apiKeyEndpointChanged,
      aiNicknameExists: t.aiNicknameExists,
      projectExportUnavailable: t.projectExportUnavailable
    }
  });
  const selectionToolbarIconSize = Math.max(14, selectionToolbarSize - 10);
  const currentEditorWidthPreset = editorWidthPresets.find((preset) => preset.id === editorWidthPreset) ?? editorWidthPresets[1];
  const currentTextFontPreset = textFontPresets.find((preset) => preset.id === textFontPreset) ?? textFontPresets[0];
  const currentCodeFontPreset = codeFontPresets.find((preset) => preset.id === codeFontPreset) ?? codeFontPresets[0];
  const currentShellFontPreset = shellFontPresets.find((preset) => preset.id === shellFontPreset) ?? shellFontPresets[0];
  const currentThemePreset = themePresets.find((preset) => preset.id === theme) ?? themePresets[0];
  const shellStyle = {
    "--rail-width": `${railWidth}px`,
    "--shell-font-family": currentShellFontPreset.stack
  } as CSSProperties;
  const editorStyle = {
    "--editor-width": `${currentEditorWidthPreset.ratio}%`,
    "--editor-font-size": `${editorFontSize}px`,
    "--editor-code-font-size": `${editorCodeFontSize}px`,
    "--editor-text-font-family": currentTextFontPreset.stack,
    "--editor-code-font-family": currentCodeFontPreset.stack,
    "--selection-toolbar-button-size": `${selectionToolbarSize}px`,
    "--selection-toolbar-icon-size": `${selectionToolbarIconSize}px`
  } as CSSProperties;

  const stats = getStats(workspace.doc.markdown);
  const { commands, exporters, panels } = plugins;
  const activePanelContribution = panels.find((panel) => panel.id === activePanel) ?? panels[0];

  useEffect(() => {
    window.document.documentElement.dataset.theme = theme;
    localStorage.setItem("tickpad:theme", theme);
  }, [theme]);

  useEffect(() => {
    if (!themeMenuOpen) {
      return;
    }

    const closeThemeMenu = () => setThemeMenuOpen(false);
    const closeThemeMenuOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeThemeMenu();
      }
    };

    window.addEventListener("pointerdown", closeThemeMenu);
    window.addEventListener("keydown", closeThemeMenuOnEscape);
    return () => {
      window.removeEventListener("pointerdown", closeThemeMenu);
      window.removeEventListener("keydown", closeThemeMenuOnEscape);
    };
  }, [themeMenuOpen]);

  useEffect(() => {
    localStorage.setItem("tickpad:language", language);
    window.document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
  }, [language]);

  useEffect(() => localStorage.setItem("tickpad:editor-width", editorWidthPreset), [editorWidthPreset]);
  useEffect(() => localStorage.setItem("tickpad:rail-width", String(railWidth)), [railWidth]);
  useEffect(() => localStorage.setItem("tickpad:editor-text-font", textFontPreset), [textFontPreset]);
  useEffect(() => localStorage.setItem("tickpad:editor-code-font", codeFontPreset), [codeFontPreset]);
  useEffect(() => localStorage.setItem("tickpad:shell-font", shellFontPreset), [shellFontPreset]);
  useEffect(() => localStorage.setItem("tickpad:editor-font-size", String(editorFontSize)), [editorFontSize]);
  useEffect(() => localStorage.setItem("tickpad:editor-code-font-size", String(editorCodeFontSize)), [editorCodeFontSize]);
  useEffect(() => localStorage.setItem("tickpad:selection-toolbar-size", String(selectionToolbarSize)), [selectionToolbarSize]);
  useEffect(() => localStorage.setItem("tickpad:selection-toolbar-tools", JSON.stringify(selectionToolbarTools)), [selectionToolbarTools]);
  const cycleTheme = () => {
    const currentIndex = themePresets.findIndex((preset) => preset.id === theme);
    const nextTheme = themePresets[(currentIndex + 1) % themePresets.length] ?? themePresets[0];
    setTheme(nextTheme.id);
  };

  const toggleSelectionToolbarTool = (tool: SelectionToolbarToolId) => {
    setSelectionToolbarTools((current) => {
      if (!current.includes(tool)) {
        return [...current, tool];
      }
      return current.length === 1 ? current : current.filter((item) => item !== tool);
    });
  };

  const startRailResize = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!railOpen) {
      return;
    }
    event.preventDefault();
    const startX = event.clientX;
    const startWidth = railWidth;

    const stopRailResize = () => {
      window.removeEventListener("pointermove", resizeRail);
      window.removeEventListener("pointerup", stopRailResize);
      window.removeEventListener("pointercancel", stopRailResize);
      window.document.body.classList.remove("rail-resizing");
    };

    const resizeRail = (moveEvent: PointerEvent) => {
      setRailWidth(clampNumber(startWidth + moveEvent.clientX - startX, minRailWidth, maxRailWidth));
    };

    window.document.body.classList.add("rail-resizing");
    window.addEventListener("pointermove", resizeRail);
    window.addEventListener("pointerup", stopRailResize);
    window.addEventListener("pointercancel", stopRailResize);
  };

  const saveMarkdown = () => workspace.hasOpenDocument && workspace.saveMarkdown((path) => plugins.host.emit("document:save", { path }));

  const copyWechatHtml = async () => {
    if (await plugins.copyWechatHtml()) {
      workspace.setLastSaved("wechatHtmlCopied");
    }
  };

  const downloadHtml = () => {
    if (!workspace.hasOpenDocument) return;
    const url = URL.createObjectURL(new Blob([exportHtml(workspace.doc.markdown)], { type: "text/html" }));
    const link = window.document.createElement("a");
    link.href = url;
    link.download = `${workspace.fileName.replace(/\.md$/, "")}.html`;
    link.click();
    URL.revokeObjectURL(url);
    workspace.setLastSaved("htmlExported");
  };

  const openShortcutSettings = () => {
    setActiveSettingsSection("shortcuts");
    setSettingsOpen(true);
  };

  const handleEditorClick = (event: ReactMouseEvent<HTMLElement>) => {
    const target = event.target instanceof Element ? event.target : null;
    const link = target?.closest("a[href]");
    const href = link?.getAttribute("href");
    if (!href || !/^https?:\/\//i.test(href)) {
      return;
    }
    event.preventDefault();
    void window.tickpad?.openExternal(href);
  };

  const scrollToOutlineItem = (item: DocumentOutlineItem) => {
    const headings = Array.from(window.document.querySelectorAll("h1, h2, h3, h4, h5, h6"));
    const target =
      headings.find((heading, index) => index === item.index && cleanOutlineText(heading.textContent ?? "") === item.targetText) ??
      headings.find((heading) => cleanOutlineText(heading.textContent ?? "") === item.targetText) ??
      headings[item.index];
    if (target instanceof HTMLElement) {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const resolveWorkspaceReplacePrompt = (confirmed: boolean) => {
    workspaceReplacePrompt?.resolve(confirmed);
    setWorkspaceReplacePrompt(null);
  };

  useEffect(() => {
    const handleKeyboardShortcuts = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const isCommand = event.metaKey && !event.ctrlKey && !event.altKey;
      const isCommandOnly = isCommand && !event.shiftKey;
      const isCommandShift = isCommand && event.shiftKey;
      if (!isCommand) {
        return;
      }
      if (isCommandOnly && key === "/") {
        event.preventDefault();
        openShortcutSettings();
        return;
      }
      if (isCommandOnly && key === "o") {
        event.preventDefault();
        void workspace.openMarkdown();
        return;
      }
      if (isCommandOnly && key === "s") {
        event.preventDefault();
        void saveMarkdown();
        return;
      }
      if (isCommandOnly && key === "e") {
        event.preventDefault();
        downloadHtml();
        return;
      }
      if (isCommandOnly && key === ",") {
        event.preventDefault();
        setActiveSettingsSection("general");
        setSettingsOpen(true);
        return;
      }
      if (isCommandShift && key === "p") {
        event.preventDefault();
        setDockOpen((value) => !value);
        return;
      }
      if (isCommandShift && key === "t") {
        event.preventDefault();
        cycleTheme();
      }
    };

    window.addEventListener("keydown", handleKeyboardShortcuts);
    return () => window.removeEventListener("keydown", handleKeyboardShortcuts);
  });

  return (
    <div className={railOpen ? "app-shell rail-open" : "app-shell rail-collapsed"} style={shellStyle}>
      <FileRail
        activeDocument={workspace.hasOpenDocument ? workspace.doc : null}
        contextMenuDocument={workspace.contextMenuDocument}
        documentContextMenu={workspace.documentContextMenu}
        documentTree={workspace.documentTree}
        folderContextMenu={workspace.folderContextMenu}
        openFolders={workspace.openFolders}
        pinnedDocumentIdSet={workspace.pinnedDocumentIdSet}
        railOpen={railOpen}
        renameDraft={workspace.renameDraft}
        renamingDocumentId={workspace.renamingDocumentId}
        renamingFolderId={workspace.renamingFolderId}
        searchQuery={workspace.searchQuery}
        t={t}
         onCreateFile={workspace.createLocalFile}
         onCreateFolder={workspace.createLocalFolder}
         onDeleteDocument={workspace.deleteDocument}
         onDeleteFolder={workspace.deleteFolder}
          onOpenWorkspace={() =>
            workspace.openWorkspace({
              title: t.chooseWorkspaceFolder,
              buttonLabel: t.chooseFolder
            })
          }
         onOpenDocumentContextMenu={workspace.openDocumentContextMenu}
        onOpenFolderContextMenu={workspace.openFolderContextMenu}
        onRenameBlur={workspace.handleRenameBlur}
        onRenameDraftChange={workspace.setRenameDraft}
        onRenameKeyDown={workspace.handleRenameKeyDown}
        onSearchQueryChange={workspace.setSearchQuery}
        onSelectDocument={workspace.selectDocument}
        onStartRailResize={startRailResize}
        onStartRenamingDocument={workspace.startRenamingDocument}
        onStartRenamingFolder={workspace.startRenamingFolder}
        onToggleFolder={workspace.toggleFolder}
        onTogglePinnedDocument={workspace.togglePinnedDocument}
      />

      <main className="workspace">
        <Topbar
          activeDocument={workspace.doc}
          currentThemePreset={currentThemePreset}
          railOpen={railOpen}
          settingsOpen={settingsOpen}
          t={t}
          tabDocuments={workspace.tabDocuments}
          theme={theme}
          themeMenuOpen={themeMenuOpen}
          onCloseDocumentTab={workspace.closeDocumentTab}
          onCloseDocumentTabsByScope={workspace.closeDocumentTabsByScope}
          onOpenDocumentContextMenu={workspace.openDocumentContextMenu}
          onSelectDocument={workspace.selectDocument}
          onSetTheme={(nextTheme) => {
            setTheme(nextTheme);
            setThemeMenuOpen(false);
          }}
          onToggleFileRail={() => setRailOpen((value) => !value)}
          onToggleSettings={() => setSettingsOpen((value) => !value)}
          onToggleThemeMenu={() => setThemeMenuOpen((value) => !value)}
        />

        {settingsOpen && (
          <SettingsModal
            activeSection={activeSettingsSection}
            autoUpdateEnabled={updates.autoUpdateEnabled}
            codeFontPreset={codeFontPreset}
            currentCodeFontPreset={currentCodeFontPreset}
            currentEditorWidthPreset={currentEditorWidthPreset}
            currentShellFontPreset={currentShellFontPreset}
            currentTextFontPreset={currentTextFontPreset}
            editorCodeFontSize={editorCodeFontSize}
             editorFontSize={editorFontSize}
             editorWidthPreset={editorWidthPreset}
            language={language}
            pluginSettingsPage={(
              <PluginSettingsPage
                aiProfiles={plugins.aiProfiles}
                availablePlugins={plugins.availablePlugins}
                commandCount={commands.length}
                exportCount={exporters.length}
                installedPluginIds={plugins.installedPluginIds}
                projectExporters={plugins.projectExporters}
                secretProfileIds={plugins.secretProfileIds}
                t={t}
                onDeleteAiProfile={plugins.deleteAiProfile}
                onExportProject={plugins.exportProject}
                onSaveAiProfile={plugins.saveAiProfile}
                onTogglePluginInstall={plugins.togglePluginInstall}
              />
            )}
            selectionToolbarSize={selectionToolbarSize}
            selectionToolbarTools={selectionToolbarTools}
            shellFontPreset={shellFontPreset}
            t={t}
            textFontPreset={textFontPreset}
            updateResult={updates.updateResult}
            updateStatus={updates.updateStatus}
            onActiveSectionChange={setActiveSettingsSection}
            onAutoUpdateEnabledChange={updates.setAutoUpdateEnabled}
            onCheckForUpdates={() => void updates.checkForUpdates()}
            onClose={() => setSettingsOpen(false)}
            onCodeFontPresetChange={setCodeFontPreset}
            onCodeFontSizeChange={setEditorCodeFontSize}
            onEditorFontSizeChange={setEditorFontSize}
            onEditorWidthPresetChange={setEditorWidthPreset}
            onLanguageChange={setLanguage}
            onSelectionToolbarSizeChange={setSelectionToolbarSize}
            onShellFontPresetChange={setShellFontPreset}
            onTextFontPresetChange={setTextFontPreset}
            onToggleSelectionToolbarTool={toggleSelectionToolbarTool}
          />
        )}

        {workspaceReplacePrompt && (
          <ConfirmModal
            cancelLabel={t.cancel}
            confirmLabel={t.replaceWorkspaceConfirm}
            description={t.replaceWorkspaceDescription}
            title={t.replaceWorkspaceTitle}
            onCancel={() => resolveWorkspaceReplacePrompt(false)}
            onConfirm={() => resolveWorkspaceReplacePrompt(true)}
          />
        )}

        {updates.updatePrompt && (
          <ConfirmModal
            cancelLabel={t.cancel}
            confirmLabel={t.updateAvailableConfirm}
            description={`${t.updateAvailableDescription} ${updates.updatePrompt.latestVersion}`}
            title={t.updateAvailableTitle}
            onCancel={updates.dismissUpdatePrompt}
            onConfirm={() => void updates.openUpdatePage(updates.updatePrompt?.downloadUrl)}
          />
        )}

        <section className={dockOpen ? "content-grid dock-open" : "content-grid"}>
          <EditorPane
            aiProfiles={plugins.aiProfiles}
            aiWriterEnabled={plugins.installedPluginIds.includes("ai-writer")}
            doc={workspace.doc}
            docFormat={workspace.docFormat}
            editorOutlineItems={workspace.editorOutlineItems}
            editorRevision={workspace.editorRevision}
            editorStyle={editorStyle}
            hasOpenDocument={workspace.hasOpenDocument}
            outlineOpen={outlineOpen}
            selectionToolbarTools={selectionToolbarTools}
            t={t}
            onAiGenerate={plugins.generateWithAi}
            onClick={handleEditorClick}
            onCreateFile={workspace.createLocalFile}
            onMarkdownChange={workspace.updateDocumentMarkdown}
            onOpenAiSettings={() => {
              setActiveSettingsSection("plugins");
              setSettingsOpen(true);
            }}
            onOpenFile={() => void workspace.openMarkdown()}
            onOutlineOpenChange={setOutlineOpen}
            onScrollToOutlineItem={scrollToOutlineItem}
          />

          {dockOpen && workspace.hasOpenDocument && (
            <PluginDock
              activePanel={activePanel}
              activePanelContribution={activePanelContribution}
              panels={panels}
              t={t}
              onActivePanelChange={setActivePanel}
              onCopyWechatHtml={() => void copyWechatHtml()}
            />
          )}
        </section>

        <Statusbar
          characterCount={stats.characters}
          commandCount={commands.length}
          currentDocumentPath={workspace.currentDocumentPath}
          exporterCount={exporters.length}
          hasOpenDocument={workspace.hasOpenDocument}
          statusDocumentPath={workspace.statusDocumentPath}
          t={t}
          wordCount={stats.words}
        />
      </main>
    </div>
  );
}
