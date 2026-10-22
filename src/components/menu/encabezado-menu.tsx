"use client";

import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { brand } from "@/config/brand";
import { cn } from "@/lib/utils";
import { MESAS } from "@/store/mesa";

type Props = {
  mesa: string | null | undefined;
  selectorAbierto: boolean;
  onSelector: (abierto: boolean) => void;
  onElegirMesa: (mesa: string) => void;
  /** El selector se abrió al intentar enviar sin mesa. */
  paraEnviar?: boolean;
};

export function EncabezadoMenu({ mesa, selectorAbierto, onSelector, onElegirMesa, paraEnviar }: Props) {
  return (
    <header className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 pt-5 pb-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <Image src="/brand/logo-mark.svg" alt="" width={44} height={44} priority className="size-11 shrink-0" />
        <div className="min-w-0">
          <p className="truncate font-heading text-[1.35rem] leading-none font-bold text-crema">{brand.nombre}</p>
          <p className="mt-1 truncate text-[0.8rem] text-crema/75">{brand.descriptor}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onSelector(true)}
        aria-label={mesa ? `Mesa ${mesa}. Cambiar de mesa` : "Elegir mesa"}
        className={cn(
          "flex h-11 shrink-0 items-center gap-1.5 rounded-full bg-dorado pr-3 pl-4 text-tostado shadow-[0_4px_14px_-4px_rgb(0_0_0/0.45)] transition-transform active:scale-95",
          mesa === undefined && "w-28 border-2 border-dorado/45 bg-transparent shadow-none",
        )}
      >
        {mesa !== undefined && (
          <>
            <span className="font-heading text-lg leading-none font-bold">{mesa ? `Mesa ${mesa}` : "¿Mesa?"}</span>
            <ChevronDown className="size-4" strokeWidth={2.5} aria-hidden="true" />
          </>
        )}
      </button>

      <Sheet open={selectorAbierto} onOpenChange={onSelector}>
        <SheetContent
          side="bottom"
          className="mx-auto max-w-xl gap-0 rounded-t-[22px] border-0 bg-crema px-5 pt-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] text-tostado sm:px-6"
        >
          <SheetTitle className="pr-10 font-heading text-[1.6rem] leading-tight font-bold text-oceano">
            ¿En qué mesa estás?
          </SheetTitle>
          <SheetDescription className="mt-1.5 text-[0.95rem] text-tostado/75">
            {paraEnviar
              ? "Elígela y te mostramos la comanda para enviarla a cocina."
              : "El QR de cada mesa ya trae su número. Cámbialo si te moviste de mesa."}
          </SheetDescription>
          <div className="mt-5 grid grid-cols-4 gap-2.5">
            {MESAS.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => onElegirMesa(m)}
                aria-pressed={m === mesa}
                className={cn(
                  "h-14 rounded-xl border font-heading text-xl font-bold tabular-nums transition-colors",
                  m === mesa
                    ? "border-oceano bg-oceano text-crema"
                    : "border-tostado/15 bg-white/70 text-oceano hover:border-oceano/40",
                )}
              >
                {m}
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
