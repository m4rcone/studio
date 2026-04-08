import { z } from "zod";
import { withMeta } from "../helpers";

export const contactFieldSchema = z.object({
  name: z.string().min(1),
  label: withMeta(z.string().min(1).max(40), { label: "Rótulo do campo" }),
  type: z.enum(["text", "email", "tel", "textarea"]),
  required: z.boolean().optional(),
});

export const contactSectionSchema = z.object({
  headline: withMeta(z.string().min(1).max(80), {
    label: "Título",
    recommendedMax: 60,
  }),
  description: withMeta(z.string().min(1).max(300), {
    label: "Descrição",
    recommendedMax: 200,
  }),
  phone: z.string().min(1),
  email: z.string().email(),
  address: z.string().min(1),
  hours: z.string().min(1),
  whatsappUrl: z.string().min(1),
  whatsappLabel: withMeta(z.string().min(1).max(40), {
    label: "Label do WhatsApp",
  }),
  fields: z.array(contactFieldSchema).min(1),
  submitLabel: withMeta(z.string().min(1).max(30), {
    label: "Label do botão enviar",
  }),
  successMessage: withMeta(z.string().min(1).max(200), {
    label: "Mensagem de sucesso",
  }),
});

export type ContactField = z.infer<typeof contactFieldSchema>;
export type ContactSectionProps = z.infer<typeof contactSectionSchema>;
