import { readFile, readdir, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import type { ContentProvider, FileChange } from "./content-provider";

const PROJECT_ROOT = process.cwd();

export class FilesystemContentProvider implements ContentProvider {
  private resolve(filePath: string): string {
    return path.join(PROJECT_ROOT, filePath);
  }

  async readFile(filePath: string): Promise<string> {
    const fullPath = this.resolve(filePath);
    return readFile(fullPath, "utf-8");
  }

  async writeFiles(
    files: FileChange[],
    // _commitMessage: string,
    // _branch: string,
  ): Promise<{ sha: string }> {
    for (const file of files) {
      const fullPath = this.resolve(file.path);
      const dir = path.dirname(fullPath);
      if (!existsSync(dir)) {
        await mkdir(dir, { recursive: true });
      }
      await writeFile(fullPath, file.content, "utf-8");
    }
    // No real commit in dev — return a placeholder SHA
    return { sha: `local-${Date.now()}` };
  }

  async listFiles(directory: string): Promise<string[]> {
    const fullPath = this.resolve(directory);
    return listFilesRecursive(fullPath, directory);
  }

  async readTextFile(filePath: string): Promise<string> {
    return this.readFile(filePath);
  }
}

async function listFilesRecursive(
  fullPath: string,
  relativePath: string,
): Promise<string[]> {
  if (!existsSync(fullPath)) return [];

  const entries = await readdir(fullPath, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const nextFullPath = path.join(fullPath, entry.name);
      const nextRelativePath = path.join(relativePath, entry.name);

      if (entry.isDirectory()) {
        return listFilesRecursive(nextFullPath, nextRelativePath);
      }

      return [nextRelativePath];
    }),
  );

  return files.flat().sort();
}
