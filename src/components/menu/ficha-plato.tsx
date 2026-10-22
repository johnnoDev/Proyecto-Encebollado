"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Contador } from "@/components/menu/contador";
import { IlustracionPlato } from "@/components/menu/ilustracion-plato";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { useMedia } from "@/hooks/use-media";
import { precio } from "@/lib/formato";
import {
  detalleSeleccion,
  faltaObligatorio,
  precioUnitario,
  seleccionInicial,
  type Seleccion,
} from "@/lib/pedido";
import { cn } from "@/lib/utils";
import type { GrupoOpciones, LineaCarrito, Plato } from "@/types/menu";

/** Línea de la comanda que se está editando (selección y cantidad de partida). */
export type Edicion = { lineaId: string; seleccion: Seleccion; cantidad: number } | null;

type Props = {
  plato: Plato | null;
  edicion?: Edicion;
  onCerrar: () => void;
  onAnotar: (linea: Omit<LineaCarrito, "lineaId">) => void;
};

export function FichaPlato({ plato, edicion = null, onCerrar, onAnotar }: Props) {
  const escritorio = useMedia("(min-width: 1024px)");
  return (
    <Sheet open={plato !== null} onOpenChange={(abierto) => !abierto && onCerrar()}>
      <SheetContent
        side={escritorio ? "right" : "bottom"}
        className="gap-0 overflow-hidden border-0 bg-crema p-0 text-tostado data-[side=bottom]:max-h-[94dvh] data-[side=bottom]:rounded-t-[22px] data-[side=right]:w-full data-[side=right]:sm:max-w-md [&>[data-slot=sheet-close]]:top-4 [&>[data-slot=sheet-close]]:right-4 [&>[data-slot=sheet-close]]:size-10 [&>[data-slot=sheet-close]]:rounded-full [&>[data-slot=sheet-close]]:bg-crema/15 [&>[data-slot=sheet-close]]:text-crema [&>[data-slot=sheet-close]]:hover:bg-crema/25"
      >
        {plato && (
          <Contenido
            key={`${plato.id}-${edicion?.lineaId ?? "nuevo"}`}
            plato={plato}
            edicion={edicion}
            onAnotar={onAnotar}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}

function Contenido({ plato, edicion, onAnotar }: { plato: Plato; edicion: Edicion; onAnotar: Props["onAnotar"] }) {
  const [seleccion, setSeleccion] = useState<Seleccion>(() => edicion?.seleccion ?? seleccionInicial(plato));
  const [cantidad, setCantidad] = useState(edicion?.cantidad ?? 1);
  const unitario = precioUnitario(plato, seleccion);
  const incompleto = faltaObligatorio(plato, seleccion);

  const anotar = () =>
    onAnotar({
      platoId: plato.id,
      nombre: plato.nombre,
      precioUnitario: unitario,
      cantidad,
      seleccion,
      detalle: detalleSeleccion(plato, seleccion),
    });

  return (
    <div className="flex max-h-[inherit] min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {/* Celular: fila compacta para que las opciones entren sin scroll.
            Desde sm: la ilustración grande encabeza y el nombre va debajo. */}
        <div className="flex items-center gap-4 bg-oceano py-5 pr-16 pl-5 sm:flex-col sm:gap-0 sm:px-6 sm:pt-8 sm:pb-6 sm:text-center">
          <IlustracionPlato platoId={plato.id} className="size-24 shrink-0 sm:size-52" />
          <div className="min-w-0 sm:mt-5">
            <SheetTitle className="font-heading text-[1.5rem] leading-[1.1] font-bold text-balance text-crema sm:text-[1.9rem]">
              {plato.nombre}
            </SheetTitle>
            <SheetDescription className="mt-1.5 text-[0.9rem] leading-snug text-crema/80 sm:text-[0.95rem]">
              {plato.descripcion}
            </SheetDescription>
          </div>
        </div>
        <div className="px-5 pt-5 pb-6 sm:px-6">
          {plato.grupos.map((grupo) => (
            <Grupo
              key={grupo.id}
              grupo={grupo}
              base={plato.precio}
              elegidas={seleccion[grupo.id] ?? []}
              onCambiar={(ids) => setSeleccion((s) => ({ ...s, [grupo.id]: ids }))}
            />
          ))}
        </div>
      </div>
      <div className="flex items-center gap-3 border-t border-dashed border-tostado/25 bg-crema px-5 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6">
        <Contador valor={cantidad} onCambiar={setCantidad} etiqueta="Cantidad" />
        <button
          type="button"
          onClick={anotar}
          disabled={incompleto}
          aria-label={`${edicion ? "Guardar cambios" : "Anotar en la comanda"}, ${precio(unitario * cantidad)}`}
          className="flex h-14 flex-1 items-center justify-between gap-3 rounded-2xl bg-aji-texto px-5 text-white shadow-[0_6px_18px_-6px_color-mix(in_oklab,var(--aji)_70%,transparent)] transition-[transform,background-color] duration-150 hover:bg-[color-mix(in_oklab,var(--aji-texto)_88%,black)] active:scale-[0.98] disabled:opacity-50"
        >
          <span className="text-base font-semibold">{edicion ? "Guardar cambios" : "Anotar"}</span>
          <span className="font-heading text-lg font-bold tabular-nums">{precio(unitario * cantidad)}</span>
        </button>
      </div>
    </div>
  );
}

function Grupo({
  grupo,
  base,
  elegidas,
  onCambiar,
}: {
  grupo: GrupoOpciones;
  base: number;
  elegidas: string[];
  onCambiar: (ids: string[]) => void;
}) {
  const unica = grupo.tipo === "unica";
  const conPrecio = grupo.opciones.some((o) => o.precio > 0);

  return (
    <fieldset className="mt-6 first:mt-0">
      <legend className="flex w-full items-baseline justify-between gap-3">
        <span className="text-base font-semibold text-tostado">{grupo.nombre}</span>
        <span className="text-[0.8rem] text-tostado/70">
          {unica ? "Elige uno" : "Opcional, puedes marcar varios"}
        </span>
      </legend>
      <div
        className={cn(
          "mt-3 gap-2",
          unica ? "grid" : "flex flex-wrap",
        )}
        style={unica ? { gridTemplateColumns: `repeat(${grupo.opciones.length}, minmax(0, 1fr))` } : undefined}
      >
        {grupo.opciones.map((opcion) => {
          const marcada = elegidas.includes(opcion.id);
          return (
            <label
              key={opcion.id}
              className={cn(
                "relative flex cursor-pointer items-center justify-center gap-1.5 border text-center transition-colors duration-150 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-oceano",
                unica
                  ? "min-h-16 flex-col rounded-xl px-2 py-2"
                  : "h-11 rounded-full px-4",
                marcada
                  ? "border-oceano bg-oceano text-crema"
                  : "border-tostado/15 bg-white/70 text-tostado hover:border-oceano/40",
              )}
            >
              <input
                type={unica ? "radio" : "checkbox"}
                name={grupo.id}
                className="sr-only"
                checked={marcada}
                onChange={() =>
                  onCambiar(
                    unica ? [opcion.id] : marcada ? elegidas.filter((id) => id !== opcion.id) : [...elegidas, opcion.id],
                  )
                }
              />
              {!unica && marcada && <Check className="size-4" strokeWidth={2.75} aria-hidden="true" />}
              <span className="text-[0.95rem] leading-tight font-semibold">{opcion.nombre}</span>
              {unica && conPrecio && (
                <span className={cn("text-[0.8rem] tabular-nums", marcada ? "text-crema/85" : "text-tostado/70")}>
                  {precio(base + opcion.precio)}
                </span>
              )}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
