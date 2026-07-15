import { renderMarkdown, toPlainText } from "@tickpad/markdown-engine";
import type { TickpadPlugin, ProjectExportResult } from "@tickpad/plugin-api";

export type VercelSiteTemplateId = "article" | "docs" | "portfolio";

interface VercelSiteTemplate {
  id: VercelSiteTemplateId;
  title: string;
  description: string;
  renderBody(content: string, title: string): string;
  styles: string;
}

const baseStyles = `
:root {
  color: #202124;
  background: #f7f7f5;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-synthesis: none;
}

* { box-sizing: border-box; }
body { margin: 0; min-width: 320px; }
a { color: #1769aa; }
img { display: block; max-width: 100%; height: auto; }
pre { overflow-x: auto; padding: 1rem; color: #f8fafc; background: #202124; border-radius: 6px; }
code { font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace; }
:not(pre) > code { padding: 0.15rem 0.35rem; background: #e8eaed; border-radius: 4px; }
blockquote { margin-left: 0; padding-left: 1rem; color: #5f6368; border-left: 4px solid #a8aaad; }
.content { min-width: 0; overflow-wrap: anywhere; }
.content h1 { margin-top: 0; }
.content p, .content li { line-height: 1.75; }

@media (max-width: 700px) {
  .site { padding: 1.25rem; }
}
`.trim();

export const vercelSiteTemplates: readonly VercelSiteTemplate[] = [
  {
    id: "article",
    title: "Article",
    description: "A focused, readable long-form page.",
    renderBody: (content) => `<main class="site article"><article class="content">${content}</article></main>`,
    styles: `
body { border-top: 5px solid #d1495b; }
.article { width: min(100% - 2rem, 760px); margin: 0 auto; padding: 4rem 0 6rem; }
.article h1 { font-family: Georgia, "Times New Roman", serif; font-size: 4.8rem; line-height: 1.05; }
.article h2 { margin-top: 2.5rem; padding-bottom: 0.4rem; border-bottom: 1px solid #dadce0; }
.article p { font-family: Georgia, "Times New Roman", serif; font-size: 1.12rem; }

@media (max-width: 700px) {
  .article h1 { font-size: 2.35rem; }
}
`.trim()
  },
  {
    id: "docs",
    title: "Documentation",
    description: "A compact reference layout with persistent context.",
    renderBody: (content, title) =>
      `<div class="site docs"><aside class="docs-sidebar"><strong>${escapeHtml(title)}</strong><span>Documentation</span></aside><main class="content">${content}</main></div>`,
    styles: `
body { background: #ffffff; }
.docs { display: grid; grid-template-columns: 240px minmax(0, 760px); gap: 3rem; width: min(100% - 3rem, 1120px); margin: 0 auto; padding: 3rem 0 5rem; }
.docs-sidebar { position: sticky; top: 2rem; align-self: start; display: grid; gap: 0.35rem; padding-left: 1rem; border-left: 4px solid #1769aa; }
.docs-sidebar span { color: #5f6368; font-size: 0.875rem; }
.docs h1 { font-size: 2.5rem; line-height: 1.15; }
.docs h2 { margin-top: 2.75rem; }

@media (max-width: 700px) {
  .docs { display: block; width: 100%; padding: 1.25rem; }
  .docs-sidebar { position: static; margin-bottom: 2.5rem; }
}
`.trim()
  },
  {
    id: "portfolio",
    title: "Portfolio",
    description: "A bold showcase for projects and case studies.",
    renderBody: (content, title) =>
      `<main class="site portfolio"><header class="portfolio-header"><span>Selected work</span><strong>${escapeHtml(title)}</strong></header><section class="content">${content}</section></main>`,
    styles: `
body { color: #111111; background: #f4f0e8; }
.portfolio { width: min(100% - 3rem, 1080px); margin: 0 auto; padding: 2.5rem 0 6rem; }
.portfolio-header { display: flex; justify-content: space-between; gap: 2rem; padding-bottom: 1.25rem; border-bottom: 2px solid #111111; }
.portfolio-header span { color: #8a3d2f; text-transform: uppercase; }
.portfolio-header strong { overflow-wrap: anywhere; text-align: right; }
.portfolio .content { padding-top: 5rem; }
.portfolio h1 { max-width: 12ch; font-size: 7rem; line-height: 0.95; }
.portfolio h2 { margin-top: 3.5rem; font-size: 1.75rem; }
.portfolio li::marker { color: #8a3d2f; }

@media (max-width: 700px) {
  .portfolio-header { flex-direction: column; gap: 0.5rem; }
  .portfolio-header strong { text-align: left; }
  .portfolio .content { padding-top: 3rem; }
  .portfolio h1 { font-size: 2.75rem; }
}
`.trim()
  }
];

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const getDocumentTitle = (markdown: string, fallback: string) => {
  const heading = markdown.match(/^#\s+(.+)$/m)?.[1];
  return (heading && toPlainText(heading)) || fallback;
};

const toDirectoryName = (title: string) => {
  const slug = title
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 63)
    .replace(/-+$/g, "");
  return slug || "tickpad-site";
};

const renderDocument = (template: VercelSiteTemplate, markdown: string, title: string) => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="${escapeHtml(template.description)}" />
    <title>${escapeHtml(title)}</title>
    <link rel="stylesheet" href="/assets/styles.css" />
  </head>
  <body>
    ${template.renderBody(renderMarkdown(markdown), title)}
  </body>
</html>
`;

export function createVercelProject(templateId: VercelSiteTemplateId, markdown: string): ProjectExportResult {
  const template = vercelSiteTemplates.find((candidate) => candidate.id === templateId);
  if (!template) {
    throw new Error(`Unknown Vercel template: ${String(templateId)}`);
  }

  const title = getDocumentTitle(markdown, template.title);
  return {
    kind: "project",
    suggestedDirectoryName: toDirectoryName(title),
    files: [
      { path: "index.html", content: renderDocument(template, markdown, title) },
      { path: "assets/styles.css", content: `${baseStyles}\n\n${template.styles}\n` },
      {
        path: "README.md",
        content: `# ${title}\n\nGenerated with Tickpad's ${template.title} Vercel template.\n\nDeploy this directory as a static Vercel project.\n`
      },
      {
        path: "vercel.json",
        content: `${JSON.stringify(
          {
            $schema: "https://openapi.vercel.sh/vercel.json",
            cleanUrls: true
          },
          null,
          2
        )}\n`
      }
    ]
  };
}

export const vercelTemplatesPlugin: TickpadPlugin = {
  manifest: {
    id: "vercel-templates",
    name: "Vercel Templates",
    version: "0.1.0",
    apiVersion: "0.1",
    contributes: {
      exporters: vercelSiteTemplates.map((template) => `vercel-templates.${template.id}`)
    }
  },
  activate(ctx) {
    for (const template of vercelSiteTemplates) {
      ctx.exporters.register({
        id: `vercel-templates.${template.id}`,
        title: `Vercel ${template.title} Site`,
        output: "project",
        export: async (markdown) => createVercelProject(template.id, markdown)
      });
    }
  }
};

export default vercelTemplatesPlugin;
