import { z } from "zod";
import { withMeta } from "../helpers";

export const teamMemberSchema = z.object({
  id: z.string().min(1),
  name: withMeta(z.string().min(1).max(60), { label: "Nome" }),
  role: withMeta(z.string().min(1).max(60), { label: "Cargo" }),
  bio: withMeta(z.string().min(1).max(300), {
    label: "Biografia",
    recommendedMax: 200,
  }),
  image: z.object({
    src: z.string().min(1),
    alt: z.string().min(1),
  }),
});

export const teamSchema = z.object({
  eyebrow: withMeta(z.string().min(1).max(40), { label: "Eyebrow text" }),
  headline: withMeta(z.string().min(1).max(80), {
    label: "Título",
    recommendedMax: 60,
  }),
  description: withMeta(z.string().max(300).optional(), {
    label: "Descrição",
    recommendedMax: 200,
  }),
  members: z.array(teamMemberSchema).min(1),
});

export type TeamMember = z.infer<typeof teamMemberSchema>;
export type TeamProps = z.infer<typeof teamSchema>;
