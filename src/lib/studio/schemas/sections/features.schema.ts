import { z } from "zod";
import { withMeta } from "../helpers";

export const featuresItemSchema = z.object({
  id: z.string().min(1),
  title: withMeta(z.string().min(1).max(60), {
    label: "Título do item",
    recommendedMax: 40,
  }),
  description: withMeta(z.string().min(1).max(300), {
    label: "Descrição do item",
    recommendedMax: 200,
  }),
  icon: z.string().optional(),
});

export const featuresSchema = z.object({
  headline: withMeta(z.string().min(1).max(80), {
    label: "Título da seção",
    recommendedMax: 60,
  }),
  subheadline: withMeta(z.string().max(200).optional(), {
    label: "Subtítulo",
    recommendedMax: 150,
  }),
  items: z.array(featuresItemSchema).min(1),
});

export type FeaturesItem = z.infer<typeof featuresItemSchema>;
export type FeaturesProps = z.infer<typeof featuresSchema>;
