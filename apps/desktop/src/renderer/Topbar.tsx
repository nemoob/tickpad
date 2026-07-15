import { Check, ChevronDown, MoreHorizontal, PanelLeftClose, PanelLeftOpen, Settings, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { MouseEvent } from "react";

import { getDocumentFileName } from "./document-model";
import type { TabCloseScope } from "./document-tabs";
import type { AppText } from "./i18n";
import { themePresets, type AppTheme } from "./preferences";
import { TabContextMenu, type TabContextMenuState } from "./TabContextMenu";
import type { LocalDocument } from "./types";

type ThemePreset = (typeof themePresets)[number];

type TopbarProps = {
  activeDocument: LocalDocument;
  currentThemePreset: ThemePreset;
  railOpen: boolean;
  settingsOpen: boolean;
  t: AppText;
  tabDocuments: LocalDocument[];
  theme: AppTheme;
  themeMenuOpen: boolean;
  onCloseDocumentTab: (event: MouseEvent<HTMLButtonElement>, documentId: string) => void;
  onCloseDocumentTabsByScope: (documentId: string, scope: TabCloseScope) => void;
  onOpenDocumentContextMenu: (event: MouseEvent<HTMLButtonElement>, document: LocalDocument) => void;
  onSelectDocument: (document: LocalDocument) => void;
  onSetTheme: (theme: AppTheme) => void;
  onToggleFileRail: () => void;
  onToggleSettings: () => void;
  onToggleThemeMenu: () => void;
};

export function Topbar({
  activeDocument,
  currentThemePreset,
  railOpen,
  settingsOpen,
  t,
  tabDocuments,
  theme,
  themeMenuOpen,
  onCloseDocumentTab,
  onCloseDocumentTabsByScope,
  onOpenDocumentContextMenu,
  onSelectDocument,
  onSetTheme,
  onToggleFileRail,
  onToggleSettings,
  onToggleThemeMenu
}: TopbarProps) {
  const [tabContextMenu, setTabContextMenu] = useState<TabContextMenuState>(null);
  const tabRefs = useRef(new Map<string, HTMLDivElement>());
  const topbarRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!tabContextMenu) {
      return;
    }
    const closeMenu = () => setTabContextMenu(null);
    const closeOnEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    };
    window.addEventListener("pointerdown", closeMenu);
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      window.removeEventListener("pointerdown", closeMenu);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [tabContextMenu]);

  useEffect(() => {
    const activeTab = tabRefs.current.get(activeDocument.id);
    activeTab?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [activeDocument.id]);

  const openTabContextMenu = (event: MouseEvent<HTMLElement>, document: LocalDocument) => {
    event.preventDefault();
    event.stopPropagation();
    const tabElement = tabRefs.current.get(document.id) ?? event.currentTarget;
    const tabRect = tabElement.getBoundingClientRect();
    const topbarRect = topbarRef.current?.getBoundingClientRect();
    const leftOffset = topbarRect?.left ?? 0;
    const topOffset = topbarRect?.top ?? 0;
    const topbarWidth = topbarRect?.width ?? window.innerWidth;
    setTabContextMenu({
      document,
      x: Math.max(0, Math.min(tabRect.left - leftOffset, topbarWidth - 180)),
      y: tabRect.bottom - topOffset + 6
    });
  };

  const closeTabsByScope = (documentId: string, scope: TabCloseScope) => {
    onCloseDocumentTabsByScope(documentId, scope);
    setTabContextMenu(null);
  };

  return (
    <header className="topbar" ref={topbarRef}>
      <div className="topbar-left">
        <button className="icon-button" type="button" title={t.toggleFileRail} onClick={onToggleFileRail}>
          {railOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
        </button>
        <div className="document-tabs" role="tablist" aria-label={t.openDocuments}>
          {tabDocuments.map((document) => {
            const tabName = getDocumentFileName(document);
            const tabPath = document.path ?? document.treePath ?? tabName;
            return (
              <div
                className={document.id === activeDocument.id ? "document-tab active" : "document-tab"}
                key={document.id}
                ref={(element) => {
                  if (element) {
                    tabRefs.current.set(document.id, element);
                    return;
                  }
                  tabRefs.current.delete(document.id);
                }}
                role="tab"
                tabIndex={0}
                aria-selected={document.id === activeDocument.id}
                title={`${tabPath}${document.dirty ? ` · ${t.unsavedChanges}` : ""}`}
                onClick={() => onSelectDocument(document)}
                onKeyDown={(event) => {
                  if (event.target !== event.currentTarget) {
                    return;
                  }
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelectDocument(document);
                  }
                }}
                onContextMenu={(event) => openTabContextMenu(event, document)}
              >
                <span className="document-tab-name">{tabName}</span>
                <button
                  className="document-tab-menu"
                  type="button"
                  title={t.fileMenu}
                  aria-label={`${t.fileMenu}: ${tabName}`}
                  onClick={(event) => onOpenDocumentContextMenu(event, document)}
                >
                  <MoreHorizontal size={13} />
                </button>
                <button
                  className="document-tab-close"
                  type="button"
                  title={t.closeDocumentTab}
                  aria-label={`${t.closeDocumentTab}: ${tabName}`}
                  onClick={(event) => onCloseDocumentTab(event, document.id)}
                >
                  <X size={12} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
      <div className="topbar-actions">
        <button className={settingsOpen ? "icon-button selected" : "icon-button"} type="button" title={t.editorSettings} onClick={onToggleSettings}>
          <Settings size={18} />
        </button>
        <div className="theme-picker" onPointerDown={(event) => event.stopPropagation()}>
          <button className="theme-picker-trigger" type="button" title={t.toggleTheme} onClick={onToggleThemeMenu}>
            <span className={`theme-swatch ${currentThemePreset.tone}`}>Aa</span>
            <span className="theme-picker-label">{t[currentThemePreset.labelKey]}</span>
            <ChevronDown size={14} />
          </button>
          {themeMenuOpen && (
            <div className="theme-menu" role="menu" aria-label={t.toggleTheme}>
              {themePresets.map((preset) => (
                <button
                  className={preset.id === theme ? "theme-menu-item selected" : "theme-menu-item"}
                  key={preset.id}
                  type="button"
                  role="menuitem"
                  onClick={() => onSetTheme(preset.id)}
                >
                  <span className={`theme-swatch ${preset.tone}`}>Aa</span>
                  <span>{t[preset.labelKey]}</span>
                  {preset.id === theme && <Check size={14} />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <TabContextMenu contextMenu={tabContextMenu} t={t} onCloseTabsByScope={closeTabsByScope} />
    </header>
  );
}
