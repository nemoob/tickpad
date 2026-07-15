import { describe, expect, test } from "vitest";
import { buildDocumentTree, filterDocumentTree, getDocumentFolderIds, getDocumentTreeSegments, sortDocumentsForRail } from "./document-tree";

describe("document tree", () => {
  test("groups documents by treePath folders", () => {
    const tree = buildDocumentTree([
      { id: "intro", title: "Intro.md", treePath: "Docs/Intro.md" },
      { id: "api", title: "API.md", treePath: "Docs/API.md" },
      { id: "mermaid", title: "Mermaid.md", treePath: "Plugins/Mermaid.md" }
    ]);

    expect(tree.map((node) => node.name)).toEqual(["Docs", "Plugins"]);
    expect(tree[0]?.children.map((node) => node.name)).toEqual(["Intro.md", "API.md"]);
    expect(tree[1]?.children[0]?.document?.id).toBe("mermaid");
  });

  test("includes empty local folders", () => {
    const tree = buildDocumentTree([{ id: "intro", title: "Intro.md", treePath: "Docs/Intro.md" }], ["Docs/Drafts"]);

    expect(tree[0]?.name).toBe("Docs");
    expect(tree[0]?.children.map((node) => node.name)).toEqual(["Drafts", "Intro.md"]);
    expect(tree[0]?.children[0]?.document).toBeUndefined();
  });

  test("falls back to the parent folder for opened files", () => {
    const document = { id: "opened", title: "Plan.md", path: "/tmp/workspace/docs/Plan.md" };

    expect(getDocumentTreeSegments(document)).toEqual(["docs", "Plan.md"]);
    expect(getDocumentFolderIds(document)).toEqual(["root/docs"]);
  });

  test("keeps pinned documents first inside their folder", () => {
    const documents = [
      { id: "intro", title: "Intro.md", treePath: "Docs/Intro.md" },
      { id: "api", title: "API.md", treePath: "Plugins/API.md" },
      { id: "draft", title: "Draft.md", treePath: "Docs/Draft.md" }
    ];

    expect(sortDocumentsForRail(documents, new Set(["draft"])).map((document) => document.id)).toEqual(["draft", "intro", "api"]);
  });

  test("filters folders and documents by a search query", () => {
    const tree = buildDocumentTree([
      { id: "intro", title: "Intro.md", treePath: "Docs/Intro.md" },
      { id: "api", title: "API.md", treePath: "Plugins/API.md" },
      { id: "mermaid", title: "Mermaid.md", treePath: "Plugins/Mermaid.md" }
    ]);

    expect(filterDocumentTree(tree, "mer").map((node) => node.name)).toEqual(["Plugins"]);
    expect(filterDocumentTree(tree, "mer")[0]?.children.map((node) => node.name)).toEqual(["Mermaid.md"]);
    expect(filterDocumentTree(tree, "docs").map((node) => node.name)).toEqual(["Docs"]);
    expect(filterDocumentTree(tree, "docs")[0]?.children.map((node) => node.name)).toEqual(["Intro.md"]);
    expect(filterDocumentTree(tree, "missing")).toEqual([]);
  });
});
