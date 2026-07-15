import { describe, expect, it, vi } from "vitest";
import type { TickpadPlugin } from "@tickpad/plugin-api";
import { createPluginHost, PermissionDeniedError } from "./index";

describe("plugin host", () => {
  it("activates plugins and registers commands, panels, blocks, styles, and exporters", async () => {
    const host = createPluginHost({ markdown: "# Hello" });
    const plugin: TickpadPlugin = {
      manifest: { id: "sample", name: "Sample", version: "0.1.0", apiVersion: "0.1", permissions: ["document:read"] },
      activate(ctx) {
        ctx.commands.register({ id: "sample.command", title: "Sample", run: () => undefined });
        ctx.panels.register({ id: "sample.panel", title: "Sample", render: () => "panel" });
        ctx.markdown.registerBlock({ language: "sample", render: (code) => `<x-sample>${code}</x-sample>` });
        ctx.codeBlockStyles.register({
          id: "sample.dark",
          title: "Sample Dark",
          tokens: {
            background: "#111827",
            text: "#f8fafc",
            muted: "#94a3b8",
            controlBackground: "#1f2937",
            activeBackground: "#374151",
            border: "#374151"
          }
        });
        ctx.exporters.register({ id: "sample.export", title: "Sample", export: (markdown) => markdown.toUpperCase() });
      }
    };

    await host.activate(plugin);

    expect(host.getCommands().map((item) => item.id)).toEqual(["sample.command"]);
    expect(host.getPanels().map((item) => item.id)).toEqual(["sample.panel"]);
    expect(host.getMarkdownBlocks().map((item) => item.language)).toEqual(["sample"]);
    expect(host.getCodeBlockStyles().map((item) => item.id)).toEqual(["sample.dark"]);
    expect(await host.getExporters()[0].export("hello")).toBe("HELLO");
  });

  it("blocks privileged APIs unless the manifest declares permission", async () => {
    const host = createPluginHost({ markdown: "# Hello" });
    const plugin: TickpadPlugin = {
      manifest: { id: "blocked", name: "Blocked", version: "0.1.0", apiVersion: "0.1", permissions: ["document:read"] },
      async activate(ctx) {
        await ctx.clipboard.writeText("secret");
      }
    };

    await expect(host.activate(plugin)).rejects.toBeInstanceOf(PermissionDeniedError);
  });

  it("emits document lifecycle events to plugins", async () => {
    const host = createPluginHost({ markdown: "# Hello" });
    const onSave = vi.fn();
    await host.activate({
      manifest: { id: "events", name: "Events", version: "0.1.0", apiVersion: "0.1" },
      activate(ctx) {
        ctx.events.on("document:save", onSave);
      }
    });

    await host.emit("document:save", { path: "note.md" });

    expect(onSave).toHaveBeenCalledWith({ path: "note.md" });
  });

  it("forwards command payloads and reports plugin document updates", async () => {
    const onMarkdownChange = vi.fn();
    const host = createPluginHost({ markdown: "# Draft", onMarkdownChange });
    await host.activate({
      manifest: {
        id: "writer",
        name: "Writer",
        version: "0.1.0",
        apiVersion: "0.1",
        permissions: ["document:write"]
      },
      activate(ctx) {
        ctx.commands.register({
          id: "writer.replace",
          title: "Replace draft",
          run(input) {
            ctx.document.setMarkdown(String(input));
          }
        });
      }
    });

    await host.getCommands()[0]?.run("# Generated");

    expect(host.getMarkdown()).toBe("# Generated");
    expect(onMarkdownChange).toHaveBeenCalledWith("# Generated");
  });

  it("rejects plugins built for an incompatible API version", async () => {
    const host = createPluginHost({ markdown: "# Hello" });

    await expect(
      host.activate({
        manifest: { id: "future", name: "Future", version: "9.0.0", apiVersion: "9.0" as "0.1" },
        activate() {
          throw new Error("should not activate");
        }
      })
    ).rejects.toThrow('Unsupported plugin API version "9.0"');
  });
});
