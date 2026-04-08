import { z } from "zod";
import { withMeta } from "../helpers";

export const ctaSchema = z.object({
  headline: withMeta(z.string().min(1).max(80), {
    label: "Título",
    recommendedMax: 60,
  }),
  text: withMeta(z.string().max(300).optional(), {
    label: "Texto de apoio",
    recommendedMax: 200,
  }),
  cta: z.object({
    label: z.string().min(1).max(30),
    href: z.string().min(1),
    style: z.enum(["primary", "secondary", "whatsapp", "outline"]).optional(),
  }),
});

export type CtaProps = z.infer<typeof ctaSchema>;
