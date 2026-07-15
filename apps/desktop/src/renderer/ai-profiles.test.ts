import { describe, expect, it } from "vitest";

import { parseStoredAiProfiles, serializeAiProfiles, upsertAiProfile } from "./ai-profiles";

const profile = {
  id: "openai-main",
  nickname: "OpenAI",
  baseUrl: "https://api.openai.com/v1",
  model: "configured-model",
  systemPrompt: "Return Markdown"
};

describe("AI profile preferences", () => {
  it("loads only validated non-secret profile metadata", () => {
    const stored = JSON.stringify([{ ...profile, apiKey: "sk-sensitive" }, { id: "broken" }]);

    expect(parseStoredAiProfiles(stored)).toEqual([profile]);
    expect(JSON.stringify(parseStoredAiProfiles(stored))).not.toContain("sk-sensitive");
  });

  it("serializes profile metadata without secret-shaped fields", () => {
    const serialized = serializeAiProfiles([{ ...profile, apiKey: "sk-sensitive" } as typeof profile]);

    expect(JSON.parse(serialized)).toEqual([profile]);
    expect(serialized).not.toContain("sk-sensitive");
  });

  it("keeps nicknames unique when adding or editing profiles", () => {
    const next = upsertAiProfile([profile], { ...profile, id: "openai-secondary", model: "other-model" });
    expect(next).toHaveLength(1);
    expect(next[0]?.model).toBe("other-model");
  });
});
