import { readdir, readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

export type {
  SiteConfig,
  Navigation,
  NavigationLink,
  NavigationCta,
  PageData,
  PageMeta,
  SectionEntry,
  MediaManifest,
  MediaManifestEntry,
} from "@/types/content";

import type { SiteConfig, Navigation, PageData } from "@/types/content";

// ─── Helpers ───────────────────────────────────────────────────────────────────

const CONTENT_DIR = path.join(process.cwd(), "content");

async function readJson<T>(filePath: string): Promise<T> {
  let raw: string;
  try {
    raw = await readFile(filePath, "utf-8");
  } catch {
    throw new Error(`Could not read file: ${filePath}`);
  }
  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new Error(`Invalid JSON at: ${filePath}`);
  }
}

// ─── Public API ────────────────────────────────────────────────────────────────

export async function getPageData(slug: string): Promise<PageData> {
  const filePath = path.join(CONTENT_DIR, "pages", `${slug}.data.json`);
  if (!existsSync(filePath)) {
    const { notFound } = await import("next/navigation");
    notFound();
  }
  return readJson<PageData>(filePath);
}

export async function getSiteConfig(): Promise<SiteConfig> {
  return readJson<SiteConfig>(path.join(CONTENT_DIR, "site.config.json"));
}

export async function getNavigation(): Promise<Navigation> {
  return readJson<Navigation>(path.join(CONTENT_DIR, "navigation.json"));
}

export async function getAllPages(): Promise<string[]> {
  const pagesDir = path.join(CONTENT_DIR, "pages");
  const entries = await readdir(pagesDir);
  return entries
    .filter((f) => f.endsWith(".data.json"))
    .map((f) => f.replace(/\.data\.json$/, ""));
}
