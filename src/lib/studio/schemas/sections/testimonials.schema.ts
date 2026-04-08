import { z } from "zod";
import { withMeta } from "../helpers";

export const testimonialItemSchema = z.object({
  id: z.string().min(1),
  quote: withMeta(z.string().min(1).max(500), {
    label: "Depoimento",
    recommendedMax: 300,
  }),
  name: withMeta(z.string().min(1).max(60), { label: "Nome do cliente" }),
  description: withMeta(z.string().min(1).max(100), {
    label: "Descrição do cliente",
  }),
});

export const testimonialsSchema = z.object({
  eyebrow: withMeta(z.string().min(1).max(40), { label: "Eyebrow text" }),
  headline: withMeta(z.string().min(1).max(80), {
    label: "Título",
    recommendedMax: 60,
  }),
  items: z.array(testimonialItemSchema).min(1),
});

export type TestimonialItem = z.infer<typeof testimonialItemSchema>;
export type TestimonialsProps = z.infer<typeof testimonialsSchema>;
