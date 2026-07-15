import { BrowserWindow, app, dialog, ipcMain, /* safeStorage, */ shell, type IpcMainInvokeEvent } from "electron";
import { readFile, readdir, writeFile } from "node:fs/promises";
import { extname, join, relative } from "node:path";
import type { ProjectExportResult } from "@tickpad/plugin-api";

// import { createAiCompletionService, createAiSecretVault, type AiCompletionRequest } from "./ai-service";
import { exportProjectToDirectory, validateProjectExport } from "./project-export";

type SavePayload = {
  path?: string;
  markdown: string;
  format?: DocumentFormat;
};

type OpenWorkspaceOptions = {
  title?: string;
  buttonLabel?: string;
};

/* Temporarily disabled for the first public release.
type SetAiSecretPayload = {
  profileId: string;
  baseUrl: string;
  apiKey: string;
};
*/

type UpdateCheckResult = {
  currentVersion: string;
  latestVersion: string;
  available: boolean;
  checkedAt: string;
  downloadUrl?: string;
  notes?: string;
  error?: string;
};

type DocumentFormat = "markdown" | "plain";

const isMarkdownPath = (filePath: string) => [".md", ".markdown"].includes(extname(filePath).toLowerCase());
const isPlainTextPath = (filePath: string) => {
  const extension = extname(filePath).toLowerCase();
  return extension === ".txt" || extension === "";
};
const ignoredWorkspaceFolders = new Set([".git", "node_modules", "dist", "out", "release"]);

const isSupportedWorkspacePath = (filePath: string) => isMarkdownPath(filePath) || isPlainTextPath(filePath);

const getDocumentFormat = (filePath: string): DocumentFormat => {
  if (isMarkdownPath(filePath)) {
    return "markdown";
  }
  if (isPlainTextPath(filePath)) {
    return "plain";
  }
  throw new Error("Only Markdown and plain text files can be opened.");
};

const isExternalHttpUrl = (url: unknown): url is string => {
  if (typeof url !== "string") {
    return false;
  }
  try {
    const { protocol } = new URL(url);
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
};

const getStringField = (value: unknown) => (typeof value === "string" && value.trim() ? value.trim() : undefined);
const getUpdateManifestUrl = () => {
  const url = process.env.TICKPAD_UPDATE_MANIFEST_URL;
  return isExternalHttpUrl(url) ? url : undefined;
};

const getDialogText = (value: unknown) => (typeof value === "string" && value.trim() ? value : undefined);

function compareVersions(left: string, right: string) {
  const toParts = (version: string) =>
    version
      .replace(/^v/i, "")
      .split(/[.-]/)
      .map((part) => Number.parseInt(part, 10))
      .map((part) => (Number.isFinite(part) ? part : 0));
  const leftParts = toParts(left);
  const rightParts = toParts(right);
  const length = Math.max(leftParts.length, rightParts.length);

  for (let index = 0; index < length; index += 1) {
    const diff = (leftParts[index] ?? 0) - (rightParts[index] ?? 0);
    if (diff !== 0) {
      return diff;
    }
  }
  return 0;
}

async function checkForUpdates(): Promise<UpdateCheckResult> {
  const currentVersion = app.getVersion();
  const manifestUrl = getUpdateManifestUrl();
  const checkedAt = new Date().toISOString();

  if (!manifestUrl) {
    return { currentVersion, latestVersion: currentVersion, available: false, checkedAt };
  }

  try {
    const response = await fetch(manifestUrl, { headers: { accept: "application/json" } });
    if (!response.ok) {
      throw new Error(`Update manifest returned ${response.status}`);
    }
    const manifest = (await response.json()) as Record<string, unknown>;
    const latestVersion = getStringField(manifest.version) ?? currentVersion;
    const downloadUrl = getStringField(manifest.downloadUrl) ?? getStringField(manifest.url);
    const notes = getStringField(manifest.notes);

    return {
      currentVersion,
      latestVersion,
      available: compareVersions(latestVersion, currentVersion) > 0,
      checkedAt,
      downloadUrl: isExternalHttpUrl(downloadUrl) ? downloadUrl : undefined,
      notes
    };
  } catch (error) {
    return {
      currentVersion,
      latestVersion: currentVersion,
      available: false,
      checkedAt,
      error: error instanceof Error ? error.message : "Update check failed"
    };
  }
}

async function collectWorkspaceFiles(rootPath: string, currentPath = rootPath) {
  const entries = (await readdir(currentPath, { withFileTypes: true })).sort((left, right) => left.name.localeCompare(right.name));
  const files: { path: string; relativePath: string; format: DocumentFormat; markdown: string }[] = [];

  for (const entry of entries) {
    const entryPath = join(currentPath, entry.name);
    if (entry.isDirectory()) {
      if (!ignoredWorkspaceFolders.has(entry.name) && !entry.name.startsWith(".")) {
        files.push(...(await collectWorkspaceFiles(rootPath, entryPath)));
      }
      continue;
    }
    if (!entry.isFile() || !isSupportedWorkspacePath(entryPath)) {
      continue;
    }
    files.push({
      path: entryPath,
      relativePath: relative(rootPath, entryPath).replaceAll("\\", "/"),
      format: getDocumentFormat(entryPath),
      markdown: await readFile(entryPath, "utf8")
    });
  }

  return files;
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1320,
    height: 860,
    minWidth: 980,
    minHeight: 680,
    title: "Tickpad",
    titleBarStyle: "hiddenInset",
    trafficLightPosition: { x: 18, y: 18 },
    backgroundColor: "#f7f8f4",
    webPreferences: {
      preload: join(__dirname, "../preload/index.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true
    }
  });

  if (process.env.ELECTRON_RENDERER_URL) {
    void win.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    void win.loadFile(join(__dirname, "../renderer/index.html"));
  }

  return win;
}

