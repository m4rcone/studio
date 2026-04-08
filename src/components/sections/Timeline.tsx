import type { TimelineProps } from "@/lib/studio/schemas/sections/timeline.schema";

export type {
  TimelineProps,
  TimelineEvent,
} from "@/lib/studio/schemas/sections/timeline.schema";

export function Timeline({ eyebrow, headline, events }: TimelineProps) {
  return (
    <section className="bg-muted px-6 py-24">
      <div className="mx-auto max-w-4xl">
        <div className="mb-16 text-center">
          <span className="text-secondary mb-4 block text-xs tracking-[0.2em] uppercase">
            {eyebrow}
          </span>
          <h2 className="text-foreground font-heading text-3xl sm:text-4xl">
            {headline}
          </h2>
        </div>
        <div className="relative">
          {/* Vertical line */}
          <div className="bg-foreground/10 absolute top-0 bottom-0 left-20 w-px -translate-x-1/2 sm:left-1/2" />
          <div className="space-y-12">
            {events.map((event, index) => (
              <div
                key={event.id}
                className={`flex gap-8 ${index % 2 === 0 ? "sm:flex-row" : "sm:flex-row-reverse"} items-center`}
              >
                {/* Content block */}
                <div
                  className={`flex-1 ${index % 2 === 0 ? "sm:text-right" : "sm:text-left"} pl-24 sm:pl-0`}
                >
                  <div className="bg-background p-6">
                    <h3 className="text-foreground font-heading mb-2 text-lg">
                      {event.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {event.description}
                    </p>
                  </div>
                </div>
                {/* Year node */}
                <div className="bg-primary absolute left-20 z-10 flex h-16 w-16 shrink-0 -translate-x-1/2 items-center justify-center sm:relative sm:left-auto sm:h-20 sm:w-20 sm:translate-x-0">
                  <span className="text-secondary font-heading text-sm font-normal sm:text-base">
                    {event.year}
                  </span>
                </div>
                {/* Spacer for opposite side */}
                <div className="hidden flex-1 sm:block" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
