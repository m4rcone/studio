import Link from "next/link";
import { APP_STRINGS } from "@/lib/app-strings";

export default function NotFound() {
  const s = APP_STRINGS.notFound;

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <h1 className="text-foreground text-2xl font-bold">{s.title}</h1>
      <p className="text-muted-foreground">{s.description}</p>
      <Link
        href="/"
        className="bg-primary text-primary-foreground rounded-(--radius) px-6 py-2 text-sm font-medium transition-opacity hover:opacity-90"
      >
        {s.back}
      </Link>
    </div>
  );
}
