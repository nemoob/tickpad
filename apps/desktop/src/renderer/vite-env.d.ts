/// <reference types="vite/client" />

interface Window {
  tickpad?: {
    openMarkdown(): Promise<{ path: string; markdown: string; format: "markdown" | "plain" } | null>;
    openWorkspace(options?: OpenWorkspaceOptions): Promise<{
      rootPath: string;
      files: { path: string; relativePath: string; markdown: string; format: "markdown" | "plain" }[];
    } | null>;
    saveMarkdown(payload: { path?: string; markdown: string; format: "markdown" | "plain" }): Promise<{ path: string } | null>;
    exportPdf(): Promise<{ path: string } | null>;
    setAiSecret(payload: { profileId: string; baseUrl: string; apiKey: string }): Promise<void>;
    deleteAiSecret(profileId: string): Promise<void>;
    hasAiSecret(profileId: string): Promise<boolean>;
    completeAi(request: import("../main/ai-service").AiCompletionRequest): Promise<string>;
    exportProject(project: import("@tickpad/plugin-api").ProjectExportResult): Promise<{ path: string } | null>;
    openExternal(url: string): Promise<void>;
    checkForUpdates(): Promise<UpdateCheckResult>;
  };
}

type UpdateCheckResult = {
  currentVersion: string;
  latestVersion: string;
  available: boolean;
  checkedAt: string;
  downloadUrl?: string;
  notes?: string;
  error?: string;
};

type OpenWorkspaceOptions = {
  title?: string;
  buttonLabel?: string;
};
