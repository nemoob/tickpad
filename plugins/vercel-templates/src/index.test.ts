import { createPluginHost } from "@tickpad/plugin-host";
import { describe, expect, it } from "vitest";

import { createVercelProject, vercelSiteTemplates, vercelTemplatesPlugin } from "./index";

const markdown = [
  "# Product Notes",
  "",
  "A concise project description.",
  "",
  "## Features",
  "",
  "- Fast",
  "- Portable"
].join("\n");

describe("Vercel templates plugin", () => {
  it("ships three focused static-site templates", () => {
    expect(vercelSiteTemplates.map((template) => template.id)).toEqual(["article", "docs", "portfolio"]);
  });

  it.each(["article", "docs", "portfolio"] as const)("builds a deployable %s project", (templateId) => {
    const project = createVercelProject(templateId, markdown);
    const files = new Map(project.files.map((file) => [file.path, file.content]));

    expect(project.kind).toBe("project");
    expect(project.suggestedDirectoryName).toBe("product-notes");
    expect(files.has("index.html")).toBe(true);
    expect(files.has("assets/styles.css")).toBe(true);
    expect(files.has("README.md")).toBe(true);
    expect(files.get("index.html")).toContain("Product Notes");
    expect(files.get("index.html")).toContain("Features");
    expect(JSON.parse(files.get("vercel.json") ?? "{}")).toMatchObject({
      $schema: "https://openapi.vercel.sh/vercel.json",
      cleanUrls: true
    });
  });

  it("registers every template as a project exporter", async () => {
    const host = createPluginHost({ markdown });

    await host.activate(vercelTemplatesPlugin);

    const exporters = host.getExporters().filter((exporter) => exporter.output === "project");
    expect(exporters.map((exporter) => exporter.id)).toEqual([
      "vercel-templates.article",
      "vercel-templates.docs",
      "vercel-templates.portfolio"
    ]);
    await expect(exporters[0]?.export(markdown)).resolves.toMatchObject({ kind: "project" });
  });
});
