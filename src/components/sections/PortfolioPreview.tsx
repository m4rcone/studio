import Image from "next/image";
import { AppLink } from "@/components/ui/AppLink";
import type {
  PortfolioPreviewProps,
  PortfolioPreviewItem,
} from "@/lib/studio/schemas/sections/portfolio-preview.schema";

export type {
  PortfolioPreviewProps,
  PortfolioPreviewItem,
} from "@/lib/studio/schemas/sections/portfolio-preview.schema";

const CATEGORY_LABEL: Record<string, string> = {
  residential: "Residential",
  commercial: "Commercial",
  corporate: "Corporate",
};

export function PortfolioPreview({
  eyebrow,
  headline,
  subheadline,
  viewAllLabel,
  viewAllHref,
  items,
}: PortfolioPreviewProps) {
  const [first, ...rest] = items;

  return (
    <section className="bg-background px-6 py-24">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-12 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className="text-secondary mb-3 block text-xs tracking-[0.2em] uppercase">
              {eyebrow}
            </span>
            <h2 className="text-foreground font-heading text-3xl sm:text-4xl">
              {headline}
            </h2>
            {subheadline && (
              <p className="text-muted-foreground mt-3 max-w-md">
                {subheadline}
              </p>
            )}
          </div>
          <AppLink
            href={viewAllHref}
            className="text-foreground hover:text-secondary text-sm whitespace-nowrap underline underline-offset-4 transition-colors"
          >
            {viewAllLabel} →
          </AppLink>
        </div>

        {/* Asymmetric grid */}
        {items.length > 0 && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Large featured item */}
            {first && (
              <ProjectCard
                item={first}
                className="aspect-3/4 md:row-span-2 md:aspect-auto md:min-h-150"
              />
            )}
            {/* Smaller items */}
            <div className="grid grid-cols-1 gap-4">
              {rest.map((item) => (
                <ProjectCard key={item.id} item={item} className="aspect-4/3" />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function ProjectCard({
  item,
  className = "",
}: {
  item: PortfolioPreviewItem;
  className?: string;
}) {
  const inner = (
    <div className={`group relative overflow-hidden ${className}`}>
      <Image
        src={item.image.src}
        alt={item.image.alt}
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-105 group-focus-visible:scale-105"
        sizes="(max-width: 768px) 100vw, 50vw"
      />
      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100" />
      <div className="absolute inset-x-0 bottom-0 p-6 opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100">
        <span className="text-secondary mb-1 text-xs tracking-widest uppercase">
          {CATEGORY_LABEL[item.category] ?? item.category}
        </span>
        <h3 className="font-heading mb-1 text-xl text-white">{item.name}</h3>
        <p className="text-sm text-white/80">{item.location}</p>
      </div>
    </div>
  );

  if (item.href) {
    return (
      <AppLink
        href={item.href}
        className="focus-visible:ring-secondary block focus-visible:ring-2 focus-visible:outline-none"
      >
        {inner}
      </AppLink>
    );
  }
  return inner;
}
