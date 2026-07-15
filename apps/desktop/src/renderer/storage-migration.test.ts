import { describe, expect, it } from "vitest";

import { migrateLegacyStorage } from "./storage-migration";

class MemoryStorage implements Storage {
  private readonly values = new Map<string, string>();

  get length() {
    return this.values.size;
  }

  clear() {
    this.values.clear();
  }

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  key(index: number) {
    return [...this.values.keys()][index] ?? null;
  }

  removeItem(key: string) {
    this.values.delete(key);
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
}

describe("Tickpad storage migration", () => {
  it("moves legacy settings without overwriting current values", () => {
    const storage = new MemoryStorage();
    storage.setItem("markdownloom:theme", "dark");
    storage.setItem("markdownloom:documents", "legacy documents");
    storage.setItem("tickpad:theme", "light");

    migrateLegacyStorage(storage);

    expect(storage.getItem("tickpad:theme")).toBe("light");
    expect(storage.getItem("tickpad:documents")).toBe("legacy documents");
    expect(storage.getItem("markdownloom:theme")).toBeNull();
    expect(storage.getItem("markdownloom:documents")).toBeNull();
  });
});
