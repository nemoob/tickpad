import { normalizeEscapedMarkdown, normalizeMarkdownInputSymbols, normalizeSplitMarkdownLinks } from "@tickpad/editor-core";

import { getDocumentTreeSegments } from "./document-tree";
import { sampleDocuments } from "./fixtures";
import { getMarkdownSymbolMappingEnabled } from "./preferences";
import type { DocumentFormat, LocalDocument } from "./types";

export function getDocumentFileName(document: LocalDocument) {
  return getDocumentTreeSegments(document).at(-1) ?? document.path?.split(/[\\/]/).pop() ?? document.title;
}

export function splitFileName(name: string) {
  const dotIndex = name.lastIndexOf(".");
  if (dotIndex > 0) {
    return { baseName: name.slice(0, dotIndex), extension: name.slice(dotIndex) };
  }
  return { baseName: name, extension: "" };
}

export function getDocumentParentPath(document: LocalDocument) {
  return getDocumentTreeSegments(document).slice(0, -1).join("/");
}

export function normalizeRenameName(document: LocalDocument, name: string) {
  const trimmed = name.trim().replace(/[\\/]+/g, "-");
  const currentName = getDocumentFileName(document);
  if (!trimmed) {
    return currentName;
  }
  const { extension } = splitFileName(currentName);
  return extension && !trimmed.includes(".") ? `${trimmed}${extension}` : trimmed;
}

export function formatStatusPath(path: string) {
  return path.replace(/\\/g, "/").replace(/^\/Users\/[^/]+(?=\/|$)/, "~");
}

export function normalizeFolderPath(path: string) {
  return path.split(/[\\/]/).filter(Boolean).join("/");
}

export function normalizeFolderName(name: string, fallback: string) {
  const normalized = normalizeFolderPath(name.trim().replace(/[\\/]+/g, "-"));
  return normalized.split("/").at(-1) || fallback;
}

export function joinTreePath(folderPath: string, name: string) {
  return folderPath ? `${folderPath}/${name}` : name;
}

function pathStartsWithFolder(path: string, folderPath: string) {
  return path === folderPath || path.startsWith(`${folderPath}/`);
}

function replaceFolderPrefix(path: string, folderPath: string, nextFolderPath: string) {
  if (path === folderPath) {
    return nextFolderPath;
  }
  return pathStartsWithFolder(path, folderPath) ? `${nextFolderPath}${path.slice(folderPath.length)}` : path;
}

function getDocumentTreePath(document: LocalDocument) {
  return getDocumentTreeSegments(document).join("/");
}

export function renameFolderByPath(documents: LocalDocument[], folders: string[], folderPath: string, nextName: string) {
  const normalizedFolderPath = normalizeFolderPath(folderPath);
  const segments = normalizedFolderPath.split("/");
  const currentName = segments.at(-1) ?? normalizedFolderPath;
  const parentPath = segments.slice(0, -1).join("/");
  const nextFolderPath = joinTreePath(parentPath, normalizeFolderName(nextName, currentName));
  const renamePath = (path: string) => replaceFolderPrefix(normalizeFolderPath(path), normalizedFolderPath, nextFolderPath);

  return {
    documents: documents.map((document) => {
      const treePath = getDocumentTreePath(document);
      return pathStartsWithFolder(treePath, normalizedFolderPath) ? { ...document, treePath: renamePath(treePath), updatedAt: Date.now() } : document;
    }),
    folders: folders.map(renamePath)
  };
}

export function deleteFolderByPath(documents: LocalDocument[], folders: string[], folderPath: string) {
  const normalizedFolderPath = normalizeFolderPath(folderPath);

  return {
    documents: documents.filter((document) => !pathStartsWithFolder(getDocumentTreeSegments(document).slice(0, -1).join("/"), normalizedFolderPath)),
    folders: folders.filter((folder) => !pathStartsWithFolder(normalizeFolderPath(folder), normalizedFolderPath))
  };
}

export function getFolderIdsFromPath(folderPath: string) {
  const segments = normalizeFolderPath(folderPath).split("/").filter(Boolean);
  return segments.map((_, index) => `root/${segments.slice(0, index + 1).join("/")}`);
}

