import { describe, expect, test } from "vitest";

import { buildDocumentOutline } from "./document-outline";

describe("document outline", () => {
  test("keeps every heading instead of silently truncating long outlines", () => {
    const markdown = Array.from({ length: 14 }, (_, index) => `## Heading ${index + 1}`).join("\n");

    expect(buildDocumentOutline(markdown)).toHaveLength(14);
  });
});
