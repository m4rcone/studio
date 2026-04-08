import { z } from "zod";

const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/);

export const siteConfigSchema = z.object({
  brand: z.object({
    name: z.string().min(1),
    tagline: z.string().min(1),
    logo: z.string().min(1),
  }),
  theme: z.object({
    colors: z.object({
      primary: hexColor,
      "primary-foreground": hexColor,
      secondary: hexColor,
      "secondary-foreground": hexColor,
      background: hexColor,
      foreground: hexColor,
      muted: hexColor,
      "muted-foreground": hexColor,
    }),
    fonts: z.object({
      heading: z.string().min(1),
      body: z.string().min(1),
    }),
    borderRadius: z.string().min(1),
  }),
  contact: z.object({
    phone: z.string().min(1),
    whatsapp: z.string().min(1),
    email: z.string().email(),
    address: z.object({
      street: z.string().min(1),
      neighborhood: z.string().min(1),
      city: z.string().min(1),
      state: z.string().min(1),
      zip: z.string().min(1),
    }),
  }),
  social: z.object({
    instagram: z.string().nullable(),
    facebook: z.string().nullable(),
    linkedin: z.string().nullable(),
  }),
  seo: z.object({
    defaultTitle: z.string().min(1),
    titleTemplate: z.string().min(1),
    defaultDescription: z.string().min(1),
  }),
});

export type SiteConfig = z.infer<typeof siteConfigSchema>;
