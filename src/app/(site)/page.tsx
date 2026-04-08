import { getPageData } from "@/lib/content";
import { getSectionComponent } from "@/lib/section-registry";

export default async function HomePage() {
  const page = await getPageData("home");

  return (
    <>
      {page.sections.map((section) => {
        const Section = getSectionComponent(section.type);
        return <Section key={section.id} {...section.data} />;
      })}
    </>
  );
}
