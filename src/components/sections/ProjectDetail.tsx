import Image from "next/image";
import { AppLink } from "@/components/ui/AppLink";
import type { ProjectDetailProps } from "@/lib/studio/schemas/sections/project-detail.schema";

export type { ProjectDetailProps } from "@/lib/studio/schemas/sections/project-detail.schema";

const CATEGORY_LABELS: Record<string, string> = {
  residential: "Residential",
  commercial: "Commercial",
  corporate: "Corporate",
};

export function ProjectDetail({
  name,
  location,
  year,
  category,
  description,
  image,
  backLabel,
  backHref,
}: ProjectDetailProps) {
  return (
    <article className="bg-background">
      {/* Hero image */}
      <div
        className="relative w-full overflow-hidden"
        style={{ height: "clamp(320px, 55vh, 680px)" }}
      >
        <Image
          src={image.src}
          alt={image.alt}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="bg-foreground/10 absolute inset-0" />
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-6 py-16 lg:py-24">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-20">
          {/* Left — identity */}
          <div>
            <span className="text-secondary mb-4 inline-block text-xs tracking-[0.2em] uppercase">
              {CATEGORY_LABELS[category] ?? category} · {year}
            </span>
            <h1 className="text-foreground font-heading mb-4 text-4xl leading-tight sm:text-5xl">
              {name}
            </h1>
            <p className="text-muted-foreground text-sm tracking-wide">
              {location}
            </p>
          </div>

          {/* Right — description + navigation */}
          <div className="flex flex-col justify-center">
            <div className="bg-secondary mb-8 h-px w-12" />
            <p className="text-muted-foreground text-lg leading-relaxed">
              {description}
            </p>
            <AppLink
              href={backHref}
              className="text-secondary hover:text-foreground focus-visible:ring-secondary mt-10 inline-flex items-center gap-2 text-xs tracking-[0.15em] uppercase transition-colors focus-visible:ring-2 focus-visible:outline-none"
            >
              ← {backLabel}
            </AppLink>
          </div>
        </div>
      </div>
    </article>
  );
}
