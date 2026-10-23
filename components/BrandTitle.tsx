import Link from "next/link";
import { CinedleLogo } from "./CinedleLogo";
import { cn } from "@/lib/utils";

export function BrandTitle({
  className = "",
  showLogo = true,
  href = "/",
}: {
  className?: string;
  showLogo?: boolean;
  href?: string | null;
}) {
  const content = (
    <span className="inline-flex items-center gap-2">
      {showLogo ? (
        <CinedleLogo size={22} className="shrink-0 drop-shadow-sm" />
      ) : null}
      <span
        className={cn(
          "font-display font-semibold uppercase tracking-wider",
          className,
        )}
      >
        <span className="brand-title-accent text-primary">Cine</span>
        <span className="text-foreground">dle</span>
      </span>
    </span>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="inline-flex items-center transition-opacity hover:opacity-90"
        aria-label="Cinedle Home"
      >
        {content}
      </Link>
    );
  }

  return content;
}