export function BrandTitle({ className = "" }: { className?: string }) {
  return (
    <span className={`font-bold tracking-wide ${className}`}>
      <span className="font-normal text-accent-text">Cine</span>dle
    </span>
  );
}
