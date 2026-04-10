import type { ComponentType } from "react";
import type { z } from "zod";
import { Hero } from "@/components/sections/Hero";
import { Features } from "@/components/sections/Features";
import { Cta } from "@/components/sections/Cta";
import { Stats } from "@/components/sections/Stats";
import { PageHeader } from "@/components/sections/PageHeader";
import { PortfolioPreview } from "@/components/sections/PortfolioPreview";
import { Testimonials } from "@/components/sections/Testimonials";
import { Team } from "@/components/sections/Team";
import { Timeline } from "@/components/sections/Timeline";
import { Philosophy } from "@/components/sections/Philosophy";
import { ServicesList } from "@/components/sections/ServicesList";
import { ProcessSteps } from "@/components/sections/ProcessSteps";
import { PortfolioGallery } from "@/components/sections/PortfolioGallery";
import { ContactSection } from "@/components/sections/ContactSection";
import { ProjectDetail } from "@/components/sections/ProjectDetail";
import { heroSchema } from "@/lib/studio/schemas/sections/hero.schema";
import {
  featuresSchema,
  featuresItemSchema,
} from "@/lib/studio/schemas/sections/features.schema";
import { ctaSchema } from "@/lib/studio/schemas/sections/cta.schema";
import {
  statsSchema,
  statItemSchema,
} from "@/lib/studio/schemas/sections/stats.schema";
import { pageHeaderSchema } from "@/lib/studio/schemas/sections/page-header.schema";
import {
  portfolioPreviewSchema,
  portfolioPreviewItemSchema,
} from "@/lib/studio/schemas/sections/portfolio-preview.schema";
import {
  testimonialsSchema,
  testimonialItemSchema,
} from "@/lib/studio/schemas/sections/testimonials.schema";
import {
  teamSchema,
  teamMemberSchema,
} from "@/lib/studio/schemas/sections/team.schema";
import {
  timelineSchema,
  timelineEventSchema,
} from "@/lib/studio/schemas/sections/timeline.schema";
import {
  philosophySchema,
  philosophyValueSchema,
} from "@/lib/studio/schemas/sections/philosophy.schema";
import {
  servicesListSchema,
  serviceItemSchema,
} from "@/lib/studio/schemas/sections/services-list.schema";
import {
  processStepsSchema,
  processStepSchema,
} from "@/lib/studio/schemas/sections/process-steps.schema";
import {
  portfolioGallerySchema,
  galleryProjectSchema,
} from "@/lib/studio/schemas/sections/portfolio-gallery.schema";
import {
  contactSectionSchema,
  contactFieldSchema,
} from "@/lib/studio/schemas/sections/contact-section.schema";
import { projectDetailSchema } from "@/lib/studio/schemas/sections/project-detail.schema";

type SectionProps = Record<string, unknown>;
type SectionSchema = z.ZodType<SectionProps>;
type SectionComponent<TProps extends SectionProps = SectionProps> =
  ComponentType<TProps>;

export interface SectionCollectionHint {
  field: string;
  description: string;
  minItems: number;
  itemSchema: z.ZodTypeAny;
}

interface SectionDefinition<TSchema extends SectionSchema> {
  type: string;
  component: SectionComponent<z.infer<TSchema>>;
  schema: TSchema;
  editableCollections: SectionCollectionHint[];
}

function defineSection<TSchema extends SectionSchema>(
  type: string,
  component: SectionComponent<z.infer<TSchema>>,
  schema: TSchema,
  editableCollections: SectionCollectionHint[] = [],
): SectionDefinition<TSchema> {
  return {
    type,
    component,
    schema,
    editableCollections,
  };
}

