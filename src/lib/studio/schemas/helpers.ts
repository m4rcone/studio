import { z } from "zod";

export interface FieldMeta {
  label?: string;
  recommendedMax?: number;
  severity?: "error" | "warning";
}

/**
 * Associates display/validation metadata with a Zod schema field
 * without changing its runtime validation behavior.
 * Used by the Proposal Engine to generate warnings and by the UI to show limits.
 */
export function withMeta<T extends z.ZodType>(schema: T, meta: FieldMeta): T {
  return schema.describe(JSON.stringify(meta));
}
