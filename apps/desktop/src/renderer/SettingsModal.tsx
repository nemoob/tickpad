import { FileText, Keyboard, Puzzle, Settings, X } from "lucide-react";
import { type ReactNode, useEffect, useRef } from "react";

import type { AppLanguage, AppText } from "./i18n";
import { languageOptions } from "./i18n";
import type { UpdateCheckResult } from "./types";
import type { UpdateStatus } from "./useAppUpdates";
import { WritingSettings, type FontPreset, type WidthPreset } from "./WritingSettings";
import {
  clampNumber,
  maxSelectionToolbarSize,
  minSelectionToolbarSize,
  selectionToolbarSizeStep,
  selectionToolbarToolOptions,
  settingsSections,
  shortcutItems,
  type CodeFontPresetId,
  type EditorWidthPresetId,
  type SelectionToolbarToolId,
  type SettingsSectionId,
  type ShellFontPresetId,
  type TextFontPresetId
} from "./preferences";

type SettingsModalProps = {
  activeSection: SettingsSectionId;
  autoUpdateEnabled: boolean;
  codeFontPreset: CodeFontPresetId;
  currentCodeFontPreset: FontPreset;
  currentEditorWidthPreset: WidthPreset;
  currentShellFontPreset: FontPreset;
  currentTextFontPreset: FontPreset;
  editorCodeFontSize: number;
  editorFontSize: number;
  editorWidthPreset: EditorWidthPresetId;
  language: AppLanguage;
  pluginSettingsPage: ReactNode;
  selectionToolbarSize: number;
  selectionToolbarTools: SelectionToolbarToolId[];
  shellFontPreset: ShellFontPresetId;
  t: AppText;
  textFontPreset: TextFontPresetId;
  updateResult: UpdateCheckResult | null;
  updateStatus: UpdateStatus;
  onActiveSectionChange: (section: SettingsSectionId) => void;
  onAutoUpdateEnabledChange: (enabled: boolean) => void;
  onCheckForUpdates: () => void;
  onClose: () => void;
  onCodeFontPresetChange: (preset: CodeFontPresetId) => void;
  onCodeFontSizeChange: (size: number) => void;
  onEditorFontSizeChange: (size: number) => void;
  onEditorWidthPresetChange: (preset: EditorWidthPresetId) => void;
  onLanguageChange: (language: AppLanguage) => void;
  onSelectionToolbarSizeChange: (size: number) => void;
  onShellFontPresetChange: (preset: ShellFontPresetId) => void;
  onTextFontPresetChange: (preset: TextFontPresetId) => void;
  onToggleSelectionToolbarTool: (tool: SelectionToolbarToolId) => void;
};

function SettingsSidebarIcon({ sectionId }: { sectionId: SettingsSectionId }) {
  if (sectionId === "general") {
    return <Settings size={20} />;
  }
  if (sectionId === "shortcuts") {
    return <Keyboard size={20} />;
  }
  if (sectionId === "writing") {
    return <FileText size={20} />;
  }
  return <Puzzle size={20} />;
}

