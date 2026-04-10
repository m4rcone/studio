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
  // listFiles always returns files recursively from the given directory.
  listFiles(directory: string, branch?: string): Promise<string[]>;
  readTextFile(path: string): Promise<string>;
}

function hasGitHubStudioConfig(): boolean {
  return Boolean(
    process.env.GITHUB_TOKEN &&
    process.env.GITHUB_OWNER &&
    process.env.GITHUB_REPO,
  );
}

export async function getContentProvider(): Promise<ContentProvider> {
  // Production should always use GitHub so Studio behaves identically to the
  // deployed environment and Turbopack can statically avoid tracing the local
  // filesystem provider into server bundles.
  if (process.env.NODE_ENV === "production") {
    const { GitHubContentProvider } = await import("./github-content-provider");
    return new GitHubContentProvider();
  }

  const explicitProvider = process.env.STUDIO_CONTENT_PROVIDER;
  const forceFilesystem =
    explicitProvider === "filesystem" ||
    process.env.FORCE_LOCAL_FILESYSTEM === "true";
  const forceGitHub =
    explicitProvider === "github" ||
    process.env.FORCE_GITHUB_API === "true" ||
    process.env.FORCE_GITHUB_API === "1";

  // Prefer GitHub whenever the Studio has the production credentials available,
  // even during local development. This keeps local testing aligned with the
  // production behavior: reads come from GitHub and applies create commits/PRs.
  if (!forceFilesystem && (forceGitHub || hasGitHubStudioConfig())) {
    const { GitHubContentProvider } = await import("./github-content-provider");
    return new GitHubContentProvider();
  }

  // Fallback for offline / local-only workflows.
  if (forceFilesystem || process.env.NODE_ENV === "development") {
    const { FilesystemContentProvider } =
      await import("./filesystem-content-provider");
    return new FilesystemContentProvider();
  }

  const { GitHubContentProvider } = await import("./github-content-provider");
  return new GitHubContentProvider();
}
