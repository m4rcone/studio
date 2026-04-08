# Content Editing Guide — Atlas Architecture

Rules and procedures for editing site content via AI.

---

## General principles

1. **Only edit files in `content/`** — never modify components, TypeScript types, code, or configuration
2. **Verify structure from TypeScript interfaces** — before editing, read the component interface in `src/components/sections/` to understand valid fields, constraints, and required props
3. **Never invent content** — if a request is ambiguous, ask for clarification
4. **Preserve consistency** — when adding or reordering items to lists, follow the pattern of existing items
5. **Show before applying** — present the before/after diff to the client for approval before create a new branch, new commit, and open a PR
6. **Use the correct file** — global data goes in `site.config.json`, navigation goes in `navigation.json`, page-specific content goes in `pages/[slug].data.json`

---

## What can be edited

### Text

- Titles, subtitles, descriptions, paragraphs
- Button and CTA labels
- Testimonial quotes and author names
- List items (services, steps, projects, events)
- Copyright text, taglines, partner bios

### Contact data

- Phone, WhatsApp, email
- Address (street, neighborhood, city, state, zip)
- Social media links (instagram, linkedin; facebook is null = hidden)

### Images

- Replace existing images (requires uploading the real file to `public/media/`)
- Update alt text
- Update metadata in `content/media/manifest.json`

### Content structure

- Add/remove items in lists (e.g. new testimonial, new portfolio project, new service)
- Reorder items within lists
- Reorder sections within a page

### SEO

- Page titles and descriptions in each page's `meta.title` and `meta.description`

### Navigation

- Menu labels and links in `navigation.json`

---

## What cannot be edited (requires a developer)

- Creating new pages
- Adding new section types
- Modifying components, TypeScript types, or code
- Changing design tokens (colors, fonts) — requires running `npm run generate-theme` after editing `site.config.json`
- Removing entire pages

---

## Editing procedure

### To edit a text field:

1. Identify which file contains the field:
   - Global data → `site.config.json`
   - Navigation → `navigation.json`
   - Page content → `pages/[slug].data.json`

2. Read the TypeScript interface of the corresponding component in `src/components/sections/` (or `src/types/content.ts` for global structures) to confirm valid fields, constraints, and types

3. Locate the exact field using the section `id` and field name

4. Apply the change respecting:
   - Character limits in JSDoc comments
   - Union type allowed values (e.g. `"primary" | "secondary" | "whatsapp" | "outline"`)
   - Fields without `?` are required and cannot be removed

### To add an item to a list:

1. Read existing items to understand the pattern
2. Read the component interface for required fields
3. Create the new item following the same structure
4. Position it at the desired index in the array

---

## Common edit examples

| Request                           | File                        | Field                                                             |
| --------------------------------- | --------------------------- | ----------------------------------------------------------------- |
| "Change the phone number"         | `site.config.json`          | `contact.phone`                                                   |
| "Update the hero headline"        | `pages/home.data.json`      | `sections[id=main-hero].data.headline`                            |
| "Add a new testimonial"           | `pages/home.data.json`      | `sections[id=client-testimonials].data.items`                     |
| "Add a project to the portfolio"  | `pages/portfolio.data.json` | `sections[id=projects-gallery].data.projects`                     |
| "Change the Instagram link"       | `site.config.json`          | `social.instagram`                                                |
| "Reorder the services"            | `pages/services.data.json`  | `sections[id=services-list].data.items`                           |
| "Change the menu CTA button text" | `navigation.json`           | `header.cta.label`                                                |
| "Update Ana Beatriz's bio"        | `pages/about.data.json`     | `sections[id=founding-partners].data.members[id=partner-ana].bio` |
| "Add a milestone to the timeline" | `pages/about.data.json`     | `sections[id=studio-history].data.events`                         |

---

## Site-specific notes

### Client

**Atlas Architecture** (Atlas Arquitetura) — Architecture and interior design studio in São Paulo, Brazil.

- Segments: high-end residential + commercial/corporate
- Target audience: upper-middle to high income, ages 30–55
- Tone: sophisticated, contemporary, professional but accessible
- Instagram is the primary acquisition channel
- Primary CTA always directs to WhatsApp: `https://wa.me/5511987654321`

### Pages

| Slug         | File                                | Sections                                                        |
| ------------ | ----------------------------------- | --------------------------------------------------------------- |
| `/`          | `content/pages/home.data.json`      | `hero` → `stats` → `portfolio-preview` → `testimonials` → `cta` |
| `/about`     | `content/pages/about.data.json`     | `page-header` → `philosophy` → `team` → `timeline`              |
| `/portfolio` | `content/pages/portfolio.data.json` | `page-header` → `portfolio-gallery`                             |
| `/services`  | `content/pages/services.data.json`  | `page-header` → `services-list` → `process-steps` → `cta`       |
| `/contact`   | `content/pages/contact.data.json`   | `page-header` → `contact-section`                               |

### Portfolio categories

Accepted values for project `category`: `"residential"` | `"commercial"` | `"corporate"`.
These are hardcoded as display labels in `PortfolioGallery.tsx` and `PortfolioPreview.tsx`. Do not use other values.

### WhatsApp format

The `contact.whatsapp` field in `site.config.json` must be in international format without spaces or symbols: `5511987654321` (55 = Brazil, 11 = area code, number). The CTA button uses the URL `https://wa.me/5511987654321` directly in `navigation.json`.

### Color palette

| Token        | Hex       | Used for                                                          |
| ------------ | --------- | ----------------------------------------------------------------- |
| `primary`    | `#1a1a1a` | Dark section backgrounds (stats, process-steps, cta, footer)      |
| `secondary`  | `#c9a96e` | Gold accents, stat numbers, decorative lines, hover states        |
| `background` | `#fafaf8` | Warm white general background                                     |
| `muted`      | `#f5f4f0` | Alternating section backgrounds (testimonials, page-header, form) |

### Images

All image paths in `content/pages/*.data.json` reference `.svg` placeholder files in `public/media/`. These are descriptive placeholders — they must be replaced with real project photos when the client provides them.

**To replace an image:**

1. Save the real image in `public/media/` using the same filename (e.g. `project-higienopolis-house.webp`)
2. Update the `src` field in the relevant JSON (e.g. change `.svg` → `.webp`)
3. Update the `alt` text if needed
4. Update `content/media/manifest.json`

### Validation after editing

After editing content, verify the JSON is syntactically correct (no stray commas or quotes) and that it respects the TypeScript interface of the corresponding component. The build (`npm run build`) will catch type mismatches.
