"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, MotionConfig, useReducedMotion } from "motion/react";
import { ArrowRight, Bell, BellOff, Check, Flame, Play, Thermometer, Undo2 } from "lucide-react";
import { brand } from "@/config/brand";
import {
  columnasCocina,
  type ColumnaCocina,
  MINUTOS_DEMORA,
  MINUTOS_URGENTE,
  MINUTOS_ENFRIA,
  minutosListo,
  textoListo,
  minutosEspera,
  nombreDestino,
  siguienteEstado,
  textoEspera,
} from "@/lib/cocina";
import { cn } from "@/lib/utils";
import { useMedia } from "@/hooks/use-media";
import { useMontado } from "@/store/hidratar";
import { usePedidos } from "@/store/pedidos";
import type { EstadoPedido, Pedido } from "@/types/menu";

const papel =
  "bg-crema text-tostado [mask:radial-gradient(circle_at_9px_0,transparent_6px,#000_6.5px)_0_0/18px_100%_repeat-x]";

const COLUMNAS: { id: ColumnaCocina; nombre: string; vacio: string; accion: string }[] = [
  { id: "nuevo", nombre: "Nuevos", vacio: "Sin pedidos nuevos. Llegarán aquí al instante.", accion: "Empezar" },
  { id: "preparando", nombre: "Preparando", vacio: "Nada en preparación.", accion: "Marcar listo" },
  { id: "listo", nombre: "Listos", vacio: "Aún no hay pedidos listos.", accion: "Entregado" },
];

const textoCambio: Record<EstadoPedido, string> = {
  nuevo: " de vuelta en nuevos",
  preparando: " en preparación",
  listo: " listo para entregar",
  entregado: " entregado en la mesa",
};

type Cambio = { id: number; pedido: Pedido; de: EstadoPedido; a: EstadoPedido } | null;

// Reloj compartido: avanza cada 30 s para mantener al día el tiempo de espera.
// En el servidor vale 0 (las comandas solo se pintan tras montar).
let ahoraCompartido = 0;
function suscribirReloj(avisar: () => void) {
  ahoraCompartido = Date.now();
  const t = setInterval(() => {
    ahoraCompartido = Date.now();
    avisar();
  }, 30000);
  return () => clearInterval(t);
}
function useAhora() {
  return useSyncExternalStore(
    suscribirReloj,
    () => ahoraCompartido,
    () => 0,
  );
}

let ultimoIdCambio = 0;

/** Timbre corto de dos notas, sintetizado: no depende de archivos de audio. */
function tocarTimbre(ctx: AudioContext) {
  const t = ctx.currentTime;
  [880, 1320].forEach((frecuencia, i) => {
    const osc = ctx.createOscillator();
    const vol = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = frecuencia;
    vol.gain.setValueAtTime(0.0001, t + i * 0.16);
    vol.gain.exponentialRampToValueAtTime(0.25, t + i * 0.16 + 0.02);
    vol.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.16 + 0.35);
    osc.connect(vol).connect(ctx.destination);
    osc.start(t + i * 0.16);
    osc.stop(t + i * 0.16 + 0.4);
  });
}

