import { useEffect, useMemo, useRef, useState } from "react";
import { createPluginHost } from "@tickpad/plugin-host";
import { parseAiMention, sanitizeAiProfile, type AiProfile } from "@tickpad/plugin-ai-writer";
import type { ProjectExportResult } from "@tickpad/plugin-api";

import type { AiProfileDraft } from "./AiProfileSettings";
import { parseStoredAiProfiles, serializeAiProfiles, upsertAiProfile } from "./ai-profiles";
import { writeClipboardHtml } from "./editor-clipboard";
import {
  createAvailablePlugins,
  getInstalledPluginIds,
  getInstalledPlugins,
  storeInstalledPluginIds
} from "./plugin-registry";

const aiProfilesStorageKey = "tickpad:ai-profiles";

type UseOfficialPluginsOptions = {
  markdown: string;
  onMarkdownChange: (markdown: string) => void;
  messages: {
    aiBridgeUnavailable: string;
    apiKeyRequired: string;
    apiKeyEndpointChanged: string;
    aiNicknameExists: string;
    projectExportUnavailable: string;
  };
};

const normalizeEndpoint = (value: string) => value.trim().replace(/\/+$/u, "");
const normalizeNickname = (value: string) => value.trim().normalize("NFKC").toLocaleLowerCase();

