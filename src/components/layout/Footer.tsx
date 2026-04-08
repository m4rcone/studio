import Link from "next/link";
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
            <Link
              href="/"
              className="text-primary-foreground hover:text-secondary font-heading text-2xl transition-colors"
            >
              {config.brand.name}
            </Link>
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
                  <Link
                    href={link.href}
                    className="text-primary-foreground/60 hover:text-secondary text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
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
              <a
                href={`tel:${config.contact.phone}`}
                className="text-primary-foreground/60 hover:text-secondary block text-sm transition-colors"
              >
                {config.contact.phone}
              </a>
              <a
                href={`mailto:${config.contact.email}`}
                className="text-primary-foreground/60 hover:text-secondary block text-sm transition-colors"
              >
                {config.contact.email}
              </a>
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
                <a
                  href={config.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-foreground/60 hover:text-secondary text-sm transition-colors"
                >
                  Instagram
                </a>
              )}
              {config.social.linkedin && (
                <a
                  href={config.social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-foreground/60 hover:text-secondary text-sm transition-colors"
                >
                  LinkedIn
                </a>
              )}
              {config.social.facebook && (
                <a
                  href={config.social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-foreground/60 hover:text-secondary text-sm transition-colors"
                >
                  Facebook
                </a>
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
              <Link
                key={link.href}
                href={link.href}
                className="text-primary-foreground/40 hover:text-secondary text-xs transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
