import type { MarkdownDocument } from "@tickpad/shared";

export type DocumentFormat = "markdown" | "plain";

export type WorkspaceFile = {
  path: string;
  relativePath: string;
  markdown: string;
  format: DocumentFormat;
};

export type WorkspaceResult = {
  rootPath: string;
  files: WorkspaceFile[];
};

export type UpdateCheckResult = {
  currentVersion: string;
  latestVersion: string;
  available: boolean;
  checkedAt: string;
  downloadUrl?: string;
  notes?: string;
  error?: string;
};

export type LocalDocument = MarkdownDocument & {
  id: string;
  icon: "file" | "plugin";
  format?: DocumentFormat;
  treePath?: string;
};

export type DocumentContextMenuState = {
  documentId: string;
  x: number;
  y: number;
};

export type FolderContextMenuState = {
  folderPath: string;
  folderName: string;
  x: number;
  y: number;
};
