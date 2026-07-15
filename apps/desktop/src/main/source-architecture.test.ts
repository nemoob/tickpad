import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";

import { describe, expect, test } from "vitest";

const repoRoot = resolve(__dirname, "../../../..");
const sourceRoots = ["apps/desktop/src", "packages", "plugins", "examples"];
const maxSourceFileLines = 500;
const sourceExtensions = new Set([".ts", ".tsx", ".css"]);
const ignoredPathSegments = new Set(["dist", "out", "release", "node_modules"]);

function hasIgnoredSegment(path: string) {
  return path.split(sep).some((segment) => ignoredPathSegments.has(segment));
}

function isSourceFile(path: string) {
  return Array.from(sourceExtensions).some((extension) => path.endsWith(extension));
}

function collectSourceFiles(directory: string): string[] {
  if (hasIgnoredSegment(directory)) {
    return [];
  }

  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    const stats = statSync(path);

    if (stats.isDirectory()) {
      return collectSourceFiles(path);
    }

    return stats.isFile() && isSourceFile(path) ? [path] : [];
  });
}

function countLines(path: string) {
  const content = readFileSync(path, "utf8");
  return content.length ? content.split(/\r?\n/).length : 0;
}

describe("source architecture", () => {
  test("keeps source files within the 500 line ownership limit", () => {
    const oversizedFiles = sourceRoots
      .flatMap((sourceRoot) => collectSourceFiles(resolve(repoRoot, sourceRoot)))
      .map((path) => ({ path: relative(repoRoot, path), lines: countLines(path) }))
      .filter((file) => file.lines > maxSourceFileLines)
      .sort((left, right) => right.lines - left.lines);

    expect(oversizedFiles).toEqual([]);
  });
});
