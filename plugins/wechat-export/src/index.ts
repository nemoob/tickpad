import type { TickpadPlugin } from "@tickpad/plugin-api";

const styles = {
  root:
    "font-size:16px;line-height:1.8;color:#1f2933;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;word-break:break-word;",
  paragraph: "margin:0 0 16px 0;font-size:16px;line-height:1.8;color:#1f2933;",
  h1: "margin:28px 0 18px 0;font-size:26px;line-height:1.35;font-weight:700;color:#111827;",
  h2: "margin:26px 0 16px 0;font-size:22px;line-height:1.4;font-weight:700;color:#111827;border-left:4px solid #2f7d62;padding-left:10px;",
  h3: "margin:22px 0 14px 0;font-size:19px;line-height:1.45;font-weight:700;color:#111827;",
  h4: "margin:18px 0 12px 0;font-size:17px;line-height:1.5;font-weight:700;color:#111827;",
  h5: "margin:16px 0 10px 0;font-size:16px;line-height:1.5;font-weight:700;color:#374151;",
  h6: "margin:14px 0 10px 0;font-size:15px;line-height:1.5;font-weight:700;color:#4b5563;",
  strong: "font-weight:700;color:#111827;",
  em: "font-style:italic;color:#374151;",
  inlineCode:
    "font-family:SFMono-Regular,Consolas,'Liberation Mono',Menlo,monospace;font-size:0.92em;background:#f2f4f7;color:#b42318;border-radius:4px;padding:2px 5px;",
  link: "color:#1d4ed8;text-decoration:underline;",
  image: "display:block;max-width:100%;height:auto;margin:18px auto;border-radius:6px;",
  quote: "margin:18px 0;padding:10px 14px;border-left:4px solid #94a3b8;background:#f8fafc;color:#475569;",
  quoteParagraph: "margin:0;font-size:15px;line-height:1.75;color:#475569;",
  ul: "margin:0 0 16px 0;padding-left:24px;color:#1f2933;",
  ol: "margin:0 0 16px 0;padding-left:24px;color:#1f2933;",
  li: "margin:4px 0;font-size:16px;line-height:1.75;",
  pre: "margin:18px 0;padding:14px 16px;background:#111827;border-radius:6px;overflow:auto;",
  codeBlock:
    "font-family:SFMono-Regular,Consolas,'Liberation Mono',Menlo,monospace;font-size:13px;line-height:1.7;color:#e5e7eb;white-space:pre;",
  table: "width:100%;border-collapse:collapse;margin:18px 0;font-size:14px;line-height:1.6;",
  th: "border:1px solid #d8dee4;background:#f6f8fa;color:#111827;font-weight:700;padding:8px 10px;text-align:left;",
  td: "border:1px solid #d8dee4;color:#1f2933;padding:8px 10px;text-align:left;"
};

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

