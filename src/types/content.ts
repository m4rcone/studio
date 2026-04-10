// ─── Section type re-exports (sourced from Zod schemas) ────────────────────────
// Zod schemas are the single source of truth. Types are inferred via z.infer<>.

export type { SectionType, SectionData } from "@/lib/section-registry";

export type { HeroProps } from "@/lib/studio/schemas/sections/hero.schema";
export type {
  FeaturesProps,
  FeaturesItem,
} from "@/lib/studio/schemas/sections/features.schema";
export type { CtaProps } from "@/lib/studio/schemas/sections/cta.schema";
export type {
  StatsProps,
  StatItem,
} from "@/lib/studio/schemas/sections/stats.schema";
export type { PageHeaderProps } from "@/lib/studio/schemas/sections/page-header.schema";
export type {
  PortfolioPreviewProps,
  PortfolioPreviewItem,
} from "@/lib/studio/schemas/sections/portfolio-preview.schema";
export type {
  TestimonialsProps,
  TestimonialItem,
} from "@/lib/studio/schemas/sections/testimonials.schema";
export type {
  TeamProps,
  TeamMember,
} from "@/lib/studio/schemas/sections/team.schema";
export type {
  TimelineProps,
  TimelineEvent,
} from "@/lib/studio/schemas/sections/timeline.schema";
export type {
  PhilosophyProps,
  PhilosophyValue,
} from "@/lib/studio/schemas/sections/philosophy.schema";
export type {
  ServicesListProps,
  ServiceItem,
} from "@/lib/studio/schemas/sections/services-list.schema";
export type {
  ProcessStepsProps,
  ProcessStep,
} from "@/lib/studio/schemas/sections/process-steps.schema";
export type {
  PortfolioGalleryProps,
  GalleryProject,
} from "@/lib/studio/schemas/sections/portfolio-gallery.schema";
export type {
  ContactSectionProps,
  ContactField,
} from "@/lib/studio/schemas/sections/contact-section.schema";
export type { ProjectDetailProps } from "@/lib/studio/schemas/sections/project-detail.schema";

// ─── Shared interfaces (sourced from Zod schemas) ─────────────────────────────

export type {
  SectionEntry,
  PageMeta,
  PageData,
} from "@/lib/studio/schemas/page-data.schema";

export type {
  NavigationLink,
  NavigationCta,
  Navigation,
} from "@/lib/studio/schemas/navigation.schema";

export type { SiteConfig } from "@/lib/studio/schemas/site-config.schema";

export type {
  MediaManifestEntry,
  MediaManifest,
} from "@/lib/studio/schemas/media-manifest.schema";
