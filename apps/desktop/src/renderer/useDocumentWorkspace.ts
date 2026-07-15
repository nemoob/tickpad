import type { FocusEvent, KeyboardEvent, MouseEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { createEditorDocument, updateMarkdown } from "@tickpad/editor-core";

import { buildDocumentTree, filterDocumentTree, getDocumentFolderIds, getDocumentTreeSegments, sortDocumentsForRail, type DocumentTreeNode } from "./document-tree";
import {
  createUniqueName,
  deleteFolderByPath,
  formatStatusPath,
  getChildFolderNames,
  getCurrentFolderPath,
  getDocumentFileName,
  getDocumentFormat,
  getDocumentFormatFromDocument,
  getDocumentParentPath,
  getDocuments,
  getFolderIdsFromPath,
  getFolders,
  getPinnedDocumentIds,
  joinTreePath,
  normalizeEditorMarkdown,
  normalizeFolderName,
  normalizeFolderPath,
  normalizeRenameName,
  renameFolderByPath,
  splitFileName
} from "./document-model";
import { buildDocumentOutline } from "./document-outline";
import { closeOpenDocumentId, closeOpenDocumentIdsByScope, ensureOpenDocumentId, getInitialOpenDocumentIds, getNextActiveDocumentIdAfterScopedTabClose, getNextActiveDocumentIdAfterTabClose, getTabDocuments, pruneOpenDocumentIds, type TabCloseScope } from "./document-tabs";
import { sampleDocuments } from "./fixtures";
import type { LastSavedKey } from "./i18n";
import type { DocumentContextMenuState, FolderContextMenuState, LocalDocument } from "./types";
import { createWorkspaceDocuments, getWorkspaceFoldersFromFiles } from "./workspace-documents";

const getFolderPathFromId = (folderId: string) => folderId.replace(/^root\/?/, "");
const getFolderIdFromPath = (folderPath: string) => `root/${normalizeFolderPath(folderPath)}`;
const folderPathStartsWith = (path: string, folderPath: string) => path === folderPath || path.startsWith(`${folderPath}/`);

type ConfirmWorkspaceReplace = () => Promise<boolean>;

export function useDocumentWorkspace(confirmWorkspaceReplace: ConfirmWorkspaceReplace = async () => true) {
  const [documents, setDocuments] = useState<LocalDocument[]>(() => getDocuments());
  const [openDocumentIds, setOpenDocumentIds] = useState(() => getInitialOpenDocumentIds(documents));
  const [folders, setFolders] = useState<string[]>(() => getFolders());
  const [activeDocumentId, setActiveDocumentId] = useState(() => documents[0]?.id ?? sampleDocuments[0].id);
  const [editorRevision, setEditorRevision] = useState(0);
  const [openFolders, setOpenFolders] = useState<Set<string>>(() => new Set(["root/Docs", "root/Plugins"]));
  const [pinnedDocumentIds, setPinnedDocumentIds] = useState<string[]>(() => getPinnedDocumentIds());
  const [documentContextMenu, setDocumentContextMenu] = useState<DocumentContextMenuState | null>(null);
  const [folderContextMenu, setFolderContextMenu] = useState<FolderContextMenuState | null>(null);
  const [renamingDocumentId, setRenamingDocumentId] = useState<string | null>(null);
  const [renamingFolderId, setRenamingFolderId] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [lastSaved, setLastSaved] = useState<LastSavedKey>("autosaved");

  const doc = documents.find((document) => document.id === activeDocumentId) ?? documents[0] ?? sampleDocuments[0];
  const docFormat = getDocumentFormatFromDocument(doc);
  const pinnedDocumentIdSet = useMemo(() => new Set(pinnedDocumentIds), [pinnedDocumentIds]);
  const fullDocumentTree = useMemo(
    () => buildDocumentTree(sortDocumentsForRail(documents, pinnedDocumentIdSet), folders),
    [documents, folders, pinnedDocumentIdSet]
  );
  const documentTree = useMemo(() => filterDocumentTree(fullDocumentTree, searchQuery), [fullDocumentTree, searchQuery]);
  const editorOutlineItems = useMemo(() => (docFormat === "plain" ? [] : buildDocumentOutline(doc.markdown)), [doc.markdown, docFormat]);
  const fileName = getDocumentFileName(doc);
  const currentDocumentPath = doc.path ?? doc.treePath ?? fileName;
  const statusDocumentPath = formatStatusPath(currentDocumentPath);
  const tabDocuments = useMemo(() => getTabDocuments(documents, pruneOpenDocumentIds(openDocumentIds, documents)), [documents, openDocumentIds]);
  const hasOpenDocument = tabDocuments.length > 0;
  const contextMenuDocument = documentContextMenu ? documents.find((document) => document.id === documentContextMenu.documentId) : undefined;

  useEffect(() => {
    localStorage.setItem("tickpad:documents", JSON.stringify(documents));
    const timer = window.setTimeout(() => setLastSaved("autosavedJustNow"), 250);
    return () => window.clearTimeout(timer);
  }, [documents]);

  useEffect(() => {
    localStorage.setItem("tickpad:folders", JSON.stringify(folders));
  }, [folders]);

  useEffect(() => {
    localStorage.setItem("tickpad:pinned-documents", JSON.stringify(pinnedDocumentIds));
  }, [pinnedDocumentIds]);

  useEffect(() => {
    if (!documentContextMenu && !folderContextMenu) {
      return;
    }

    const closeMenu = () => {
      setDocumentContextMenu(null);
      setFolderContextMenu(null);
    };
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
  }, [documentContextMenu, folderContextMenu]);

  const updateDocumentMarkdown = (markdown: string, forceEditorRefresh = false) => {
    if (docFormat === "plain") {
      setDocuments((current) =>
        current.map((document) =>
          document.id === doc.id ? { ...document, format: "plain", markdown, dirty: true, updatedAt: Date.now() } : document
        )
      );
      return;
    }

    const normalizedMarkdown = normalizeEditorMarkdown(markdown);
    if (normalizedMarkdown !== markdown || forceEditorRefresh) {
      setEditorRevision((value) => value + 1);
    }
    setDocuments((current) =>
      current.map((document) =>
        document.id === doc.id ? { ...updateMarkdown(document, normalizedMarkdown), id: document.id, icon: document.icon } : document
      )
    );
  };

  const selectDocument = (document: LocalDocument) => {
    setOpenDocumentIds((current) => ensureOpenDocumentId(pruneOpenDocumentIds(current, documents), document.id));
    setActiveDocumentId(document.id);
    setLastSaved(document.dirty ? "unsavedChanges" : "openedLocalDraft");
  };

  const cancelRenamingDocument = () => {
    setRenamingDocumentId(null);
    setRenamingFolderId(null);
    setRenameDraft("");
  };

  const removeDocumentFromWorkspace = (documentId: string) => {
    if (documents.length <= 1) {
      return;
    }

    const targetIndex = documents.findIndex((document) => document.id === documentId);
    if (targetIndex < 0) {
      return;
    }

    const nextDocuments = documents.filter((document) => document.id !== documentId);
    setDocuments(nextDocuments);
    setOpenDocumentIds((current) => pruneOpenDocumentIds(current.filter((id) => id !== documentId), nextDocuments));
    setPinnedDocumentIds((current) => current.filter((id) => id !== documentId));
    if (activeDocumentId === documentId) {
      const nextActiveDocument = nextDocuments[Math.min(targetIndex, nextDocuments.length - 1)] ?? nextDocuments[0];
      setActiveDocumentId(nextActiveDocument.id);
      setLastSaved(nextActiveDocument.dirty ? "unsavedChanges" : "openedLocalDraft");
    }
    if (renamingDocumentId === documentId) {
      cancelRenamingDocument();
    }
  };

  const closeDocumentTab = (event: MouseEvent<HTMLButtonElement>, documentId: string) => {
    event.preventDefault();
    event.stopPropagation();
    const currentOpenDocumentIds = pruneOpenDocumentIds(openDocumentIds, documents);
    const nextActiveDocumentId = getNextActiveDocumentIdAfterTabClose(currentOpenDocumentIds, activeDocumentId, documentId);
    const nextOpenDocumentIds = closeOpenDocumentId(currentOpenDocumentIds, documentId);
    setOpenDocumentIds(nextOpenDocumentIds);
    if (nextActiveDocumentId !== activeDocumentId) {
      setActiveDocumentId(nextActiveDocumentId);
      const nextDocument = documents.find((document) => document.id === nextActiveDocumentId);
      setLastSaved(nextDocument?.dirty ? "unsavedChanges" : "openedLocalDraft");
    }
  };

  const closeDocumentTabsByScope = (documentId: string, scope: TabCloseScope) => {
    const currentOpenDocumentIds = pruneOpenDocumentIds(openDocumentIds, documents);
    const nextActiveDocumentId = getNextActiveDocumentIdAfterScopedTabClose(currentOpenDocumentIds, activeDocumentId, documentId, scope);
    const nextOpenDocumentIds = closeOpenDocumentIdsByScope(currentOpenDocumentIds, documentId, scope);
    setOpenDocumentIds(nextOpenDocumentIds);
    if (nextActiveDocumentId !== activeDocumentId) {
      setActiveDocumentId(nextActiveDocumentId);
      const nextDocument = documents.find((document) => document.id === nextActiveDocumentId);
      setLastSaved(nextDocument?.dirty ? "unsavedChanges" : "openedLocalDraft");
    }
  };

  const openDocumentContextMenu = (event: MouseEvent<HTMLButtonElement>, document: LocalDocument) => {
    event.preventDefault();
    event.stopPropagation();
    setActiveDocumentId(document.id);
    setDocumentContextMenu({
      documentId: document.id,
      x: Math.min(event.clientX, window.innerWidth - 180),
      y: Math.min(event.clientY, window.innerHeight - 140)
    });
  };

  const openFolderContextMenu = (event: MouseEvent<HTMLButtonElement>, folder: DocumentTreeNode<LocalDocument>) => {
    event.preventDefault();
    event.stopPropagation();
    setDocumentContextMenu(null);
    setFolderContextMenu({
      folderPath: getFolderPathFromId(folder.id),
      folderName: folder.name,
      x: Math.min(event.clientX, window.innerWidth - 180),
      y: Math.min(event.clientY, window.innerHeight - 120)
    });
  };

  const closeDocumentContextMenu = () => {
    setDocumentContextMenu(null);
    setFolderContextMenu(null);
  };

  const startRenamingDocument = (document: LocalDocument) => {
    setRenamingDocumentId(document.id);
    setRenameDraft(getDocumentFileName(document));
    closeDocumentContextMenu();
  };

  const startRenamingFolder = (folderPath: string) => {
    const normalizedFolderPath = normalizeFolderPath(folderPath);
    setRenamingFolderId(getFolderIdFromPath(normalizedFolderPath));
    setRenameDraft(normalizedFolderPath.split("/").at(-1) ?? normalizedFolderPath);
    closeDocumentContextMenu();
  };

  const commitRenamingDocument = () => {
    if (!renamingDocumentId) {
      return;
    }
    const target = documents.find((document) => document.id === renamingDocumentId);
    if (!target) {
      cancelRenamingDocument();
      return;
    }

    const parentPath = getDocumentParentPath(target);
    const normalizedName = normalizeRenameName(target, renameDraft);
    const { baseName, extension } = splitFileName(normalizedName);
    const siblingNames = documents
      .filter((document) => document.id !== target.id && getDocumentParentPath(document) === parentPath)
      .map((document) => getDocumentFileName(document));
    const uniqueName = createUniqueName(siblingNames, baseName, extension);

    setDocuments((current) =>
      current.map((document) =>
        document.id === target.id ? { ...document, title: uniqueName, treePath: joinTreePath(parentPath, uniqueName), updatedAt: Date.now() } : document
      )
    );
    cancelRenamingDocument();
  };

  const commitRenamingFolder = () => {
    if (!renamingFolderId) {
      return;
    }
    const folderPath = getFolderPathFromId(renamingFolderId);
    const parentPath = folderPath.split("/").slice(0, -1).join("/");
    const currentName = folderPath.split("/").at(-1) ?? folderPath;
    const nextName = normalizeFolderName(renameDraft, currentName);
    const siblingNames = [...getChildFolderNames(documents, folders, parentPath)].filter((name) => name !== currentName);
    const uniqueName = createUniqueName(siblingNames, nextName);
    const nextFolderPath = joinTreePath(parentPath, uniqueName);
    const result = renameFolderByPath(documents, folders, folderPath, uniqueName);

    setDocuments(result.documents);
    setOpenDocumentIds((current) => pruneOpenDocumentIds(current, result.documents));
    setFolders(result.folders);
    setOpenFolders(
      (current) =>
        new Set(
          [...current].map((folderId) => {
            const openFolderPath = getFolderPathFromId(folderId);
            return folderPathStartsWith(openFolderPath, folderPath)
              ? getFolderIdFromPath(`${nextFolderPath}${openFolderPath.slice(folderPath.length)}`)
              : folderId;
          })
        )
    );
    cancelRenamingDocument();
  };

  const commitRename = () => {
    if (renamingFolderId) {
      commitRenamingFolder();
      return;
    }
    commitRenamingDocument();
  };

  const handleRenameKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      commitRename();
    }
    if (event.key === "Escape") {
      event.preventDefault();
      event.currentTarget.dataset.cancelRename = "true";
      cancelRenamingDocument();
    }
  };

  const handleRenameBlur = (event: FocusEvent<HTMLInputElement>) => {
    if (event.currentTarget.dataset.cancelRename === "true") {
      return;
    }
    commitRename();
  };

  const deleteDocument = (documentId: string) => {
    removeDocumentFromWorkspace(documentId);
    closeDocumentContextMenu();
  };

  const togglePinnedDocument = (documentId: string) => {
    setPinnedDocumentIds((current) => (current.includes(documentId) ? current.filter((id) => id !== documentId) : [documentId, ...current]));
    closeDocumentContextMenu();
  };

  const deleteFolder = (folderPath: string) => {
    const result = deleteFolderByPath(documents, folders, folderPath);
    if (!result.documents.length) {
      closeDocumentContextMenu();
      return;
    }
    setDocuments(result.documents);
    setFolders(result.folders);
    setPinnedDocumentIds((current) => current.filter((id) => result.documents.some((document) => document.id === id)));
    setOpenFolders(
      (current) =>
        new Set([...current].filter((folderId) => !folderPathStartsWith(getFolderPathFromId(folderId), normalizeFolderPath(folderPath))))
    );
    if (!result.documents.some((document) => document.id === activeDocumentId)) {
      const nextDocument = result.documents[0];
      setActiveDocumentId(nextDocument.id);
      setLastSaved(nextDocument.dirty ? "unsavedChanges" : "openedLocalDraft");
    }
    closeDocumentContextMenu();
  };

  const toggleFolder = (folderId: string) => {
    setOpenFolders((current) => {
      const next = new Set(current);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  const createLocalFile = () => {
    const folderPath = getCurrentFolderPath(doc);
    const siblingNames = documents
      .filter((document) => getDocumentTreeSegments(document).slice(0, -1).join("/") === folderPath)
      .map((document) => getDocumentTreeSegments(document).at(-1) ?? document.title);
    const fileName = createUniqueName(siblingNames, "Untitled", ".md");
    const nextDocument: LocalDocument = {
      ...createEditorDocument(""),
      id: `local:${Date.now()}`,
      title: fileName,
      markdown: "",
      dirty: true,
      updatedAt: Date.now(),
      format: "markdown",
      icon: "file",
      treePath: joinTreePath(folderPath, fileName)
    };
    setDocuments((current) => [nextDocument, ...current]);
    setOpenDocumentIds((current) => ensureOpenDocumentId(current, nextDocument.id));
    setOpenFolders((current) => new Set([...current, ...getDocumentFolderIds(nextDocument)]));
    setActiveDocumentId(nextDocument.id);
    setLastSaved("unsavedChanges");
  };

  const createLocalFolder = () => {
    const parentPath = getCurrentFolderPath(doc);
    const folderName = createUniqueName(getChildFolderNames(documents, folders, parentPath), "New Folder");
    const folderPath = joinTreePath(parentPath, folderName);
    setFolders((current) => (current.includes(folderPath) ? current : [folderPath, ...current]));
    setOpenFolders((current) => new Set([...current, ...getFolderIdsFromPath(folderPath)]));
  };

  const openMarkdown = async () => {
    const result = await window.tickpad?.openMarkdown();
    if (!result) {
      return;
    }
    const format = result.format ?? getDocumentFormat(result.path, "markdown");
    const openedDocument: LocalDocument = {
      id: `file:${result.path}`,
      path: result.path,
      title: result.path.split(/[\\/]/).pop() ?? "Untitled.md",
      markdown: format === "plain" ? result.markdown : normalizeEditorMarkdown(result.markdown),
      dirty: false,
      updatedAt: Date.now(),
      format,
      icon: "file"
    };
    setDocuments((current) => {
      const exists = current.some((document) => document.id === openedDocument.id);
      return exists ? current.map((document) => (document.id === openedDocument.id ? openedDocument : document)) : [openedDocument, ...current];
    });
    setOpenDocumentIds((current) => ensureOpenDocumentId(pruneOpenDocumentIds(current, documents), openedDocument.id));
    setOpenFolders((current) => new Set([...current, ...getDocumentFolderIds(openedDocument)]));
    setActiveDocumentId(openedDocument.id);
    setLastSaved("openedFromDisk");
  };

  const openWorkspace = async (options?: OpenWorkspaceOptions) => {
    const result = await window.tickpad?.openWorkspace(options);
    if (!result) {
      return;
    }
    if (documents.some((document) => document.dirty)) {
      const shouldReplace = await confirmWorkspaceReplace();
      if (!shouldReplace) {
        return;
      }
    }
    const openedDocuments = createWorkspaceDocuments(result);
    const workspaceFolders = getWorkspaceFoldersFromFiles(result.files);
    setDocuments(openedDocuments);
    setFolders(workspaceFolders);
    setPinnedDocumentIds([]);
    setOpenDocumentIds([openedDocuments[0].id]);
    setOpenFolders(new Set(workspaceFolders.flatMap(getFolderIdsFromPath)));
    setActiveDocumentId(openedDocuments[0].id);
    setLastSaved(openedDocuments[0].dirty ? "unsavedChanges" : "openedFromDisk");
  };

  const saveMarkdown = async (onSaved: (path: string) => Promise<void>) => {
    const result = await window.tickpad?.saveMarkdown({ path: doc.path, markdown: doc.markdown, format: docFormat });
    if (!result) {
      return;
    }
    setDocuments((current) =>
      current.map((document) =>
        document.id === doc.id ? { ...document, path: result.path, format: getDocumentFormat(result.path, docFormat), dirty: false, updatedAt: Date.now() } : document
      )
    );
    await onSaved(result.path);
    setLastSaved("savedToDisk");
  };

  return {
    contextMenuDocument,
    currentDocumentPath,
    deleteDocument,
    deleteFolder,
    doc,
    docFormat,
    documentContextMenu,
    documentTree,
    editorOutlineItems,
    editorRevision,
    fileName,
    folderContextMenu,
    hasOpenDocument,
    handleRenameBlur,
    handleRenameKeyDown,
    lastSaved,
    openFolders,
    pinnedDocumentIdSet,
    renameDraft,
    renamingDocumentId,
    renamingFolderId,
    searchQuery,
    statusDocumentPath,
    tabDocuments,
    createLocalFile,
    createLocalFolder,
    closeDocumentTab,
    closeDocumentTabsByScope,
    openDocumentContextMenu,
    openFolderContextMenu,
    openMarkdown,
    openWorkspace,
    saveMarkdown,
    selectDocument,
    setLastSaved,
    setRenameDraft,
    setSearchQuery,
    startRenamingFolder,
    startRenamingDocument,
    toggleFolder,
    togglePinnedDocument,
    updateDocumentMarkdown
  };
}
