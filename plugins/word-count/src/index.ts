import type { TickpadPlugin } from "@tickpad/plugin-api";

export const wordCountPlugin: TickpadPlugin = {
  manifest: {
    id: "word-count",
    name: "Word Count",
    version: "0.1.0",
    apiVersion: "0.1",
    permissions: ["document:read", "clipboard:write"],
    contributes: {
      commands: ["word-count.copy"],
      panels: ["word-count.panel"]
    }
  },
  activate(ctx) {
    ctx.panels.register({
      id: "word-count.panel",
      title: "Word Count",
      render: () => {
        const stats = ctx.document.getStats();
        return `${stats.words} words · ${stats.characters} characters · ${stats.lines} lines`;
      }
    });

    ctx.commands.register({
      id: "word-count.copy",
      title: "Copy word count",
      run: async () => {
        const stats = ctx.document.getStats();
        await ctx.clipboard.writeText(String(stats.words));
      }
    });
  }
};

export default wordCountPlugin;
