import Image from "next/image";
import { Button } from "@/components/ui/Button";
import type { HeroProps } from "@/lib/studio/schemas/sections/hero.schema";

export type { HeroProps } from "@/lib/studio/schemas/sections/hero.schema";

export function Hero({
  headline,
  subheadline,
  cta,
  secondaryCta,
  image,
}: HeroProps) {
  return (
    <section className="bg-background relative flex min-h-[90vh] items-center overflow-hidden">
      <div className="grid min-h-[90vh] w-full grid-cols-1 lg:grid-cols-2">
        {/* Text side */}
        <div className="order-2 flex flex-col justify-center px-6 py-20 lg:order-1 lg:px-16 xl:px-24">
          <div className="bg-secondary mb-8 h-px w-12" />
          <h1 className="text-foreground font-heading mb-6 text-4xl leading-tight sm:text-5xl xl:text-6xl">
            {headline}
          </h1>
          {subheadline && (
            <p className="text-muted-foreground mb-10 max-w-md text-lg leading-relaxed">
              {subheadline}
            </p>
          )}
          <div className="flex flex-col items-start gap-4 sm:flex-row">
            <Button
              label={cta.label}
              href={cta.href}
              style={cta.style ?? "primary"}
            />
            {secondaryCta && (
              <a
                href={secondaryCta.href}
                className="text-foreground hover:text-secondary inline-flex items-center pt-3 text-sm underline underline-offset-4 transition-colors sm:pt-0"
              >
                {secondaryCta.label}
              </a>
            )}
          </div>
        </div>

        {/* Image side */}
        <div className="relative order-1 min-h-[50vh] overflow-hidden lg:order-2 lg:min-h-full">
          <Image
            src={image.src}
            alt={image.alt}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          <div className="bg-foreground/5 absolute inset-0" />
        </div>
      </div>
    </section>
  );
}
