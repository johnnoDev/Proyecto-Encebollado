"use client";

import { Plus } from "lucide-react";
import { IlustracionPlato } from "@/components/menu/ilustracion-plato";
import { precio } from "@/lib/formato";
import { tienePrecioVariable } from "@/lib/pedido";
import { cn } from "@/lib/utils";
import type { Plato } from "@/types/menu";

export function FilaPlato({ plato, onElegir }: { plato: Plato; onElegir: (plato: Plato) => void }) {
  const desde = tienePrecioVariable(plato);
  const agotado = !plato.disponible;
  const directo = plato.grupos.length === 0;

  return (
    <li className="border-b border-dashed border-crema/18 last:border-b-0">
      <button
        type="button"
        disabled={agotado}
        onClick={() => onElegir(plato)}
        aria-label={
          agotado
            ? `${plato.nombre}, agotado`
            : `${directo ? "Anotar" : "Elegir"} ${plato.nombre}, ${desde ? "desde " : ""}${precio(plato.precio)}`
        }
        className="group grid w-full grid-cols-[76px_1fr_auto] items-center gap-4 rounded-2xl py-4 text-left transition-colors outline-offset-[-2px] enabled:hover:bg-crema/[0.04] sm:grid-cols-[92px_1fr_auto] lg:px-3"
      >
        <IlustracionPlato
          platoId={plato.id}
          className={cn(
            "size-[76px] transition-transform duration-500 ease-out group-enabled:group-hover:rotate-[8deg] sm:size-[92px]",
            agotado && "opacity-40 grayscale-[.6]",
          )}
        />
        <span className={cn("min-w-0", agotado && "opacity-55")}>
          <span className="block font-heading text-plato leading-[1.15] font-semibold text-balance text-crema">
            {plato.nombre}
          </span>
          <span className="mt-1 line-clamp-2 block text-sm leading-snug text-crema/75">
            {plato.descripcion}
          </span>
          {plato.etiqueta && !agotado && (
            <span className="mt-2 inline-block rounded-full bg-rosa px-2.5 py-0.5 text-xs font-semibold text-white">
              {plato.etiqueta}
            </span>
          )}
        </span>
        {agotado ? (
          <span
            aria-hidden="true"
            className="-rotate-[8deg] rounded-[4px] border-[2.5px] border-[color-mix(in_oklab,var(--aji)_70%,white)] px-2 py-0.5 font-heading text-base font-black tracking-[0.1em] text-[color-mix(in_oklab,var(--aji)_70%,white)]"
          >
            AGOTADO
          </span>
        ) : (
          <span className="flex flex-col items-end justify-center gap-2 self-stretch">
            <span className="text-right">
              {desde && <span className="block text-xs text-crema/70">desde</span>}
              <span className="font-heading text-plato font-semibold text-dorado tabular-nums">
                {precio(plato.precio)}
              </span>
            </span>
            <span
              aria-hidden="true"
              className="grid size-10 place-items-center rounded-full bg-aji-texto text-white shadow-[0_3px_10px_-2px_rgb(0_0_0/.35)] transition-transform duration-200 group-active:scale-90"
            >
              <Plus className="size-5" strokeWidth={2.5} />
            </span>
          </span>
        )}
      </button>
    </li>
  );
}
