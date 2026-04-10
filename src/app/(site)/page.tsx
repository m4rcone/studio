import { getPageData } from "@/lib/content";
import { SectionsRenderer } from "@/components/sections/SectionsRenderer";

export default async function HomePage() {
  const page = await getPageData("home");

  return <SectionsRenderer sections={page.sections} />;
}
