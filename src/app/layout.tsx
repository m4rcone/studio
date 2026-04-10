import type { Metadata } from "next";
import { DM_Serif_Display, Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { getSiteConfig } from "@/lib/content";
import { VercelBypassCleanup } from "@/components/VercelBypassCleanup";

const dmSerifDisplay = DM_Serif_Display({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-heading",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--st-font-display",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig();
  return {
    title: {
      default: config.seo.defaultTitle,
      template: config.seo.titleTemplate,
    },
    description: config.seo.defaultDescription,
    other: {
      "theme-color": config.theme.colors.background,
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pt-BR"
      className={`${dmSerifDisplay.variable} ${inter.variable} ${spaceGrotesk.variable}`}
    >
      <body className="bg-background text-foreground min-h-screen antialiased">
        <VercelBypassCleanup />
        {children}
      </body>
    </html>
  );
}
