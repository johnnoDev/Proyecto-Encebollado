"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, MotionConfig } from "motion/react";
import { ArrowRight, RotateCcw, Undo2 } from "lucide-react";
import { IlustracionPlato } from "@/components/menu/ilustracion-plato";
import { brand } from "@/config/brand";
import { avisoCambioGrande, leerPrecio, precioEditable } from "@/lib/admin";
import { precio } from "@/lib/formato";
import { cn } from "@/lib/utils";
import { useMontado, useRehidratar } from "@/store/hidratar";
import { platoOriginal, useMenu } from "@/store/menu";
import type { Plato } from "@/types/menu";

const papel =
  "bg-crema text-tostado [mask:radial-gradient(circle_at_9px_0,transparent_6px,#000_6.5px)_0_0/18px_100%_repeat-x]";

type Estado = Pick<Plato, "precio" | "disponible">;
type Aviso = { id: number; texto: string; deshacer: () => void } | null;

let ultimoIdAviso = 0;

export function AdminCliente() {
  useRehidratar();
  const montado = useMontado();
  const { categorias, platos, ajustes } = useMenu();
  const ajustarPlato = useMenu((s) => s.ajustarPlato);
  const quitarAjuste = useMenu((s) => s.quitarAjuste);
  const [aviso, setAviso] = useState<Aviso>(null);
  const [confirmar, setConfirmar] = useState(false);
  // «Agotados» deja ver solo lo que hay que reactivar o revisar en medio del servicio.
  const [soloAgotados, setSoloAgotados] = useState(false);
  const temporizador = useRef<ReturnType<typeof setTimeout>>(undefined);
  const temporizadorConfirmar = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(
    () => () => {
      clearTimeout(temporizador.current);
      clearTimeout(temporizadorConfirmar.current);
    },
    [],
  );

  const avisar = (texto: string, deshacer: () => void) => {
    setAviso({ id: ++ultimoIdAviso, texto, deshacer });
    clearTimeout(temporizador.current);
    temporizador.current = setTimeout(() => setAviso(null), 5000);
  };

  /** Cada cambio guarda cómo estaba el plato para poder deshacerlo. */
  const cambiar = (plato: Plato, cambio: Partial<Estado>, texto: string) => {
    const antes: Estado = { precio: plato.precio, disponible: plato.disponible };
    ajustarPlato(plato.id, cambio);
    avisar(texto, () => ajustarPlato(plato.id, antes));
  };

  const volverAlOriginal = (plato: Plato) => {
    const antes: Estado = { precio: plato.precio, disponible: plato.disponible };
    quitarAjuste(plato.id);
    avisar(`${plato.nombre} volvió a la carta original`, () => ajustarPlato(plato.id, antes));
  };

  const restablecerTodo = () => {
    if (!confirmar) {
      // Primer toque: pide confirmación sin abrir un diálogo.
      setConfirmar(true);
      clearTimeout(temporizadorConfirmar.current);
      temporizadorConfirmar.current = setTimeout(() => setConfirmar(false), 4000);
      return;
    }
    setConfirmar(false);
    const antes = structuredClone(ajustes);
    useMenu.getState().restablecer();
    avisar("Se restableció toda la carta", () => {
      Object.entries(antes).forEach(([id, ajuste]) => ajustarPlato(id, ajuste));
    });
  };

  const disponibles = platos.filter((p) => p.disponible).length;
  const agotados = platos.length - disponibles;
  const preciosCambiados = Object.values(ajustes).filter((a) => a.precio !== undefined).length;
  const hayCambios = Object.keys(ajustes).length > 0;

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-dvh bg-oceano pb-28 text-crema">
        <header className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 pt-5 pb-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Image src="/brand/logo-mark.svg" alt="" width={44} height={44} priority className="size-11 shrink-0" />
            <div className="min-w-0">
              <h1 className="truncate font-heading text-titulo leading-none font-bold">Administración</h1>
              <p className="mt-1 truncate text-nota text-crema/75">{brand.nombre}</p>
            </div>
          </div>
          <Link
            href="/menu?mesa=1"
            target="_blank"
            className="flex h-11 shrink-0 items-center gap-1.5 rounded-full border border-crema/30 px-4 text-sm font-semibold text-crema/90 transition-colors hover:border-crema/60 hover:text-crema max-sm:w-11 max-sm:justify-center max-sm:px-0"
          >
            <span className="max-sm:sr-only">Ver la carta</span>
            <span className="sr-only"> (se abre en otra pestaña)</span>
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </header>

        <nav
          aria-label="Ir a"
          className="sticky top-0 z-30 border-b border-crema/15 bg-oceano shadow-[0_10px_20px_-14px_rgb(0_0_0/0.6)]"
        >
          <ul className="mx-auto flex max-w-4xl gap-2 overflow-x-auto px-4 py-2.5 [scrollbar-width:none] sm:px-6">
            <li>
              <button
                type="button"
                aria-pressed={soloAgotados}
                onClick={() => setSoloAgotados((v) => !v)}
                disabled={!montado}
                className={cn(
                  "flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-semibold whitespace-nowrap transition-colors",
                  soloAgotados
                    ? "border-dorado bg-dorado text-tostado"
                    : "border-crema/30 text-crema/90 hover:border-crema/60",
                )}
              >
                Agotados
                <span className="grid h-5 min-w-5 place-items-center rounded-full bg-tostado/15 px-1 text-xs tabular-nums">
                  {montado ? agotados : "·"}
                </span>
              </button>
            </li>
            {!soloAgotados &&
              categorias.map((c) => (
                <li key={c.id}>
                  <a
                    href={`#cat-${c.id}`}
                    className="flex h-10 items-center rounded-full px-4 text-sm font-semibold whitespace-nowrap text-crema/80 transition-colors hover:bg-crema/10 hover:text-crema"
                  >
                    {c.nombre}
                  </a>
                </li>
              ))}
          </ul>
        </nav>

        <main className="mx-auto max-w-4xl px-4 sm:px-6">
          <section
            aria-label="Resumen de la carta"
            className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-y border-dashed border-crema/20 py-4"
          >
            <p className="text-cuerpo text-pretty text-crema/85">
              {montado ? (
                <>
                  <strong className="font-semibold text-crema">{disponibles} disponibles</strong>
                  {" · "}
                  <span className={cn(agotados > 0 && "font-semibold text-aji-claro")}>
                    {agotados} {agotados === 1 ? "agotado" : "agotados"}
                  </span>
                  {" · "}
                  {preciosCambiados === 0
                    ? "precios de la carta original"
                    : `${preciosCambiados} ${preciosCambiados === 1 ? "precio cambiado" : "precios cambiados"}`}
                </>
              ) : (
                <span className="inline-block h-4 w-56 rounded-full bg-crema/10 align-middle" />
              )}
            </p>
            {montado && hayCambios && (
              <button
                type="button"
                onClick={restablecerTodo}
                className={cn(
                  "flex h-11 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors",
                  confirmar
                    ? "border-aji bg-aji-texto text-white"
                    : "border-crema/30 text-crema/90 hover:border-crema/60",
                )}
              >
                <RotateCcw className="size-4" aria-hidden="true" />
                {confirmar ? "¿Seguro? Toca otra vez" : "Restablecer toda la carta"}
              </button>
            )}
          </section>

          <p className="mt-4 text-sm text-pretty text-crema/75">
            Los cambios se ven al instante en la carta del comensal. Lo ya anotado en un pedido mantiene su precio.
          </p>

          {soloAgotados && montado && agotados === 0 && (
            <p className="mt-8 rounded-xl border border-dashed border-crema/25 px-4 py-8 text-center text-cuerpo text-pretty text-crema/75">
              No hay platos agotados. Todo lo de la carta se puede pedir.
            </p>
          )}

          {categorias.map((categoria) => {
            const visibles = platos.filter(
              (p) => p.categoriaId === categoria.id && (!soloAgotados || !p.disponible),
            );
            if (visibles.length === 0) return null;
            const conOpciones = visibles.some((p) => p.grupos.length > 0);
            return (
              <section
                key={categoria.id}
                id={`cat-${categoria.id}`}
                aria-labelledby={`titulo-${categoria.id}`}
                className="mt-8 scroll-mt-20"
              >
                <h2 id={`titulo-${categoria.id}`} className="font-heading text-plato font-bold">
                  {categoria.nombre}
                </h2>
                {/* Una sola vez por categoría, no repetido en cada plato. */}
                {conOpciones && (
                  <p className="mt-1 text-sm text-pretty text-crema/75">
                    Los precios son la base; las opciones (tamaño, sabor) suman encima.
                  </p>
                )}
                <div className="mt-3 drop-shadow-[0_10px_16px_rgb(0_0_0/0.3)]">
                  <ul data-superficie="clara" className={cn(papel, "rounded-b-[14px] px-4 pt-3 pb-1 sm:px-5")}>
                    {visibles.map((plato) => (
                      <FilaAdmin
                        key={plato.id}
                        plato={plato}
                        montado={montado}
                        cambiado={ajustes[plato.id] !== undefined}
                        onCambiar={cambiar}
                        onOriginal={() => volverAlOriginal(plato)}
                      />
                    ))}
                  </ul>
                </div>
              </section>
            );
          })}
        </main>

        <AnimatePresence>
          {aviso && (
            <motion.div
              key={aviso.id}
              data-superficie="clara"
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 8, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 mx-auto flex max-w-md items-center gap-3 rounded-lg border border-dashed border-tostado/30 bg-crema py-2 pr-2 pl-4 text-tostado shadow-[0_10px_24px_-8px_rgb(0_0_0/0.5)]"
            >
              <p className="min-w-0 flex-1 text-cuerpo leading-snug">{aviso.texto}</p>
              <button
                type="button"
                onClick={() => {
                  aviso.deshacer();
                  clearTimeout(temporizador.current);
                  setAviso(null);
                }}
                className="flex h-11 shrink-0 items-center gap-1.5 rounded-lg px-3 text-cuerpo font-semibold text-oceano underline decoration-oceano/40 underline-offset-4 hover:bg-oceano/8"
              >
                <Undo2 className="size-4" aria-hidden="true" />
                Deshacer
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        <p aria-live="polite" className="sr-only">
          {aviso?.texto ?? ""}
        </p>
      </div>
    </MotionConfig>
  );
}

function FilaAdmin({
  plato,
  montado,
  cambiado,
  onCambiar,
  onOriginal,
}: {
  plato: Plato;
  montado: boolean;
  cambiado: boolean;
  onCambiar: (plato: Plato, cambio: Partial<Estado>, texto: string) => void;
  onOriginal: () => void;
}) {
  const original = platoOriginal(plato.id);
  const precioCambiado = original !== undefined && original.precio !== plato.precio;

  return (
    <li
      className={cn(
        "-mx-4 grid grid-cols-[56px_minmax(0,1fr)] items-center gap-x-3 gap-y-3 border-b border-dashed border-tostado/25 px-4 py-4 transition-colors last:border-b-0 sm:-mx-5 sm:grid-cols-[56px_minmax(0,1fr)_auto_auto] sm:gap-x-5 sm:px-5",
        // Agotado: la fila entera se tiñe para encontrarla al recorrer la lista.
        !plato.disponible && "bg-[color-mix(in_oklab,var(--aji)_9%,var(--crema))]",
      )}
    >
      <IlustracionPlato
        platoId={plato.id}
        className={cn("size-14 transition-opacity", !plato.disponible && "opacity-45 grayscale-[.6]")}
      />
      <div className="min-w-0">
        <p className={cn("font-heading text-linea leading-snug font-semibold", !plato.disponible && "text-tostado/65")}>
          {plato.nombre}
        </p>
        {precioCambiado && <p className="mt-0.5 text-sm text-tostado/75">Antes {precio(original.precio)}</p>}
        {montado && cambiado && (
          <button
            type="button"
            onClick={onOriginal}
            className="mt-1 -ml-1 flex min-h-8 items-center gap-1 rounded px-1 text-sm font-semibold text-oceano underline decoration-oceano/40 underline-offset-4 hover:bg-oceano/8"
          >
            <RotateCcw className="size-3.5" aria-hidden="true" />
            Volver al original
          </button>
        )}
      </div>
      <div className="col-span-2 flex items-start justify-between gap-4 sm:col-span-1 sm:contents">
        <CampoPrecio plato={plato} montado={montado} onCambiar={onCambiar} />
        <Interruptor plato={plato} montado={montado} onCambiar={onCambiar} />
      </div>
    </li>
  );
}

function CampoPrecio({
  plato,
  montado,
  onCambiar,
}: {
  plato: Plato;
  montado: boolean;
  onCambiar: (plato: Plato, cambio: Partial<Estado>, texto: string) => void;
}) {
  const id = useId();
  const [texto, setTexto] = useState(() => precioEditable(plato.precio));
  const [error, setError] = useState<string | null>(null);
  // Precio grande pendiente de confirmar: no se guarda hasta un segundo «sí».
  const [porConfirmar, setPorConfirmar] = useState<{ valor: number; aviso: string } | null>(null);
  const [visto, setVisto] = useState(plato.precio);

  // Si el precio cambia desde fuera (deshacer, otra pestaña), el campo lo sigue.
  if (visto !== plato.precio) {
    setVisto(plato.precio);
    setTexto(precioEditable(plato.precio));
    setError(null);
    setPorConfirmar(null);
  }

  const aplicar = (valor: number) => {
    setPorConfirmar(null);
    setTexto(precioEditable(valor));
    onCambiar(plato, { precio: valor }, `${plato.nombre}: ahora ${precio(valor)}`);
  };

  const cancelar = () => {
    setTexto(precioEditable(plato.precio));
    setError(null);
    setPorConfirmar(null);
  };

  const guardar = () => {
    const leido = leerPrecio(texto);
    if (!leido.ok) return setError(leido.error);
    setError(null);
    if (leido.valor === plato.precio) {
      setTexto(precioEditable(leido.valor));
      return setPorConfirmar(null);
    }
    if (porConfirmar?.valor === leido.valor) return aplicar(leido.valor);
    const aviso = avisoCambioGrande(plato.precio, leido.valor);
    if (aviso) return setPorConfirmar({ valor: leido.valor, aviso });
    aplicar(leido.valor);
  };

  return (
    <div className="min-w-0">
      <label htmlFor={id} className="sr-only">
        Precio de {plato.nombre}
      </label>
      <div
        className={cn(
          "flex h-11 w-32 items-center rounded-xl border bg-white/70 pl-3 transition-colors focus-within:border-oceano",
          error ? "border-aji-texto" : "border-tostado/20",
        )}
      >
        <span aria-hidden="true" className="font-heading text-linea font-semibold text-tostado/70">
          $
        </span>
        <input
          id={id}
          inputMode="decimal"
          autoComplete="off"
          disabled={!montado}
          value={texto}
          onChange={(e) => {
            setTexto(e.target.value);
            setPorConfirmar(null);
          }}
          onBlur={guardar}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              // Con un precio pendiente, Enter es el segundo «sí».
              if (porConfirmar) aplicar(porConfirmar.valor);
              else e.currentTarget.blur();
            }
            if (e.key === "Escape") cancelar();
          }}
          aria-invalid={error !== null}
          aria-describedby={error ? `${id}-error` : porConfirmar ? `${id}-confirmar` : undefined}
          className="h-full w-full min-w-0 bg-transparent pr-3 pl-1 font-heading text-linea font-semibold tabular-nums outline-none"
        />
      </div>
      {porConfirmar && (
        <div id={`${id}-confirmar`} role="alert" className="mt-2 max-w-60">
          <p className="text-sm font-semibold text-pretty text-oceano">
            ¿{precio(porConfirmar.valor)}? {porConfirmar.aviso} Antes: {precio(plato.precio)}.
          </p>
          <div className="mt-1.5 flex gap-2">
            <button
              type="button"
              // mousedown: confirmar antes de que el campo pierda el foco y vuelva a validar.
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => aplicar(porConfirmar.valor)}
              className="flex h-10 items-center rounded-lg bg-oceano px-3 text-sm font-semibold text-crema"
            >
              Confirmar
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={cancelar}
              className="flex h-10 items-center rounded-lg border border-tostado/25 px-3 text-sm font-semibold text-tostado"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1 max-w-48 text-sm font-semibold text-pretty text-aji-texto">
          {error}
        </p>
      )}
    </div>
  );
}

