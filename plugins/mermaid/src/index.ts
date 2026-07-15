import type { TickpadPlugin } from "@tickpad/plugin-api";

export const mermaidPlugin: TickpadPlugin = {
  manifest: {
    id: "mermaid",
    name: "Mermaid",
    version: "0.1.0",
    apiVersion: "0.1",
    contributes: {
      markdownBlocks: ["mermaid"]
    }
  },
  activate(ctx) {
    ctx.markdown.registerBlock({
      language: "mermaid",
      render: (code) => `<figure class="ml-mermaid" data-plugin="mermaid"><figcaption>Mermaid</figcaption><pre>${code}</pre></figure>`
    });
  }
};

export default mermaidPlugin;
