export interface FileChange {
  path: string;
  content: string;
}

export interface ContentProvider {
  readFile(path: string, branch?: string): Promise<string>;
  writeFiles(
    files: FileChange[],
    commitMessage: string,
    branch: string,
  ): Promise<{ sha: string }>;
  listFiles(directory: string): Promise<string[]>;
  readTextFile(path: string): Promise<string>;
}

export async function getContentProvider(): Promise<ContentProvider> {
  if (process.env.NODE_ENV === "development" && !process.env.FORCE_GITHUB_API) {
    // Lazy import to avoid loading fs in edge/production
    const { FilesystemContentProvider } =
      await import("./filesystem-content-provider");
    return new FilesystemContentProvider();
  }
  const { GitHubContentProvider } = await import("./github-content-provider");
  return new GitHubContentProvider();
}
