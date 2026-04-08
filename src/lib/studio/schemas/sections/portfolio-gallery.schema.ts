import { z } from "zod";
import { withMeta } from "../helpers";

export const galleryProjectSchema = z.object({
  id: z.string().min(1),
  name: withMeta(z.string().min(1).max(60), { label: "Nome do projeto" }),
  location: withMeta(z.string().min(1).max(80), { label: "Localização" }),
  year: withMeta(z.string().min(1).max(10), { label: "Ano" }),
  category: z.enum(["residential", "commercial", "corporate"]),
  image: z.object({
    src: z.string().min(1),
    alt: z.string().min(1),
  }),
  href: z.string().optional(),
});

export const portfolioGallerySchema = z.object({
  allLabel: withMeta(z.string().min(1).max(30), {
    label: "Label do filtro todos",
  }),
  projects: z.array(galleryProjectSchema).min(1),
});

export type GalleryProject = z.infer<typeof galleryProjectSchema>;
export type PortfolioGalleryProps = z.infer<typeof portfolioGallerySchema>;
