import type { AppText } from "./i18n";

type StatusbarProps = {
  characterCount: number;
  commandCount: number;
  currentDocumentPath: string;
  exporterCount: number;
  hasOpenDocument: boolean;
  statusDocumentPath: string;
  t: AppText;
  wordCount: number;
};

export function Statusbar({
  characterCount,
  commandCount,
  currentDocumentPath,
  exporterCount,
  hasOpenDocument,
  statusDocumentPath,
  t,
  wordCount
}: StatusbarProps) {
  return (
    <footer className="statusbar">
      {hasOpenDocument ? (
        <>
          <span className="statusbar-path" title={currentDocumentPath}>{statusDocumentPath}</span>
          <span>{wordCount} {t.words}</span>
          <span>{characterCount} {t.characters}</span>
        </>
      ) : <span className="statusbar-path">{t.emptyEditorTitle}</span>}
      <span>{commandCount} {t.commands}</span>
      <span>{exporterCount} {t.exporters}</span>
    </footer>
  );
}
