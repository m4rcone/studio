import type { z } from "zod";
import { getSectionSchema as getSharedSectionSchema } from "@/lib/section-registry";

import { siteConfigSchema } from "./site-config.schema";
import { navigationSchema } from "./navigation.schema";
import { mediaManifestSchema } from "./media-manifest.schema";
import { pageDataSchema } from "./page-data.schema";
// ─── Section schema registry ──────────────────────────────────────────────────

export function getSectionSchema(type: string): z.ZodType | null {
  return getSharedSectionSchema(type);
}

// ─── File schema registry ─────────────────────────────────────────────────────

interface SchemaRule {
  match: RegExp;
  schema: z.ZodType;
}

const FILE_SCHEMA_REGISTRY: SchemaRule[] = [
  { match: /^site\.config\.json$/, schema: siteConfigSchema },
  { match: /^navigation\.json$/, schema: navigationSchema },
  { match: /^media\/manifest\.json$/, schema: mediaManifestSchema },
  { match: /^pages\/.*\.data\.json$/, schema: pageDataSchema },
];

export function getSchemaForFile(path: string): z.ZodType | null {
  const rule = FILE_SCHEMA_REGISTRY.find((r) => r.match.test(path));
  return rule?.schema ?? null;
}

export function validateContentFile(
  path: string,
  data: unknown,
): { success: true } | { success: false; errors: z.ZodError } {
  const schema = getSchemaForFile(path);
  if (!schema) return { success: true };

  const result = schema.safeParse(data);
  if (result.success) return { success: true };
  return { success: false, errors: result.error };
}

// ─── Re-exports ───────────────────────────────────────────────────────────────

export { siteConfigSchema } from "./site-config.schema";
export { navigationSchema } from "./navigation.schema";
export { mediaManifestSchema } from "./media-manifest.schema";
export {
  pageDataSchema,
  pageMetaSchema,
  sectionEntrySchema,
} from "./page-data.schema";

export { heroSchema } from "./sections/hero.schema";
export { featuresSchema, featuresItemSchema } from "./sections/features.schema";
export { ctaSchema } from "./sections/cta.schema";
export { statsSchema, statItemSchema } from "./sections/stats.schema";
export { pageHeaderSchema } from "./sections/page-header.schema";
export {
  portfolioPreviewSchema,
  portfolioPreviewItemSchema,
} from "./sections/portfolio-preview.schema";
export {
  testimonialsSchema,
  testimonialItemSchema,
} from "./sections/testimonials.schema";
export { teamSchema, teamMemberSchema } from "./sections/team.schema";
export {
  timelineSchema,
  timelineEventSchema,
} from "./sections/timeline.schema";
export {
  philosophySchema,
  philosophyValueSchema,
} from "./sections/philosophy.schema";
export {
  servicesListSchema,
  serviceItemSchema,
} from "./sections/services-list.schema";
export {
  processStepsSchema,
  processStepSchema,
} from "./sections/process-steps.schema";
export {
  portfolioGallerySchema,
  galleryProjectSchema,
} from "./sections/portfolio-gallery.schema";
export {
  contactSectionSchema,
  contactFieldSchema,
} from "./sections/contact-section.schema";
export { projectDetailSchema } from "./sections/project-detail.schema";
