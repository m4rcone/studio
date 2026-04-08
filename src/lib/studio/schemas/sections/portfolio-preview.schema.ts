import { z } from "zod";
import { withMeta } from "../helpers";

export const portfolioPreviewItemSchema = z.object({
  id: z.string().min(1),
  name: withMeta(z.string().min(1).max(60), { label: "Nome do projeto" }),
  location: withMeta(z.string().min(1).max(80), { label: "Localização" }),
  category: z.enum(["residential", "commercial", "corporate"]),
  image: z.object({
    src: z.string().min(1),
    alt: z.string().min(1),
  }),
  href: z.string().optional(),
});

export const portfolioPreviewSchema = z.object({
  eyebrow: withMeta(z.string().min(1).max(40), { label: "Eyebrow text" }),
  headline: withMeta(z.string().min(1).max(80), {
    label: "Título",
    recommendedMax: 60,
  }),
  subheadline: withMeta(z.string().max(200).optional(), {
    label: "Subtítulo",
    recommendedMax: 150,
  }),
  viewAllLabel: withMeta(z.string().min(1).max(30), {
    label: "Label do botão ver todos",
  }),
  viewAllHref: z.string().min(1),
  items: z.array(portfolioPreviewItemSchema).min(1),
});

export type PortfolioPreviewItem = z.infer<typeof portfolioPreviewItemSchema>;
export type PortfolioPreviewProps = z.infer<typeof portfolioPreviewSchema>;