function Interruptor({
  plato,
  montado,
  onCambiar,
}: {
  plato: Plato;
  montado: boolean;
  onCambiar: (plato: Plato, cambio: Partial<Estado>, texto: string) => void;
}) {
  const disponible = plato.disponible;
  return (
    <button
      type="button"
      role="switch"
      aria-checked={disponible}
      aria-label={`${plato.nombre} disponible`}
      disabled={!montado}
      onClick={() =>
        onCambiar(
          plato,
          { disponible: !disponible },
          disponible ? `${plato.nombre} marcado como agotado` : `${plato.nombre} vuelve a estar disponible`,
        )
      }
      className="flex h-11 shrink-0 items-center gap-2.5 rounded-full pr-1 pl-3 transition-colors hover:bg-tostado/5"
    >
      <span
        className={cn(
          "w-20 text-right text-sm font-semibold",
          disponible ? "text-cilantro-texto" : "text-aji-oscuro",
        )}
      >
        {disponible ? "Disponible" : "Agotado"}
      </span>
      <span
        aria-hidden="true"
        className={cn(
          "relative h-7 w-12 rounded-full transition-colors",
          disponible ? "bg-cilantro-texto" : "bg-tostado/25",
        )}
      >
        <span
          className={cn(
            "absolute top-1 left-1 size-5 rounded-full bg-white shadow-[0_1px_3px_rgb(0_0_0/0.3)] transition-transform motion-reduce:transition-none",
            disponible && "translate-x-5",
          )}
        />
      </span>
    </button>
  );
}
