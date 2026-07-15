import { renderMarkdown } from "@tickpad/markdown-engine";

export function exportHtml(markdown: string): string {
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Tickpad Export</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; line-height: 1.65; max-width: 760px; margin: 48px auto; padding: 0 24px; color: #172018; }
    pre { background: #f3f5f1; padding: 16px; overflow: auto; }
    blockquote { border-left: 3px solid #7f947e; margin-left: 0; padding-left: 16px; color: #4d5f4c; }
  </style>
</head>
<body>
${renderMarkdown(markdown)}
</body>
</html>`;
}
