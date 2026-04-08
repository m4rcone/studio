"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import type { ButtonStyle } from "@/components/ui/Button";
import type { SiteConfig, Navigation } from "@/types/content";

interface HeaderProps {
  config: SiteConfig;
  nav: Navigation;
}

export function Header({ config, nav }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="bg-background/95 border-foreground/5 sticky top-0 z-50 border-b backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          {/* Logo */}
          <Link
            href="/"
            className="text-foreground hover:text-secondary font-heading text-xl transition-colors"
            onClick={() => setMobileOpen(false)}
          >
            {config.brand.name}
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-8 md:flex">
            {nav.header.links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-muted-foreground hover:text-foreground group relative text-sm transition-colors"
              >
                {link.label}
                <span className="bg-secondary absolute -bottom-0.5 left-0 h-px w-0 transition-[width] duration-300 group-hover:w-full" />
              </Link>
            ))}
          </nav>

          {/* CTA + hamburger */}
          <div className="flex items-center gap-4">
            <div className="hidden md:block">
              <Button
                label={nav.header.cta.label}
                href={nav.header.cta.href}
                style={nav.header.cta.style as ButtonStyle}
              />
            </div>
            <button
              className="text-foreground focus-visible:ring-secondary p-2 focus-visible:ring-2 focus-visible:outline-none md:hidden"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
            >
              {mobileOpen ? (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M4 4l12 12M16 4L4 16" />
                </svg>
              ) : (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M3 5h14M3 10h14M3 15h14" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div
          id="mobile-menu"
          className="bg-background fixed inset-0 z-40 flex flex-col px-6 pt-16 pb-10 md:hidden"
        >
          <nav className="flex flex-1 flex-col gap-1 pt-8">
            {nav.header.links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-foreground border-foreground/5 hover:text-secondary font-heading border-b py-3 text-3xl transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="pt-8">
            <Button
              label={nav.header.cta.label}
              href={nav.header.cta.href}
              style={nav.header.cta.style as ButtonStyle}
              className="w-full justify-center"
            />
          </div>
        </div>
      )}
    </>
  );
}
