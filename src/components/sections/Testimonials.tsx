import type { TestimonialsProps } from "@/lib/studio/schemas/sections/testimonials.schema";

export type {
  TestimonialsProps,
  TestimonialItem,
} from "@/lib/studio/schemas/sections/testimonials.schema";

export function Testimonials({ eyebrow, headline, items }: TestimonialsProps) {
  return (
    <section className="bg-muted px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <span className="text-secondary mb-4 block text-xs tracking-[0.2em] uppercase">
            {eyebrow}
          </span>
          <h2 className="text-foreground font-heading text-3xl sm:text-4xl">
            {headline}
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <figure key={item.id} className="bg-background relative p-8">
              <span
                aria-hidden="true"
                className="text-secondary font-heading mb-4 block text-6xl leading-none select-none"
              >
                &ldquo;
              </span>
              <blockquote>
                <p className="text-foreground/80 mb-8 text-[15px] leading-relaxed">
                  {item.quote}
                </p>
              </blockquote>
              <figcaption className="border-foreground/10 border-t pt-6">
                <div className="bg-secondary mb-3 h-px w-8" />
                <cite className="not-italic">
                  <p className="text-foreground text-sm font-medium">
                    {item.name}
                  </p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    {item.description}
                  </p>
                </cite>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