app.whenReady().then(() => {
  const win = createWindow();
  /* Temporarily disabled for the first public release.
  const aiSecrets = createAiSecretVault({
    filePath: join(app.getPath("userData"), "ai-secrets.json"),
    encryption: safeStorage
  });
  const aiCompletion = createAiCompletionService({ secrets: aiSecrets });
  */
  const requireTrustedSender = (event: IpcMainInvokeEvent) => {
    if (event.sender !== win.webContents || event.senderFrame !== win.webContents.mainFrame) {
      throw new Error("Untrusted desktop request.");
    }
  };

  ipcMain.handle("dialog:openMarkdown", async () => {
    const result = await dialog.showOpenDialog(win, {
      properties: ["openFile"],
      filters: [
        { name: "Text documents", extensions: ["md", "markdown", "txt"] },
        { name: "All files", extensions: ["*"] }
      ]
    });
    if (result.canceled || !result.filePaths[0]) {
      return null;
    }
    const filePath = result.filePaths[0];
    return {
      path: filePath,
      format: getDocumentFormat(filePath),
      markdown: await readFile(filePath, "utf8")
    };
  });

  ipcMain.handle("dialog:openWorkspace", async (_, options?: OpenWorkspaceOptions) => {
    const dialogOptions = {
      title: getDialogText(options?.title),
      buttonLabel: getDialogText(options?.buttonLabel)
    };
    const result = await dialog.showOpenDialog(win, {
      title: dialogOptions.title,
      buttonLabel: dialogOptions.buttonLabel,
      properties: ["openDirectory"]
    });
    if (result.canceled || !result.filePaths[0]) {
      return null;
    }
    const rootPath = result.filePaths[0];
    return {
      rootPath,
      files: await collectWorkspaceFiles(rootPath)
    };
  });

  ipcMain.handle("dialog:saveMarkdown", async (_, payload: SavePayload) => {
    if (!payload || typeof payload.markdown !== "string") {
      throw new Error("Invalid save payload.");
    }
    const format = payload.format === "plain" ? "plain" : "markdown";
    let filePath = payload.path;
    if (!filePath) {
      const result = await dialog.showSaveDialog(win, {
        filters:
          format === "plain"
            ? [{ name: "Plain text", extensions: ["txt"] }]
            : [{ name: "Markdown", extensions: ["md"] }]
      });
      if (result.canceled || !result.filePath) {
        return null;
      }
      filePath = result.filePath;
    }
    if (format === "markdown" && !isMarkdownPath(filePath)) {
      filePath = `${filePath}.md`;
    }
    await writeFile(filePath, payload.markdown, "utf8");
    return { path: filePath };
  });

  ipcMain.handle("dialog:exportPdf", async () => {
    const result = await dialog.showSaveDialog(win, {
      filters: [{ name: "PDF", extensions: ["pdf"] }]
    });
    if (result.canceled || !result.filePath) {
      return null;
    }
    const pdf = await win.webContents.printToPDF({ printBackground: true, pageSize: "A4" });
    await writeFile(result.filePath, pdf);
    void shell.showItemInFolder(result.filePath);
    return { path: result.filePath };
  });

  /* Temporarily disabled for the first public release.
  ipcMain.handle("ai:setSecret", async (event, payload: SetAiSecretPayload) => {
    requireTrustedSender(event);
    if (!payload || typeof payload !== "object") {
      throw new Error("Invalid AI credential payload.");
    }
    await aiSecrets.set(payload.profileId, payload.apiKey, payload.baseUrl);
  });

  ipcMain.handle("ai:deleteSecret", async (event, profileId: string) => {
    requireTrustedSender(event);
    await aiSecrets.delete(profileId);
  });

  ipcMain.handle("ai:hasSecret", async (event, profileId: string) => {
    requireTrustedSender(event);
    return aiSecrets.has(profileId);
  });

  ipcMain.handle("ai:complete", async (event, request: AiCompletionRequest) => {
    requireTrustedSender(event);
    return aiCompletion.complete(request);
  });
  */

  ipcMain.handle("dialog:exportProject", async (event, project: ProjectExportResult) => {
    requireTrustedSender(event);
    validateProjectExport(project);
    const result = await dialog.showOpenDialog(win, {
      title: "Choose a folder for the Vercel project",
      buttonLabel: "Export project",
      properties: ["openDirectory", "createDirectory"]
    });
    if (result.canceled || !result.filePaths[0]) {
      return null;
    }
    const projectPath = await exportProjectToDirectory(result.filePaths[0], project);
    void shell.showItemInFolder(projectPath);
    return { path: projectPath };
  });

  ipcMain.handle("shell:openExternal", async (_, url: unknown) => {
    if (!isExternalHttpUrl(url)) {
      throw new Error("Only http and https links can be opened.");
    }
    await shell.openExternal(url);
  });

  ipcMain.handle("app:checkForUpdates", checkForUpdates);

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
