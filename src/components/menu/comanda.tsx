"use client";

import { AnimatePresence, motion } from "motion/react";
import { ChevronUp, Trash2, Undo2 } from "lucide-react";
import { Contador } from "@/components/menu/contador";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { precio } from "@/lib/formato";
import { cn } from "@/lib/utils";
import { platosEnCarrito, totalCarrito, useCarrito } from "@/store/carrito";
import type { LineaCarrito } from "@/types/menu";

// Curva del trazo: salida exponencial, como tinta que corre y se asienta.
const TINTA = [0.16, 1, 0.3, 1] as const;

const papel =
  "bg-crema text-tostado [mask:radial-gradient(circle_at_9px_0,transparent_6px,#000_6.5px)_0_0/18px_100%_repeat-x]";

const nPlatos = (n: number) => `${n} ${n === 1 ? "plato" : "platos"}`;

export type AvisoComanda = {
  id: number;
  tipo: "anotado" | "quitado";
  texto: string;
  onDeshacer?: () => void;
} | null;

/** Margen real para deshacer el envío: el pedido se crea al terminar. */
export const ESPERA_ENVIO_MS = 4000;

/** Comanda sellada «A COCINA», a la espera de salir. */
export type SelloEnvio = { hora: string } | null;

type Comun = {
  mesa: string | null | undefined;
  montado: boolean;
  sello: SelloEnvio;
  onEnviar: () => void;
  onCancelarEnvio: () => void;
  onQuitar: (lineaId: string) => void;
};

