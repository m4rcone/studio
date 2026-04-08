import type { StatsProps } from "@/lib/studio/schemas/sections/stats.schema";

export type {
  StatsProps,
  StatItem,
} from "@/lib/studio/schemas/sections/stats.schema";

export function Stats({ items }: StatsProps) {
  return (
    <section className="bg-primary px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4 lg:gap-0">
          {items.map((item, index) => (
            <div
              key={index}
              className={`flex flex-col items-center px-6 text-center ${
                index < items.length - 1
                  ? "lg:border-primary-foreground/20 lg:border-r"
                  : ""
              }`}
            >
              <span className="text-secondary font-heading mb-2 text-4xl tabular-nums xl:text-5xl">
                {item.value}
              </span>
              <span className="text-primary-foreground/70 text-sm tracking-widest uppercase">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
