import { z } from "zod";
import { withMeta } from "../helpers";

export const statItemSchema = z.object({
  value: withMeta(z.string().min(1).max(20), {
    label: "Valor numérico",
  }),
  label: withMeta(z.string().min(1).max(50), {
    label: "Rótulo",
  }),
});

export const statsSchema = z.object({
  items: z.array(statItemSchema).min(1),
});

export type StatItem = z.infer<typeof statItemSchema>;
export type StatsProps = z.infer<typeof statsSchema>;
