# Template Prompt — Create or Extend a Studio Site

Use this prompt when creating a new Studio-backed site, adding a new page, or
introducing new reusable sections inside this repository structure.

---

# Task: Build or Extend a Complete Client Site with Studio Support

## Briefing

**Business type:** [e.g. architecture studio, clinic, consultancy, restaurant]

**Company name:** [Name]

**Tagline:** [Short brand statement]

**Pages to create or update:**

- [Page slug + intent]
- [Page slug + intent]

**Primary CTA:** [quote request, WhatsApp, booking, consultation, etc.]

**Services / products / offers:**

- [Item 1]
- [Item 2]

**Tone of voice:** [e.g. premium and calm, warm and approachable, corporate]

**Visual direction:** [layout feel, spacing, references, imagery style]

**Color palette:**

- Primary: #xxxxxx
- Secondary: #xxxxxx
- Background: #xxxxxx

**Fonts:**

- Heading: [Google Font]
- Body: [Google Font]

**Contact info:**

- Phone:
- WhatsApp:
- Email:
- Address:

**Social links:**

- Instagram:
- Facebook:
- LinkedIn:

**Additional notes:** [audience, differentiators, constraints]

---

## Instructions

Read `CLAUDE.md` first.

Important documentation rule:

- `CLAUDE.md` is a shared Studio document and should stay generic across Studio
  repositories.
- Whenever you create or update a page template, add a new page, add a new
  section type, or change content conventions, you must also update:
  - `ai/CONVENTIONS.md`
  - `ai/EDITING_GUIDE.md`

Do not leave those docs stale after scaffolding a new design.

### 1. Update global site data

- Fill `content/site.config.json` with the client brand, theme tokens, contact,
  social links, and default SEO.
- Run `npm run generate-theme`.
- Update `src/app/layout.tsx` font imports if the chosen fonts change.

### 2. Update navigation

- Reflect the requested pages in `content/navigation.json`.
- Make the header CTA match the primary conversion goal.

### 3. Create media placeholders first

- Create placeholder assets in `public/media/` before writing JSON that points
  to them.
- Update `content/media/manifest.json` for every new asset.

### 4. Build or extend sections through the shared registry

When you add a new section type:

1. Create the Zod schema in `src/lib/studio/schemas/sections/`.
2. Create the React section component in `src/components/sections/`.
3. Register the section in `src/lib/section-registry.ts`.
4. Ensure the Studio can infer collection metadata from that same registry.

Do not create parallel registries or duplicate section mappings elsewhere.

### 5. Populate page content

- Create or update `content/pages/*.data.json`.
- Use real structure and realistic short copy.
- Keep long descriptive text concise unless the briefing explicitly asks for
  dense editorial content.
- Preserve responsive image usage and valid alt text.

### 6. Keep the public UX intentional and simple

- Avoid over-engineering component APIs.
- Prefer a few reusable primitives over a large component framework.
- Make cards readable on mobile and keyboard, not only on hover.
- Keep form behavior real. If a contact flow is front-end only, wire it to the
  actual destination instead of creating a fake success state.

### 7. Update repository documentation

After any new page/template/design work:

- Update `ai/CONVENTIONS.md`
  - page inventory
  - section catalog
  - project-specific constraints
- Update `ai/EDITING_GUIDE.md`
  - edit locations
  - allowed collections
  - workflow changes
  - validation expectations

If you add a new reusable section or change the Studio architecture in a way
that should apply across repositories, update `CLAUDE.md` only if the change is
meant to be shared globally.

### 8. Validate

- Run `npm run lint`
- Run `npm run build`
- Check the affected public routes
- Check the Studio flow if your changes touched schemas, permissions, or content
  editing behavior

## Output Expectations

The final result should:

- Feel like a custom site, not a generic template
- Keep the content-driven architecture intact
- Keep the Studio workflow compatible with the new content structure
- Leave `ai/CONVENTIONS.md` and `ai/EDITING_GUIDE.md` up to date in the same
  change
