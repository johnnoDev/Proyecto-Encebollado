import { cn } from "@/lib/utils";

/** Separador ornamental dorado (línea · rombo · línea), el mismo del logo. */
export function Ornamento({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 140 12" aria-hidden="true" className={cn("h-3 w-36 text-dorado", className)}>
      <path d="M2 6h56M82 6h56" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M70 1l5 5-5 5-5-5z" fill="currentColor" />
    </svg>
  );
}
