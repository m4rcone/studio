import type { PageHeaderProps } from "@/lib/studio/schemas/sections/page-header.schema";

export type { PageHeaderProps } from "@/lib/studio/schemas/sections/page-header.schema";

export function PageHeader({ title, subtitle, eyebrow }: PageHeaderProps) {
  return (
    <section className="bg-muted px-6 py-20">
      <div className="mx-auto max-w-4xl text-center">
        {eyebrow && (
          <span className="text-secondary mb-4 inline-block text-xs tracking-[0.2em] uppercase">
            {eyebrow}
          </span>
        )}
        <h1 className="text-foreground font-heading mb-6 text-4xl sm:text-5xl xl:text-6xl">
          {title}
        </h1>
        <div className="bg-secondary mx-auto mb-6 h-px w-12" />
        {subtitle && (
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}
