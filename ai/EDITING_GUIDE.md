# Editing Guide — Studio Repository

This guide is repository-specific and operational. Use it when editing content,
adding pages, or maintaining the Studio workflow.

## What Can Be Edited Directly

### Safe content edits

- `content/site.config.json`
  Brand text, contact info, social links, default SEO.
- `content/navigation.json`
  Header/footer links and CTA labels/targets.
- `content/pages/*.data.json`
  Page metadata, section order, section content, list items.
- `content/media/manifest.json`
  Media metadata and usage references.

### Requires code changes

- New section types
- Changed section data shape
- New public layout patterns
- New Studio tools, permissions, or workflow states
- New API behavior for contact flows beyond the current WhatsApp redirect

## Role Boundaries in the Current Studio

### Client role

Can edit:

- Existing page content
- Navigation labels/links
- Contact and SEO content
- List items inside existing collections
- Section order and item order

Cannot edit:

- Theme tokens in `site.config.json.theme.*`
- `content/media/manifest.json`
- Code, schemas, components, or docs outside approved content scope

### Team role

Can edit everything in `content/`, including `media/manifest.json`.

## Editing Workflow

### For content-only changes

1. Read `src/lib/section-registry.ts` to confirm the section exists.
2. Read the matching schema in `src/lib/studio/schemas/sections/`.
3. Read the current content file in `content/`.
4. Make the smallest valid change possible.
5. Validate with `npm run lint` and `npm run build` when the change is non-trivial.

### For new pages or section capabilities

1. Add or update the schema.
2. Register it in `src/lib/section-registry.ts`.
3. Add or update the section component.
4. Add or update the content file.
5. Update this file and `ai/CONVENTIONS.md`.
6. If this changes how new projects should be scaffolded, update
   `ai/TEMPLATE_PROMPT_NEW_DESIGN.md`.

## Common Edit Locations

| Intent                 | File                                | Path pattern                                  |
| ---------------------- | ----------------------------------- | --------------------------------------------- |
| Change site phone      | `content/site.config.json`          | `contact.phone`                               |
| Change default SEO     | `content/site.config.json`          | `seo.*`                                       |
| Change nav CTA         | `content/navigation.json`           | `header.cta.*`                                |
| Update home hero title | `content/pages/home.data.json`      | `sections[id=main-hero].data.headline`        |
| Add testimonial        | `content/pages/home.data.json`      | `sections[id=client-testimonials].data.items` |
| Reorder services       | `content/pages/services.data.json`  | `sections[id=services-list].data.items`       |
| Update contact fields  | `content/pages/contact.data.json`   | `sections[id=contact-form].data.fields`       |
| Add portfolio project  | `content/pages/portfolio.data.json` | `sections[id=projects-gallery].data.projects` |

## Section Collection Reference

Use the actual section `id` from the page file.

- `features` → `data.items`
- `stats` → `data.items`
- `portfolio-preview` → `data.items`
- `testimonials` → `data.items`
- `team` → `data.members`
- `timeline` → `data.events`
- `philosophy` → `data.values`
- `services-list` → `data.items`
- `process-steps` → `data.steps`
- `portfolio-gallery` → `data.projects`
- `contact-section` → `data.fields`

## Current Project-Specific Notes

- Public site copy is in English.
- The contact page form opens WhatsApp with the form values; there is no server
  submission endpoint.
- Portfolio category labels are rendered from fixed category values used in the
  content: `residential`, `commercial`, `corporate`.
- `successMessage` on `contact-section` is legacy content and is not part of
  the current rendered UX.
- `studio.md` is currently locally modified and should not be rewritten unless
  the change explicitly targets that document.

## Validation Checklist

Before finishing:

- JSON stays valid.
- The edited content still matches the relevant Zod schema.
- Any new page/section/documentation change also updates:
  - `ai/CONVENTIONS.md`
  - `ai/EDITING_GUIDE.md`
- `npm run lint` passes.
- `npm run build` passes, or the report clearly notes if a build issue is only
  due to blocked Google Fonts network access.
