import { describe, expect, test } from "vitest";

import { deleteFolderByPath, renameFolderByPath } from "./document-model";
import type { LocalDocument } from "./types";

const documents = [
  { id: "intro", title: "Intro.md", treePath: "Docs/Intro.md", markdown: "", icon: "file" },
  { id: "draft", title: "Draft.md", treePath: "Docs/Drafts/Draft.md", markdown: "", icon: "file" },
  { id: "api", title: "API.md", treePath: "Plugins/API.md", markdown: "", icon: "plugin" }
] as LocalDocument[];

describe("document model folders", () => {
  test("renames a folder path and moves nested documents", () => {
    const result = renameFolderByPath(documents, ["Docs", "Docs/Drafts"], "Docs", "Notes");

    expect(result.folders).toEqual(["Notes", "Notes/Drafts"]);
    expect(result.documents.map((document) => document.treePath)).toEqual(["Notes/Intro.md", "Notes/Drafts/Draft.md", "Plugins/API.md"]);
  });

  test("deletes a folder path and all nested documents", () => {
    const result = deleteFolderByPath(documents, ["Docs", "Docs/Drafts", "Plugins"], "Docs");

    expect(result.folders).toEqual(["Plugins"]);
    expect(result.documents.map((document) => document.id)).toEqual(["api"]);
  });
});
