import type { MarkdownBlockContribution } from "@tickpad/plugin-api";

export interface RenderMarkdownOptions {
  blocks?: MarkdownBlockContribution[];
}

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const safeUrl = (value: string) => {
  const url = value.trim();
  return /^(https?:|mailto:|\/|#)/i.test(url) ? escapeHtml(url) : "#";
};

const inlineMarkdown = (value: string) =>
  escapeHtml(value)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label: string, url: string) => `<a href="${safeUrl(url)}">${label}</a>`);

export function renderMarkdown(markdown: string, options: RenderMarkdownOptions = {}): string {
  const blocks = new Map((options.blocks ?? []).map((block) => [block.language, block]));
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const html: string[] = [];
  let listOpen = false;
  let quoteOpen = false;

  const closeList = () => {
    if (listOpen) {
      html.push("</ul>");
      listOpen = false;
    }
  };
  const closeQuote = () => {
    if (quoteOpen) {
      html.push("</blockquote>");
      quoteOpen = false;
    }
  };

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i] ?? "";
    const fence = line.match(/^```(\w+)?\s*$/);
    if (fence) {
      closeList();
      closeQuote();
      const language = fence[1] ?? "";
      const code: string[] = [];
      i += 1;
      while (i < lines.length && !/^```\s*$/.test(lines[i] ?? "")) {
        code.push(lines[i] ?? "");
        i += 1;
      }
      const source = escapeHtml(code.join("\n"));
      const pluginBlock = blocks.get(language);
      html.push(
        pluginBlock
          ? pluginBlock.render(source)
          : `<pre><code class="language-${escapeHtml(language)}">${source}</code></pre>`
      );
      continue;
    }

    if (!line.trim()) {
      closeList();
      closeQuote();
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      closeList();
      closeQuote();
      const level = heading[1].length;
      html.push(`<h${level}>${inlineMarkdown(heading[2])}</h${level}>`);
      continue;
    }

    const task = line.match(/^[-*]\s+\[([ x])]\s+(.+)$/i);
    if (task) {
      closeQuote();
      if (!listOpen) {
        html.push("<ul>");
        listOpen = true;
      }
      const checked = task[1].toLowerCase() === "x" ? " checked" : "";
      html.push(`<li><input type="checkbox" disabled${checked}> ${inlineMarkdown(task[2])}</li>`);
      continue;
    }

    const list = line.match(/^[-*]\s+(.+)$/);
    if (list) {
      closeQuote();
      if (!listOpen) {
        html.push("<ul>");
        listOpen = true;
      }
      html.push(`<li>${inlineMarkdown(list[1])}</li>`);
      continue;
    }

    const quote = line.match(/^>\s?(.+)$/);
    if (quote) {
      closeList();
      if (!quoteOpen) {
        html.push("<blockquote>");
        quoteOpen = true;
      }
      html.push(`<p>${inlineMarkdown(quote[1])}</p>`);
      continue;
    }

    closeList();
    closeQuote();
    html.push(`<p>${inlineMarkdown(line)}</p>`);
  }

  closeList();
  closeQuote();
  return html.join("\n");
}

export function toPlainText(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, "")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^>\s?/gm, "")
    .replace(/^[-*]\s+/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}