export function CocinaCliente() {
  const montado = useMontado();
  const pedidos = usePedidos((s) => s.pedidos);
  const cambiarEstado = usePedidos((s) => s.cambiarEstado);
  // Para probar el circuito: la carta se abre en la mesa siguiente a la del último pedido.
  const mesaDemo = (usePedidos((s) => s.contador) % brand.mesas) + 1;
  const ahora = useAhora();
  const [vista, setVista] = useState<ColumnaCocina>("nuevo");
  const [cambio, setCambio] = useState<Cambio>(null);
  const temporizador = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(temporizador.current), []);

  const columnas = columnasCocina(montado ? pedidos : []);
  const nNuevos = columnas.nuevo.length;
  // El pedido nuevo más reciente: cambia solo cuando llega uno nuevo.
  const ultimoNuevo = columnas.nuevo.at(-1)?.id ?? null;

  const [sonido, setSonido] = useState(false);
  const audio = useRef<AudioContext | null>(null);
  const vistos = useRef<Set<string> | null>(null);

  // Conteo en el título de la pestaña: se ve aunque la pantalla esté en otra app.
  useEffect(() => {
    document.title = nNuevos > 0 ? `(${nNuevos}) Cocina · ${brand.nombre}` : `Cocina · ${brand.nombre}`;
  }, [nNuevos]);

  // Timbre solo si aparece en «Nuevos» un pedido nunca visto: no al cargar
  // la página ni al deshacer un cambio.
  useEffect(() => {
    if (!montado) return;
    const llegoUno =
      vistos.current !== null && pedidos.some((p) => p.estado === "nuevo" && !vistos.current!.has(p.id));
    if (llegoUno && sonido && audio.current) tocarTimbre(audio.current);
    vistos.current = new Set(pedidos.map((p) => p.id));
  }, [pedidos, montado, sonido]);

  const alternarSonido = () => {
    // El navegador solo permite audio tras un toque: el contexto nace aquí.
    if (!audio.current) audio.current = new AudioContext();
    void audio.current.resume();
    if (!sonido) tocarTimbre(audio.current);
    setSonido((v) => !v);
  };

  // Turno: un solo toque deja la tablet lista para la cocina (timbre encendido
  // y pantalla que no se apaga). Es el gesto que el navegador exige para el audio.
  const [turno, setTurno] = useState(false);
  const bloqueo = useRef<WakeLockSentinel | null>(null);

  const pedirPantallaEncendida = async () => {
    try {
      bloqueo.current = (await navigator.wakeLock?.request("screen")) ?? null;
    } catch {
      // Sin permiso o sin soporte: el turno funciona igual, solo sin bloqueo.
    }
  };

  useEffect(() => {
    if (!turno) return;
    // El bloqueo se suelta al ocultar la pestaña; al volver se pide de nuevo.
    const alVolver = () => {
      if (document.visibilityState === "visible") void pedirPantallaEncendida();
    };
    document.addEventListener("visibilitychange", alVolver);
    return () => {
      document.removeEventListener("visibilitychange", alVolver);
      void bloqueo.current?.release();
    };
  }, [turno]);

  const empezarTurno = () => {
    if (!sonido) alternarSonido();
    void pedirPantallaEncendida();
    setTurno(true);
  };

  // En celular las columnas son pestañas; desde md se ven las tres a la vez.
  const conPestanas = !useMedia("(min-width: 768px)");
  const pestanas = useRef<(HTMLButtonElement | null)[]>([]);

  const moverPestana = (e: React.KeyboardEvent, i: number) => {
    const destino =
      e.key === "ArrowRight" ? (i + 1) % COLUMNAS.length
      : e.key === "ArrowLeft" ? (i - 1 + COLUMNAS.length) % COLUMNAS.length
      : e.key === "Home" ? 0
      : e.key === "End" ? COLUMNAS.length - 1
      : null;
    if (destino === null) return;
    e.preventDefault();
    setVista(COLUMNAS[destino].id);
    pestanas.current[destino]?.focus();
  };

  // «Deshacer» se monta junto con el aviso: se enfoca después de montarlo.
  const enfocarDeshacer = useRef(false);
  useEffect(() => {
    if (cambio && enfocarDeshacer.current) {
      // Al cambiar de aviso conviven el que sale y el que entra: el nuevo es el último.
      [...document.querySelectorAll<HTMLButtonElement>("[data-deshacer]")].at(-1)?.focus();
      enfocarDeshacer.current = false;
    }
  }, [cambio]);

  const avanzar = (pedido: Pedido) => {
    const a = siguienteEstado[pedido.estado];
    if (!a) return;
    // El foco no se pierde cuando la comanda cambia de columna: pasa a la
    // siguiente acción de la misma columna o, si no queda ninguna, a «Deshacer».
    const columna = document.querySelector<HTMLElement>(`[data-columna="${pedido.estado}"]`);
    const acciones = [...(columna?.querySelectorAll<HTMLButtonElement>("button[data-accion]") ?? [])];
    const siguiente = acciones[acciones.findIndex((b) => b.dataset.accion === pedido.id) + 1] ?? acciones.at(-2);
    if (siguiente && siguiente.dataset.accion !== pedido.id) requestAnimationFrame(() => siguiente.focus());
    else enfocarDeshacer.current = true;
    cambiarEstado(pedido.id, a);
    setCambio({ id: ++ultimoIdCambio, pedido, de: pedido.estado, a });
    clearTimeout(temporizador.current);
    temporizador.current = setTimeout(() => setCambio(null), 5000);
  };

  const deshacer = () => {
    if (!cambio) return;
    cambiarEstado(cambio.pedido.id, cambio.de);
    clearTimeout(temporizador.current);
    setCambio(null);
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-dvh bg-oceano pb-28 text-crema">
        <header className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 pt-5 pb-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Image src="/brand/logo-mark.svg" alt="" width={44} height={44} priority className="size-11 shrink-0" />
            <div className="min-w-0">
              <h1 className="truncate font-heading text-titulo leading-none font-bold">Cocina</h1>
              <p className="mt-1 truncate text-nota text-crema/75">{brand.nombre}</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={alternarSonido}
            aria-pressed={sonido}
            aria-label="Timbre de pedidos nuevos"
            className={cn(
              "flex h-11 items-center gap-2 rounded-full border px-3 text-sm font-semibold transition-colors",
              sonido
                ? "w-11 justify-center border-dorado bg-dorado px-0 text-tostado"
                : turno
                  ? "border-aji bg-aji-texto text-white"
                  : "w-11 justify-center border-crema/30 px-0 text-crema/80 hover:border-crema/60",
            )}
          >
            {sonido ? <Bell className="size-5" aria-hidden="true" /> : <BellOff className="size-5" aria-hidden="true" />}
            {/* Con el turno empezado, un timbre apagado se dice con palabras, no solo con un icono. */}
            {!sonido && turno && (
              <span aria-hidden="true">
                <span className="max-sm:hidden">Sonido apagado · </span>Activar
              </span>
            )}
          </button>
          <Link
            href={`/menu?mesa=${mesaDemo}`}
            target="_blank"
            className="flex h-11 shrink-0 items-center gap-1.5 rounded-full border border-crema/30 px-4 max-sm:w-11 max-sm:justify-center max-sm:px-0 text-sm font-semibold text-crema/90 transition-colors hover:border-crema/60 hover:text-crema"
          >
            <span className="max-sm:sr-only">Abrir la carta</span>
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
          </div>
        </header>

        {/* Celular: una columna a la vez, elegida con pestañas que cuentan pedidos. */}
        <nav
          aria-label="Estados de pedido"
          className="sticky top-0 z-30 border-b border-crema/15 bg-oceano md:hidden"
        >
          <div role="tablist" aria-label="Estados de pedido" className="mx-auto flex max-w-7xl px-2">
            {COLUMNAS.map((c, i) => (
              <button
                key={c.id}
                ref={(el) => {
                  pestanas.current[i] = el;
                }}
                type="button"
                role="tab"
                id={`pestana-${c.id}`}
                aria-controls={`panel-${c.id}`}
                aria-selected={vista === c.id}
                tabIndex={vista === c.id ? 0 : -1}
                onClick={() => setVista(c.id)}
                onKeyDown={(e) => moverPestana(e, i)}
                className={cn(
                  "relative flex h-14 flex-1 items-center justify-center gap-2 text-cuerpo font-semibold transition-colors",
                  vista === c.id ? "text-crema" : "text-crema/65",
                )}
              >
                {c.nombre}
                <Conteo n={columnas[c.id].length} activo={vista === c.id} destacado={c.id === "nuevo"} pulso={c.id === "nuevo" ? ultimoNuevo : null} />
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute inset-x-4 bottom-0 h-[3px] rounded-full bg-dorado transition-opacity",
                    vista === c.id ? "opacity-100" : "opacity-0",
                  )}
                />
              </button>
            ))}
          </div>
        </nav>

        {montado && !turno && (
          <section
            aria-label="Empezar turno"
            className="mx-auto mt-4 flex max-w-7xl flex-col gap-3 px-4 sm:px-6 md:mt-0 md:mb-5 md:flex-row md:items-center"
          >
            <div className="flex flex-1 flex-col gap-3 rounded-2xl border-2 border-dashed border-dorado/60 p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-cuerpo text-pretty text-crema/90">
                <strong className="font-heading text-linea text-crema">¿Empieza el turno?</strong>{" "}
                Activa el timbre de pedidos nuevos y mantén la pantalla encendida.
              </p>
              <button
                type="button"
                onClick={empezarTurno}
                className="flex h-12 shrink-0 items-center justify-center gap-2 rounded-2xl bg-dorado px-5 text-base font-semibold text-tostado transition-transform motion-safe:active:scale-[0.98]"
              >
                <Play className="size-4 fill-current" aria-hidden="true" />
                Empezar turno
              </button>
            </div>
          </section>
        )}

        <main className="mx-auto grid max-w-7xl gap-6 px-4 pt-5 sm:px-6 md:grid-cols-3 md:pt-2">
          {COLUMNAS.map((c) => (
            <section
              key={c.id}
              id={`panel-${c.id}`}
              data-columna={c.id}
              role={conPestanas ? "tabpanel" : undefined}
              aria-labelledby={conPestanas ? `pestana-${c.id}` : `col-${c.id}`}
              className={cn("min-w-0", vista !== c.id && "max-md:hidden")}
            >
              <h2 id={`col-${c.id}`} className="mb-3 flex items-center gap-2 max-md:sr-only">
                <span className="font-heading text-plato font-bold">{c.nombre}</span>
                <Conteo n={columnas[c.id].length} activo destacado={c.id === "nuevo"} pulso={c.id === "nuevo" ? ultimoNuevo : null} />
              </h2>
              {!montado ? (
                <div className="h-40 rounded-xl border border-dashed border-crema/20" />
              ) : columnas[c.id].length === 0 ? (
                <p className="rounded-xl border border-dashed border-crema/25 px-4 py-8 text-center text-cuerpo text-pretty text-crema/70">
                  {c.vacio}
                </p>
              ) : (
                <ul className="flex flex-col gap-5">
                  <AnimatePresence initial={false}>
                    {columnas[c.id].map((p) => (
                      <Ticket key={p.id} pedido={p} ahora={ahora} accion={c.accion} onAvanzar={() => avanzar(p)} />
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </section>
          ))}
        </main>

        <AnimatePresence>
          {cambio && (
            <motion.div
              key={cambio.id}
              data-superficie="clara"
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 8, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 mx-auto flex max-w-md flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-dashed border-tostado/30 bg-crema py-2 pr-2 pl-4 text-tostado shadow-[0_10px_24px_-8px_rgb(0_0_0/0.5)]"
            >
              {/* En celular el texto ocupa su propia línea y los botones van debajo. */}
              <p className="min-w-0 flex-1 text-cuerpo leading-snug max-sm:basis-full max-sm:pt-1">
                <span className="font-semibold whitespace-nowrap text-oceano">{cambio.pedido.numero}</span>
                {textoCambio[cambio.a]}
              </p>
              {COLUMNAS.some((c) => c.id === cambio.a && c.id !== vista) && (
                <button
                  type="button"
                  onClick={() => setVista(cambio.a as ColumnaCocina)}
                  className="flex h-11 shrink-0 items-center rounded-lg px-2 text-cuerpo font-semibold text-oceano hover:bg-oceano/8 md:hidden"
                >
                  Ver en {COLUMNAS.find((c) => c.id === cambio.a)?.nombre}
                </button>
              )}
              <button
                type="button"
                onClick={deshacer}
                data-deshacer
                className="flex h-11 shrink-0 items-center gap-1.5 rounded-lg px-3 text-cuerpo font-semibold text-oceano underline decoration-oceano/40 underline-offset-4 hover:bg-oceano/8"
              >
                <Undo2 className="size-4" aria-hidden="true" />
                Deshacer
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        <p aria-live="polite" className="sr-only">
          {cambio
            ? `${cambio.pedido.numero}${textoCambio[cambio.a]}.`
            : ""}
        </p>
      </div>
    </MotionConfig>
  );
}

/** Contador de columna; con `pulso`, late cada vez que cambia el pedido más reciente. */
function Conteo({
  n,
  activo,
  destacado,
  pulso,
}: {
  n: number;
  activo: boolean;
  destacado?: boolean;
  pulso?: string | null;
}) {
  return (
    <motion.span
      key={pulso ?? "fijo"}
      initial={pulso ? { scale: 1.6 } : false}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 14 }}
      className={cn(
        "grid h-6 min-w-6 place-items-center rounded-full px-1.5 text-xs font-bold tabular-nums",
        destacado && n > 0 ? "bg-dorado text-tostado" : activo ? "bg-crema/20 text-crema" : "bg-crema/10 text-crema/75",
      )}
    >
      {n}
    </motion.span>
  );
}

function Ticket({
  pedido,
  ahora,
  accion,
  onAvanzar,
}: {
  pedido: Pedido;
  ahora: number;
  accion: string;
  onAvanzar: () => void;
}) {
  const reducir = useReducedMotion();
  const minutos = minutosEspera(pedido.creadoEn, ahora);
  const demorado = pedido.estado !== "listo" && minutos >= MINUTOS_DEMORA;
  const urgente = demorado && minutos >= MINUTOS_URGENTE;
  // En «Listos» lo que importa es cuánto lleva esperando salir: se enfría.
  const esListo = pedido.estado === "listo";
  const minutosSalida = esListo ? minutosListo(pedido, ahora) : 0;
  const enfriando = esListo && minutosSalida >= MINUTOS_ENFRIA;
  const platos = pedido.lineas.reduce((s, l) => s + l.cantidad, 0);

  return (
    <motion.li
      layout={reducir ? false : "position"}
      initial={reducir ? { opacity: 0 } : { opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="drop-shadow-[0_10px_16px_rgb(0_0_0/0.3)]"
    >
      <article
        data-superficie="clara"
        aria-label={`Pedido ${pedido.numero}, ${nombreDestino(pedido)}, ${platos} ${platos === 1 ? "plato" : "platos"}`}
        className={cn(
          papel,
          "rounded-b-[12px] px-4 pt-5 pb-4",
          urgente && "bg-[color-mix(in_oklab,var(--aji)_16%,var(--crema))]",
        )}
      >
        {/* Franja de demora: se lee a metros de distancia, antes que cualquier texto. */}
        {demorado && <div aria-hidden="true" className="-mx-4 -mt-5 mb-4 h-3 bg-aji-texto" />}
        {/* En cocina se trabaja por mesa: el destino es el título; el número, la referencia. */}
        <header className="border-b-2 border-tostado pb-3">
          {/* El destino nunca se parte; si no cabe junto al número, el número baja de línea. */}
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1.5">
            <p className="font-heading text-titular leading-none font-bold whitespace-nowrap text-oceano">{nombreDestino(pedido)}</p>
            <span className="shrink-0 rounded-[5px] border-[1.5px] border-tostado/40 px-1.5 text-sm font-semibold whitespace-nowrap tabular-nums text-tostado/80">
              {pedido.numero}
            </span>
          </div>
          {esListo ? (
            <p
              className={cn(
                "mt-2 inline-flex items-center gap-1.5 font-heading text-linea font-bold tabular-nums",
                enfriando ? "rounded-md bg-oceano px-2 py-0.5 whitespace-nowrap text-crema" : "text-cilantro-texto",
              )}
            >
              {enfriando && <Thermometer className="size-[18px]" aria-hidden="true" />}
              {enfriando ? `Se enfría · ${textoEspera(minutosSalida)}` : textoListo(minutosSalida)}
            </p>
          ) : (
            <p
              className={cn(
                "mt-2 inline-flex items-center gap-1.5 font-heading text-linea font-bold tabular-nums",
                demorado ? "rounded-md bg-aji-texto px-2 py-0.5 text-white" : "text-tostado/75",
              )}
            >
              {demorado && <Flame className="size-[18px]" aria-hidden="true" />}
              {textoEspera(minutos)}
              {demorado && <span className="sr-only">{urgente ? " (muy demorado)" : " (demorado)"}</span>}
            </p>
          )}
        </header>

        <ul className="divide-y divide-dashed divide-tostado/25">
          {pedido.lineas.map((l) => (
            <li key={l.lineaId} className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-2.5 py-2.5 md:py-2 lg:py-2.5">
              <span className="font-heading text-linea font-bold tabular-nums text-oceano">
                {l.cantidad}
                <span aria-hidden="true"> ×</span>
              </span>
              <div className="min-w-0">
                <p className="font-heading text-linea leading-snug font-semibold break-words md:text-base lg:text-linea">{l.nombre}</p>
                {l.detalle && <Detalle texto={l.detalle} sobreTinte={urgente} />}
              </div>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={onAvanzar}
          data-accion={pedido.id}
          className={cn(
            "mt-3 flex h-14 w-full items-center justify-center gap-2 rounded-2xl text-base font-semibold transition-[transform,background-color] duration-150 motion-safe:active:scale-[0.98]",
            pedido.estado === "nuevo" &&
              "bg-aji-texto text-white shadow-[0_6px_18px_-6px_color-mix(in_oklab,var(--aji)_70%,transparent)] hover:bg-[color-mix(in_oklab,var(--aji-texto)_88%,black)]",
            pedido.estado === "preparando" &&
              "bg-cilantro-texto text-white hover:bg-[color-mix(in_oklab,var(--cilantro-texto)_88%,black)]",
            pedido.estado === "listo" && "border-2 border-oceano text-oceano hover:bg-oceano/8",
          )}
        >
          {pedido.estado !== "nuevo" && <Check className="size-5" aria-hidden="true" />}
          {accion}
          <span className="sr-only"> {pedido.numero}</span>
        </button>
      </article>
    </motion.li>
  );
}

/**
 * Detalle de la línea: lo que cambia la preparación («sin cebolla», «ají aparte»)
 * va destacado; el resto (tamaño, sabor) queda en tono normal.
 */
function Detalle({ texto, sobreTinte }: { texto: string; sobreTinte?: boolean }) {
  const partes = texto.split(" · ");
  return (
    <p className="mt-0.5 text-sm leading-snug break-words text-tostado/80">
      {partes.map((parte, i) => {
        const especial = /^sin |aparte$/i.test(parte);
        return (
          <span key={i}>
            {i > 0 && " · "}
            <span
              className={cn(
                especial && "font-semibold text-aji-texto",
                // Sobre el tinte de urgencia el ají no llega a 4,5:1: se oscurece hacia tostado (~5:1).
                especial && sobreTinte && "text-[color-mix(in_oklab,var(--aji-texto)_80%,var(--tostado))]",
              )}
            >
              {parte}
            </span>
          </span>
        );
      })}
    </p>
  );
}
