import { FolderOutput, PackagePlus, Store } from "lucide-react";
import { useState } from "react";
import type { ExporterContribution, TickpadPlugin } from "@tickpad/plugin-api";
import type { AiProfile } from "@tickpad/plugin-ai-writer";

import { AiProfileSettings, type AiProfileDraft } from "./AiProfileSettings";
import type { AppText } from "./i18n";

type PluginSettingsPageProps = {
  availablePlugins: readonly TickpadPlugin[];
  commandCount: number;
  exportCount: number;
  installedPluginIds: readonly string[];
  aiProfiles: readonly AiProfile[];
  secretProfileIds: ReadonlySet<string>;
  projectExporters: readonly ExporterContribution[];
  t: AppText;
  onDeleteAiProfile: (profileId: string) => Promise<void>;
  onExportProject: (exporterId: string) => Promise<{ path: string } | null>;
  onSaveAiProfile: (draft: AiProfileDraft) => Promise<void>;
  onTogglePluginInstall: (pluginId: string) => void;
};

export function PluginSettingsPage({
  availablePlugins,
  commandCount,
  exportCount,
  installedPluginIds,
  aiProfiles,
  secretProfileIds,
  projectExporters,
  t,
  onDeleteAiProfile,
  onExportProject,
  onSaveAiProfile,
  onTogglePluginInstall
}: PluginSettingsPageProps) {
  const installedPluginIdSet = new Set(installedPluginIds);
  const [exportMessage, setExportMessage] = useState("");

  const exportProject = async (exporterId: string) => {
    setExportMessage("");
    try {
      const result = await onExportProject(exporterId);
      if (result) {
        setExportMessage(`${t.projectExported}: ${result.path}`);
      }
    } catch (cause) {
      setExportMessage(cause instanceof Error ? cause.message : t.projectExportFailed);
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-section">
        <span className="settings-section-title">{t.plugins}</span>
        <div className="plugin-install-panel">
          <div className="plugin-install-copy">
            <strong>{t.pluginInstall}</strong>
            <span>{t.pluginInstallDescription}</span>
            <span className="plugin-install-coming-soon">{t.pluginInstallComingSoon}</span>
          </div>
          <div className="plugin-install-actions">
            <button className="plugin-install-action" type="button" title={t.pluginStoreInstall} disabled><Store size={16} />{t.pluginStoreInstall}</button>
            <button className="plugin-install-action" type="button" title={t.installFromZip} disabled><PackagePlus size={16} />{t.installFromZip}</button>
          </div>
        </div>
        <div className="settings-list-row">
          <div className="settings-row"><span>{t.plugins}</span><strong>{installedPluginIds.length}/{availablePlugins.length}</strong></div>
          <div className="plugin-settings-summary"><span>{commandCount} {t.commands}</span><span>{exportCount} {t.exporters}</span></div>
        </div>
        <div className="plugin-settings-list">
          {availablePlugins.map((plugin) => {
            const installed = installedPluginIdSet.has(plugin.manifest.id);
            return (
              <div className="plugin-settings-card" key={plugin.manifest.id}>
                <div className="plugin-settings-card-header">
                  <strong>{plugin.manifest.name}</strong>
                  <button className="plugin-settings-action" type="button" aria-pressed={installed} onClick={() => onTogglePluginInstall(plugin.manifest.id)}>
                    {installed ? t.uninstallPlugin : t.installPlugin}
                  </button>
                </div>
                <div className="plugin-settings-meta"><span>{plugin.manifest.id}</span><span>v{plugin.manifest.version} · API {plugin.manifest.apiVersion}</span></div>
                <div className="plugin-settings-permissions"><span>{t.permissions}</span><strong>{plugin.manifest.permissions?.join(", ") ?? t.defaultDeny}</strong></div>

                {installed && plugin.manifest.id === "ai-writer" && (
                  <div className="plugin-settings-configuration">
                    <AiProfileSettings profiles={aiProfiles} secretProfileIds={secretProfileIds} t={t} onDelete={onDeleteAiProfile} onSave={onSaveAiProfile} />
                  </div>
                )}

                {installed && plugin.manifest.id === "vercel-templates" && (
                  <div className="plugin-settings-configuration">
                    <p className="settings-section-description">{t.vercelTemplatesDescription}</p>
                    <div className="project-export-list">
                      {projectExporters.map((exporter) => (
                        <button className="project-export-action" type="button" key={exporter.id} onClick={() => void exportProject(exporter.id)}>
                          <FolderOutput size={16} /><span>{exporter.title}</span>
                        </button>
                      ))}
                    </div>
                    {exportMessage && <p className="settings-inline-notice" role="status">{exportMessage}</p>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
