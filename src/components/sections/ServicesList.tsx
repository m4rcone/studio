import type { ServicesListProps } from "@/lib/studio/schemas/sections/services-list.schema";

export type {
  ServicesListProps,
  ServiceItem,
} from "@/lib/studio/schemas/sections/services-list.schema";

export function ServicesList({
  eyebrow,
  headline,
  intro,
  items,
}: ServicesListProps) {
  return (
    <section className="bg-background px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 grid grid-cols-1 gap-16 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <span className="text-secondary mb-4 block text-xs tracking-[0.2em] uppercase">
              {eyebrow}
            </span>
            <h2 className="text-foreground font-heading text-3xl leading-tight sm:text-4xl">
              {headline}
            </h2>
          </div>
          {intro && (
            <div className="flex items-start pt-8 lg:col-span-2 lg:pt-0">
              <p className="text-muted-foreground text-[15px] leading-relaxed">
                {intro}
              </p>
            </div>
          )}
        </div>
        <div className="divide-foreground/10 divide-y">
          {items.map((item) => (
            <div
              key={item.id}
              className="group grid grid-cols-1 gap-6 py-10 md:grid-cols-12"
            >
              <div className="md:col-span-1">
                <span className="text-secondary/40 group-hover:text-secondary font-heading text-4xl transition-colors duration-300">
                  {item.number}
                </span>
              </div>
              <div className="md:col-span-4">
                <h3 className="text-foreground font-heading text-xl">
                  {item.name}
                </h3>
              </div>
              <div className="md:col-span-5">
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
              {item.details && item.details.length > 0 && (
                <div className="md:col-span-2">
                  <ul className="space-y-1">
                    {item.details.map((detail, i) => (
                      <li
                        key={i}
                        className="text-muted-foreground flex items-start gap-2 text-xs"
                      >
                        <span className="text-secondary mt-0.5">—</span>
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
