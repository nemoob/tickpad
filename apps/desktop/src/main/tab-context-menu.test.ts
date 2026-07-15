import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

const rendererSrc = resolve(__dirname, "../renderer");
const readRendererFile = (file: string) => readFileSync(resolve(rendererSrc, file), "utf8");

describe("tab context menu", () => {
  test("offers scoped close actions from a tab right click", () => {
    const topbarSource = readRendererFile("Topbar.tsx");
    const workspaceSource = readRendererFile("useDocumentWorkspace.ts");
    const translationsSource = readRendererFile("i18n.ts");
    const styles = readRendererFile("styles/topbar.css");

    expect(topbarSource).toContain("TabContextMenu");
    expect(topbarSource).toContain("const tabRefs = useRef(new Map<string, HTMLDivElement>())");
    expect(topbarSource).toContain("const topbarRef = useRef<HTMLElement | null>(null)");
    expect(topbarSource).toContain("onContextMenu={(event) => openTabContextMenu(event, document)}");
    expect(topbarSource).toContain("tabRefs.current.set(document.id, element)");
    expect(topbarSource).toContain("tabRefs.current.delete(document.id)");
    expect(topbarSource).toContain("const tabElement = tabRefs.current.get(document.id) ?? event.currentTarget");
    expect(topbarSource).toContain("const tabRect = tabElement.getBoundingClientRect()");
    expect(topbarSource).toContain("const topbarRect = topbarRef.current?.getBoundingClientRect()");
    const contextMenuHandler = topbarSource.slice(
      topbarSource.indexOf("const openTabContextMenu"),
      topbarSource.indexOf("const closeTabsByScope")
    );
    expect(contextMenuHandler).not.toContain("onSelectDocument(document);");
    expect(topbarSource).toContain("onClick={() => onSelectDocument(document)}");
    expect(topbarSource).toContain("x: Math.max(0, Math.min(tabRect.left - leftOffset, topbarWidth - 180))");
    expect(topbarSource).toContain("y: tabRect.bottom - topOffset + 6");
    expect(topbarSource).toContain("onCloseDocumentTabsByScope");
    expect(workspaceSource).toContain("closeDocumentTabsByScope");
    expect(translationsSource).toContain('closeOtherTabs: "Close other tabs"');
    expect(translationsSource).toContain('closeTabsToRight: "Close tabs to the right"');
    expect(translationsSource).toContain('closeAllTabs: "Close all tabs"');
    expect(translationsSource).toContain('closeOtherTabs: "关闭其他标签"');
    expect(translationsSource).toContain('closeTabsToRight: "关闭右侧标签"');
    expect(translationsSource).toContain('closeAllTabs: "关闭所有标签"');
    expect(styles).toContain(".tab-context-menu");
    expect(styles).toMatch(/\.tab-context-menu\s*\{[\s\S]*position: absolute;/);
    expect(styles).toMatch(/\.document-tab\.active::after\s*\{[\s\S]*right: 0;/);
    expect(styles).toMatch(/\.document-tab\.active::after\s*\{[\s\S]*left: 0;/);
  });
});
