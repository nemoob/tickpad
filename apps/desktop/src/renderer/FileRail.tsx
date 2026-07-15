import { ChevronDown, ChevronRight, FilePlus, FileText, Folder, FolderOpen, FolderPlus, PencilLine, Pin, Puzzle, Search, Trash2 } from "lucide-react";
import type { FocusEvent, KeyboardEvent, MouseEvent, PointerEvent, ReactNode } from "react";

import type { DocumentTreeNode } from "./document-tree";
import type { AppText } from "./i18n";
import type { DocumentContextMenuState, FolderContextMenuState, LocalDocument } from "./types";

type FileRailProps = {
  activeDocument: LocalDocument | null;
  contextMenuDocument: LocalDocument | undefined;
  documentContextMenu: DocumentContextMenuState | null;
  documentTree: DocumentTreeNode<LocalDocument>[];
  folderContextMenu: FolderContextMenuState | null;
  openFolders: Set<string>;
  pinnedDocumentIdSet: Set<string>;
  railOpen: boolean;
  renameDraft: string;
  renamingDocumentId: string | null;
  renamingFolderId: string | null;
  searchQuery: string;
  t: AppText;
  onCreateFile: () => void;
  onCreateFolder: () => void;
  onOpenWorkspace: () => void;
  onDeleteDocument: (documentId: string) => void;
  onDeleteFolder: (folderPath: string) => void;
  onOpenFolderContextMenu: (event: MouseEvent<HTMLButtonElement>, folder: DocumentTreeNode<LocalDocument>) => void;
  onOpenDocumentContextMenu: (event: MouseEvent<HTMLButtonElement>, document: LocalDocument) => void;
  onRenameBlur: (event: FocusEvent<HTMLInputElement>) => void;
  onRenameDraftChange: (value: string) => void;
  onRenameKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  onSearchQueryChange: (value: string) => void;
  onSelectDocument: (document: LocalDocument) => void;
  onStartRailResize: (event: PointerEvent<HTMLButtonElement>) => void;
  onStartRenamingDocument: (document: LocalDocument) => void;
  onStartRenamingFolder: (folderPath: string) => void;
  onToggleFolder: (folderId: string) => void;
  onTogglePinnedDocument: (documentId: string) => void;
};