const renderInline = (value: string) =>
  escapeHtml(value).replace(
    /!\[([^\]]*)]\(([^)]+)\)|\[([^\]]+)]\(([^)]+)\)|`([^`]+)`|\*\*([^*]+)\*\*|\*([^*]+)\*/g,
    (_, imageAlt, imageUrl, linkText, linkUrl, code, strong, em) => {
      if (imageUrl) {
        return `<img src="${safeUrl(imageUrl)}" alt="${imageAlt ?? ""}" style="${styles.image}" />`;
      }
      if (linkUrl) {
        return `<a href="${safeUrl(linkUrl)}" style="${styles.link}">${linkText}</a>`;
      }
      if (code) {
        return `<code style="${styles.inlineCode}">${code}</code>`;
      }
      if (strong) {
        return `<strong style="${styles.strong}">${strong}</strong>`;
      }
      return `<em style="${styles.em}">${em}</em>`;
    }
  );

const splitTableRow = (line: string) =>
  line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());

const isTableSeparator = (line: string) => splitTableRow(line).every((cell) => /^:?-{3,}:?$/.test(cell));

const renderTable = (lines: string[]) => {
  const [headerLine, , ...bodyLines] = lines;
  const headers = splitTableRow(headerLine ?? "");
  const bodyRows = bodyLines.map(splitTableRow);
  const headerHtml = headers.map((cell) => `<th style="${styles.th}">${renderInline(cell)}</th>`).join("");
  const bodyHtml = bodyRows
    .map((row) => `<tr>${row.map((cell) => `<td style="${styles.td}">${renderInline(cell)}</td>`).join("")}</tr>`)
    .join("");
  return `<table style="${styles.table}"><thead><tr>${headerHtml}</tr></thead><tbody>${bodyHtml}</tbody></table>`;
};

export function toWechatHtml(markdown: string): string {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const html: string[] = [];
  let listType: "ul" | "ol" | null = null;
  let quoteOpen = false;

  const closeList = () => {
    if (listType) {
      html.push(`</${listType}>`);
      listType = null;
    }
  };
  const closeQuote = () => {
    if (quoteOpen) {
      html.push("</blockquote>");
      quoteOpen = false;
    }
  };
  const openList = (type: "ul" | "ol") => {
    closeQuote();
    if (listType !== type) {
      closeList();
      html.push(`<${type} style="${styles[type]}">`);
      listType = type;
    }
  };

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i] ?? "";
    const trimmed = line.trim();
    const fence = line.match(/^```([^\s`]*)\s*$/);

    if (fence) {
      closeList();
      closeQuote();
      const language = fence[1] ? ` data-language="${escapeHtml(fence[1])}"` : "";
      const code: string[] = [];
      i += 1;
      while (i < lines.length && !/^```\s*$/.test(lines[i] ?? "")) {
        code.push(lines[i] ?? "");
        i += 1;
      }
      html.push(`<pre style="${styles.pre}"><code${language} style="${styles.codeBlock}">${escapeHtml(code.join("\n"))}</code></pre>`);
      continue;
    }

    if (!trimmed) {
      closeList();
      closeQuote();
      continue;
    }

    if (trimmed.includes("|") && lines[i + 1] && isTableSeparator(lines[i + 1])) {
      closeList();
      closeQuote();
      const tableLines = [trimmed, lines[i + 1] ?? ""];
      i += 2;
      while (i < lines.length && (lines[i] ?? "").trim().includes("|")) {
        tableLines.push((lines[i] ?? "").trim());
        i += 1;
      }
      i -= 1;
      html.push(renderTable(tableLines));
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      closeList();
      closeQuote();
      const level = Math.min(6, heading[1].length);
      html.push(`<h${level} style="${styles[`h${level}` as keyof typeof styles]}">${renderInline(heading[2])}</h${level}>`);
      continue;
    }

    const orderedList = line.match(/^\d+\.\s+(.+)$/);
    if (orderedList) {
      openList("ol");
      html.push(`<li style="${styles.li}">${renderInline(orderedList[1])}</li>`);
      continue;
    }

    const unorderedList = line.match(/^[-*+]\s+(.+)$/);
    if (unorderedList) {
      openList("ul");
      html.push(`<li style="${styles.li}">${renderInline(unorderedList[1])}</li>`);
      continue;
    }

    const quote = line.match(/^>\s?(.+)$/);
    if (quote) {
      closeList();
      if (!quoteOpen) {
        html.push(`<blockquote style="${styles.quote}">`);
        quoteOpen = true;
      }
      html.push(`<p style="${styles.quoteParagraph}">${renderInline(quote[1])}</p>`);
      continue;
    }

    closeList();
    closeQuote();
    html.push(`<p style="${styles.paragraph}">${renderInline(line)}</p>`);
  }

  closeList();
  closeQuote();
  return `<section style="${styles.root}">${html.join("\n")}</section>`;
}

export const wechatExportPlugin: TickpadPlugin = {
  manifest: {
    id: "wechat-export",
    name: "WeChat Export",
    version: "0.1.0",
    apiVersion: "0.1",
    permissions: ["document:read", "clipboard:write"],
    contributes: {
      commands: ["wechat-export.copyHtml"],
      exporters: ["wechat-html"]
    }
  },
  activate(ctx) {
    ctx.exporters.register({
      id: "wechat-html",
      title: "WeChat Official Account HTML",
      export: toWechatHtml
    });

    ctx.commands.register({
      id: "wechat-export.copyHtml",
      title: "Copy WeChat Official Account Style",
      run: async () => {
        await ctx.clipboard.writeHtml(toWechatHtml(ctx.document.getMarkdown()));
      }
    });
  }
};

export default wechatExportPlugin;
