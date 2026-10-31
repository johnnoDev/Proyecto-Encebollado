import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

/** Acción primaria de la portada: abre la carta (la mesa se pide al enviar). */
export function PideAhora({ className, flecha }: { className?: string; /** Con flecha que avanza al pasar el mouse. */ flecha?: boolean }) {
  return (
    <Link
      href="/menu"
      transitionTypes={["a-la-carta"]}
      className={cn(
        "group inline-flex h-14 items-center justify-center gap-2.5 rounded-2xl bg-aji-texto px-9 text-base font-semibold text-white shadow-[0_8px_22px_-8px_color-mix(in_oklab,var(--aji)_80%,transparent)] transition-[transform,background-color] duration-150 hover:bg-[color-mix(in_oklab,var(--aji-texto)_88%,black)] motion-safe:active:scale-[0.98]",
        className,
      )}
    >
      Pide ahora
      {flecha && (
        <ArrowRight
          className="size-5 transition-transform duration-300 ease-out motion-safe:group-hover:translate-x-1"
          aria-hidden="true"
        />
      )}
    </Link>
  );
}
