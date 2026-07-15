import { describe, expect, it } from "vitest";
import { createEditorDocument, normalizeEscapedMarkdown, normalizeMarkdownInputSymbols, normalizeSplitMarkdownLinks, updateMarkdown } from "./index";

describe("editor core", () => {
  it("tracks title and dirty state when markdown changes", () => {
    const document = createEditorDocument("# Start");
    const changed = updateMarkdown(document, "# Changed");

    expect(changed.title).toBe("Changed.md");
    expect(changed.dirty).toBe(true);
    expect(changed.markdown).toBe("# Changed");
  });

  it("keeps links recognizable when enter splits the label and url", () => {
    const markdown = [
      "| key | 标题 |",
      "| --- | --- |",
      "| [ISSUE-123]",
      "(https://tracker.example.com/issues/ISSUE-123) |"
    ].join("\n");

    expect(normalizeSplitMarkdownLinks(markdown)).toContain("[ISSUE-123](https://tracker.example.com/issues/ISSUE-123)");
  });

  it("keeps table links recognizable when the editor stores the break as br markup", () => {
    const markdown = [
      "| key | 标题 |",
      "| --- | --- |",
      "| [ISSUE-123]<br />",
      "(https://tracker.example.com/issues/ISSUE-123) |"
    ].join("\n");

    expect(normalizeSplitMarkdownLinks(markdown)).toContain("[ISSUE-123](https://tracker.example.com/issues/ISSUE-123)");
  });

  it("keeps table links recognizable when enter splits the url itself", () => {
    const markdown = [
      "| key | 标题 |",
      "| --- | --- |",
      "| [ISSUE-123]",
      "(https://tracker.example.com/issu",
      "es/ISSUE-123) |"
    ].join("\n");

    expect(normalizeSplitMarkdownLinks(markdown)).toContain("[ISSUE-123](https://tracker.example.com/issues/ISSUE-123)");
  });

  it("keeps table links recognizable when the editor escapes a split label", () => {
    const markdown = [
      "| key | 标题 |",
      "| --- | --- |",
      "| \\[ISSUE-123\\]<br />",
      "(https://tracker.example.com/issu<br />es/ISSUE-123) |"
    ].join("\n");

    expect(normalizeSplitMarkdownLinks(markdown)).toContain("[ISSUE-123](https://tracker.example.com/issues/ISSUE-123)");
  });

  it("normalizes split links when updating a document", () => {
    const document = createEditorDocument("# Start");
    const changed = updateMarkdown(document, "[ISSUE-123]\n(https://tracker.example.com/issues/ISSUE-123)");

    expect(changed.markdown).toBe("[ISSUE-123](https://tracker.example.com/issues/ISSUE-123)");
  });

  it("normalizes escaped markdown pasted from rich text sources", () => {
    const markdown = [
      "\\- 列表数据缺字段",
      "",
      "&#x20;\\- 接口：https\\://api.example.com/v1/items?...\\&page=1",
      "",
      "&#x20;\\- 字段：items\\[temp.id=82].video\\[title=\"今天\"].data\\[]",
      "",
      "&#x20;\\- 现状：16 条全部缺 title / image\\_cover / album\\_image\\_url\\_hover / back\\_image"
    ].join("\n");

    expect(normalizeEscapedMarkdown(markdown)).toBe(
      [
        "- 列表数据缺字段",
        "",
        "  - 接口：https://api.example.com/v1/items?...&page=1",
        "",
        "  - 字段：items[temp.id=82].video[title=\"今天\"].data[]",
        "",
        "  - 现状：16 条全部缺 title / image_cover / album_image_url_hover / back_image"
      ].join("\n")
    );
  });

  it("normalizes escaped markdown when updating a document", () => {
    const document = createEditorDocument("# Start");
    const changed = updateMarkdown(document, "\\- 一级页\n\n&#x20;\\- 字段：image\\_cover");

    expect(changed.markdown).toBe("- 一级页\n\n  - 字段：image_cover");
  });

  it("normalizes one-space child list indentation left from earlier pasted markdown", () => {
    const document = createEditorDocument("# Start");
    const changed = updateMarkdown(document, "- 一级页\n\n - 字段：image_cover");

    expect(changed.markdown).toBe("- 一级页\n\n  - 字段：image_cover");
  });

  it("normalizes Chinese IME markdown symbols after a typed space", () => {
    const markdown = ["＃ 标题", "》 引用", "－ 列表", "··· ts", "const ok = true", "··· "].join("\n");

    expect(normalizeMarkdownInputSymbols(markdown)).toBe(["# 标题", "> 引用", "- 列表", "``` ts", "const ok = true", "``` "].join("\n"));
  });

  it("does not normalize Chinese IME markdown symbols before a typed space", () => {
    const markdown = ["＃标题", "》引用", "－列表", "···ts", "···"].join("\n");

    expect(normalizeMarkdownInputSymbols(markdown)).toBe(markdown);
  });

  it("keeps ordinary Chinese punctuation inside prose untouched", () => {
    expect(normalizeMarkdownInputSymbols("这里有《书名》和中点 · 符号")).toBe("这里有《书名》和中点 · 符号");
  });
});
