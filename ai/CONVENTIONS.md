# Repository Conventions — Studio

This document is repository-specific. It gives the minimum context needed to
understand how content, schemas, rendering, and Studio editing fit together.

## Source of Truth Order

Read these in this order when you need to understand or change the site:

1. `src/lib/section-registry.ts`
   This is the shared registry for section type, component, Zod schema, and
   Studio collection metadata.
2. `src/lib/studio/schemas/`
   File-level and section-level validation rules.
3. `content/`
   Actual site data used at runtime.
4. `src/components/sections/` and `src/components/layout/`
   Visual implementation of the data model.
5. `src/app/(site)/` and `src/app/(studio)/`
   Routing and page composition.

## Public Site Data Model

### Global files

- `content/site.config.json`
  Global brand, theme tokens, contact info, social links, and default SEO.
- `content/navigation.json`
  Header and footer navigation plus primary CTA.
- `content/media/manifest.json`
  Registry of media assets and where they are used.

### Page files

- `content/pages/*.data.json`
  Each file defines one page.
- A page contains:
  - `slug`
  - `meta`
  - `sections[]`
- Section render order is the array order.
- Each section uses:
  - `type`
  - `id`
  - `data`

### Page composition

- `/` reads `content/pages/home.data.json`
- `/(site)/[slug]` reads the matching file in `content/pages/*.data.json`
- Both routes use the shared renderer in
  [SectionsRenderer.tsx](/Users/marconeboff/Dev/studio/src/components/sections/SectionsRenderer.tsx)

## Studio Runtime Model

### Main backend layers

- `src/lib/studio/agent.ts`
  Runs the model/tool loop.
- `src/lib/studio/proposal.ts`
  Validates operations, produces diffs, persists pending proposals.
- `src/lib/studio/apply.ts`
  Applies approved operations and creates commits/PRs.
- `src/lib/studio/deployment.ts`
  Resolves preview deployment status.
- `src/lib/studio/permissions.ts`
  Enforces edit permissions by role.

### Content access

- `src/lib/studio/content-provider.ts` selects GitHub or filesystem provider.
- `listFiles()` is recursive in both providers.
- The Studio may read:
  - `content/`
  - `ai/`
  - `src/lib/studio/schemas/`

## Current Section Catalog

The canonical definitions live in `src/lib/section-registry.ts`.

| Type                | Component                                      | Main collections |
| ------------------- | ---------------------------------------------- | ---------------- |
| `hero`              | `src/components/sections/Hero.tsx`             | none             |
| `features`          | `src/components/sections/Features.tsx`         | `data.items`     |
| `cta`               | `src/components/sections/Cta.tsx`              | none             |
| `stats`             | `src/components/sections/Stats.tsx`            | `data.items`     |
| `page-header`       | `src/components/sections/PageHeader.tsx`       | none             |
| `portfolio-preview` | `src/components/sections/PortfolioPreview.tsx` | `data.items`     |
| `testimonials`      | `src/components/sections/Testimonials.tsx`     | `data.items`     |
| `team`              | `src/components/sections/Team.tsx`             | `data.members`   |
| `timeline`          | `src/components/sections/Timeline.tsx`         | `data.events`    |
| `philosophy`        | `src/components/sections/Philosophy.tsx`       | `data.values`    |
| `services-list`     | `src/components/sections/ServicesList.tsx`     | `data.items`     |
| `process-steps`     | `src/components/sections/ProcessSteps.tsx`     | `data.steps`     |
| `portfolio-gallery` | `src/components/sections/PortfolioGallery.tsx` | `data.projects`  |
| `contact-section`   | `src/components/sections/ContactSection.tsx`   | `data.fields`    |
| `project-detail`    | `src/components/sections/ProjectDetail.tsx`    | none             |

## Current Page Inventory

| Route        | File                                | Sections                                                    |
| ------------ | ----------------------------------- | ----------------------------------------------------------- |
| `/`          | `content/pages/home.data.json`      | `hero`, `stats`, `portfolio-preview`, `testimonials`, `cta` |
| `/about`     | `content/pages/about.data.json`     | `page-header`, `philosophy`, `team`, `timeline`             |
| `/portfolio` | `content/pages/portfolio.data.json` | `page-header`, `portfolio-gallery`                          |
| `/services`  | `content/pages/services.data.json`  | `page-header`, `services-list`, `process-steps`, `cta`      |
| `/contact`   | `content/pages/contact.data.json`   | `page-header`, `contact-section`                            |
| `/project-*` | `content/pages/project-*.data.json` | `project-detail`, `cta`                                     |

## Project-Specific Content Constraints

- Portfolio categories currently used in preview/gallery/detail flows are:
  - `residential`
  - `commercial`
  - `corporate`
- The contact page form opens WhatsApp with the filled form values. It does not
  submit to a backend endpoint.
- `successMessage` still exists in `contact-section` content for compatibility,
  but the public UI no longer renders a fake local success state.
- `site.config.json.theme.*` is runtime configuration, not ordinary copy.
- `media/manifest.json` is part of content inventory, but should be treated as a
  controlled asset registry rather than day-to-day copy.

## Documentation Maintenance Rules

Update this file when any of the following changes:

- A new page file is added or removed.
- A section type is added, removed, renamed, or gains a new collection field.
- The rendering flow changes between content and the public site.
- Studio permissions or content ownership boundaries change.
