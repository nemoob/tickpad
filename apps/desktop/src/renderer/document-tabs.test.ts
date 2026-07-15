import { describe, expect, test } from "vitest";

import {
  closeOpenDocumentId,
  closeOpenDocumentIdsByScope,
  ensureOpenDocumentId,
  getNextActiveDocumentIdAfterScopedTabClose,
  getNextActiveDocumentIdAfterTabClose,
  getTabDocuments,
  pruneOpenDocumentIds
} from "./document-tabs";
import type { LocalDocument } from "./types";

const documents = [
  { id: "one", title: "One.md", markdown: "", icon: "file" },
  { id: "two", title: "Two.md", markdown: "", icon: "file" },
  { id: "three", title: "Three.md", markdown: "", icon: "file" }
] as LocalDocument[];

describe("document tabs", () => {
  test("closes a tab without removing the document from the file list", () => {
    const nextOpenIds = closeOpenDocumentId(["one", "two", "three"], "two");

    expect(nextOpenIds).toEqual(["one", "three"]);
    expect(documents.map((document) => document.id)).toEqual(["one", "two", "three"]);
  });

  test("closes the final tab without removing its document", () => {
    expect(closeOpenDocumentId(["one"], "one")).toEqual([]);
    expect(documents.map((document) => document.id)).toContain("one");
  });

  test("adds a selected document back to the open tab list", () => {
    expect(ensureOpenDocumentId(["one"], "two")).toEqual(["one", "two"]);
    expect(ensureOpenDocumentId(["one", "two"], "two")).toEqual(["one", "two"]);
  });

  test("picks the adjacent active tab when closing the current tab", () => {
    expect(getNextActiveDocumentIdAfterTabClose(["one", "two", "three"], "two", "two")).toBe("three");
    expect(getNextActiveDocumentIdAfterTabClose(["one", "two", "three"], "one", "two")).toBe("one");
  });

  test("closes open tabs by scope from a selected tab", () => {
    const openIds = ["one", "two", "three", "four"];

    expect(closeOpenDocumentIdsByScope(openIds, "two", "right")).toEqual(["one", "two"]);
    expect(closeOpenDocumentIdsByScope(openIds, "two", "others")).toEqual(["two"]);
    expect(closeOpenDocumentIdsByScope(openIds, "two", "all")).toEqual([]);
    expect(closeOpenDocumentIdsByScope(openIds, "missing", "right")).toEqual(openIds);
  });

  test("moves active tab only when scoped tab close removes it", () => {
    expect(getNextActiveDocumentIdAfterScopedTabClose(["one", "two", "three"], "one", "two", "right")).toBe("one");
    expect(getNextActiveDocumentIdAfterScopedTabClose(["one", "two", "three"], "three", "two", "right")).toBe("two");
    expect(getNextActiveDocumentIdAfterScopedTabClose(["one", "two", "three"], "one", "two", "others")).toBe("two");
  });

  test("renders tabs from open ids and prunes deleted document ids", () => {
    expect(getTabDocuments(documents, ["three", "missing", "one"]).map((document) => document.id)).toEqual(["three", "one"]);
    expect(pruneOpenDocumentIds(["missing"], documents)).toEqual([]);
    expect(ensureOpenDocumentId([], "one")).toEqual(["one"]);
  });
});