export function useOfficialPlugins({ markdown, onMarkdownChange, messages }: UseOfficialPluginsOptions) {
  const markdownChangeRef = useRef(onMarkdownChange);
  markdownChangeRef.current = onMarkdownChange;

  const availablePlugins = useMemo(
    () =>
      createAvailablePlugins({
        async complete(payload) {
          if (!window.tickpad) {
            throw new Error(messages.aiBridgeUnavailable);
          }
          return window.tickpad.completeAi({
            profileId: payload.profile.id,
            baseUrl: payload.profile.baseUrl,
            model: payload.profile.model,
            prompt: payload.prompt,
            systemPrompt: payload.profile.systemPrompt
          });
        }
      }),
    [messages.aiBridgeUnavailable]
  );
  const [installedPluginIds, setInstalledPluginIds] = useState(() => getInstalledPluginIds(availablePlugins));
  const [aiProfiles, setAiProfiles] = useState<AiProfile[]>(() =>
    parseStoredAiProfiles(localStorage.getItem(aiProfilesStorageKey))
  );
  const [secretProfileIds, setSecretProfileIds] = useState<Set<string>>(() => new Set());
  const installedPlugins = useMemo(
    () => getInstalledPlugins(availablePlugins, installedPluginIds),
    [availablePlugins, installedPluginIds]
  );

  const host = useMemo(() => {
    const pluginHost = createPluginHost({
      markdown,
      onMarkdownChange: (nextMarkdown) => markdownChangeRef.current(nextMarkdown),
      clipboard: {
        readText: async () => navigator.clipboard.readText(),
        writeText: async (text) => navigator.clipboard.writeText(text),
        writeHtml: writeClipboardHtml
      },
      network: {
        fetchText: async (url) => {
          const response = await fetch(url);
          return response.text();
        }
      }
    });
    for (const plugin of installedPlugins) {
      void pluginHost.activate(plugin);
    }
    return pluginHost;
  }, [installedPlugins]);

  useEffect(() => host.setMarkdown(markdown), [host, markdown]);
  useEffect(() => storeInstalledPluginIds(installedPluginIds), [installedPluginIds]);
  useEffect(() => localStorage.setItem(aiProfilesStorageKey, serializeAiProfiles(aiProfiles)), [aiProfiles]);

  useEffect(() => {
    let active = true;
    if (!window.tickpad) {
      setSecretProfileIds(new Set());
      return;
    }
    void Promise.all(
      aiProfiles.map(async (profile) => [profile.id, await window.tickpad!.hasAiSecret(profile.id)] as const)
    ).then((statuses) => {
      if (active) {
        setSecretProfileIds(new Set(statuses.filter(([, stored]) => stored).map(([profileId]) => profileId)));
      }
    }).catch(() => {
      if (active) {
        setSecretProfileIds(new Set());
      }
    });
    return () => {
      active = false;
    };
  }, [aiProfiles]);

  const commands = host.getCommands();
  const panels = host.getPanels();
  const exporters = host.getExporters();
  const projectExporters = exporters.filter((exporter) => exporter.output === "project");

  const togglePluginInstall = (pluginId: string) => {
    setInstalledPluginIds((current) =>
      current.includes(pluginId) ? current.filter((id) => id !== pluginId) : [...current, pluginId]
    );
  };

  const saveAiProfile = async (draft: AiProfileDraft) => {
    if (!window.tickpad) {
      throw new Error(messages.aiBridgeUnavailable);
    }
    const profile = sanitizeAiProfile(draft);
    const existing = aiProfiles.find((candidate) => candidate.id === profile.id);
    const duplicateNickname = aiProfiles.find(
      (candidate) => candidate.id !== profile.id && normalizeNickname(candidate.nickname) === normalizeNickname(profile.nickname)
    );
    if (duplicateNickname) {
      throw new Error(messages.aiNicknameExists);
    }
    if (!draft.apiKey.trim() && !secretProfileIds.has(profile.id)) {
      throw new Error(messages.apiKeyRequired);
    }
    if (
      !draft.apiKey.trim() &&
      existing &&
      normalizeEndpoint(existing.baseUrl) !== normalizeEndpoint(profile.baseUrl)
    ) {
      throw new Error(messages.apiKeyEndpointChanged);
    }
    if (draft.apiKey.trim()) {
      await window.tickpad.setAiSecret({ profileId: profile.id, baseUrl: profile.baseUrl, apiKey: draft.apiKey });
      setSecretProfileIds((current) => new Set(current).add(profile.id));
    }
    setAiProfiles((current) => upsertAiProfile(current, profile));
  };

  const deleteAiProfile = async (profileId: string) => {
    if (!window.tickpad) {
      throw new Error(messages.aiBridgeUnavailable);
    }
    await window.tickpad.deleteAiSecret(profileId);
    setAiProfiles((current) => current.filter((profile) => profile.id !== profileId));
    setSecretProfileIds((current) => {
      const next = new Set(current);
      next.delete(profileId);
      return next;
    });
  };

  const generateWithAi = async (request: string) => {
    const command = commands.find((candidate) => candidate.id === "ai-writer.generate");
    if (!command) {
      throw new Error(messages.aiBridgeUnavailable);
    }
    await command.run(parseAiMention(request, aiProfiles));
  };

  const exportProject = async (exporterId: string) => {
    const exporter = projectExporters.find((candidate) => candidate.id === exporterId);
    if (!exporter || !window.tickpad) {
      throw new Error(messages.projectExportUnavailable);
    }
    const project = await exporter.export(markdown);
    if (typeof project === "string" || project.kind !== "project") {
      throw new Error(messages.projectExportUnavailable);
    }
    return window.tickpad.exportProject(project as ProjectExportResult);
  };

  const copyWechatHtml = async () => {
    const command = commands.find((item) => item.id === "wechat-export.copyHtml");
    if (command) {
      await command.run();
      return true;
    }
    const exporter = exporters.find((item) => item.id === "wechat-html");
    if (!exporter) {
      return false;
    }
    await writeClipboardHtml(String(await exporter.export(markdown)));
    return true;
  };

  return {
    aiProfiles,
    availablePlugins,
    commands,
    exporters,
    host,
    installedPluginIds,
    panels,
    projectExporters,
    secretProfileIds,
    copyWechatHtml,
    deleteAiProfile,
    exportProject,
    generateWithAi,
    saveAiProfile,
    togglePluginInstall
  };
}
