import { z } from "zod";
import { withMeta } from "../helpers";

export const projectDetailSchema = z.object({
  name: withMeta(z.string().min(1).max(80), { label: "Nome do projeto" }),
  location: withMeta(z.string().min(1).max(80), { label: "Localização" }),
  year: withMeta(z.string().min(1).max(10), { label: "Ano" }),
  category: z.enum(["residential", "commercial", "corporate"]),
  description: withMeta(z.string().min(1).max(1000), {
    label: "Descrição do projeto",
    recommendedMax: 500,
  }),
  image: z.object({
    src: z.string().min(1),
    alt: z.string().min(1),
  }),
  backLabel: withMeta(z.string().min(1).max(30), { label: "Label de voltar" }),
  backHref: z.string().min(1),
});

export type ProjectDetailProps = z.infer<typeof projectDetailSchema>;
