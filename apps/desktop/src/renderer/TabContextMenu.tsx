import type { TabCloseScope } from "./document-tabs";
import type { AppText } from "./i18n";
import type { LocalDocument } from "./types";

export type TabContextMenuState = {
  document: LocalDocument;
  x: number;
  y: number;
} | null;

type TabContextMenuProps = {
  contextMenu: TabContextMenuState;
  t: AppText;
  onCloseTabsByScope: (documentId: string, scope: TabCloseScope) => void;
};

export function TabContextMenu({ contextMenu, t, onCloseTabsByScope }: TabContextMenuProps) {
  if (!contextMenu) {
    return null;
  }

  const actions: { label: string; scope: TabCloseScope }[] = [
    { label: t.closeOtherTabs, scope: "others" },
    { label: t.closeTabsToRight, scope: "right" },
    { label: t.closeAllTabs, scope: "all" }
  ];

  return (
    <div className="tab-context-menu" role="menu" style={{ left: contextMenu.x, top: contextMenu.y }} onPointerDown={(event) => event.stopPropagation()}>
      {actions.map((action) => (
        <button key={action.scope} type="button" role="menuitem" onClick={() => onCloseTabsByScope(contextMenu.document.id, action.scope)}>
          {action.label}
        </button>
      ))}
    </div>
  );
}
