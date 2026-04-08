import { Button } from "@/components/ui/Button";
import type { CtaProps } from "@/lib/studio/schemas/sections/cta.schema";

export type { CtaProps } from "@/lib/studio/schemas/sections/cta.schema";

export function Cta({ headline, text, cta }: CtaProps) {
  return (
    <section className="bg-primary px-6 py-24">
      <div className="mx-auto max-w-4xl text-center">
        <div className="bg-secondary mx-auto mb-8 h-px w-12" />
        <h2 className="text-primary-foreground font-heading mb-6 text-3xl sm:text-4xl xl:text-5xl">
          {headline}
        </h2>
        {text && (
          <p className="text-primary-foreground/60 mx-auto mb-10 max-w-xl leading-relaxed">
            {text}
          </p>
        )}
        <Button
          label={cta.label}
          href={cta.href}
          style={cta.style ?? "secondary"}
        />
      </div>
    </section>
  );
}
