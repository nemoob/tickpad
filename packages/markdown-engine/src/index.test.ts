import { describe, expect, it } from "vitest";
import { renderMarkdown, toPlainText } from "./index";

describe("markdown engine", () => {
  it("renders common Markdown blocks into safe HTML", () => {
    const html = renderMarkdown("# Title\n\n- one\n- two\n\n```ts\nconst x = 1\n```");

    expect(html).toContain("<h1>Title</h1>");
    expect(html).toContain("<li>one</li>");
    expect(html).toContain("<code");
    expect(html).not.toContain("<script>");
  });

  it("allows plugin-rendered fenced blocks", () => {
    const html = renderMarkdown("```mermaid\ngraph TD;A-->B\n```", {
      blocks: [
        {
          language: "mermaid",
          render: (code) => `<figure data-kind="mermaid">${code}</figure>`
        }
      ]
    });

    expect(html).toContain('data-kind="mermaid"');
    expect(html).toContain("graph TD;A--&gt;B");
  });

  it("renders task list items as disabled checkboxes", () => {
    const html = renderMarkdown("* [x] Done\n- [ ] Later");

    expect(html).toContain('type="checkbox" disabled checked');
    expect(html).toContain('type="checkbox" disabled>');
    expect(html).not.toContain("[x] Done");
  });

  it("blocks executable link protocols in exported HTML", () => {
    const html = renderMarkdown("[unsafe](javascript:alert(1)) [safe](https://example.com)");

    expect(html).toContain('<a href="#">unsafe</a>');
    expect(html).toContain('<a href="https://example.com">safe</a>');
    expect(html).not.toContain("javascript:");
  });

  it("extracts plain text for stats and previews", () => {
    expect(toPlainText("# Hello **Markdown**")).toBe("Hello Markdown");
  });
});
