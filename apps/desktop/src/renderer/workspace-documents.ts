import { createEditorDocument } from "@tickpad/editor-core";

import { normalizeEditorMarkdown, normalizeFolderPath } from "./document-model";
import type { LocalDocument, WorkspaceFile, WorkspaceResult } from "./types";

const getFileName = (path: string) => path.split(/[\\/]/).pop() ?? "Untitled.md";
const joinWorkspacePath = (rootPath: string, fileName: string) => `${rootPath.replace(/[\\/]+$/, "")}/${fileName}`;

function createEmptyWorkspaceDocument(rootPath: string): LocalDocument {
  const path = joinWorkspacePath(rootPath, "Untitled.md");
  return {
    ...createEditorDocument(""),
    id: `file:${path}`,
    path,
    title: "Untitled.md",
    markdown: "",
    dirty: true,
    updatedAt: Date.now(),
    format: "markdown",
    icon: "file",
    treePath: "Untitled.md"
  };
}

export function createWorkspaceDocuments(workspace: WorkspaceResult): LocalDocument[] {
  if (!workspace.files.length) {
    return [createEmptyWorkspaceDocument(workspace.rootPath)];
  }

  return workspace.files.map((file) => {
    const treePath = normalizeFolderPath(file.relativePath);
    const markdown = file.format === "plain" ? file.markdown : normalizeEditorMarkdown(file.markdown);
    return {
      ...createEditorDocument(markdown),
      id: `file:${file.path}`,
      path: file.path,
      title: getFileName(file.relativePath),
      markdown,
      dirty: false,
      updatedAt: Date.now(),
      format: file.format,
      icon: "file",
      treePath
    };
  });
}

export function getWorkspaceFoldersFromFiles(files: readonly WorkspaceFile[]) {
  const folders = new Set<string>();
  for (const file of files) {
    const segments = normalizeFolderPath(file.relativePath).split("/").slice(0, -1);
    for (let index = 1; index <= segments.length; index += 1) {
      folders.add(segments.slice(0, index).join("/"));
    }
  }
  return [...folders];
}
