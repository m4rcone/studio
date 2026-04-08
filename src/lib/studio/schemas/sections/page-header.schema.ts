import { z } from "zod";
import { withMeta } from "../helpers";

export const pageHeaderSchema = z.object({
  title: withMeta(z.string().min(1).max(80), {
    label: "Título da página",
    recommendedMax: 60,
  }),
  subtitle: withMeta(z.string().max(200).optional(), {
    label: "Subtítulo",
    recommendedMax: 150,
  }),
  eyebrow: withMeta(z.string().max(40).optional(), {
    label: "Eyebrow text",
  }),
});

export type PageHeaderProps = z.infer<typeof pageHeaderSchema>;
