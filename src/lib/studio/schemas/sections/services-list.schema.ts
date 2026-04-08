import { z } from "zod";
import { withMeta } from "../helpers";

export const serviceItemSchema = z.object({
  id: z.string().min(1),
  number: withMeta(z.string().min(1).max(5), { label: "Número do serviço" }),
  name: withMeta(z.string().min(1).max(60), { label: "Nome do serviço" }),
  description: withMeta(z.string().min(1).max(300), {
    label: "Descrição do serviço",
    recommendedMax: 200,
  }),
  details: z.array(z.string()).optional(),
});

export const servicesListSchema = z.object({
  eyebrow: withMeta(z.string().min(1).max(40), { label: "Eyebrow text" }),
  headline: withMeta(z.string().min(1).max(80), {
    label: "Título",
    recommendedMax: 60,
  }),
  intro: withMeta(z.string().max(300).optional(), {
    label: "Introdução",
    recommendedMax: 200,
  }),
  items: z.array(serviceItemSchema).min(1),
});

export type ServiceItem = z.infer<typeof serviceItemSchema>;
export type ServicesListProps = z.infer<typeof servicesListSchema>;
