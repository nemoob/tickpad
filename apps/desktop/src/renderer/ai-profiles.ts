import { sanitizeAiProfile, type AiProfile } from "@tickpad/plugin-ai-writer";

const normalizeNickname = (nickname: string) => nickname.normalize("NFKC").toLocaleLowerCase();

function readProfile(value: unknown): AiProfile | null {
  if (!value || typeof value !== "object") {
    return null;
  }
  try {
    return sanitizeAiProfile(value as Record<string, unknown>);
  } catch {
    return null;
  }
}

export function parseStoredAiProfiles(raw: string | null): AiProfile[] {
  if (!raw) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(readProfile).filter((profile): profile is AiProfile => profile !== null) : [];
  } catch {
    return [];
  }
}

export function serializeAiProfiles(profiles: readonly AiProfile[]) {
  return JSON.stringify(profiles.map((profile) => sanitizeAiProfile(profile)));
}

export function upsertAiProfile(profiles: readonly AiProfile[], nextProfile: AiProfile) {
  const sanitized = sanitizeAiProfile(nextProfile);
  const nickname = normalizeNickname(sanitized.nickname);
  return [
    sanitized,
    ...profiles.filter(
      (profile) => profile.id !== sanitized.id && normalizeNickname(profile.nickname) !== nickname
    )
  ];
}
