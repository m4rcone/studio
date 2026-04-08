import Link from "next/link";

export type ButtonStyle = "primary" | "secondary" | "whatsapp" | "outline";

const BUTTON_STYLES: Record<ButtonStyle, string> = {
  primary: "bg-primary text-primary-foreground hover:opacity-90",
  secondary: "bg-secondary text-secondary-foreground hover:opacity-90",
  whatsapp: "bg-[#25D366] text-white hover:opacity-90",
  outline:
    "border border-primary text-primary hover:bg-primary hover:text-primary-foreground",
};

interface ButtonProps {
  label: string;
  style?: ButtonStyle;
  href?: string;
  onClick?: () => void;
  className?: string;
  external?: boolean;
}

export function Button({
  label,
  style = "primary",
  href,
  onClick,
  className = "",
  external,
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center px-6 py-3 text-sm font-medium tracking-wide transition duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2";
  const classes = `${base} ${BUTTON_STYLES[style]} ${className}`;

  if (href) {
    const isExternal =
      external || href.startsWith("http") || href.startsWith("https");
    return (
      <Link
        href={href}
        className={classes}
        {...(isExternal
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
      >
        {label}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={classes}>
      {label}
    </button>
  );
}
