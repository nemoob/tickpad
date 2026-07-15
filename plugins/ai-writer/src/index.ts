import type { TickpadPlugin } from "@tickpad/plugin-api";

export interface AiProfile {
  id: string;
  nickname: string;
  baseUrl: string;
  model: string;
  systemPrompt?: string;
}

export interface AiWriterGeneratePayload {
  profile: AiProfile;
  prompt: string;
}

export interface AiWriterRuntime {
  complete(payload: AiWriterGeneratePayload): Promise<string>;
}

const requiredProfileFields = ["id", "nickname", "baseUrl", "model"] as const;
const profileIdPattern = /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export function sanitizeAiProfile(value: unknown): AiProfile {
  if (!isRecord(value) || requiredProfileFields.some((field) => typeof value[field] !== "string" || !value[field].trim())) {
    throw new Error("Invalid AI profile");
  }

  const id = (value.id as string).trim();
  const nickname = (value.nickname as string).trim();
  if (!profileIdPattern.test(id) || /[@\s]/u.test(nickname)) {
    throw new Error("Invalid AI profile");
  }

  const profile: AiProfile = {
    id,
    nickname,
    baseUrl: (value.baseUrl as string).trim(),
    model: (value.model as string).trim()
  };
  if (typeof value.systemPrompt === "string") {
    profile.systemPrompt = value.systemPrompt;
  }
  return profile;
}

export function getAiMentionQuery(input: string): string | null {
  const match = input.match(/(?:^|\s)@([^\s@]*)$/u);
  if (!match) {
    return null;
  }

  return (match[1] ?? "").toLocaleLowerCase();
}

export function getAiMentionSuggestions(input: string, profiles: readonly AiProfile[]): AiProfile[] {
  const query = getAiMentionQuery(input);
  if (query === null) {
    return [];
  }

  return profiles.filter((profile) => profile.nickname.toLocaleLowerCase().startsWith(query));
}

export function parseAiMention(input: string, profiles: readonly AiProfile[]): AiWriterGeneratePayload {
  const request = input.trimStart();
  const profile = [...profiles]
    .sort((left, right) => right.nickname.length - left.nickname.length)
    .find((candidate) => {
      const mention = `@${candidate.nickname}`;
      return request.slice(0, mention.length).toLocaleLowerCase() === mention.toLocaleLowerCase()
        && (request.length === mention.length || /\s/u.test(request[mention.length] ?? ""));
    });

  if (!profile) {
    throw new Error("Unknown AI profile");
  }

  return {
    profile,
    prompt: request.slice(profile.nickname.length + 1).trim()
  };
}

export function appendGeneratedMarkdown(markdown: string, generatedMarkdown: string): string {
  const generated = generatedMarkdown.trim();
  if (!generated) {
    return markdown;
  }
  if (!markdown.trim()) {
    return generated;
  }
  return `${markdown.trimEnd()}\n\n${generated}`;
}

const parseGeneratePayload = (value: unknown): AiWriterGeneratePayload => {
  if (!isRecord(value) || typeof value.prompt !== "string" || !value.prompt.trim()) {
    throw new Error("Invalid AI writer payload");
  }
  return {
    profile: sanitizeAiProfile(value.profile),
    prompt: value.prompt
  };
};

export function createAiWriterPlugin(runtime: AiWriterRuntime): TickpadPlugin {
  return {
    manifest: {
      id: "ai-writer",
      name: "AI Writer",
      version: "0.1.0",
      apiVersion: "0.1",
      permissions: ["document:read", "document:write"],
      contributes: {
        commands: ["ai-writer.generate"]
      }
    },
    activate(ctx) {
      ctx.commands.register({
        id: "ai-writer.generate",
        title: "Generate with AI",
        run: async (input) => {
          const payload = parseGeneratePayload(input);
          const generated = await runtime.complete(payload);
          ctx.document.setMarkdown(appendGeneratedMarkdown(ctx.document.getMarkdown(), generated));
        }
      });
    }
  };
}

export default createAiWriterPlugin;