export function FileRail({
  activeDocument,
  contextMenuDocument,
  documentContextMenu,
  documentTree,
  folderContextMenu,
  openFolders,
  pinnedDocumentIdSet,
  railOpen,
  renameDraft,
  renamingDocumentId,
  renamingFolderId,
  searchQuery,
  t,
  onCreateFile,
  onCreateFolder,
  onOpenWorkspace,
  onDeleteDocument,
  onDeleteFolder,
  onOpenFolderContextMenu,
  onOpenDocumentContextMenu,
  onRenameBlur,
  onRenameDraftChange,
  onRenameKeyDown,
  onSearchQueryChange,
  onSelectDocument,
  onStartRailResize,
  onStartRenamingDocument,
  onStartRenamingFolder,
  onToggleFolder,
  onTogglePinnedDocument
}: FileRailProps) {
  const renderTreeNode = (node: DocumentTreeNode<LocalDocument>, depth = 0): ReactNode => {
    if (node.document) {
      const document = node.document;
      const isPinned = pinnedDocumentIdSet.has(document.id);
      const isRenaming = renamingDocumentId === document.id;
      const rowClassName = document.id === activeDocument?.id ? "document-row active" : "document-row";
      const rowStyle = { paddingLeft: `${8 + depth * 12}px` };
      const icon = document.icon === "plugin" ? <Puzzle size={16} /> : <FileText size={16} />;

      if (isRenaming) {
        return (
          <div key={node.id} className={rowClassName} style={rowStyle}>
            {icon}
            <input
              className="document-rename-input"
              value={renameDraft}
              autoFocus
              onBlur={onRenameBlur}
              onChange={(event) => onRenameDraftChange(event.target.value)}
              onKeyDown={onRenameKeyDown}
            />
            {isPinned && <Pin className="document-pin-indicator" size={12} />}
          </div>
        );
      }

      return (
        <button
          key={node.id}
          className={rowClassName}
          type="button"
          title={document.title}
          style={rowStyle}
          onClick={() => onSelectDocument(document)}
          onContextMenu={(event) => onOpenDocumentContextMenu(event, document)}
        >
          {icon}
          <span>{node.name}</span>
          {isPinned && <Pin className="document-pin-indicator" size={12} />}
        </button>
      );
    }

    const isOpen = Boolean(searchQuery.trim()) || openFolders.has(node.id);
    const isRenaming = renamingFolderId === node.id;
    if (isRenaming) {
      return (
        <div className="folder-branch" key={node.id}>
          <div className="folder-row" style={{ paddingLeft: `${6 + depth * 12}px` }}>
            <span />
            <Folder size={16} />
            <input
              className="document-rename-input"
              value={renameDraft}
              autoFocus
              onBlur={onRenameBlur}
              onChange={(event) => onRenameDraftChange(event.target.value)}
              onKeyDown={onRenameKeyDown}
            />
          </div>
          {isOpen && node.children.map((child) => renderTreeNode(child, depth + 1))}
        </div>
      );
    }

    return (
      <div className="folder-branch" key={node.id}>
        <button
          className="folder-row"
          type="button"
          aria-expanded={isOpen}
          style={{ paddingLeft: `${6 + depth * 12}px` }}
          onClick={() => onToggleFolder(node.id)}
          onContextMenu={(event) => onOpenFolderContextMenu(event, node)}
        >
          {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          <Folder size={16} />
          <span>{node.name}</span>
        </button>
        {isOpen && node.children.map((child) => renderTreeNode(child, depth + 1))}
      </div>
    );
  };

  return (
    <>
      <aside className={railOpen ? "file-rail" : "file-rail collapsed"} aria-label={t.files}>
        <div className="rail-header">
          <span>{t.files}</span>
          <div className="rail-header-actions">
            <button className="rail-action-button" type="button" title={t.openWorkspace} aria-label={t.openWorkspace} onClick={onOpenWorkspace}>
              <FolderOpen size={14} />
            </button>
            <button className="rail-action-button" type="button" title={t.newFile} aria-label={t.newFile} onClick={onCreateFile}>
              <FilePlus size={14} />
            </button>
            <button className="rail-action-button" type="button" title={t.newFolder} aria-label={t.newFolder} onClick={onCreateFolder}>
              <FolderPlus size={14} />
            </button>
          </div>
        </div>
        <label className="rail-search">
          <Search size={13} />
          <input
            className="rail-search-input"
            value={searchQuery}
            placeholder={t.searchFiles}
            onChange={(event) => onSearchQueryChange(event.target.value)}
          />
        </label>
        <div className="document-tree">{documentTree.map((node) => renderTreeNode(node))}</div>
      </aside>
      <button
        className="rail-resize-handle"
        type="button"
        aria-label={t.resizeFileRail}
        title={t.resizeFileRail}
        disabled={!railOpen}
        onPointerDown={onStartRailResize}
      />
      {contextMenuDocument && documentContextMenu && (
        <div
          className="document-context-menu"
          role="menu"
          style={{ left: documentContextMenu.x, top: documentContextMenu.y }}
          onPointerDown={(event) => event.stopPropagation()}
        >
          <button type="button" role="menuitem" onClick={() => onStartRenamingDocument(contextMenuDocument)}>
            <PencilLine size={14} />
            <span>{t.renameFile}</span>
          </button>
          <button type="button" role="menuitem" onClick={() => onTogglePinnedDocument(contextMenuDocument.id)}>
            <Pin size={14} />
            <span>{pinnedDocumentIdSet.has(contextMenuDocument.id) ? t.unpinFromTop : t.pinToTop}</span>
          </button>
          <button type="button" role="menuitem" className="danger" onClick={() => onDeleteDocument(contextMenuDocument.id)}>
            <Trash2 size={14} />
            <span>{t.deleteFile}</span>
          </button>
        </div>
      )}
      {folderContextMenu && (
        <div
          className="document-context-menu"
          role="menu"
          style={{ left: folderContextMenu.x, top: folderContextMenu.y }}
          onPointerDown={(event) => event.stopPropagation()}
        >
          <button type="button" role="menuitem" onClick={() => onStartRenamingFolder(folderContextMenu.folderPath)}>
            <PencilLine size={14} />
            <span>{t.renameFolder}</span>
          </button>
          <button type="button" role="menuitem" className="danger" onClick={() => onDeleteFolder(folderContextMenu.folderPath)}>
            <Trash2 size={14} />
            <span>{t.deleteFolder}</span>
          </button>
        </div>
      )}
    </>
  );
}
