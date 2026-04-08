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
    if (!existsSync(fullPath)) return [];
    const entries = await readdir(fullPath, { withFileTypes: true });
    return entries
      .filter((e) => e.isFile())
      .map((e) => path.join(directory, e.name));
  }

  async readTextFile(filePath: string): Promise<string> {
    return this.readFile(filePath);
  }
}
