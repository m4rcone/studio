import { z } from "zod";

export const mediaManifestEntrySchema = z.object({
  src: z.string().min(1),
  alt: z.string().min(1),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  usedIn: z.array(z.string()),
});

export const mediaManifestSchema = z.object({
  images: z.array(mediaManifestEntrySchema),
});

export type MediaManifestEntry = z.infer<typeof mediaManifestEntrySchema>;
export type MediaManifest = z.infer<typeof mediaManifestSchema>;
