import { z } from "zod";

export const navigationLinkSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1),
});

export const navigationCtaSchema = navigationLinkSchema.extend({
  style: z.enum(["primary", "secondary"]),
});

export const navigationSchema = z.object({
  header: z.object({
    links: z.array(navigationLinkSchema),
    cta: navigationCtaSchema,
  }),
  footer: z.object({
    links: z.array(navigationLinkSchema),
    copyright: z.string().min(1),
    contactLabel: z.string().min(1),
    socialLabel: z.string().min(1),
  }),
});

export type NavigationLink = z.infer<typeof navigationLinkSchema>;
export type NavigationCta = z.infer<typeof navigationCtaSchema>;
export type Navigation = z.infer<typeof navigationSchema>;
