import type { MarkdownDocument } from "@tickpad/shared";
import { getDocumentTitle } from "@tickpad/shared";

export const starterMarkdown = `# Tickpad

Write Markdown in a focused desktop app.

> A plugin-first Markdown editor.

- [x] Desktop shell
- [x] Plugin API
- [ ] Publish plugin marketplace

\`\`\`ts
ctx.commands.register({
  id: "demo.sayHello",
  title: "Say hello",
  run: () => console.log("hello")
})
\`\`\`
`;

export function normalizeSplitMarkdownLinks(markdown: string): string {
  return markdown.replace(
    /(^|[^!\\])\\?\[([^\]\n]+?)\\?](?:[ \t]*<br\s*\/?>[ \t]*(?:\r?\n[ \t]*)*|[ \t]*(?:\r?\n[ \t]*)+)\((https?:\/\/(?:[^\s)]|[ \t]*<br\s*\/?>[ \t]*(?:\r?\n[ \t]*)*|[ \t]*\r?\n[ \t]*)+)\)/gim,
    (_, prefix: string, label: string, url: string) =>
      `${prefix}[${label}](${url.replace(/[ \t]*<br\s*\/?>[ \t]*(?:\r?\n[ \t]*)*|[ \t]*\r?\n[ \t]*/gim, "")})`
  );
}

export function normalizeMarkdownInputSymbols(markdown: string): string {
  let inFence = false;
  let changed = false;
  const normalizedMarkdown = markdown
    .split(/(\r?\n)/)
    .map((part) => {
      if (/^\r?\n$/.test(part)) {
        return part;
      }

      const originalPart = part;
      let nextPart = part.replace(/^([ \t]*)(?:···|｀｀｀)(?=\s)/, "$1```");
      if (/^[ \t]*(?:```|~~~)/.test(nextPart)) {
        inFence = !inFence;
        changed ||= nextPart !== originalPart;
        return nextPart;
      }
      if (!inFence) {
        nextPart = nextPart
          .replace(/^([ \t]*)＃(?=\s)/, "$1#")
          .replace(/^([ \t]*)[》＞](?=\s)/, "$1>")
          .replace(/^([ \t]*)[－﹣–—](?=\s)/, "$1-")
          .replace(/^([ \t]*)＊(?=\s)/, "$1*")
          .replace(/^([ \t]*)＋(?=\s)/, "$1+");
      }
      changed ||= nextPart !== originalPart;
      return nextPart;
    })
    .join("");
  return changed ? normalizedMarkdown : markdown;
}

export function normalizeEscapedMarkdown(markdown: string): string {
  const decodedMarkdown = markdown.replace(/&#x20;|&nbsp;/gi, " ");
  const shouldUnescape = /(^|\n)[ \t]*\\[-*+]\s|\bhttps\\:\/\//i.test(decodedMarkdown);
  const sourceMarkdown = shouldUnescape ? decodedMarkdown : markdown;

  let inFence = false;
  let sawTopLevelList = false;
  let changed = shouldUnescape;
  const normalizedMarkdown = sourceMarkdown
    .split(/(\r?\n)/)
    .map((part) => {
      if (/^\r?\n$/.test(part)) {
        return part;
      }
      if (/^[ \t]*(?:```|~~~)/.test(part)) {
        inFence = !inFence;
        return part;
      }
      if (inFence) {
        return part;
      }
      const unescapedPart = shouldUnescape ? part.replace(/\\([\\`*{}\[\]()#+\-.!_:&\/>|])/g, "$1") : part;
      const indentedPart = sawTopLevelList ? unescapedPart.replace(/^ ((?:[-*+]|\d+[.)])\s)/, "  $1") : unescapedPart;
      if (/^(?:[-*+]|\d+[.)])\s/.test(indentedPart)) {
        sawTopLevelList = true;
      }
      if (indentedPart !== part) {
        changed = true;
      }
      return indentedPart;
    })
    .join("");
  return changed ? normalizedMarkdown : markdown;
}

function normalizeMarkdown(markdown: string): string {
  return normalizeSplitMarkdownLinks(normalizeEscapedMarkdown(markdown));
}

export function createEditorDocument(markdown = starterMarkdown): MarkdownDocument {
  const normalizedMarkdown = normalizeMarkdown(markdown);
  return {
    title: getDocumentTitle(normalizedMarkdown),
    markdown: normalizedMarkdown,
    dirty: false,
    updatedAt: Date.now()
  };
}

export function updateMarkdown(document: MarkdownDocument, markdown: string): MarkdownDocument {
  const normalizedMarkdown = normalizeMarkdown(markdown);
  return {
    ...document,
    title: getDocumentTitle(normalizedMarkdown, document.title),
    markdown: normalizedMarkdown,
    dirty: true,
    updatedAt: Date.now()
  };
}

export function getStats(markdown: string) {
  const text = markdown.replace(/[#*_`>\-[\]()]/g, " ").replace(/\s+/g, " ").trim();
  return {
    characters: markdown.length,
    words: text ? text.split(/\s+/).length : 0,
    lines: markdown.split(/\r?\n/).length
  };
}
