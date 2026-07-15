import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

export interface SafeStorageLike {
  isEncryptionAvailable(): boolean;
  encryptString(value: string): Buffer;
  decryptString(value: Buffer): string;
}

export interface AiSecretVault {
  set(profileId: string, apiKey: string, baseUrl: string): Promise<void>;
  get(profileId: string): Promise<AiSecretRecord | undefined>;
  has(profileId: string): Promise<boolean>;
  delete(profileId: string): Promise<void>;
}

export interface AiSecretRecord {
  apiKey: string;
  baseUrl: string;
}

export interface AiCompletionRequest {
  profileId: string;
  baseUrl: string;
  model: string;
  prompt: string;
  systemPrompt?: string;
}

type FetchResponse = {
  ok: boolean;
  status?: number;
  json(): Promise<unknown>;
};

type FetchLike = (url: string, init: RequestInit) => Promise<FetchResponse>;

type SecretReader = Pick<AiSecretVault, "get">;

const profileIdPattern = /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/;
const requestTimeoutMs = 30_000;

function assertProfileId(profileId: unknown): asserts profileId is string {
  if (typeof profileId !== "string" || !profileIdPattern.test(profileId)) {
    throw new Error("Invalid AI profile ID");
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const requireNonEmptyString = (value: unknown, field: string): string => {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Invalid AI ${field}`);
  }
  return value;
};

const normalizeHttpsBaseUrl = (baseUrl: unknown): string => {
  if (typeof baseUrl !== "string") {
    throw new Error("AI endpoint must use HTTPS");
  }

  let url: URL;
  try {
    url = new URL(baseUrl);
  } catch {
    throw new Error("AI endpoint must use HTTPS");
  }
  if (url.protocol !== "https:") {
    throw new Error("AI endpoint must use HTTPS");
  }
  if (url.username || url.password) {
    throw new Error("AI endpoint must not contain credentials");
  }
  if (url.search || url.hash) {
    throw new Error("AI endpoint must not contain a query or fragment");
  }

  url.pathname = url.pathname.replace(/\/+$/, "") || "/";
  return url.toString();
};

const getChatCompletionsUrl = (baseUrl: string): string => {
  const url = new URL(baseUrl);
  url.pathname = `${url.pathname.replace(/\/+$/, "")}/chat/completions`;
  return url.toString();
};

const readEncryptedSecrets = async (filePath: string): Promise<Record<string, string>> => {
  let contents: string;
  try {
    contents = await readFile(filePath, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return Object.create(null) as Record<string, string>;
    }
    throw new Error("Unable to read AI secret store");
  }

  try {
    const parsed = JSON.parse(contents) as unknown;
    if (!isRecord(parsed)) {
      throw new Error();
    }
    const secrets = Object.create(null) as Record<string, string>;
    for (const [profileId, encrypted] of Object.entries(parsed)) {
      if (profileIdPattern.test(profileId) && typeof encrypted === "string") {
        secrets[profileId] = encrypted;
      }
    }
    return secrets;
  } catch {
    throw new Error("Unable to read AI secret store");
  }
};

const writeEncryptedSecrets = async (filePath: string, secrets: Record<string, string>) => {
  try {
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, JSON.stringify(secrets), { encoding: "utf8", mode: 0o600 });
  } catch {
    throw new Error("Unable to write AI secret store");
  }
};

const requireEncryption = (encryption: SafeStorageLike) => {
  try {
    if (encryption.isEncryptionAvailable()) {
      return;
    }
  } catch {
    // The fixed error below avoids exposing implementation details.
  }
  throw new Error("Secure storage encryption is unavailable");
};

export function createAiSecretVault(options: { filePath: string; encryption: SafeStorageLike }): AiSecretVault {
  const get = async (profileId: string) => {
    assertProfileId(profileId);
    const encrypted = (await readEncryptedSecrets(options.filePath))[profileId];
    if (encrypted === undefined) {
      return undefined;
    }

    requireEncryption(options.encryption);
    try {
      const decrypted = JSON.parse(options.encryption.decryptString(Buffer.from(encrypted, "base64"))) as unknown;
      if (!isRecord(decrypted) || typeof decrypted.apiKey !== "string" || typeof decrypted.baseUrl !== "string") {
        throw new Error();
      }
      if (!decrypted.apiKey.trim() || /[\r\n]/u.test(decrypted.apiKey)) {
        throw new Error();
      }
      return {
        apiKey: decrypted.apiKey,
        baseUrl: normalizeHttpsBaseUrl(decrypted.baseUrl)
      };
    } catch {
      throw new Error("Unable to decrypt AI credential");
    }
  };

  return {
    async set(profileId, apiKey, baseUrl) {
      assertProfileId(profileId);
      if (typeof apiKey !== "string" || !apiKey.trim() || /[\r\n]/u.test(apiKey)) {
        throw new Error("Invalid AI credential");
      }
      const normalizedBaseUrl = normalizeHttpsBaseUrl(baseUrl);
      requireEncryption(options.encryption);

      let encrypted: string;
      try {
        encrypted = options.encryption
          .encryptString(JSON.stringify({ apiKey, baseUrl: normalizedBaseUrl }))
          .toString("base64");
      } catch {
        throw new Error("Unable to encrypt AI credential");
      }

      const secrets = await readEncryptedSecrets(options.filePath);
      secrets[profileId] = encrypted;
      await writeEncryptedSecrets(options.filePath, secrets);
    },
    get,
    async has(profileId) {
      assertProfileId(profileId);
      return Object.hasOwn(await readEncryptedSecrets(options.filePath), profileId);
    },
    async delete(profileId) {
      assertProfileId(profileId);
      const secrets = await readEncryptedSecrets(options.filePath);
      if (!Object.hasOwn(secrets, profileId)) {
        return;
      }
      delete secrets[profileId];
      await writeEncryptedSecrets(options.filePath, secrets);
    }
  };
}

const getCompletionContent = (body: unknown): string | undefined => {
  if (!isRecord(body) || !Array.isArray(body.choices)) {
    return undefined;
  }
  const choice = body.choices[0];
  if (!isRecord(choice) || !isRecord(choice.message)) {
    return undefined;
  }
  return typeof choice.message.content === "string" ? choice.message.content : undefined;
};

export function createAiCompletionService(options: { secrets: SecretReader; fetchImpl?: FetchLike }) {
  const fetchImpl = options.fetchImpl ?? (globalThis.fetch as FetchLike);

  return {
    async complete(request: AiCompletionRequest): Promise<string> {
      if (!isRecord(request)) {
        throw new Error("Invalid AI completion request");
      }
      assertProfileId(request.profileId);
      const normalizedBaseUrl = normalizeHttpsBaseUrl(request.baseUrl);
      const model = requireNonEmptyString(request.model, "model");
      const prompt = requireNonEmptyString(request.prompt, "prompt");
      if (request.systemPrompt !== undefined && typeof request.systemPrompt !== "string") {
        throw new Error("Invalid AI system prompt");
      }

      let secret: AiSecretRecord | undefined;
      try {
        secret = await options.secrets.get(request.profileId);
      } catch {
        throw new Error("Unable to access AI credentials");
      }
      if (!secret || !isRecord(secret) || typeof secret.apiKey !== "string" || typeof secret.baseUrl !== "string") {
        throw new Error("No API key is stored for this AI profile");
      }
      const apiKey = secret.apiKey;
      if (!apiKey.trim() || /[\r\n]/u.test(apiKey)) {
        throw new Error("No API key is stored for this AI profile");
      }
      let storedBaseUrl: string;
      try {
        storedBaseUrl = normalizeHttpsBaseUrl(secret.baseUrl);
      } catch {
        throw new Error("Unable to access AI credentials");
      }
      if (storedBaseUrl !== normalizedBaseUrl) {
        throw new Error("AI profile endpoint does not match the stored credential");
      }

      const messages: Array<{ role: "system" | "user"; content: string }> = [];
      if (request.systemPrompt?.trim()) {
        messages.push({ role: "system", content: request.systemPrompt });
      }
      messages.push({ role: "user", content: prompt });
      const body = JSON.stringify({ model, messages });
      if (body.includes(apiKey)) {
        throw new Error("AI credential cannot be included in request content");
      }

      let response: FetchResponse;
      try {
        response = await fetchImpl(getChatCompletionsUrl(normalizedBaseUrl), {
          method: "POST",
          redirect: "error",
          signal: AbortSignal.timeout(requestTimeoutMs),
          headers: {
            accept: "application/json",
            authorization: `Bearer ${apiKey}`,
            "content-type": "application/json"
          },
          body
        });
      } catch {
        throw new Error("AI request failed");
      }

      if (!response.ok) {
        const status = typeof response.status === "number" ? ` (${response.status})` : "";
        throw new Error(`AI request failed${status}`);
      }

      let responseBody: unknown;
      try {
        responseBody = await response.json();
      } catch {
        throw new Error("AI service returned an invalid response");
      }
      const content = getCompletionContent(responseBody);
      if (content === undefined || content.includes(apiKey)) {
        throw new Error("AI service returned an invalid response");
      }
      return content;
    }
  };
}
