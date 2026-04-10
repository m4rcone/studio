"use client";
import { Button } from "@/components/ui/Button";
import type { ContactSectionProps } from "@/lib/studio/schemas/sections/contact-section.schema";

export type {
  ContactSectionProps,
  ContactField,
} from "@/lib/studio/schemas/sections/contact-section.schema";

export function ContactSection({
  headline,
  description,
  phone,
  email,
  address,
  hours,
  whatsappUrl,
  whatsappLabel,
  fields,
  submitLabel,
}: ContactSectionProps) {
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    const entries = fields
      .map((field) => {
        const value = formData.get(field.name);
        if (typeof value !== "string" || !value.trim()) {
          return null;
        }

        return `${field.label}: ${value.trim()}`;
      })
      .filter(Boolean);

    const separator = whatsappUrl.includes("?") ? "&" : "?";
    const message = encodeURIComponent(entries.join("\n"));
    window.open(
      `${whatsappUrl}${separator}text=${message}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  return (
    <section className="bg-background px-6 py-24">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-16 lg:grid-cols-2">
        {/* Left: info */}
        <div>
          <div className="bg-secondary mb-6 h-px w-8" />
          <h2 className="text-foreground font-heading mb-6 text-3xl sm:text-4xl">
            {headline}
          </h2>
          <p className="text-muted-foreground mb-10 leading-relaxed">
            {description}
          </p>

          <div className="space-y-6">
            <div>
              <p className="text-secondary mb-1 text-xs tracking-widest uppercase">
                Telefone
              </p>
              <a
                href={`tel:${phone}`}
                className="text-foreground hover:text-secondary transition-colors"
              >
                {phone}
              </a>
            </div>
            <div>
              <p className="text-secondary mb-1 text-xs tracking-widest uppercase">
                E-mail
              </p>
              <a
                href={`mailto:${email}`}
                className="text-foreground hover:text-secondary transition-colors"
              >
                {email}
              </a>
            </div>
            <div>
              <p className="text-secondary mb-1 text-xs tracking-widest uppercase">
                Endereço
              </p>
              <p className="text-foreground">{address}</p>
            </div>
            <div>
              <p className="text-secondary mb-1 text-xs tracking-widest uppercase">
                Horário
              </p>
              <p className="text-foreground">{hours}</p>
            </div>
          </div>

          <div className="mt-10">
            <Button label={whatsappLabel} href={whatsappUrl} style="whatsapp" />
          </div>
        </div>

        {/* Right: form */}
        <div className="bg-muted p-8 sm:p-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {fields.map((field) => (
              <div key={field.name}>
                <label
                  className="text-muted-foreground mb-2 block text-xs tracking-widest uppercase"
                  htmlFor={field.name}
                >
                  {field.label}
                  {field.required && (
                    <span className="text-secondary ml-1">*</span>
                  )}
                </label>
                {field.type === "textarea" ? (
                  <textarea
                    id={field.name}
                    name={field.name}
                    required={field.required}
                    rows={4}
                    className="bg-background border-foreground/10 text-foreground focus:border-secondary focus-visible:ring-secondary w-full resize-none border px-4 py-3 text-sm transition-colors focus:outline-none focus-visible:ring-2"
                  />
                ) : (
                  <input
                    id={field.name}
                    name={field.name}
                    type={field.type}
                    required={field.required}
                    autoComplete={
                      field.type === "email"
                        ? "email"
                        : field.type === "tel"
                          ? "tel"
                          : field.name === "name"
                            ? "name"
                            : undefined
                    }
                    className="bg-background border-foreground/10 text-foreground focus:border-secondary focus-visible:ring-secondary w-full border px-4 py-3 text-sm transition-colors focus:outline-none focus-visible:ring-2"
                  />
                )}
              </div>
            ))}
            <button
              type="submit"
              className="bg-primary text-primary-foreground w-full px-6 py-4 text-sm tracking-wide uppercase transition-opacity hover:opacity-90"
            >
              {submitLabel}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
