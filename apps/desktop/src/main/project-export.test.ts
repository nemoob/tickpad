import { access, mkdtemp, mkdir, readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { afterEach, describe, expect, it } from "vitest";

import { exportProjectToDirectory, validateProjectExport } from "./project-export";

const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })));
});

const project = {
  kind: "project" as const,
  suggestedDirectoryName: "my-site",
  files: [
    { path: "index.html", content: "<h1>Hello</h1>" },
    { path: "assets/styles.css", content: "body {}" }
  ]
};

describe("project export", () => {
  it("writes a new project directory without overwriting user files", async () => {
    const parentDirectory = await mkdtemp(join(tmpdir(), "tickpad-project-"));
    temporaryDirectories.push(parentDirectory);

    const projectPath = await exportProjectToDirectory(parentDirectory, project);

    expect(projectPath).toBe(join(parentDirectory, "my-site"));
    expect(await readFile(join(projectPath, "index.html"), "utf8")).toBe("<h1>Hello</h1>");
    expect(await readFile(join(projectPath, "assets/styles.css"), "utf8")).toBe("body {}");
    await expect(exportProjectToDirectory(parentDirectory, project)).rejects.toThrow("already exists");
  });

  it.each(["../escape.txt", "/tmp/absolute.txt", "assets\\file.css", "./same.txt"])("rejects unsafe file path %s", (path) => {
    expect(() => validateProjectExport({ ...project, files: [{ path, content: "unsafe" }] })).toThrow("path");
  });

  it("rejects duplicate paths before creating a directory", async () => {
    const parentDirectory = await mkdtemp(join(tmpdir(), "tickpad-project-"));
    temporaryDirectories.push(parentDirectory);
    const duplicateProject = {
      ...project,
      files: [
        { path: "index.html", content: "one" },
        { path: "INDEX.html", content: "two" }
      ]
    };

    await expect(exportProjectToDirectory(parentDirectory, duplicateProject)).rejects.toThrow("Duplicate");
    await expect(access(join(parentDirectory, "my-site"))).rejects.toThrow();
  });
});
