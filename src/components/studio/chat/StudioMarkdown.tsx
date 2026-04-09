"use client";

import type {
  AnchorHTMLAttributes,
  HTMLAttributes,
  ReactNode,
  TableHTMLAttributes,
} from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface StudioMarkdownProps {
  content: string;
  className?: string;
}

function MarkdownLink({
  href,
  children,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement>) {
  const isExternal = typeof href === "string" && /^https?:\/\//.test(href);

  return (
    <a
      {...props}
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
    >
      {children}
    </a>
  );
}

function MarkdownTable({
  children,
  ...props
}: TableHTMLAttributes<HTMLTableElement> & {
  children?: ReactNode;
}) {
  return (
    <div className="st-markdown-table">
      <table {...props}>{children}</table>
    </div>
  );
}

function MarkdownPre(props: HTMLAttributes<HTMLPreElement>) {
  return <pre {...props} />;
}

export function StudioMarkdown({
  content,
  className = "",
}: StudioMarkdownProps) {
  return (
    <div className={`st-markdown ${className}`.trim()}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: MarkdownLink,
          table: MarkdownTable,
          pre: MarkdownPre,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
