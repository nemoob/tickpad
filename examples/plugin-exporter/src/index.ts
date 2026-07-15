import type { TickpadPlugin } from "@tickpad/plugin-api";

export default {
  manifest: {
    id: "plain-text-export",
    name: "Plain Text Export",
    version: "0.1.0",
    apiVersion: "0.1",
    permissions: ["document:read"],
    contributes: {
      exporters: ["plain-text"]
    }
  },
  activate(ctx) {
    ctx.exporters.register({
      id: "plain-text",
      title: "Plain Text",
      export: (markdown) => markdown.replace(/[#*_`>\-[\]()]/g, "")
    });
  }
} satisfies TickpadPlugin;
