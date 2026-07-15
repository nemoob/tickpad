import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const desktopSrc = resolve(__dirname, "..");
const rendererSrc = resolve(desktopSrc, "renderer");
const rendererFiles = [
  "App.tsx",
  "AiProfileSettings.tsx",
  "AiWriterBar.tsx",
  "ConfirmModal.tsx",
  "EditorPane.tsx",
  "FileRail.tsx",
  "MilkdownSurface.tsx",
  "PluginDock.tsx",
  "PluginSettingsPage.tsx",
  "SettingsModal.tsx",
  "Statusbar.tsx",
  "Topbar.tsx",
  "WritingSettings.tsx",
  "ai-profiles.ts",
  "code-block-style.ts",
  "document-model.ts",
  "document-outline.ts",
  "editor-clipboard.ts",
  "fixtures.ts",
  "i18n.ts",
  "mermaid-support.ts",
  "plugin-registry.ts",
  "preferences.ts",
  "types.ts",
  "useAppUpdates.ts",
  "useDocumentWorkspace.ts",
  "useOfficialPlugins.ts",
  "workspace-documents.ts"
];

export const mainSource = readFileSync(resolve(desktopSrc, "main/index.ts"), "utf8");
export const preloadSource = readFileSync(resolve(desktopSrc, "preload/index.ts"), "utf8");
export const appSource = rendererFiles.map((file) => readFileSync(resolve(rendererSrc, file), "utf8")).join("\n");
export const rendererMainSource = readFileSync(resolve(rendererSrc, "main.tsx"), "utf8");
export const rendererTypesSource = readFileSync(resolve(rendererSrc, "vite-env.d.ts"), "utf8");
export const foundationStyles = readFileSync(resolve(rendererSrc, "styles/foundation.css"), "utf8");
export const preferencesSource = readFileSync(resolve(rendererSrc, "preferences.ts"), "utf8");

const styleFiles = ["styles.css", ...readdirSync(resolve(rendererSrc, "styles")).map((file) => `styles/${file}`)];
export const styles = styleFiles.map((file) => readFileSync(resolve(rendererSrc, file), "utf8")).join("\n");
