import type { LocalDocument } from "./types";

export type TabCloseScope = "all" | "right" | "others";

export function getInitialOpenDocumentIds(documents: LocalDocument[]) {
  return documents.slice(0, 1).map((document) => document.id);
}

export function closeOpenDocumentId(openDocumentIds: string[], documentId: string) {
  return openDocumentIds.filter((id) => id !== documentId);
}

export function ensureOpenDocumentId(openDocumentIds: string[], documentId: string) {
  return openDocumentIds.includes(documentId) ? openDocumentIds : [...openDocumentIds, documentId];
}

export function closeOpenDocumentIdsByScope(openDocumentIds: string[], documentId: string, scope: TabCloseScope) {
  if (!openDocumentIds.includes(documentId)) {
    return openDocumentIds;
  }
  if (scope === "all") {
    return [];
  }
  if (openDocumentIds.length <= 1) {
    return openDocumentIds;
  }
  if (scope === "right") {
    return openDocumentIds.slice(0, openDocumentIds.indexOf(documentId) + 1);
  }
  return [documentId];
}

export function pruneOpenDocumentIds(openDocumentIds: string[], documents: LocalDocument[]) {
  const documentIds = new Set(documents.map((document) => document.id));
  return openDocumentIds.filter((id) => documentIds.has(id));
}

export function getTabDocuments(documents: LocalDocument[], openDocumentIds: string[]) {
  const documentById = new Map(documents.map((document) => [document.id, document]));
  return openDocumentIds.map((id) => documentById.get(id)).filter((document): document is LocalDocument => Boolean(document));
}

export function getNextActiveDocumentIdAfterTabClose(openDocumentIds: string[], activeDocumentId: string, closedDocumentId: string) {
  if (activeDocumentId !== closedDocumentId) {
    return activeDocumentId;
  }
  const closingIndex = openDocumentIds.indexOf(closedDocumentId);
  const nextOpenDocumentIds = closeOpenDocumentId(openDocumentIds, closedDocumentId);
  return nextOpenDocumentIds[Math.min(Math.max(closingIndex, 0), nextOpenDocumentIds.length - 1)] ?? activeDocumentId;
}

export function getNextActiveDocumentIdAfterScopedTabClose(
  openDocumentIds: string[],
  activeDocumentId: string,
  documentId: string,
  scope: TabCloseScope
) {
  const nextOpenDocumentIds = closeOpenDocumentIdsByScope(openDocumentIds, documentId, scope);
  return nextOpenDocumentIds.includes(activeDocumentId) ? activeDocumentId : nextOpenDocumentIds.at(-1) ?? activeDocumentId;
}
