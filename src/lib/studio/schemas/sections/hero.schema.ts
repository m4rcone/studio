import { z } from "zod";
import { withMeta } from "../helpers";

export const heroSchema = z.object({
  headline: withMeta(z.string().min(1).max(80), {
    label: "Título principal",
    recommendedMax: 60,
    severity: "warning",
  }),
  subheadline: withMeta(z.string().max(200).optional(), {
    label: "Subtítulo",
    recommendedMax: 150,
  }),
  cta: z.object({
    label: z.string().min(1).max(30),
    href: z.string().min(1),
    style: z.enum(["primary", "secondary", "whatsapp", "outline"]).optional(),
  }),
  secondaryCta: z
    .object({
      label: z.string().min(1),
      href: z.string().min(1),
    })
    .optional(),
  image: z.object({
    src: z.string().min(1),
    alt: z.string().min(1),
  }),
});

export type HeroProps = z.infer<typeof heroSchema>;