export function getCurrentFolderPath(document: LocalDocument) {
  const folderSegments = getDocumentTreeSegments(document).slice(0, -1);
  return folderSegments.length ? folderSegments.join("/") : "Docs";
}

export function createUniqueName(existingNames: Iterable<string>, baseName: string, extension = "") {
  const existing = new Set(existingNames);
  const firstName = `${baseName}${extension}`;
  if (!existing.has(firstName)) {
    return firstName;
  }
  for (let index = 2; index < 1000; index += 1) {
    const name = `${baseName} ${index}${extension}`;
    if (!existing.has(name)) {
      return name;
    }
  }
  return `${baseName} ${Date.now()}${extension}`;
}

export function getChildFolderNames(documents: LocalDocument[], folders: string[], parentPath: string) {
  const parentSegments = normalizeFolderPath(parentPath).split("/").filter(Boolean);
  const names = new Set<string>();
  const appendChildName = (folderPath: string) => {
    const segments = normalizeFolderPath(folderPath).split("/").filter(Boolean);
    if (segments.length <= parentSegments.length) {
      return;
    }
    if (parentSegments.every((segment, index) => segment === segments[index])) {
      names.add(segments[parentSegments.length]);
    }
  };

  for (const folder of folders) {
    appendChildName(folder);
  }
  for (const document of documents) {
    appendChildName(getDocumentTreeSegments(document).slice(0, -1).join("/"));
  }
  return names;
}

export function normalizeEditorMarkdown(markdown: string, options = { normalizeInputSymbols: getMarkdownSymbolMappingEnabled() }) {
  const inputMarkdown = options.normalizeInputSymbols ? normalizeMarkdownInputSymbols(markdown) : markdown;
  return normalizeSplitMarkdownLinks(normalizeEscapedMarkdown(inputMarkdown));
}

export function getDocumentFormat(filePath: string | undefined, fallback: DocumentFormat = "markdown"): DocumentFormat {
  const fileName = filePath?.split(/[\\/]/).pop() ?? "";
  const dotIndex = fileName.lastIndexOf(".");
  const extension = dotIndex > 0 ? fileName.slice(dotIndex).toLowerCase() : "";
  if (extension === ".md" || extension === ".markdown") {
    return "markdown";
  }
  if (extension === ".txt" || extension === "") {
    return "plain";
  }
  return fallback;
}

export function getDocumentFormatFromDocument(document: Pick<LocalDocument, "format" | "path" | "title" | "treePath">): DocumentFormat {
  return document.format ?? getDocumentFormat(document.path ?? document.treePath ?? document.title, "markdown");
}

export function getDocuments(): LocalDocument[] {
  const raw = localStorage.getItem("tickpad:documents");
  if (!raw) {
    return sampleDocuments;
  }
  try {
    const parsed = (JSON.parse(raw) as LocalDocument[]).map((document) => {
      const sample = sampleDocuments.find((item) => item.id === document.id);
      const format = getDocumentFormatFromDocument(document);
      const normalizedDocument = {
        ...document,
        format,
        markdown: format === "plain" ? document.markdown : normalizeEditorMarkdown(document.markdown)
      };
      return sample
        ? { ...sample, ...normalizedDocument, icon: document.icon ?? sample.icon, treePath: document.treePath ?? sample.treePath }
        : normalizedDocument;
    });
    if (!parsed.length) {
      return sampleDocuments;
    }
    const missingSamples = sampleDocuments.filter((sample) => !parsed.some((document) => document.id === sample.id));
    return [...parsed, ...missingSamples];
  } catch {
    return sampleDocuments;
  }
}

export function getFolders() {
  const raw = localStorage.getItem("tickpad:folders");
  if (!raw) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string").map(normalizeFolderPath).filter(Boolean) : [];
  } catch {
    return [];
  }
}

export function getPinnedDocumentIds() {
  const raw = localStorage.getItem("tickpad:pinned-documents");
  if (!raw) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}
