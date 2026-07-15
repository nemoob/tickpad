import { contextBridge, ipcRenderer } from "electron";
import type { ProjectExportResult } from "@tickpad/plugin-api";
// import type { AiCompletionRequest } from "../main/ai-service";

export type DocumentFormat = "markdown" | "plain";

export type MarkdownFileResult = {
  path: string;
  format: DocumentFormat;
  markdown: string;
} | null;

export type WorkspaceResult = {
  rootPath: string;
  files: { path: string; relativePath: string; format: DocumentFormat; markdown: string }[];
} | null;

export type OpenWorkspaceOptions = {
  title?: string;
  buttonLabel?: string;
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

const api = {
  openMarkdown: () => ipcRenderer.invoke("dialog:openMarkdown") as Promise<MarkdownFileResult>,
  openWorkspace: (options?: OpenWorkspaceOptions) => ipcRenderer.invoke("dialog:openWorkspace", options) as Promise<WorkspaceResult>,
  saveMarkdown: (payload: { path?: string; markdown: string; format: DocumentFormat }) =>
    ipcRenderer.invoke("dialog:saveMarkdown", payload) as Promise<{ path: string } | null>,
  exportPdf: () => ipcRenderer.invoke("dialog:exportPdf") as Promise<{ path: string } | null>,
  /* Temporarily disabled for the first public release.
  setAiSecret: (payload: { profileId: string; baseUrl: string; apiKey: string }) =>
    ipcRenderer.invoke("ai:setSecret", payload) as Promise<void>,
  deleteAiSecret: (profileId: string) => ipcRenderer.invoke("ai:deleteSecret", profileId) as Promise<void>,
  hasAiSecret: (profileId: string) => ipcRenderer.invoke("ai:hasSecret", profileId) as Promise<boolean>,
  completeAi: (request: AiCompletionRequest) => ipcRenderer.invoke("ai:complete", request) as Promise<string>,
  */
  exportProject: (project: ProjectExportResult) =>
    ipcRenderer.invoke("dialog:exportProject", project) as Promise<{ path: string } | null>,
  openExternal: (url: string) => ipcRenderer.invoke("shell:openExternal", url) as Promise<void>,
  checkForUpdates: () => ipcRenderer.invoke("app:checkForUpdates") as Promise<UpdateCheckResult>
};

contextBridge.exposeInMainWorld("tickpad", api);
