import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

const rendererSrc = resolve(__dirname, "../renderer");
const readRendererFile = (file: string) => readFileSync(resolve(rendererSrc, file), "utf8");

describe("empty tab state", () => {
  test("offers useful actions without exposing a hidden document", () => {
    const appSource = readRendererFile("App.tsx");
    const editorSource = readRendererFile("EditorPane.tsx");
    const fileRailSource = readRendererFile("FileRail.tsx");
    const statusbarSource = readRendererFile("Statusbar.tsx");
    const translationsSource = readRendererFile("i18n.ts");

    expect(appSource).toContain("hasOpenDocument={workspace.hasOpenDocument}");
    expect(appSource).toContain("activeDocument={workspace.hasOpenDocument ? workspace.doc : null}");
    expect(appSource).toContain("dockOpen && workspace.hasOpenDocument");
    expect(editorSource).toContain("if (!hasOpenDocument)");
    expect(editorSource).toContain("onCreateFile");
    expect(editorSource).toContain("onOpenFile");
    expect(fileRailSource).toContain("activeDocument: LocalDocument | null");
    expect(statusbarSource).toContain("hasOpenDocument ?");
    expect(translationsSource).toContain('emptyEditorTitle: "No open document"');
    expect(translationsSource).toContain('emptyEditorTitle: "没有打开的文档"');
  });

  test("keeps the empty editor as compact as the file rail", () => {
    const editorSource = readRendererFile("EditorPane.tsx");
    const styles = readRendererFile("styles/editor.css");
    const headingBlock = styles.slice(styles.indexOf(".editor-empty-content h2"), styles.indexOf(".editor-empty-content p"));
    const descriptionBlock = styles.slice(styles.indexOf(".editor-empty-content p"), styles.indexOf(".editor-empty-actions"));
    const buttonBlock = styles.slice(styles.indexOf(".editor-empty-actions button"), styles.indexOf(".editor-scroll"));

    expect(editorSource).toContain("<FilePlus2 size={15}");
    expect(editorSource).toContain("<FolderOpen size={15}");
    expect(headingBlock).toContain("font-size: 14px;");
    expect(descriptionBlock).toContain("font-size: 12px;");
    expect(buttonBlock).toContain("min-height: 30px;");
    expect(buttonBlock).toContain("background: transparent;");
    expect(buttonBlock).toContain("font-size: 12px;");
    expect(buttonBlock).toContain(".editor-empty-actions button:hover");
  });
});
