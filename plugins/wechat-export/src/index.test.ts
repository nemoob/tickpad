import { describe, expect, it, vi } from "vitest";
import { createPluginHost } from "@tickpad/plugin-host";
import { toWechatHtml, wechatExportPlugin } from "./index";

const sampleMarkdown = [
  "# 技术标题",
  "",
  "普通段落包含 **加粗**、*斜体*、`inlineCode`、[链接](https://example.com) 和 ![配图](https://example.com/a.png)。",
  "",
  "> 这是一段引用。",
  "",
  "1. 第一步",
  "2. 第二步",
  "",
  "- 无序项一",
  "- 无序项二",
  "",
  "```ts",
  "const value = 1 < 2",
  "```",
  "",
  "| 字段 | 说明 |",
  "| --- | --- |",
  "| key | value |"
].join("\n");

describe("wechat export plugin", () => {
  it("renders supported Markdown elements as inline-styled WeChat HTML", () => {
    const html = toWechatHtml(sampleMarkdown);

    expect(html).toContain("<section style=");
    expect(html).toContain("<h1 style=");
    expect(html).toContain("<p style=");
    expect(html).toContain("<strong style=");
    expect(html).toContain("<em style=");
    expect(html).toContain("<code style=");
    expect(html).toContain('<a href="https://example.com" style=');
    expect(html).toContain('<img src="https://example.com/a.png" alt="配图" style=');
    expect(html).toContain("<blockquote style=");
    expect(html).toContain("<ol style=");
    expect(html).toContain("<ul style=");
    expect(html).toContain("<pre style=");
    expect(html).toContain("<table style=");
    expect(html).toContain("<th style=");
    expect(html).toContain("<td style=");
    expect(html).toContain("1 &lt; 2");
    expect(html).not.toContain("<style");
  });

  it("keeps the exporter and copy command plugin-owned", async () => {
    const writeHtml = vi.fn();
    const writeText = vi.fn();
    const host = createPluginHost({
      markdown: sampleMarkdown,
      clipboard: {
        readText: async () => "",
        writeText,
        writeHtml
      }
    });

    await host.activate(wechatExportPlugin);

    const exporter = host.getExporters().find((item) => item.id === "wechat-html");
    const command = host.getCommands().find((item) => item.id === "wechat-export.copyHtml");

    expect(exporter?.title).toBe("WeChat Official Account HTML");
    expect(await exporter?.export(sampleMarkdown)).toContain("<section style=");
    expect(command?.title).toBe("Copy WeChat Official Account Style");

    await command?.run();

    expect(writeHtml).toHaveBeenCalledWith(expect.stringContaining("<section style="));
    expect(writeText).not.toHaveBeenCalled();
  });
});
