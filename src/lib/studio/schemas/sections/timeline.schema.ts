import { z } from "zod";
import { withMeta } from "../helpers";

export const timelineEventSchema = z.object({
  id: z.string().min(1),
  year: withMeta(z.string().min(1).max(10), { label: "Ano" }),
  title: withMeta(z.string().min(1).max(80), { label: "Título do evento" }),
  description: withMeta(z.string().min(1).max(300), {
    label: "Descrição do evento",
    recommendedMax: 200,
  }),
});

export const timelineSchema = z.object({
  eyebrow: withMeta(z.string().min(1).max(40), { label: "Eyebrow text" }),
  headline: withMeta(z.string().min(1).max(80), {
    label: "Título",
    recommendedMax: 60,
  }),
  events: z.array(timelineEventSchema).min(1),
});

export type TimelineEvent = z.infer<typeof timelineEventSchema>;
export type TimelineProps = z.infer<typeof timelineSchema>;
