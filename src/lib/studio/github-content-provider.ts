import type { ContentProvider, FileChange } from "./content-provider";
import * as github from "./github";

export class GitHubContentProvider implements ContentProvider {
  async readFile(path: string, branch?: string): Promise<string> {
    const { content } = await github.readFile(path, branch);
    return content;
  }

  async writeFiles(
    files: FileChange[],
    commitMessage: string,
    branch: string,
  ): Promise<{ sha: string }> {
    const sha = await github.createMultiFileCommit(
      branch,
      files,
      commitMessage,
    );
    return { sha };
  }

  async listFiles(directory: string): Promise<string[]> {
    return github.listFiles(directory);
  }

  async readTextFile(path: string): Promise<string> {
    return this.readFile(path);
  }
}
