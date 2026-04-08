import { z } from "zod";

export const pageMetaSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
});

export const sectionEntrySchema = z.object({
  type: z.string().min(1),
  id: z.string().min(1),
  data: z.record(z.string(), z.unknown()),
});

export const pageDataSchema = z.object({
  slug: z.string().min(1),
  meta: pageMetaSchema,
  sections: z.array(sectionEntrySchema).min(1),
});

export type PageMeta = z.infer<typeof pageMetaSchema>;
export type SectionEntry = z.infer<typeof sectionEntrySchema>;
export type PageData = z.infer<typeof pageDataSchema>;
