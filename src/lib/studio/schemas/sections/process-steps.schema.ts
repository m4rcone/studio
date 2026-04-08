import { z } from "zod";
import { withMeta } from "../helpers";

export const processStepSchema = z.object({
  id: z.string().min(1),
  number: withMeta(z.string().min(1).max(5), { label: "Número da etapa" }),
  title: withMeta(z.string().min(1).max(60), { label: "Título da etapa" }),
  description: withMeta(z.string().min(1).max(300), {
    label: "Descrição da etapa",
    recommendedMax: 200,
  }),
});

export const processStepsSchema = z.object({
  eyebrow: withMeta(z.string().min(1).max(40), { label: "Eyebrow text" }),
  headline: withMeta(z.string().min(1).max(80), {
    label: "Título",
    recommendedMax: 60,
  }),
  subtitle: withMeta(z.string().max(200).optional(), {
    label: "Subtítulo",
    recommendedMax: 150,
  }),
  steps: z.array(processStepSchema).min(1),
});

export type ProcessStep = z.infer<typeof processStepSchema>;
export type ProcessStepsProps = z.infer<typeof processStepsSchema>;