/** Papelito que confirma lo anotado o lo quitado (con «Deshacer»). */
function PapelAviso({ aviso, className }: { aviso: AvisoComanda; className?: string }) {
  return (
    <AnimatePresence>
      {aviso && (
        <motion.div
          key={aviso.id}
          data-superficie="clara"
          initial={{ y: 14, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 8, opacity: 0 }}
          transition={{ duration: 0.35, ease: TINTA }}
          className={cn(
            "flex items-center gap-3 rounded-lg border border-dashed border-tostado/30 bg-crema py-2 pr-2 pl-4 text-tostado shadow-[0_10px_24px_-8px_rgb(0_0_0/0.5)]",
            className,
          )}
        >
          <motion.p
            aria-hidden="true"
            initial={{ clipPath: "inset(0 100% 0 0)" }}
            animate={{ clipPath: "inset(0 0% 0 0)" }}
            transition={{ duration: 0.7, delay: 0.1, ease: TINTA }}
            className="min-w-0 flex-1 py-0.5 text-[0.9rem] leading-snug"
          >
            <span className={cn("font-semibold", aviso.tipo === "anotado" ? "text-aji-texto" : "text-oceano")}>
              {aviso.tipo === "anotado" ? "Anotado · " : "Quitado · "}
            </span>
            {aviso.texto}
          </motion.p>
          {aviso.onDeshacer && (
            <button
              type="button"
              onClick={aviso.onDeshacer}
              className="flex h-11 shrink-0 items-center gap-1.5 rounded-lg px-3 text-[0.9rem] font-semibold text-oceano underline decoration-oceano/40 underline-offset-4 hover:bg-oceano/8"
            >
              <Undo2 className="size-4" aria-hidden="true" />
              Deshacer
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Aviso en escritorio: flota alineado con la columna de la comanda. */
export function AvisoEscritorio({ aviso }: { aviso: AvisoComanda }) {
  return (
    <div className="pointer-events-none fixed right-[max(1.5rem,calc((100vw-72rem)/2+1.5rem))] bottom-6 z-40 hidden w-[380px] lg:block [&>*]:pointer-events-auto">
      <PapelAviso aviso={aviso} />
    </div>
  );
}

/** Tira plegada fija abajo (celular). Tocarla abre la comanda completa. */
export function TiraComanda({
  aviso,
  abierta,
  onAbrir,
  onCerrar,
  ...comun
}: Comun & { aviso: AvisoComanda; abierta: boolean; onAbrir: () => void; onCerrar: () => void }) {
  const lineas = useCarrito((s) => s.lineas);
  const n = platosEnCarrito(lineas);
  const { mesa, montado } = comun;

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-40 lg:hidden">
        <PapelAviso aviso={aviso} className="mx-3 mb-2" />
        <div className="drop-shadow-[0_-8px_24px_rgb(0_0_0/0.35)]">
          <div data-superficie="clara" className={cn(papel, "pt-3.5 pb-[max(0.75rem,env(safe-area-inset-bottom))]")}>
            <div className="mx-auto flex max-w-2xl items-center gap-3 px-4">
              <button
                type="button"
                onClick={onAbrir}
                disabled={!montado}
                aria-expanded={abierta}
                aria-label={`Ver comanda: ${nPlatos(n)}, ${precio(totalCarrito(lineas))}`}
                className="flex min-h-12 min-w-0 flex-1 items-center gap-2 rounded-xl text-left"
              >
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="font-heading text-[1.2rem] leading-tight font-bold text-oceano">Comanda</span>
                    {mesa && (
                      <span className="-rotate-3 rounded-[5px] border-[1.5px] border-oceano px-1.5 font-heading text-[0.8rem] leading-[1.35] font-bold whitespace-nowrap text-oceano">
                        Mesa {mesa}
                      </span>
                    )}
                  </span>
                  {montado ? (
                    <span className="block truncate text-sm text-tostado/75 tabular-nums">
                      {n === 0 ? "Vacía" : `${nPlatos(n)} · ${precio(totalCarrito(lineas))}`}
                    </span>
                  ) : (
                    <span className="mt-1.5 block h-3 w-28 rounded-full bg-tostado/10" />
                  )}
                </span>
                {n > 0 && <ChevronUp className="size-5 shrink-0 text-oceano" aria-hidden="true" />}
              </button>
              {montado && n > 0 && (
                <button
                  type="button"
                  onClick={onAbrir}
                  className="flex h-12 shrink-0 items-center justify-center rounded-2xl bg-aji-texto px-5 text-[0.95rem] font-semibold text-white shadow-[0_6px_18px_-6px_color-mix(in_oklab,var(--aji)_70%,transparent)] transition-[transform,background-color] duration-150 hover:bg-[color-mix(in_oklab,var(--aji-texto)_88%,black)] active:scale-[0.98]"
                >
                  Revisar y enviar
                </button>
              )}
              {montado && n === 0 && (
                <span className="max-w-[9.5rem] text-right text-[0.8rem] leading-snug text-tostado/70">
                  Toca un plato para anotarlo
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <Sheet open={abierta} onOpenChange={(v) => (v ? onAbrir() : onCerrar())}>
        <SheetContent
          side="bottom"
          showCloseButton={comun.sello === null}
          className="max-h-[88dvh] gap-0 border-0 bg-transparent p-0 shadow-none [&>[data-slot=sheet-close]]:top-6 [&>[data-slot=sheet-close]]:right-4 [&>[data-slot=sheet-close]]:size-10 [&>[data-slot=sheet-close]]:rounded-full [&>[data-slot=sheet-close]]:text-oceano"
        >
          <div className={cn(papel, "flex max-h-[88dvh] min-h-0 flex-col pt-5")}>
            <ContenidoComanda {...comun} enHoja aviso={aviso} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

/** Columna fija a la derecha (escritorio). */
export function ComandaLateral(comun: Comun) {
  return (
    <aside
      aria-label="Comanda"
      className="sticky top-[88px] hidden max-h-[calc(100dvh-112px)] drop-shadow-[0_18px_30px_rgb(0_0_0/0.35)] lg:block"
    >
      <div data-superficie="clara" className={cn(papel, "flex max-h-[calc(100dvh-112px)] flex-col rounded-b-[14px] pt-6")}>
        <ContenidoComanda {...comun} />
      </div>
    </aside>
  );
}

function ContenidoComanda({
  mesa,
  montado,
  sello,
  onEnviar,
  onCancelarEnvio,
  onQuitar,
  enHoja,
  aviso,
}: Comun & { enHoja?: boolean; aviso?: AvisoComanda }) {
  const lineas = useCarrito((s) => s.lineas);
  const cambiarCantidad = useCarrito((s) => s.cambiarCantidad);
  const total = totalCarrito(lineas);
  const n = platosEnCarrito(lineas);
  const Titulo = enHoja ? SheetTitle : "h2";
  const Sub = enHoja ? SheetDescription : "p";

  return (
    <>
      <header className="flex items-start justify-between gap-4 border-b-2 border-tostado px-5 pb-3 sm:px-6">
        <div>
          <Titulo className="font-heading text-[1.9rem] leading-none font-bold text-oceano">Comanda</Titulo>
          <Sub className="mt-1.5 text-sm text-tostado/75">
            {montado ? (n === 0 ? "Aún no has anotado nada" : nPlatos(n)) : " "}
          </Sub>
        </div>
        <span
          className={cn(
            "mt-0.5 shrink-0 -rotate-3 rounded-md border-2 border-oceano px-2.5 py-0.5 font-heading text-lg font-bold text-oceano",
            enHoja && "mr-12",
          )}
        >
          {mesa ? `Mesa ${mesa}` : "Sin mesa"}
        </span>
      </header>

      <div
        inert={sello !== null}
        className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 sm:px-6"
      >
        <AnimatePresence>
          {sello && (
            <motion.div
              key="sello"
              className="pointer-events-none absolute inset-0 z-10 grid place-items-center"
              initial={{ opacity: 0, scale: 1.9, rotate: -16 }}
              animate={{ opacity: 1, scale: 1, rotate: -9 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ type: "spring", stiffness: 700, damping: 26, mass: 0.8 }}
            >
              <div className="rounded-md border-[3.5px] border-aji-texto bg-crema/85 px-5 pt-2 pb-2.5 text-center text-aji-texto shadow-[0_0_0_4px_var(--crema),0_0_0_5.5px_var(--aji-texto)]">
                <p className="font-heading text-[2.4rem] leading-none font-black tracking-[0.06em]">A COCINA</p>
                <p className="mt-1.5 text-[0.8rem] font-bold tracking-[0.14em] tabular-nums">
                  MESA {mesa} · {sello.hora}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {montado && n === 0 && (
          <div>
            <p className="pt-4 pb-1 text-[0.95rem] leading-relaxed text-tostado/70">
              Toca un plato de la carta y aparecerá escrito aquí.
            </p>
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} aria-hidden="true" className="h-12 border-b border-dashed border-tostado/25" />
            ))}
            <div aria-hidden="true" className="h-6" />
          </div>
        )}
        <ul>
          <AnimatePresence initial={false}>
            {lineas.map((linea) => (
              <Linea
                key={linea.lineaId}
                linea={linea}
                onCantidad={(c) => cambiarCantidad(linea.lineaId, c)}
                onQuitar={() => onQuitar(linea.lineaId)}
              />
            ))}
          </AnimatePresence>
        </ul>
      </div>

      {enHoja && (
        <>
          {/* Con la hoja abierta, lo de afuera queda inerte: el aviso vive aquí. */}
          <PapelAviso aviso={aviso ?? null} className="mx-4 mt-3 shadow-none sm:mx-5" />
          <p aria-live="polite" className="sr-only">
            {aviso?.tipo === "quitado" ? `Quitado de la comanda: ${aviso.texto}` : ""}
          </p>
        </>
      )}

      {montado && n > 0 && (
        <footer className="border-t-2 border-tostado px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6">
          <div className="mb-3 flex items-baseline justify-between">
            <span className="text-base font-semibold">Total</span>
            <span className="font-heading text-[1.75rem] font-bold text-oceano tabular-nums">{precio(total)}</span>
          </div>
          {sello ? (
            <>
              <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-tostado/10">
                <div
                  className="h-full origin-left rounded-full bg-aji-texto"
                  style={{ animation: `vaciar-barra ${ESPERA_ENVIO_MS}ms linear forwards` }}
                />
              </div>
              <button
                type="button"
                onClick={onCancelarEnvio}
                className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl border-2 border-oceano text-base font-semibold text-oceano transition-colors hover:bg-oceano/8 active:scale-[0.98]"
              >
                <Undo2 className="size-5" aria-hidden="true" />
                Deshacer, aún no
              </button>
              <p className="mt-2.5 text-center text-[0.8rem] text-tostado/70">Saliendo a cocina…</p>
            </>
          ) : (
            <>
              <BotonEnviar onEnviar={onEnviar} />
              <p className="mt-2.5 text-center text-[0.8rem] text-tostado/70">
                {mesa
                  ? `Cocina lo recibe al instante y te lo llevamos a la mesa ${mesa}.`
                  : "Antes de enviar, dinos en qué mesa estás."}
              </p>
            </>
          )}
        </footer>
      )}
    </>
  );
}

function Linea({
  linea,
  onCantidad,
  onQuitar,
}: {
  linea: LineaCarrito;
  onCantidad: (c: number) => void;
  onQuitar: () => void;
}) {
  return (
    <motion.li
      layout="position"
      initial={{ height: 0, opacity: 1 }}
      animate={{ height: "auto" }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.35, ease: TINTA }}
      className="overflow-hidden"
    >
      <div className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-2 border-b border-dashed border-tostado/25 py-3.5">
        <motion.div
          initial={{ clipPath: "inset(0 100% 0 0)" }}
          animate={{ clipPath: "inset(0 0% 0 0)" }}
          transition={{ duration: 0.7, delay: 0.12, ease: TINTA }}
          className="min-w-0"
        >
          <p className="font-heading text-[1.1rem] leading-snug font-semibold">{linea.nombre}</p>
          {linea.detalle && <p className="text-[0.85rem] leading-snug text-tostado/70">{linea.detalle}</p>}
        </motion.div>
        <motion.span
          key={linea.cantidad}
          initial={{ color: "var(--aji-texto)" }}
          animate={{ color: "var(--tostado)" }}
          transition={{ duration: 0.9 }}
          className="self-start pt-0.5 text-right font-semibold tabular-nums"
        >
          {precio(linea.precioUnitario * linea.cantidad)}
        </motion.span>
        <Contador
          valor={linea.cantidad}
          onCambiar={onCantidad}
          tamano="sm"
          etiqueta={`Cantidad de ${linea.nombre}`}
          className="justify-self-start"
        />
        <button
          type="button"
          onClick={onQuitar}
          aria-label={`Quitar ${linea.nombre} de la comanda`}
          className="flex h-11 items-center gap-1.5 justify-self-end rounded-lg px-2 text-[0.85rem] font-semibold text-tostado/75 transition-colors hover:bg-tostado/6 hover:text-aji-texto"
        >
          <Trash2 className="size-4" aria-hidden="true" />
          Quitar
        </button>
      </div>
    </motion.li>
  );
}

function BotonEnviar({ onEnviar }: { onEnviar: () => void }) {
  return (
    <button
      type="button"
      onClick={onEnviar}
      className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-aji-texto text-base font-semibold text-white shadow-[0_6px_18px_-6px_color-mix(in_oklab,var(--aji)_70%,transparent)] transition-[transform,background-color] duration-150 hover:bg-[color-mix(in_oklab,var(--aji-texto)_88%,black)] active:scale-[0.98] "
    >
      Enviar a cocina
    </button>
  );
}
