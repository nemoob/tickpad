import { mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, join, posix } from "node:path";

import type { ProjectExportResult } from "@tickpad/plugin-api";

const invalidPortableName = /[<>:"|?*\u0000-\u001f]/;
const reservedWindowsName = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i;

const isSafeSegment = (segment: string) =>
  segment.length > 0 &&
  segment === segment.trim() &&
  segment !== "." &&
  segment !== ".." &&
  !segment.endsWith(".") &&
  !invalidPortableName.test(segment) &&
  !reservedWindowsName.test(segment);

const canonicalPath = (path: string) => path.normalize("NFC").toLowerCase();

function validateDirectoryName(value: unknown): asserts value is string {
  if (
    typeof value !== "string" ||
    !isSafeSegment(value) ||
    value.includes("/") ||
    value.includes("\\")
  ) {
    throw new Error("Invalid project directory name.");
  }
}

function validateFilePath(value: unknown): asserts value is string {
  if (
    typeof value !== "string" ||
    value.length === 0 ||
    value.includes("\\") ||
    posix.isAbsolute(value) ||
    posix.normalize(value) !== value ||
    !value.split("/").every(isSafeSegment)
  ) {
    throw new Error(`Invalid project file path: ${String(value)}`);
  }
}

export function validateProjectExport(project: unknown): asserts project is ProjectExportResult {
  if (!project || typeof project !== "object" || (project as { kind?: unknown }).kind !== "project") {
    throw new Error("Invalid project export kind.");
  }

  const candidate = project as Partial<ProjectExportResult>;
  validateDirectoryName(candidate.suggestedDirectoryName);
  if (!Array.isArray(candidate.files) || candidate.files.length === 0) {
    throw new Error("A project export must contain at least one file.");
  }

  const paths = new Set<string>();
  for (const file of candidate.files) {
    if (!file || typeof file !== "object") {
      throw new Error("Invalid project export file.");
    }
    validateFilePath(file.path);
    if (typeof file.content !== "string") {
      throw new Error(`Invalid content for project file path: ${file.path}`);
    }

    const normalizedPath = canonicalPath(file.path);
    if (paths.has(normalizedPath)) {
      throw new Error(`Duplicate project file path: ${file.path}`);
    }
    paths.add(normalizedPath);
  }

  for (const path of paths) {
    const segments = path.split("/");
    for (let index = 1; index < segments.length; index += 1) {
      const parentPath = segments.slice(0, index).join("/");
      if (paths.has(parentPath)) {
        throw new Error(`Project file path conflicts with directory path: ${path}`);
      }
    }
  }
}

const isFileSystemError = (error: unknown): error is NodeJS.ErrnoException =>
  error instanceof Error && "code" in error;

export async function exportProjectToDirectory(
  parentDirectory: string,
  project: ProjectExportResult
): Promise<string> {
  if (typeof parentDirectory !== "string" || parentDirectory.trim().length === 0) {
    throw new Error("Invalid parent directory path.");
  }

  validateProjectExport(project);
  const directoryName = project.suggestedDirectoryName;
  const files = project.files.map((file) => ({ ...file }));
  const projectPath = join(parentDirectory, directoryName);
  let createdProjectDirectory = false;

  try {
    await mkdir(projectPath);
    createdProjectDirectory = true;

    for (const file of files) {
      const filePath = join(projectPath, ...file.path.split("/"));
      await mkdir(dirname(filePath), { recursive: true });
      await writeFile(filePath, file.content, { encoding: "utf8", flag: "wx" });
    }

    return projectPath;
  } catch (error) {
    if (createdProjectDirectory) {
      await rm(projectPath, { recursive: true, force: true });
    } else if (isFileSystemError(error) && error.code === "EEXIST") {
      throw new Error(`Project directory already exists: ${projectPath}`, { cause: error });
    }
    throw error;
  }
}
