import { createEditorDocument, starterMarkdown } from "@tickpad/editor-core";

import type { LocalDocument } from "./types";

const pluginApiMarkdown = `# Plugin API

Tickpad plugins extend the editor without coupling to the Electron shell.

## Capabilities

- Commands
- Panels
- Markdown blocks
- Exporters
- Permissioned host APIs

\`\`\`ts
export default {
  manifest: {
    id: "example.panel",
    name: "Example Panel",
    version: "0.1.0",
    apiVersion: "0.1",
    permissions: ["document:read"]
  },
  activate(ctx) {
    ctx.panels.register({
      id: "example.panel",
      title: "Example",
      render: () => ctx.document.getMarkdown().slice(0, 80)
    })
  }
}
\`\`\`
`;

const mermaidMarkdown = [
  "# Mermaid",
  "",
  "Tickpad renders Mermaid blocks directly in the editor.",
  "",
  "```mermaid",
  "flowchart LR",
  "  Write[Write Markdown] --> Parse[Detect mermaid fence]",
  "  Parse --> Render[Render SVG]",
  "  Render --> Diagram[Show diagram in editor]",
  "```",
  ""
].join("\n");

export const sampleDocuments: LocalDocument[] = [
  {
    ...createEditorDocument(starterMarkdown),
    id: "tickpad",
    title: "Tickpad.md",
    icon: "file",
    format: "markdown",
    treePath: "Docs/Tickpad.md"
  },
  {
    ...createEditorDocument(pluginApiMarkdown),
    id: "plugin-api",
    title: "Plugin API.md",
    icon: "plugin",
    format: "markdown",
    treePath: "Plugins/Plugin API.md"
  },
  {
    ...createEditorDocument(mermaidMarkdown),
    id: "mermaid",
    title: "Mermaid.md",
    icon: "plugin",
    format: "markdown",
    treePath: "Plugins/Mermaid.md"
  }
];
