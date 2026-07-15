import type { TickpadPlugin } from "@tickpad/plugin-api";

export default {
  manifest: {
    id: "reading-time",
    name: "Reading Time",
    version: "0.1.0",
    apiVersion: "0.1",
    permissions: ["document:read"],
    contributes: {
      panels: ["reading-time.panel"]
    }
  },
  activate(ctx) {
    ctx.panels.register({
      id: "reading-time.panel",
      title: "Reading Time",
      render: () => `${Math.max(1, Math.ceil(ctx.document.getStats().words / 220))} min read`
    });
  }
} satisfies TickpadPlugin;
