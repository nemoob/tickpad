import { createPluginHost } from "@tickpad/plugin-host";
import { describe, expect, it, vi } from "vitest";

import {
  appendGeneratedMarkdown,
  createAiWriterPlugin,
  getAiMentionQuery,
  getAiMentionSuggestions,
  parseAiMention,
  sanitizeAiProfile,
  type AiProfile
} from "./index";

const profiles: AiProfile[] = [
  {
    id: "openai-main",
    nickname: "OpenAI",
    baseUrl: "https://api.openai.com/v1",
    model: "configured-model",
    systemPrompt: "Write clear Markdown."
  },
  {
    id: "deepseek-main",
    nickname: "深度",
    baseUrl: "https://api.deepseek.com/v1",
    model: "configured-model"
  }
];

describe("AI writer plugin", () => {
  it("suggests configured profiles after @ and parses a writing request", () => {
    expect(getAiMentionQuery("@")).toBe("");
    expect(getAiMentionQuery("draft @Op")).toBe("op");
    expect(getAiMentionQuery("draft text")).toBeNull();
    expect(getAiMentionSuggestions("@op", profiles).map((profile) => profile.id)).toEqual(["openai-main"]);
    expect(getAiMentionSuggestions("@", profiles)).toHaveLength(2);
    expect(parseAiMention("@深度 写一篇发布说明", profiles)).toEqual({
      profile: profiles[1],
      prompt: "写一篇发布说明"
    });
    expect(() => parseAiMention("@missing 写文章", profiles)).toThrow("Unknown AI profile");
  });

  it("removes secret-shaped fields before profile metadata is persisted", () => {
    const profile = sanitizeAiProfile({ ...profiles[0], apiKey: "sk-sensitive", extra: "ignored" });

    expect(profile).toEqual(profiles[0]);
    expect(JSON.stringify(profile)).not.toContain("sk-sensitive");
    expect(profile).not.toHaveProperty("apiKey");
  });

  it("normalizes profile metadata and rejects nicknames that cannot be mentioned", () => {
    expect(sanitizeAiProfile({
      id: " profile-1 ",
      nickname: " 写作 ",
      baseUrl: " https://example.com/v1 ",
      model: " model-1 "
    })).toMatchObject({
      id: "profile-1",
      nickname: "写作",
      baseUrl: "https://example.com/v1",
      model: "model-1"
    });
    expect(() => sanitizeAiProfile({ ...profiles[0], nickname: "my writer" })).toThrow("Invalid AI profile");
    expect(() => sanitizeAiProfile({ ...profiles[0], nickname: "@writer" })).toThrow("Invalid AI profile");
  });

  it("calls the injected secure runtime and appends generated Markdown", async () => {
    const complete = vi.fn().mockResolvedValue("## Generated\n\nArticle body");
    const onMarkdownChange = vi.fn();
    const host = createPluginHost({ markdown: "# Existing", onMarkdownChange });

    await host.activate(createAiWriterPlugin({ complete }));
    const command = host.getCommands().find((item) => item.id === "ai-writer.generate");
    await command?.run({ profile: profiles[0], prompt: "Write an article" });

    expect(complete).toHaveBeenCalledWith({ profile: profiles[0], prompt: "Write an article" });
    expect(complete.mock.calls[0]?.[0]).not.toHaveProperty("apiKey");
    expect(onMarkdownChange).toHaveBeenCalledWith("# Existing\n\n## Generated\n\nArticle body");
  });

  it("uses generated text directly for an empty document", () => {
    expect(appendGeneratedMarkdown("  ", "# New article\n")).toBe("# New article");
  });
});
