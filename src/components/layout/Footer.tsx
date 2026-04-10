import { AppLink } from "@/components/ui/AppLink";
import type { SiteConfig, Navigation } from "@/types/content";

interface FooterProps {
  config: SiteConfig;
  nav: Navigation;
}

export function Footer({ config, nav }: FooterProps) {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-12 grid grid-cols-1 gap-12 md:grid-cols-3">
          {/* Brand */}
          <div>
            <AppLink
              href="/"
              className="text-primary-foreground hover:text-secondary font-heading text-2xl transition-colors"
            >
              {config.brand.name}
            </AppLink>
            <p className="text-primary-foreground/50 mt-3 max-w-xs text-sm leading-relaxed">
              {config.brand.tagline}
            </p>
          </div>

          {/* Navigation */}
          <div>
            <p className="text-secondary mb-4 text-xs tracking-[0.2em] uppercase">
              Navigation
            </p>
            <ul className="space-y-2">
              {nav.header.links.map((link) => (
                <li key={link.href}>
                  <AppLink
                    href={link.href}
                    className="text-primary-foreground/60 hover:text-secondary text-sm transition-colors"
                  >
                    {link.label}
                  </AppLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact + Social */}
          <div>
            <p className="text-secondary mb-4 text-xs tracking-[0.2em] uppercase">
              {nav.footer.contactLabel}
            </p>
            <div className="mb-6 space-y-2">
              <AppLink
                href={`tel:${config.contact.phone}`}
                className="text-primary-foreground/60 hover:text-secondary block text-sm transition-colors"
              >
                {config.contact.phone}
              </AppLink>
              <AppLink
                href={`mailto:${config.contact.email}`}
                className="text-primary-foreground/60 hover:text-secondary block text-sm transition-colors"
              >
                {config.contact.email}
              </AppLink>
              <p className="text-primary-foreground/60 text-sm">
                {config.contact.address.street},{" "}
                {config.contact.address.neighborhood}
              </p>
              <p className="text-primary-foreground/60 text-sm">
                {config.contact.address.city}/{config.contact.address.state}
              </p>
            </div>
            <p className="text-secondary mb-3 text-xs tracking-[0.2em] uppercase">
              {nav.footer.socialLabel}
            </p>
            <div className="flex gap-4">
              {config.social.instagram && (
                <AppLink
                  href={config.social.instagram}
                  className="text-primary-foreground/60 hover:text-secondary text-sm transition-colors"
                >
                  Instagram
                </AppLink>
              )}
              {config.social.linkedin && (
                <AppLink
                  href={config.social.linkedin}
                  className="text-primary-foreground/60 hover:text-secondary text-sm transition-colors"
                >
                  LinkedIn
                </AppLink>
              )}
              {config.social.facebook && (
                <AppLink
                  href={config.social.facebook}
                  className="text-primary-foreground/60 hover:text-secondary text-sm transition-colors"
                >
                  Facebook
                </AppLink>
              )}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-primary-foreground/10 flex flex-col items-center justify-between gap-4 border-t pt-8 sm:flex-row">
          <p className="text-primary-foreground/40 text-xs">
            {nav.footer.copyright}
          </p>
          <div className="flex gap-6">
            {nav.footer.links.map((link) => (
              <AppLink
                key={link.href}
                href={link.href}
                className="text-primary-foreground/40 hover:text-secondary text-xs transition-colors"
              >
                {link.label}
              </AppLink>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
