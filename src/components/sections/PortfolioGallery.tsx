"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { PortfolioGalleryProps } from "@/lib/studio/schemas/sections/portfolio-gallery.schema";

export type {
  PortfolioGalleryProps,
  GalleryProject,
} from "@/lib/studio/schemas/sections/portfolio-gallery.schema";

const CATEGORY_LABELS: Record<string, string> = {
  residential: "Residential",
  commercial: "Commercial",
  corporate: "Corporate",
};

export function PortfolioGallery({
  allLabel,
  projects,
}: PortfolioGalleryProps) {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const categories = [
    "all",
    ...Array.from(new Set(projects.map((p) => p.category))),
  ];
  const filtered =
    activeCategory === "all"
      ? projects
      : projects.filter((p) => p.category === activeCategory);

  return (
    <section className="bg-background px-6 py-16">
      <div className="mx-auto max-w-7xl">
        {/* Filter tabs */}
        <div className="mb-12 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              aria-pressed={activeCategory === cat}
              className={`focus-visible:ring-secondary px-5 py-2 text-xs tracking-widest uppercase transition-[color,background-color,border-color] duration-200 focus-visible:ring-2 focus-visible:outline-none ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "border-foreground/20 text-muted-foreground hover:border-secondary hover:text-secondary border"
              }`}
            >
              {cat === "all" ? allLabel : (CATEGORY_LABELS[cat] ?? cat)}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project) => {
            const inner = (
              <>
                <Image
                  src={project.image.src}
                  alt={project.image.alt}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="bg-foreground/0 group-hover:bg-foreground/60 absolute inset-0 transition-[background-color] duration-500" />
                <div className="absolute inset-0 flex flex-col justify-end p-6 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                  <span className="text-secondary mb-1 text-xs tracking-widest uppercase">
                    {CATEGORY_LABELS[project.category] ?? project.category} ·{" "}
                    {project.year}
                  </span>
                  <h3 className="font-heading mb-1 text-lg text-white">
                    {project.name}
                  </h3>
                  <p className="text-sm text-white/70">{project.location}</p>
                </div>
              </>
            );

            return project.href ? (
              <Link
                key={project.id}
                href={project.href}
                className="group relative block aspect-4/3 overflow-hidden"
              >
                {inner}
              </Link>
            ) : (
              <div
                key={project.id}
                className="group relative aspect-4/3 overflow-hidden"
              >
                {inner}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