export function SettingsModal({
  activeSection,
  autoUpdateEnabled,
  codeFontPreset,
  currentCodeFontPreset,
  currentEditorWidthPreset,
  currentShellFontPreset,
  currentTextFontPreset,
  editorCodeFontSize,
  editorFontSize,
  editorWidthPreset,
  language,
  pluginSettingsPage,
  selectionToolbarSize,
  selectionToolbarTools,
  shellFontPreset,
  t,
  textFontPreset,
  updateResult,
  updateStatus,
  onActiveSectionChange,
  onAutoUpdateEnabledChange,
  onCheckForUpdates,
  onClose,
  onCodeFontPresetChange,
  onCodeFontSizeChange,
  onEditorFontSizeChange,
  onEditorWidthPresetChange,
  onLanguageChange,
  onSelectionToolbarSizeChange,
  onShellFontPresetChange,
  onTextFontPresetChange,
  onToggleSelectionToolbarTool
}: SettingsModalProps) {
  const modalRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);
  const activeSectionConfig = settingsSections.find((section) => section.id === activeSection) ?? settingsSections[0];
  const updateStatusLabel =
    updateStatus === "checking"
      ? t.checkingUpdates
      : updateStatus === "available"
        ? t.updateAvailable
        : updateStatus === "none"
          ? t.upToDate
            : updateStatus === "error"
              ? t.updateCheckFailed
              : t.updateNotChecked;

  onCloseRef.current = onClose;

  useEffect(() => {
    previouslyFocusedElementRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    modalRef.current?.focus();

    const handleModalKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab" || !modalRef.current) {
        return;
      }

      const focusableElements = Array.from(
        modalRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements.at(-1);
      if (!firstElement || !lastElement) {
        event.preventDefault();
        modalRef.current.focus();
        return;
      }

      if (event.shiftKey && (document.activeElement === firstElement || !modalRef.current.contains(document.activeElement))) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && (document.activeElement === lastElement || !modalRef.current.contains(document.activeElement))) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    window.addEventListener("keydown", handleModalKeyDown);
    return () => {
      window.removeEventListener("keydown", handleModalKeyDown);
      previouslyFocusedElementRef.current?.focus();
    };
  }, []);

  return (
    <div
      className="settings-modal-backdrop"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        className="settings-modal"
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        aria-describedby="settings-subtitle"
        tabIndex={-1}
      >
        <nav className="settings-sidebar" aria-label={t.settings}>
          <div className="settings-sidebar-title">{t.settings}</div>
          {settingsSections.map((section) => (
            <button
              className="settings-sidebar-item"
              key={section.id}
              type="button"
              aria-current={section.id === activeSection ? "page" : undefined}
              onClick={() => onActiveSectionChange(section.id)}
            >
              <SettingsSidebarIcon sectionId={section.id} />
              <span>{t[section.labelKey]}</span>
            </button>
          ))}
        </nav>

        <div className="settings-content">
          <div className="settings-header">
            <div>
              <strong id="settings-title">{t[activeSectionConfig.labelKey]}</strong>
              <span id="settings-subtitle">{t[activeSectionConfig.subtitleKey]}</span>
            </div>
            <button className="icon-button settings-close" type="button" title={t.closeSettings} onClick={onClose}>
              <X size={16} />
            </button>
          </div>

          {activeSection === "general" && (
            <div className="settings-page">
              <div className="settings-section">
                <span className="settings-section-title">{t.general}</span>
                <div className="settings-list-row">
                  <div className="settings-row setting-label-only">
                    <span>{t.language}</span>
                  </div>
                  <div className="settings-segmented" aria-label={t.language}>
                    {languageOptions.map((option) => (
                      <button
                        className={option.id === language ? "settings-segment selected" : "settings-segment"}
                        key={option.id}
                        type="button"
                        aria-pressed={option.id === language}
                        title={t[option.labelKey]}
                        onClick={() => onLanguageChange(option.id)}
                      >
                        <span>{t[option.labelKey]}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="settings-list-row">
                  <div className="settings-row">
                    <span>{t.updates}</span>
                    <strong>{updateStatusLabel}</strong>
                  </div>
                  <label className="settings-check">
                    <input
                      type="checkbox"
                      checked={autoUpdateEnabled}
                      onChange={(event) => onAutoUpdateEnabledChange(event.target.checked)}
                    />
                    <span>{t.autoUpdate}</span>
                  </label>
                </div>
                <div className="settings-list-row">
                  <div className="settings-row">
                    <span>{t.latestVersion}</span>
                    <strong>{updateResult?.latestVersion ?? "—"}</strong>
                  </div>
                  <button className="plugin-install-action" type="button" disabled={updateStatus === "checking"} onClick={onCheckForUpdates}>
                    <span>{updateStatus === "checking" ? t.checkingUpdates : t.checkNow}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeSection === "shortcuts" && (
            <div className="settings-page">
              <div className="settings-section">
                <span className="settings-section-title">{t.shortcuts}</span>
                <div className="shortcut-settings-list">
                  {shortcutItems.map((shortcut) => (
                    <div className="shortcut-settings-row" key={shortcut.id}>
                      <span>{t[shortcut.labelKey]}</span>
                      <kbd>{shortcut.keys}</kbd>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeSection === "writing" && (
            <WritingSettings
              codeFontPreset={codeFontPreset}
              currentCodeFontPreset={currentCodeFontPreset}
              currentEditorWidthPreset={currentEditorWidthPreset}
              currentShellFontPreset={currentShellFontPreset}
              currentTextFontPreset={currentTextFontPreset}
              editorCodeFontSize={editorCodeFontSize}
              editorFontSize={editorFontSize}
              editorWidthPreset={editorWidthPreset}
              shellFontPreset={shellFontPreset}
              t={t}
              textFontPreset={textFontPreset}
              onCodeFontPresetChange={onCodeFontPresetChange}
              onCodeFontSizeChange={onCodeFontSizeChange}
              onEditorFontSizeChange={onEditorFontSizeChange}
              onEditorWidthPresetChange={onEditorWidthPresetChange}
              onShellFontPresetChange={onShellFontPresetChange}
              onTextFontPresetChange={onTextFontPresetChange}
            />
          )}

          {activeSection === "selection" && (
            <div className="settings-page">
              <div className="settings-section">
                <span className="settings-section-title">{t.selectionMenu}</span>
                <label className="settings-list-row">
                  <div className="settings-row">
                    <span>{t.menuSize}</span>
                    <strong>{selectionToolbarSize}px</strong>
                  </div>
                  <input
                    type="range"
                    min={minSelectionToolbarSize}
                    max={maxSelectionToolbarSize}
                    step={selectionToolbarSizeStep}
                    value={selectionToolbarSize}
                    onChange={(event) =>
                      onSelectionToolbarSizeChange(clampNumber(Number(event.target.value), minSelectionToolbarSize, maxSelectionToolbarSize))
                    }
                  />
                </label>
                <div className="settings-list-row stacked">
                  <div className="settings-row">
                    <span>{t.selectionMenu}</span>
                    <strong>{selectionToolbarTools.length}</strong>
                  </div>
                  <div className="settings-checks">
                    {selectionToolbarToolOptions.map((tool) => (
                      <label className="settings-check" key={tool.id}>
                        <input
                          type="checkbox"
                          checked={selectionToolbarTools.includes(tool.id)}
                          disabled={selectionToolbarTools.length === 1 && selectionToolbarTools.includes(tool.id)}
                          onChange={() => onToggleSelectionToolbarTool(tool.id)}
                        />
                        <span>{t[tool.labelKey]}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === "plugins" && pluginSettingsPage}
        </div>
      </section>
    </div>
  );
}
