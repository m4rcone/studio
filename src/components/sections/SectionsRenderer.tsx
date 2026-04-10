import type { SectionEntry } from "@/types/content";
import { getSectionComponent } from "@/lib/section-registry";

interface SectionsRendererProps {
  sections: SectionEntry[];
}

export function SectionsRenderer({ sections }: SectionsRendererProps) {
  return (
    <>
      {sections.map((section) => {
        const Section = getSectionComponent(section.type);
        return <Section key={section.id} {...section.data} />;
      })}
    </>
  );
}
