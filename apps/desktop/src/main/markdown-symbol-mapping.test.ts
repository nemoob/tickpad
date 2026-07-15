import { describe, expect, test } from "vitest";

import { appSource } from "./layout-test-sources";

describe("markdown symbol mapping setting", () => {
  test("adds a writing setting for Chinese IME markdown symbol mapping", () => {
    expect(appSource).toContain("tickpad:markdown-symbol-mapping");
    expect(appSource).toContain("getMarkdownSymbolMappingEnabled");
    expect(appSource).toContain("setMarkdownSymbolMappingEnabled(nextEnabled)");
    expect(appSource).toContain("normalizeInputSymbols: getMarkdownSymbolMappingEnabled()");
    expect(appSource).toContain("{t.markdownSymbolMapping}");
    expect(appSource).toContain("{t.markdownSymbolMappingDescription}");
  });
});
