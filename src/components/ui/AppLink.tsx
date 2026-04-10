import type {
  HTMLAttributeAnchorTarget,
  MouseEventHandler,
  ReactNode,
} from "react";
import Link from "next/link";

interface AppLinkProps {
  href: string;
  className?: string;
  children: ReactNode;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  target?: HTMLAttributeAnchorTarget;
  rel?: string;
  "aria-label"?: string;
}

function isInternalHref(href: string): boolean {
  return href.startsWith("/") && !href.startsWith("//");
}

function isExternalHttpHref(href: string): boolean {
  return /^https?:\/\//.test(href);
}

export function AppLink({
  href,
  className,
  children,
  onClick,
  target,
  rel,
  "aria-label": ariaLabel,
}: AppLinkProps) {
  if (isInternalHref(href)) {
    return (
      <Link
        href={href}
        className={className}
        onClick={onClick}
        aria-label={ariaLabel}
      >
        {children}
      </Link>
    );
  }

  const resolvedTarget =
    target ?? (isExternalHttpHref(href) ? "_blank" : undefined);
  const resolvedRel =
    rel ?? (resolvedTarget === "_blank" ? "noopener noreferrer" : undefined);

  return (
    <a
      href={href}
      className={className}
      onClick={onClick}
      target={resolvedTarget}
      rel={resolvedRel}
      aria-label={ariaLabel}
    >
      {children}
    </a>
  );
}
