import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getSiteConfig, getNavigation } from "@/lib/content";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [config, nav] = await Promise.all([getSiteConfig(), getNavigation()]);

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main-content"
        className="focus:bg-background focus:text-foreground sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-100 focus:rounded focus:px-4 focus:py-2 focus:text-sm focus:shadow-lg"
      >
        Skip to main content
      </a>
      <Header config={config} nav={nav} />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer config={config} nav={nav} />
    </div>
  );
}
