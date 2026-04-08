import type { ComponentType } from "react";
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

export type SectionComponent = ComponentType<Record<string, unknown>>;

export const SECTION_REGISTRY: Record<string, SectionComponent> = {
  hero: Hero as unknown as SectionComponent,
  features: Features as unknown as SectionComponent,
  cta: Cta as unknown as SectionComponent,
  stats: Stats as unknown as SectionComponent,
  "page-header": PageHeader as unknown as SectionComponent,
  "portfolio-preview": PortfolioPreview as unknown as SectionComponent,
  testimonials: Testimonials as unknown as SectionComponent,
  team: Team as unknown as SectionComponent,
  timeline: Timeline as unknown as SectionComponent,
  philosophy: Philosophy as unknown as SectionComponent,
  "services-list": ServicesList as unknown as SectionComponent,
  "process-steps": ProcessSteps as unknown as SectionComponent,
  "portfolio-gallery": PortfolioGallery as unknown as SectionComponent,
  "contact-section": ContactSection as unknown as SectionComponent,
  "project-detail": ProjectDetail as unknown as SectionComponent,
};

const Fallback: SectionComponent = () => null;

export function getSectionComponent(type: string): SectionComponent {
  if (!(type in SECTION_REGISTRY)) {
    console.warn(
      `[section-registry] Unknown section type: "${type}". Check the data file and the registry.`,
    );
  }
  return SECTION_REGISTRY[type] ?? Fallback;
}
