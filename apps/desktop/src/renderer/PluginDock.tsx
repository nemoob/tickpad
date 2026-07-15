import type { PanelContribution } from "@tickpad/plugin-api";
import { Puzzle } from "lucide-react";

import type { AppText } from "./i18n";

type PluginDockProps = {
  activePanel: string;
  activePanelContribution: PanelContribution | undefined;
  panels: PanelContribution[];
  t: AppText;
  onActivePanelChange: (panelId: string) => void;
  onCopyWechatHtml: () => void;
};

export function PluginDock({ activePanel, activePanelContribution, panels, t, onActivePanelChange, onCopyWechatHtml }: PluginDockProps) {
  return (
    <aside className="plugin-dock" aria-label={t.plugins}>
      <div className="dock-header">
        <Puzzle size={18} />
        <strong>{t.plugins}</strong>
      </div>
      <div className="plugin-tabs">
        {panels.map((panel) => (
          <button key={panel.id} type="button" className={activePanel === panel.id ? "selected" : ""} onClick={() => onActivePanelChange(panel.id)}>
            {panel.title}
          </button>
        ))}
      </div>
      <div className="panel-output">
        <span>{activePanelContribution?.title ?? t.noPanel}</span>
        <strong>{activePanelContribution?.render() ?? t.noPluginPanelRegistered}</strong>
      </div>
      {/* Temporarily disabled for the first public release.
      <button className="command-button" type="button" onClick={onCopyWechatHtml}>
        {t.copyWechatHtml}
      </button>
      */}
      <div className="permission-card">
        <span>{t.permissions}</span>
        <strong>{t.defaultDeny}</strong>
        <p>{t.permissionsDescription}</p>
      </div>
    </aside>
  );
}
