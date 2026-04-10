import { getPageData, getAllPages } from "@/lib/content";
import { SectionsRenderer } from "@/components/sections/SectionsRenderer";
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

  return <SectionsRenderer sections={page.sections} />;
}
