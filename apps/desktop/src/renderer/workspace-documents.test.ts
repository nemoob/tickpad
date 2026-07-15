import { describe, expect, test } from "vitest";

import { createWorkspaceDocuments } from "./workspace-documents";

describe("workspace documents", () => {
  test("creates a blank draft when the selected workspace has no supported files", () => {
    const documents = createWorkspaceDocuments({ rootPath: "/Users/example/Empty Workspace", files: [] });

    expect(documents).toHaveLength(1);
    expect(documents[0]).toMatchObject({
      id: "file:/Users/example/Empty Workspace/Untitled.md",
      path: "/Users/example/Empty Workspace/Untitled.md",
      title: "Untitled.md",
      markdown: "",
      dirty: true,
      format: "markdown",
      icon: "file",
      treePath: "Untitled.md"
    });
  });
});
