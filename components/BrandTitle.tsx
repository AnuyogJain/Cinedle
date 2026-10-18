import { cn } from "@/lib/utils";

export function BrandTitle({ className = "" }: { className?: string }) {
  return (
    <span
      className={cn(
        "font-display font-semibold uppercase tracking-wider",
        className,
      )}
    >
      <span className="brand-title-accent text-primary">Cine</span>
      <span className="text-foreground">dle</span>
    </span>
  );
}
