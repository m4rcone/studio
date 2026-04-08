import { z } from "zod";
import { withMeta } from "../helpers";

export const philosophyValueSchema = z.object({
  id: z.string().min(1),
  title: withMeta(z.string().min(1).max(60), { label: "Título do valor" }),
  description: withMeta(z.string().min(1).max(300), {
    label: "Descrição do valor",
    recommendedMax: 200,
  }),
});

export const philosophySchema = z.object({
  eyebrow: withMeta(z.string().min(1).max(40), { label: "Eyebrow text" }),
  headline: withMeta(z.string().min(1).max(80), {
    label: "Título",
    recommendedMax: 60,
  }),
  body: withMeta(z.string().min(1).max(1000), {
    label: "Texto principal",
    recommendedMax: 500,
  }),
  bodySecondary: withMeta(z.string().max(1000).optional(), {
    label: "Texto secundário",
    recommendedMax: 500,
  }),
  values: z.array(philosophyValueSchema).min(1),
});

export type PhilosophyValue = z.infer<typeof philosophyValueSchema>;
export type PhilosophyProps = z.infer<typeof philosophySchema>;
