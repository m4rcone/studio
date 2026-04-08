import Image from "next/image";
import type { TeamProps } from "@/lib/studio/schemas/sections/team.schema";

export type {
  TeamProps,
  TeamMember,
} from "@/lib/studio/schemas/sections/team.schema";

export function Team({ eyebrow, headline, description, members }: TeamProps) {
  return (
    <section className="bg-background px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16">
          <span className="text-secondary mb-4 block text-xs tracking-[0.2em] uppercase">
            {eyebrow}
          </span>
          <h2 className="text-foreground font-heading mb-4 text-3xl sm:text-4xl">
            {headline}
          </h2>
          {description && (
            <p className="text-muted-foreground max-w-xl leading-relaxed">
              {description}
            </p>
          )}
        </div>
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:gap-16">
          {members.map((member) => (
            <div key={member.id} className="group">
              <div className="relative mb-6 aspect-3/4 overflow-hidden">
                <Image
                  src={member.image.src}
                  alt={member.image.alt}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, 50vw"
                />
              </div>
              <div className="bg-secondary mb-3 h-px w-8" />
              <h3 className="text-foreground font-heading mb-1 text-xl">
                {member.name}
              </h3>
              <p className="text-secondary mb-3 text-xs tracking-widest uppercase">
                {member.role}
              </p>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {member.bio}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
