import type { PhilosophyProps } from "@/lib/studio/schemas/sections/philosophy.schema";

export type {
  PhilosophyProps,
  PhilosophyValue,
} from "@/lib/studio/schemas/sections/philosophy.schema";

export function Philosophy({
  eyebrow,
  headline,
  body,
  bodySecondary,
  values,
}: PhilosophyProps) {
  return (
    <section className="bg-background px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-20 grid grid-cols-1 gap-16 lg:grid-cols-2">
          {/* Left: heading */}
          <div>
            <span className="text-secondary mb-4 block text-xs tracking-[0.2em] uppercase">
              {eyebrow}
            </span>
            <h2 className="text-foreground font-heading text-3xl leading-tight sm:text-4xl xl:text-5xl">
              {headline}
            </h2>
          </div>
          {/* Right: body text */}
          <div className="flex flex-col justify-center space-y-4">
            <p className="text-foreground/80 text-[15px] leading-relaxed">
              {body}
            </p>
            {bodySecondary && (
              <p className="text-muted-foreground text-[15px] leading-relaxed">
                {bodySecondary}
              </p>
            )}
          </div>
        </div>
        {/* Values grid */}
        <div className="border-foreground/10 grid grid-cols-1 gap-8 border-t pt-16 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((value) => (
            <div key={value.id}>
              <div className="bg-secondary mb-4 h-px w-8" />
              <h3 className="text-foreground font-heading mb-3 text-lg">
                {value.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
