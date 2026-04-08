import { getPageData, getAllPages } from "@/lib/content";
import { getSectionComponent } from "@/lib/section-registry";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getAllPages();
  return slugs.filter((slug) => slug !== "home").map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPageData(slug);
  return {
    title: page.meta.title,
    description: page.meta.description,
  };
}

export default async function SlugPage({ params }: Props) {
  const { slug } = await params;
  const page = await getPageData(slug);

  return (
    <>
      {page.sections.map((section) => {
        const Section = getSectionComponent(section.type);
        return <Section key={section.id} {...section.data} />;
      })}
    </>
  );
}
