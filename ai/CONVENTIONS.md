# Content Conventions — Atlas Architecture

This document explains how site content is organized. It is used by AI agents and developers to understand the structure and make correct edits.

---

## Content files

### site.config.json

Global site data. Used by Header, Footer, meta tags, and as the source of design tokens.

```json
{
  "brand": {
    "name": "Atlas Architecture",
    "tagline": "We design spaces that tell your story",
    "logo": "/media/atlas-logo.svg"
  },
  "theme": {
    "colors": {
      "primary": "#1a1a1a",
      "primary-foreground": "#ffffff",
      "secondary": "#c9a96e",
      "secondary-foreground": "#1a1a1a",
      "background": "#fafaf8",
      "foreground": "#1a1a1a",
      "muted": "#f5f4f0",
      "muted-foreground": "#6b6b6b"
    },
    "fonts": { "heading": "DM Serif Display", "body": "Inter" },
    "borderRadius": "0.125rem"
  },
  "contact": { "phone": "(11) 3456-7890", "whatsapp": "5511987654321", ... },
  "social": { "instagram": "https://instagram.com/atlasarquitetura", "facebook": null, "linkedin": "..." },
  "seo": { "defaultTitle": "...", "titleTemplate": "%s | Atlas Architecture", "defaultDescription": "..." }
}
```

### navigation.json

Menu structure: Home, Portfolio, Services, About, Contact. CTA directs to WhatsApp.

### pages/[slug].data.json

Each page has a data file with this structure:

```json
{
  "slug": "home",
  "meta": { "title": "Home", "description": "..." },
  "sections": [
    { "type": "hero", "id": "main-hero", "data": {} },
    { "type": "stats", "id": "office-stats", "data": {} }
  ]
}
```

The **order of sections** in the array defines the **render order on the page**.

### media/manifest.json

Registry of all images used on the site. Images are SVG placeholders — replace with real photos when available.

---

## Available section types

| Type                | Component                                      | Description                                                                | Required props                                                |
| ------------------- | ---------------------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------- |
| `hero`              | `src/components/sections/Hero.tsx`             | Split layout: text (left) + large image (right). Used at the top of pages. | `headline`, `cta`, `image`                                    |
| `stats`             | `src/components/sections/Stats.tsx`            | Dark horizontal strip with large numbers in gold.                          | `items` (array of `value` + `label`)                          |
| `page-header`       | `src/components/sections/PageHeader.tsx`       | Inner-page banner: centered title, gold accent line, optional subtitle.    | `title`                                                       |
| `portfolio-preview` | `src/components/sections/PortfolioPreview.tsx` | Asymmetric grid with 3–4 featured projects for the home page.              | `eyebrow`, `headline`, `viewAllLabel`, `viewAllHref`, `items` |
| `testimonials`      | `src/components/sections/Testimonials.tsx`     | Grid of quote cards with decorative quotation marks and a gold divider.    | `eyebrow`, `headline`, `items`                                |
| `features`          | `src/components/sections/Features.tsx`         | Generic card grid with optional emoji icon, title, and description.        | `headline`, `items`                                           |
| `philosophy`        | `src/components/sections/Philosophy.tsx`       | Split heading/body + 4-column values grid. Used on the About page.         | `eyebrow`, `headline`, `body`, `values`                       |
| `team`              | `src/components/sections/Team.tsx`             | Team member photos and bios in a 2-column grid.                            | `eyebrow`, `headline`, `members`                              |
| `timeline`          | `src/components/sections/Timeline.tsx`         | Alternating timeline with year nodes in dark background and gold text.     | `eyebrow`, `headline`, `events`                               |
| `portfolio-gallery` | `src/components/sections/PortfolioGallery.tsx` | Filterable gallery by category (residential / commercial / corporate).     | `allLabel`, `projects`                                        |
| `services-list`     | `src/components/sections/ServicesList.tsx`     | Numbered service list with name, description, and optional detail bullets. | `eyebrow`, `headline`, `items`                                |
| `process-steps`     | `src/components/sections/ProcessSteps.tsx`     | Numbered process step cards on a dark background.                          | `eyebrow`, `headline`, `steps`                                |
| `contact-section`   | `src/components/sections/ContactSection.tsx`   | Quote form + contact info + WhatsApp button (client component).            | All fields in `ContactSectionProps`                           |
| `cta`               | `src/components/sections/Cta.tsx`              | Dark conversion banner with large headline, optional text, and button.     | `headline`, `cta`                                             |

---

## File relationships

```
site.config.json ──→ Header, Footer, Tailwind tokens, global meta tags
navigation.json ───→ Header (menu + CTA), Footer (links + labels)
pages/*.data.json ─→ Content of each page (section array)
media/manifest.json → Image registry and metadata
src/types/content.ts → TypeScript interfaces (source of truth for data structure)
src/lib/section-registry.ts → Maps section type → React component
```

> **Note:** TypeScript interfaces with JSDoc comments in `src/components/sections/` and `src/types/content.ts` are the authoritative source of data structure. To understand which fields a section accepts, read the interface of the corresponding component.
