"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { AppLink } from "@/components/ui/AppLink";
import type { ButtonStyle } from "@/components/ui/Button";
import type { SiteConfig, Navigation } from "@/types/content";

interface HeaderProps {
  config: SiteConfig;
  nav: Navigation;
}

export function Header({ config, nav }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (mobileOpen && !dialog.open) {
      dialog.showModal();
      document.body.style.overflow = "hidden";
      return;
    }

    if (!mobileOpen && dialog.open) {
      dialog.close();
    }

    document.body.style.removeProperty("overflow");
  }, [mobileOpen]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    function handleCancel(event: Event) {
      event.preventDefault();
      setMobileOpen(false);
    }

    function handleClose() {
      setMobileOpen(false);
      document.body.style.removeProperty("overflow");
    }

    dialog.addEventListener("cancel", handleCancel);
    dialog.addEventListener("close", handleClose);

    return () => {
      dialog.removeEventListener("cancel", handleCancel);
      dialog.removeEventListener("close", handleClose);
      document.body.style.removeProperty("overflow");
    };
  }, []);

  return (
    <>
      <header className="bg-background/95 border-foreground/5 sticky top-0 z-50 border-b backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          {/* Logo */}
          <AppLink
            href="/"
            className="text-foreground hover:text-secondary font-heading text-xl transition-colors"
            onClick={() => setMobileOpen(false)}
          >
            {config.brand.name}
          </AppLink>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-8 md:flex">
            {nav.header.links.map((link) => (
              <AppLink
                key={link.href}
                href={link.href}
                className="text-muted-foreground hover:text-foreground group relative text-sm transition-colors"
              >
                {link.label}
                <span className="bg-secondary absolute -bottom-0.5 left-0 h-px w-0 transition-[width] duration-300 group-hover:w-full" />
              </AppLink>
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
      <dialog
        ref={dialogRef}
        className="bg-background m-0 h-dvh max-h-none w-full max-w-none p-0 text-left backdrop:bg-black/35 md:hidden"
      >
        <div
          id="mobile-menu"
          className="bg-background flex h-full flex-col px-6 pt-6 pb-10"
        >
          <div className="mb-8 flex items-center justify-between gap-4">
            <p className="text-foreground font-heading text-lg">
              {config.brand.name}
            </p>
            <button
              type="button"
              className="text-foreground focus-visible:ring-secondary rounded-full p-2 focus-visible:ring-2 focus-visible:outline-none"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden="true"
              >
                <path d="M4 4l12 12M16 4L4 16" />
              </svg>
            </button>
          </div>

          <nav className="flex flex-1 flex-col gap-1 pt-2">
            {nav.header.links.map((link) => (
              <AppLink
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-foreground border-foreground/5 hover:text-secondary focus-visible:ring-secondary font-heading rounded-sm border-b py-3 text-3xl transition-colors focus-visible:ring-2 focus-visible:outline-none"
              >
                {link.label}
              </AppLink>
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
      </dialog>
    </>
  );
}
