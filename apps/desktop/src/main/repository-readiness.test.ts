import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

const repositoryRoot = resolve(__dirname, "../../../..");
const readRepositoryFile = (path: string) => readFileSync(resolve(repositoryRoot, path), "utf8");
const readPackageJson = (path: string) => JSON.parse(readRepositoryFile(path)) as Record<string, unknown>;
const findFiles = (directory: string, suffixes: string[]): string[] =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) return findFiles(path, suffixes);
    return suffixes.some((suffix) => entry.name.endsWith(suffix)) ? [path] : [];
  });

describe("public repository readiness", () => {
  test("includes publication metadata and continuous integration", () => {
    const license = readRepositoryFile("LICENSE");
    const workflow = readRepositoryFile(".github/workflows/ci.yml");
    const gitignore = readRepositoryFile(".gitignore");

    expect(license).toContain("MIT License");
    expect(workflow).toContain("pnpm install --frozen-lockfile");
    expect(workflow).toContain("pnpm test");
    expect(workflow).toContain("pnpm typecheck");
    expect(workflow).toContain("pnpm build");
    expect(existsSync(resolve(repositoryRoot, "Bn"))).toBe(false);
  });

  test("includes public contribution guidance and templates", () => {
    for (const path of ["SECURITY.md", "CONTRIBUTING.md", "CODE_OF_CONDUCT.md", ".github/ISSUE_TEMPLATE/bug_report.md", ".github/ISSUE_TEMPLATE/feature_request.md", ".github/pull_request_template.md"]) {
      expect(existsSync(resolve(repositoryRoot, path))).toBe(true);
    }
  });

  test("ignores local environment files and private keys", () => {
    const gitignore = readRepositoryFile(".gitignore");
    const rules = gitignore.split(/\r?\n/);

    for (const rule of [
      "node_modules/",
      "dist/",
      "out/",
      "apps/*/out/",
      "apps/*/release/",
      "coverage/",
      "test-results/",
      ".idea/",
      ".vscode/",
      "*.tsbuildinfo",
      ".DS_Store",
      ".env",
      ".env.*",
      "!.env.example",
      "*.pem",
      "*.key",
      "*.p12"
    ]) {
      expect(rules).toContain(rule);
    }
  });

  test("keeps workspace package metadata private and toolchain versions fixed", () => {
    const rootPackage = readPackageJson("package.json");
    const packagePaths = ["apps", "packages", "plugins", "examples"].flatMap((directory) =>
      readdirSync(resolve(repositoryRoot, directory), { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .filter((entry) => existsSync(resolve(repositoryRoot, directory, entry.name, "package.json")))
        .map((entry) => `${directory}/${entry.name}/package.json`)
    );

    expect(rootPackage.engines).toEqual({ node: ">=22" });
    expect(rootPackage.packageManager).toBe("pnpm@11.7.0");
    for (const path of packagePaths) {
      expect(readPackageJson(path).private, path).toBe(true);
    }
  });

  test("keeps public test fixtures free from internal identifiers and machine paths", () => {
    const fixtureSources = ["apps", "packages", "plugins", "examples"]
      .flatMap((directory) => findFiles(resolve(repositoryRoot, directory), [".test.ts", ".test.tsx"]))
      .map((path) => readFileSync(path, "utf8"))
      .join("\n");
    expect(fixtureSources).not.toMatch(/\b[A-Z]{3,}[A-Z0-9]*-\d{4,}\b/);
    expect(fixtureSources).not.toMatch(/\b[a-z0-9-]+\.(?:[a-z0-9-]+\.)?(?:internal|intranet|corp|local)\b/i);
    expect(fixtureSources).not.toMatch(/\/Users\/(?!example(?:\/|$))[^/\s]+/);
  });
});
