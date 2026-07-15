import { mkdtemp, readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { afterEach, describe, expect, it, vi } from "vitest";

import { createAiCompletionService, createAiSecretVault } from "./ai-service";

const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })));
});

describe("AI service", () => {
  it("persists API keys only as encrypted bytes", async () => {
    const directory = await mkdtemp(join(tmpdir(), "tickpad-ai-"));
    temporaryDirectories.push(directory);
    const filePath = join(directory, "secrets.json");
    const vault = createAiSecretVault({
      filePath,
      encryption: {
        isEncryptionAvailable: () => true,
        encryptString: (value) => Buffer.from(`encrypted:${Buffer.from(value).toString("base64")}`),
        decryptString: (value) => Buffer.from(value.toString().replace("encrypted:", ""), "base64").toString()
      }
    });

    await vault.set("openai-main", "sk-sensitive", "https://api.openai.com/v1/");

    expect(await vault.has("openai-main")).toBe(true);
    expect(await vault.get("openai-main")).toEqual({
      apiKey: "sk-sensitive",
      baseUrl: "https://api.openai.com/v1"
    });
    expect(await readFile(filePath, "utf8")).not.toContain("sk-sensitive");
  });

  it("retrieves the key in the main process and sends an OpenAI-compatible request", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: "# Generated" } }] })
    });
    const service = createAiCompletionService({
      secrets: {
        get: vi.fn().mockResolvedValue({
          apiKey: "sk-sensitive",
          baseUrl: "https://api.openai.com/v1"
        })
      },
      fetchImpl
    });

    const result = await service.complete({
      profileId: "openai-main",
      baseUrl: "https://api.openai.com/v1",
      model: "configured-model",
      prompt: "Write an article",
      systemPrompt: "Return Markdown"
    });

    expect(result).toBe("# Generated");
    expect(fetchImpl).toHaveBeenCalledWith(
      "https://api.openai.com/v1/chat/completions",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ authorization: "Bearer sk-sensitive" }),
        redirect: "error",
        signal: expect.any(AbortSignal)
      })
    );
    expect(String(fetchImpl.mock.calls[0]?.[1]?.body)).toContain('"model":"configured-model"');
    expect(String(fetchImpl.mock.calls[0]?.[1]?.body)).not.toContain("sk-sensitive");
  });

  it("rejects remote insecure endpoints before reading a secret", async () => {
    const get = vi.fn();
    const service = createAiCompletionService({ secrets: { get }, fetchImpl: vi.fn() });

    await expect(
      service.complete({
        profileId: "profile",
        baseUrl: "http://example.com/v1",
        model: "model",
        prompt: "prompt"
      })
    ).rejects.toThrow("HTTPS");
    expect(get).not.toHaveBeenCalled();
  });

  it("rejects a profile endpoint change before sending the stored key", async () => {
    const get = vi.fn().mockResolvedValue({
      apiKey: "sk-sensitive",
      baseUrl: "https://api.openai.com/v1"
    });
    const fetchImpl = vi.fn();
    const service = createAiCompletionService({ secrets: { get }, fetchImpl });

    await expect(
      service.complete({
        profileId: "openai-main",
        baseUrl: "https://attacker.example/v1",
        model: "configured-model",
        prompt: "Write an article"
      })
    ).rejects.toThrow("does not match");

    expect(get).toHaveBeenCalledWith("openai-main");
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});
