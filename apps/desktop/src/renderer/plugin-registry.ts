// import { createAiWriterPlugin } from "@tickpad/plugin-ai-writer";
import type { AiWriterRuntime } from "@tickpad/plugin-ai-writer";
import { mermaidPlugin } from "@tickpad/plugin-mermaid";
import { vercelTemplatesPlugin } from "@tickpad/plugin-vercel-templates";
// import { wechatExportPlugin } from "@tickpad/plugin-wechat-export";
import { wordCountPlugin } from "@tickpad/plugin-word-count";
import type { TickpadPlugin } from "@tickpad/plugin-api";

const installedPluginsStorageKey = "tickpad:installed-plugins:v2";
const legacyInstalledPluginsStorageKey = "tickpad:installed-plugins";
const newOfficialPluginIds = new Set([
  // "ai-writer", // Temporarily disabled for the first public release.
  "vercel-templates"
]);

export function createAvailablePlugins(aiRuntime: AiWriterRuntime): readonly TickpadPlugin[] {
  return [
    wordCountPlugin,
    mermaidPlugin,
    // wechatExportPlugin, // Temporarily disabled for the first public release.
    // createAiWriterPlugin(aiRuntime), // Temporarily disabled for the first public release.
    vercelTemplatesPlugin
  ];
}

const parsePluginIds = (raw: string | null, availablePluginIds: ReadonlySet<string>) => {
  if (!raw) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((pluginId): pluginId is string => typeof pluginId === "string" && availablePluginIds.has(pluginId))
      : null;
  } catch {
    return null;
  }
};

export function getInstalledPluginIds(availablePlugins: readonly TickpadPlugin[]) {
  const availablePluginIds = new Set(availablePlugins.map((plugin) => plugin.manifest.id));
  const stored = parsePluginIds(localStorage.getItem(installedPluginsStorageKey), availablePluginIds);
  if (stored) {
    return stored;
  }

  const legacy = parsePluginIds(localStorage.getItem(legacyInstalledPluginsStorageKey), availablePluginIds);
  if (legacy) {
    return [...new Set([...legacy, ...newOfficialPluginIds].filter((pluginId) => availablePluginIds.has(pluginId)))];
  }
  return [...availablePluginIds];
}

export function storeInstalledPluginIds(pluginIds: readonly string[]) {
  localStorage.setItem(installedPluginsStorageKey, JSON.stringify(pluginIds));
}

export function getInstalledPlugins(availablePlugins: readonly TickpadPlugin[], installedPluginIds: readonly string[]) {
  const installedPluginIdSet = new Set(installedPluginIds);
  return availablePlugins.filter((plugin) => installedPluginIdSet.has(plugin.manifest.id));
}
