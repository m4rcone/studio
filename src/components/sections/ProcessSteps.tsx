import type { ProcessStepsProps } from "@/lib/studio/schemas/sections/process-steps.schema";

export type {
  ProcessStepsProps,
  ProcessStep,
} from "@/lib/studio/schemas/sections/process-steps.schema";

export function ProcessSteps({
  eyebrow,
  headline,
  subtitle,
  steps,
}: ProcessStepsProps) {
  return (
    <section className="bg-primary px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <span className="text-secondary mb-4 block text-xs tracking-[0.2em] uppercase">
            {eyebrow}
          </span>
          <h2 className="text-primary-foreground font-heading mb-4 text-3xl sm:text-4xl">
            {headline}
          </h2>
          {subtitle && (
            <p className="text-primary-foreground/60 mx-auto max-w-xl">
              {subtitle}
            </p>
          )}
        </div>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.id}
              className="border-primary-foreground/10 hover:border-secondary/40 border p-8 transition-colors duration-300"
            >
              <div className="text-secondary/30 font-heading mb-6 text-5xl leading-none">
                {step.number}
              </div>
              <h3 className="text-primary-foreground font-heading mb-3 text-lg">
                {step.title}
              </h3>
              <p className="text-primary-foreground/60 text-sm leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
