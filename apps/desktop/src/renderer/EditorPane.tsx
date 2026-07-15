import { ChevronRight, FilePlus2, FolderOpen, ListTree } from "lucide-react";
import type { CSSProperties, MouseEvent } from "react";
import type { AiProfile } from "@tickpad/plugin-ai-writer";

import { AiWriterBar } from "./AiWriterBar";
import { getOutlineTextStyle, type DocumentOutlineItem } from "./document-outline";
import type { AppText } from "./i18n";
import { MilkdownSurface } from "./MilkdownSurface";
import { PlainTextSurface } from "./PlainTextSurface";
import type { SelectionToolbarToolId } from "./preferences";
import type { DocumentFormat, LocalDocument } from "./types";

type EditorPaneProps = {
  doc: LocalDocument;
  docFormat: DocumentFormat;
  aiProfiles: readonly AiProfile[];
  aiWriterEnabled: boolean;
  editorOutlineItems: DocumentOutlineItem[];
  editorRevision: number;
  editorStyle: CSSProperties;
  hasOpenDocument: boolean;
  outlineOpen: boolean;
  selectionToolbarTools: SelectionToolbarToolId[];
  t: AppText;
  onClick: (event: MouseEvent<HTMLElement>) => void;
  onCreateFile: () => void;
  onAiGenerate: (request: string) => Promise<void>;
  onOpenAiSettings: () => void;
  onMarkdownChange: (markdown: string) => void;
  onOpenFile: () => void;
  onOutlineOpenChange: (open: boolean) => void;
  onScrollToOutlineItem: (item: DocumentOutlineItem) => void;
};

export function EditorPane({
  doc,
  docFormat,
  aiProfiles,
  aiWriterEnabled,
  editorOutlineItems,
  editorRevision,
  editorStyle,
  hasOpenDocument,
  outlineOpen,
  selectionToolbarTools,
  t,
  onClick,
  onCreateFile,
  onAiGenerate,
  onOpenAiSettings,
  onMarkdownChange,
  onOpenFile,
  onOutlineOpenChange,
  onScrollToOutlineItem
}: EditorPaneProps) {
  if (!hasOpenDocument) {
    return (
      <section className="editor-pane editor-empty" aria-label={t.editor} style={editorStyle}>
        <div className="editor-empty-content">
          <h2>{t.emptyEditorTitle}</h2>
          <p>{t.emptyEditorDescription}</p>
          <div className="editor-empty-actions">
            <button type="button" onClick={onCreateFile}><FilePlus2 size={15} />{t.newFile}</button>
            <button type="button" onClick={onOpenFile}><FolderOpen size={15} />{t.openMarkdown}</button>
          </div>
        </div>
      </section>
    );
  }

  const hasOutlineItems = editorOutlineItems.length > 0;
  const editorScrollClass = docFormat === "plain" ? "editor-scroll plain" : "editor-scroll";
  const editorScrollClassName = docFormat === "markdown" && aiWriterEnabled ? `${editorScrollClass} ai-enabled` : editorScrollClass;

  return (
    <section className="editor-pane" aria-label={t.editor} style={editorStyle} onClick={onClick}>
      {docFormat === "markdown" && hasOutlineItems && (
        outlineOpen ? (
          <aside className="editor-outline" aria-label={t.documentOutline}>
            <div className="editor-outline-header">
              <span>{t.documentOutline}</span>
              <button
                className="editor-outline-collapse"
                type="button"
                title={t.collapseOutline}
                aria-label={t.collapseOutline}
                onClick={() => onOutlineOpenChange(false)}
              >
                <ChevronRight size={14} />
              </button>
            </div>
            <div className="editor-outline-list">
              {editorOutlineItems.map((item) => (
                <button
                  className="editor-outline-item heading"
                  key={item.id}
                  type="button"
                  aria-label={`${t.documentOutline}: ${item.targetText}`}
                  onClick={() => onScrollToOutlineItem(item)}
                  style={{ paddingLeft: `${Math.max(0, item.level - 1) * 8}px`, ...getOutlineTextStyle(item.level) }}
                >
                  <span className="editor-outline-level">{item.level}</span>
                  <span className="editor-outline-text">{item.text}</span>
                </button>
              ))}
            </div>
          </aside>
        ) : (
          <button
            className="editor-outline-collapsed"
            type="button"
            title={t.expandOutline}
            aria-label={t.expandOutline}
            onClick={() => onOutlineOpenChange(true)}
          >
            <ListTree size={16} />
          </button>
        )
      )}
      <div className={editorScrollClassName}>
        {docFormat === "plain" ? (
          <PlainTextSurface text={doc.markdown} onChange={onMarkdownChange} />
        ) : (
          <MilkdownSurface
            key={`${doc.id}:${editorRevision}:${selectionToolbarTools.join("|")}`}
            markdown={doc.markdown}
            onChange={onMarkdownChange}
            placeholder={t.editorPlaceholder}
            toolbarTools={selectionToolbarTools}
          />
        )}
      </div>
      {docFormat === "markdown" && aiWriterEnabled && (
        <AiWriterBar profiles={aiProfiles} t={t} onGenerate={onAiGenerate} onOpenSettings={onOpenAiSettings} />
      )}
    </section>
  );
}
