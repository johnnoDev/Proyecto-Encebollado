"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  valor: number;
  onCambiar: (valor: number) => void;
  /** Con `minimo` 0, el botón de restar en 1 se vuelve «quitar». */
  minimo?: number;
  etiqueta: string;
  tamano?: "md" | "sm";
  className?: string;
};

export function Contador({ valor, onCambiar, minimo = 1, etiqueta, tamano = "md", className }: Props) {
  const quita = minimo === 0 && valor === 1;
  const boton = cn(
    "grid place-items-center rounded-full text-oceano transition-colors hover:bg-oceano/8 active:bg-oceano/15 disabled:opacity-35",
    tamano === "md" ? "size-11" : "size-10",
  );
  return (
    <div
      role="group"
      aria-label={etiqueta}
      className={cn(
        "inline-flex items-center rounded-full border border-tostado/15 bg-white/70",
        className,
      )}
    >
      <button
        type="button"
        className={boton}
        onClick={() => onCambiar(valor - 1)}
        disabled={valor <= minimo}
        aria-label={quita ? "Quitar de la comanda" : "Uno menos"}
      >
        {quita ? <Trash2 className="size-[18px]" /> : <Minus className="size-[18px]" />}
      </button>
      <output
        aria-live="polite"
        className={cn(
          "min-w-7 text-center font-semibold tabular-nums",
          tamano === "md" ? "text-lg" : "text-base",
        )}
      >
        {valor}
      </output>
      <button type="button" className={boton} onClick={() => onCambiar(valor + 1)} aria-label="Uno más">
        <Plus className="size-[18px]" />
      </button>
    </div>
  );
}
