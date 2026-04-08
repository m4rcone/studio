# Template Prompt — Create a New Client Site

Use this document as the prompt when starting a new client site with this content-driven architecture. Copy it, fill in the briefing, and give it to Claude Code.

---

# Task: Create a Complete Site for a New Client

## Client Briefing

**Business type:** [e.g. Architecture studio, law firm, clinic, restaurant, e-commerce]

**Company name:** [Name]

**Tagline:** [Short brand statement]

**Pages:**

- [Page 1: description of sections and content]
- [Page 2: ...]
- [...]

**Services/Products:**

- [Item 1]
- [Item 2]
- [...]

**Tone of voice:** [e.g. Sophisticated and contemporary / Friendly and approachable / Corporate and authoritative]

**Visual references:** [Describe aesthetic: spacing, typography style, layout feel, imagery style]

**Color palette:**

- Primary: #xxxxxx (description)
- Secondary: #xxxxxx (description)
- General style: [light/dark, accent usage]

**Fonts:**

- Heading: [Google Font name] (reason)
- Body: [Google Font name] (reason)

**Contact info:**

- Phone: [number]
- WhatsApp: [international format, e.g. 5511987654321]
- Email: [email]
- Address: [full address]

**Social media:**

- Instagram: [URL or null]
- Facebook: [URL or null]
- LinkedIn: [URL or null]

**Additional notes:** [Target audience, main CTA, differentiators, anything else relevant]

---

## Instructions

Read the CLAUDE.md at the project root to understand the architecture and all conventions.

Based on the briefing above, build the complete site following this workflow:

### 1. Client Data

Replace all placeholder data in `content/site.config.json` with briefing information: brand, colors, contact, social media, SEO. For fonts, pick from Google Fonts something that matches the described tone of voice.

After saving, run `npm run generate-theme` to regenerate `src/app/theme.generated.css`.

Update `src/app/layout.tsx` to import the chosen fonts from `next/font/google` and expose them as CSS variables `--font-heading` and `--font-body`. Apply them in `src/app/globals.css` via `@layer base`.

### 2. Navigation

Update `content/navigation.json` with the pages from the briefing. The header CTA should direct to the business's primary action (schedule, quote request, WhatsApp, etc.).

### 3. SVG Placeholder Images

**Before building components or writing JSON content**, create SVG placeholder files in `public/media/` for every image the site will need.

Placeholder SVGs should:

- Use the client's color palette (muted background, accent color for lines/labels)
- Show a centered icon (camera frame for photos, person silhouette for portraits)
- Display a descriptive label of what the final image should be
- Show "PLACEHOLDER · [STUDIO/CLIENT NAME]" in small uppercase at the bottom
- Have correct aspect ratios for their intended use:
  - Hero images: tall portrait (e.g. 800×1000) for split layouts
  - Project/feature images: landscape (e.g. 800×600, aspect 4:3)
  - Team portraits: portrait (e.g. 600×800, aspect 3:4)
  - Logo: transparent background wordmark SVG

Name files descriptively in kebab-case:

- `atlas-logo.svg`
- `hero-main-project.svg`
- `project-higienopolis-house.svg`
- `team-ana-beatriz.svg`

Update all JSON content files to reference these `.svg` paths (instead of `.webp` which don't exist yet). Real images will replace the SVGs later — keeping the same filenames avoids needing to update the JSON.

Also update `content/media/manifest.json` with entries for each placeholder.

### 4. Section Components

Create visual components in `src/components/sections/`. Each component:

- Must have **unique and original design** — this is a custom site, not a generic template
- Receives all data via typed props with an exported interface
- Has descriptive JSDoc comments in **English** on every interface field
- Uses theme CSS variables (bg-primary, text-secondary, bg-muted, etc.)
- Is fully responsive (mobile-first)
- Has zero hardcoded text — all content comes from props

For the design, consider the tone of voice and visual references from the briefing:

- Premium business → generous whitespace, elegant typography, subtle animations
- Friendly/casual → more vibrant colors, dynamic layouts, playful elements
- Corporate → structured layout, clean grid, professional visuals

Choose section types that make sense for this business and the pages in the briefing. Examples:

| Type                | Description                        |
| ------------------- | ---------------------------------- |
| `hero`              | Page hero with text + image        |
| `stats`             | Key numbers in a bold strip        |
| `page-header`       | Simple inner-page banner           |
| `portfolio-preview` | Featured project grid              |
| `portfolio-gallery` | Filterable full gallery            |
| `features`          | Feature/service cards grid         |
| `services-list`     | Numbered service list with details |
| `process-steps`     | Step-by-step workflow              |
| `testimonials`      | Client quote cards                 |
| `team`              | Team member profiles               |
| `timeline`          | Milestone history                  |
| `contact-section`   | Form + contact info + WhatsApp     |
| `cta`               | Conversion banner                  |
| `faq`               | Accordion FAQ                      |
| `pricing`           | Pricing tiers                      |
| `video-section`     | Embed video with text              |

### 5. Layout Components

Create or update Header and Footer in `src/components/layout/`:

- Header: logo, responsive navigation (hamburger on mobile), CTA button
- Footer: links, contact info, social media, copyright
- Same rules: zero hardcoded text, data from navigation.json and site.config.json
- Design coherent with the sections created

### 6. Base UI Components

Create in `src/components/ui/` only what the sections actually need (Button, Card, etc.). Keep it lean.

### 7. Page Content

Populate `content/pages/[slug].data.json` for each page in the briefing.

Use **lorem ipsum** for long paragraphs and descriptions, but use **realistic text** for:

- Titles and headlines (should sound like the real business)
- Button and CTA labels
- Service/product names
- Navigation items
- Stats and numbers

Each page should have 3–6 sections, organized in a logical flow.

Use the SVG placeholder paths created in step 3 for all image references.

### 8. Registry & Typing

- Register all new sections in `src/lib/section-registry.ts`
- Add re-export of each section interface in `src/types/content.ts`
- Add each type to the `SectionData` union

### 9. Routes

Ensure all pages from the briefing work:

- Home renders at `/` via `src/app/page.tsx`
- Other pages render via `src/app/[slug]/page.tsx`
- `generateStaticParams` includes all slugs
- Meta tags (title, description) come from each page's JSON

### 10. AI Documentation

Update `ai/CONVENTIONS.md`:

- Fill in the "Available section types" table with all sections created
- Each entry: type, component path, short description, required props

Update `ai/EDITING_GUIDE.md`:

- Fill "Site-specific notes" with client details and content rules
- List all existing pages with their sections
- Note any hardcoded constraints (e.g. fixed category values in filters)

### 11. Validation

Run `npm run build` and confirm the build passes without errors.
Confirm all pages render in `npm run dev`.

---

## Design Quality

The design should look like a real professional site, not a generic template:

- Use transitions and hover states on interactive elements
- Apply generous spacing between sections (py-24 or more)
- Ensure adequate contrast between text and background in all color combinations
- Icons: use inline SVGs or lucide-react if already in the project
- Images: use next/image with `sizes` and `priority` where appropriate
- Typography: clear hierarchy (h1 > h2 > h3 > body > small)
- All content in the target language — no mixed languages in the final output