export const SECTION_DEFINITIONS = {
  hero: defineSection("hero", Hero, heroSchema),
  features: defineSection("features", Features, featuresSchema, [
    {
      field: "items",
      description: "Feature cards",
      minItems: 1,
      itemSchema: featuresItemSchema,
    },
  ]),
  cta: defineSection("cta", Cta, ctaSchema),
  stats: defineSection("stats", Stats, statsSchema, [
    {
      field: "items",
      description: "Stats cards",
      minItems: 1,
      itemSchema: statItemSchema,
    },
  ]),
  "page-header": defineSection("page-header", PageHeader, pageHeaderSchema),
  "portfolio-preview": defineSection(
    "portfolio-preview",
    PortfolioPreview,
    portfolioPreviewSchema,
    [
      {
        field: "items",
        description: "Portfolio preview items",
        minItems: 1,
        itemSchema: portfolioPreviewItemSchema,
      },
    ],
  ),
  testimonials: defineSection(
    "testimonials",
    Testimonials,
    testimonialsSchema,
    [
      {
        field: "items",
        description: "Testimonials",
        minItems: 1,
        itemSchema: testimonialItemSchema,
      },
    ],
  ),
  team: defineSection("team", Team, teamSchema, [
    {
      field: "members",
      description: "Team members",
      minItems: 1,
      itemSchema: teamMemberSchema,
    },
  ]),
  timeline: defineSection("timeline", Timeline, timelineSchema, [
    {
      field: "events",
      description: "Timeline events",
      minItems: 1,
      itemSchema: timelineEventSchema,
    },
  ]),
  philosophy: defineSection("philosophy", Philosophy, philosophySchema, [
    {
      field: "values",
      description: "Philosophy values",
      minItems: 1,
      itemSchema: philosophyValueSchema,
    },
  ]),
  "services-list": defineSection(
    "services-list",
    ServicesList,
    servicesListSchema,
    [
      {
        field: "items",
        description: "Services list items",
        minItems: 1,
        itemSchema: serviceItemSchema,
      },
    ],
  ),
  "process-steps": defineSection(
    "process-steps",
    ProcessSteps,
    processStepsSchema,
    [
      {
        field: "steps",
        description: "Process steps",
        minItems: 1,
        itemSchema: processStepSchema,
      },
    ],
  ),
  "portfolio-gallery": defineSection(
    "portfolio-gallery",
    PortfolioGallery,
    portfolioGallerySchema,
    [
      {
        field: "projects",
        description: "Portfolio gallery projects",
        minItems: 1,
        itemSchema: galleryProjectSchema,
      },
    ],
  ),
  "contact-section": defineSection(
    "contact-section",
    ContactSection,
    contactSectionSchema,
    [
      {
        field: "fields",
        description: "Contact form fields",
        minItems: 1,
        itemSchema: contactFieldSchema,
      },
    ],
  ),
  "project-detail": defineSection(
    "project-detail",
    ProjectDetail,
    projectDetailSchema,
  ),
} as const;

export type SectionType = keyof typeof SECTION_DEFINITIONS;
export type SectionData = {
  [K in SectionType]: z.infer<(typeof SECTION_DEFINITIONS)[K]["schema"]>;
}[SectionType];

export const SECTION_COLLECTION_HINTS = Object.values(
  SECTION_DEFINITIONS,
).flatMap((definition) =>
  definition.editableCollections.map((collection) => ({
    sectionType: definition.type,
    ...collection,
  })),
);

const FALLBACK_SECTION_COMPONENT: SectionComponent = () => null;

export function getSectionDefinition(type: string) {
  return SECTION_DEFINITIONS[type as SectionType] ?? null;
}

export function getSectionComponent(type: string): SectionComponent {
  const definition = getSectionDefinition(type);

  if (!definition) {
    console.warn(
      `[section-registry] Unknown section type: "${type}". Check the data file and the registry.`,
    );
  }

  return (definition?.component as SectionComponent | undefined) ?? FALLBACK_SECTION_COMPONENT;
}

export function getSectionSchema(type: string): SectionSchema | null {
  return getSectionDefinition(type)?.schema ?? null;
}
