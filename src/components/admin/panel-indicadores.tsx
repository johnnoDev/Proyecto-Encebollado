"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { ArrowRight, CircleAlert, CircleCheck, FlaskConical, Trash2 } from "lucide-react";
import { CifraRodante } from "@/components/menu/cifra-rodante";
import { brand } from "@/config/brand";
import { MINUTOS_DEMORA } from "@/lib/cocina";
import { generarDiaDeEjemplo } from "@/lib/ejemplo";
import { precio } from "@/lib/formato";
import { calcularIndicadores, pedidosDeHoy } from "@/lib/indicadores";
import { cn } from "@/lib/utils";
import { useMenu } from "@/store/menu";
import { usePedidos } from "@/store/pedidos";
import type { Modalidad } from "@/types/menu";

const papel =
  "bg-crema text-tostado [mask:radial-gradient(circle_at_9px_0,transparent_6px,#000_6.5px)_0_0/18px_100%_repeat-x]";

// Reloj compartido de 30 s: las demoras de los pedidos pendientes avanzan solas.
let ahoraCompartido = 0;
function suscribirReloj(avisar: () => void) {
  ahoraCompartido = Date.now();
  const t = setInterval(() => {
    ahoraCompartido = Date.now();
    avisar();
  }, 30_000);
  return () => clearInterval(t);
}
const useAhora = () => useSyncExternalStore(suscribirReloj, () => ahoraCompartido, () => 0);

const fechaHoy = new Intl.DateTimeFormat(brand.locale, {
  timeZone: brand.zonaHoraria, weekday: "long", day: "numeric", month: "long",
});
const horaCorte = new Intl.DateTimeFormat(brand.locale, {
  timeZone: brand.zonaHoraria, hour: "2-digit", minute: "2-digit", hourCycle: "h23",
});
const minutos = new Intl.NumberFormat(brand.locale, { maximumFractionDigits: 1 });

const nombresModalidad: Record<Modalidad["id"], string> = { mesa: "En mesa", llevar: "Para llevar", retiro: "Retiro" };

type Sello = { bien: boolean; texto: string };

/**
 * Un renglón del cierre: etiqueta, cifra en tinta y su contexto. El sello
 * opcional dice si la cifra está dentro de la meta, con ícono y texto (nunca
 * solo color).
 */
function Cifra({
  etiqueta,
  valor,
  numero,
  detalle,
  sello,
}: {
  etiqueta: string;
  valor: string;
  numero: number;
  detalle: string;
  sello?: Sello;
}) {
  return (
    <div className="px-4 py-4 sm:px-5">
      <dt className="text-sm text-tostado/75">{etiqueta}</dt>
      <dd className="mt-1">
        <CifraRodante
          valor={valor}
          numero={numero}
          className="font-heading text-titular leading-none font-bold text-oceano tabular-nums sm:text-display"
        />
        {sello && (
          <span
            className={cn(
              "mt-2 flex items-center gap-1 text-nota leading-snug font-semibold",
              sello.bien ? "text-cilantro-texto" : "text-aji-texto",
            )}
          >
            {sello.bien ? (
              <CircleCheck className="size-4 shrink-0" aria-hidden="true" />
            ) : (
              <CircleAlert className="size-4 shrink-0" aria-hidden="true" />
            )}
            {sello.texto}
          </span>
        )}
        <span className="mt-1.5 block text-nota leading-snug text-pretty text-tostado/70">{detalle}</span>
      </dd>
    </div>
  );
}

/**
 * Barra horizontal de una sola serie: crece desde la izquierda, extremo
 * redondeado. Con `pista`, el fondo marca el 100 %: es una parte del total,
 * no una comparación contra el primero.
 */
function Barra({ fraccion, pista }: { fraccion: number; pista?: boolean }) {
  return (
    <span aria-hidden="true" className={cn("block h-2 flex-1 overflow-hidden", pista && "rounded-r-[4px] bg-crema/12")}>
      <span
        className="block h-full rounded-r-[4px] bg-dorado transition-[width] duration-500 ease-out motion-reduce:transition-none"
        style={{ width: `${Math.max(fraccion > 0 ? 3 : 0, Math.round(fraccion * 100))}%` }}
      />
    </span>
  );
}

/**
 * Indicadores del día para el dueño: cuánto se vendió, qué tan rápido sale la
 * cocina y qué se vende. Lee los pedidos del mismo navegador y se actualiza solo
 * cuando la cocina cambia un pedido en otra pestaña. Si hay un día de ejemplo
 * cargado, muestra solo esos datos (con aviso); nunca los suma a los reales.
 */
export function PanelIndicadores({ onRevisarAgotados }: { onRevisarAgotados: () => void }) {
  const ahora = useAhora();
  const pedidos = usePedidos((s) => s.pedidos);
  const platos = useMenu((s) => s.platos);
  const cargarEjemplo = usePedidos((s) => s.cargarEjemplo);
  const borrarEjemplo = usePedidos((s) => s.borrarEjemplo);

  const hayEjemplo = pedidos.some((p) => p.ejemplo);
  const fuente = pedidos.filter((p) => Boolean(p.ejemplo) === hayEjemplo);
  // Con el ejemplo a la vista, los pedidos reales de hoy no se cuentan: el aviso dice cuántos hay.
  const realesOcultos = hayEjemplo && ahora > 0 ? pedidosDeHoy(pedidos.filter((p) => !p.ejemplo), ahora).length : 0;

  if (ahora === 0) {
    return <div aria-hidden="true" className="mt-6 h-72 rounded-b-[14px] bg-crema/10" />;
  }

  const ind = calcularIndicadores(fuente, platos, ahora);
  const maxVendido = ind.masVendidos[0]?.cantidad ?? 0;
  const sinPedidos = ind.pedidos === 0;

  return (
    <div className="pb-6">
      {hayEjemplo && (
        <div
          data-superficie="dorada"
          className="mt-6 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-lg bg-dorado px-4 py-3 text-tostado"
        >
          <div className="min-w-0">
            <p className="flex items-center gap-2 font-semibold">
              <FlaskConical className="size-5 shrink-0" aria-hidden="true" />
              Datos de ejemplo, no corresponden a un servicio real
            </p>
            {/* Se anuncia al cambiar: si llega un pedido real durante la demo, se oye y se ve. */}
            <p aria-live="polite" className="mt-0.5 pl-7 text-sm">
              {realesOcultos > 0 &&
                (realesOcultos === 1
                  ? "Hay 1 pedido real de hoy oculto. Borra el ejemplo para verlo."
                  : `Hay ${realesOcultos} pedidos reales de hoy ocultos. Borra el ejemplo para verlos.`)}
            </p>
          </div>
          <button
            type="button"
            onClick={borrarEjemplo}
            className="flex h-11 items-center gap-1.5 rounded-full px-3 text-sm font-semibold underline decoration-tostado/40 underline-offset-4 hover:bg-tostado/10"
          >
            <Trash2 className="size-4" aria-hidden="true" />
            Borrar datos de ejemplo
          </button>
        </div>
      )}

      <section aria-labelledby="titulo-cierre" className="mt-6 drop-shadow-[0_10px_16px_rgb(0_0_0/0.3)]">
        <div data-superficie="clara" className={cn(papel, "rounded-b-[14px] pt-5")}>
          <header className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b-2 border-tostado px-4 pb-3 sm:px-5">
            <h2 id="titulo-cierre" className="font-heading text-titular leading-none font-bold text-oceano">
              Hoy
            </h2>
            {/* El día sigue abierto: las cifras son hasta la hora del reloj del panel. */}
            <p className="text-sm text-tostado/75 first-letter:uppercase">
              {fechaHoy.format(ahora)} · hasta las {horaCorte.format(ahora)}
            </p>
          </header>
          <dl className="grid grid-cols-2 divide-tostado/25 md:grid-cols-4 [&>div]:border-dashed [&>div]:border-tostado/25 [&>div:nth-child(-n+2)]:border-b md:[&>div:nth-child(-n+2)]:border-b-0 [&>div:nth-child(odd)]:border-r md:[&>div:not(:last-child)]:border-r">
            <Cifra
              etiqueta="Vendido hoy"
              valor={sinPedidos ? "—" : precio(ind.vendido)}
              numero={ind.vendido}
              detalle={sinPedidos ? "Sin pedidos todavía" : `Ticket promedio ${precio(ind.ticket)}`}
            />
            <Cifra
              etiqueta="Pedidos"
              valor={String(ind.pedidos)}
              numero={ind.pedidos}
              detalle={
                sinPedidos ? "Aún no llega ninguno" : ind.enCocina === 0 ? "Ninguno en cocina ahora" : ind.enCocina === 1 ? "1 sigue en cocina" : `${ind.enCocina} siguen en cocina`
              }
            />
            <Cifra
              etiqueta="Tiempo hasta listo"
              valor={ind.minutosListo === 0 ? "—" : `${minutos.format(ind.minutosListo)} min`}
              numero={ind.minutosListo}
              detalle={`Meta: menos de ${MINUTOS_DEMORA} min`}
            />
            <Cifra
              etiqueta="Demorados"
              valor={sinPedidos ? "—" : `${ind.demorados.porcentaje} %`}
              numero={ind.demorados.porcentaje}
              detalle={`Tardaron o llevan ${MINUTOS_DEMORA} min o más`}
              // El único veredicto de cocina: cuántos salieron a tiempo. Verde solo si ninguno se demoró.
              sello={
                sinPedidos
                  ? undefined
                  : {
                      bien: ind.demorados.cantidad === 0,
                      texto: `${ind.pedidos - ind.demorados.cantidad} de ${ind.pedidos} a tiempo`,
                    }
              }
            />
          </dl>
        </div>
      </section>

      {sinPedidos && (
        <div className="mt-6 rounded-xl border border-dashed border-crema/25 px-4 py-6 text-center">
          <p className="text-cuerpo text-pretty text-crema/85">
            Todavía no hay pedidos hoy. Cuando la cocina los reciba, las cifras aparecen aquí solas.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/menu?mesa=1"
              target="_blank"
              className="flex h-11 items-center gap-1.5 rounded-full border border-crema/30 px-4 text-sm font-semibold text-crema/90 hover:border-crema/60"
            >
              Hacer un pedido en la carta
              <span className="sr-only"> (se abre en otra pestaña)</span>
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <button
              type="button"
              onClick={() => cargarEjemplo(generarDiaDeEjemplo(platos, Date.now()))}
              className="flex h-11 items-center gap-1.5 rounded-full bg-dorado px-4 text-sm font-semibold text-tostado hover:bg-[color-mix(in_oklab,var(--dorado)_88%,black)]"
            >
              <FlaskConical className="size-4" aria-hidden="true" />
              Cargar día de ejemplo
            </button>
          </div>
        </div>
      )}

      {/* Lo único que pide acción va primero: qué no se puede pedir ahora mismo. */}
      <section
        aria-labelledby="titulo-agotados"
        className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 border-y border-dashed border-crema/20 py-3"
      >
        <h2 id="titulo-agotados" className="font-heading text-linea font-bold">
          Agotados ahora
        </h2>
        {ind.agotados.length === 0 ? (
          <p className="text-cuerpo text-crema/75">Nada: toda la carta se puede pedir.</p>
        ) : (
          <>
            <ul className="flex flex-wrap gap-2">
              {ind.agotados.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center gap-2 rounded-full border border-crema/25 px-3 py-1 text-sm font-semibold"
                >
                  <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-aji-claro" />
                  {p.nombre}
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={onRevisarAgotados}
              className="flex h-11 items-center gap-1.5 text-sm font-semibold text-dorado underline decoration-dorado/50 underline-offset-4 hover:decoration-dorado sm:ml-auto"
            >
              Revisar en la carta
              <ArrowRight className="size-4" aria-hidden="true" />
            </button>
          </>
        )}
      </section>

      <div className="mt-8 grid gap-8 md:grid-cols-2 md:gap-10">
        <section aria-labelledby="titulo-vendidos">
          <h2 id="titulo-vendidos" className="font-heading text-plato font-bold">
            Más vendidos
          </h2>
          <p className="mt-1 text-sm text-crema/75">Platos de hoy, por cantidad.</p>
          {ind.masVendidos.length === 0 ? (
            <p className="mt-4 text-cuerpo text-crema/75">Aún no se ha vendido ningún plato hoy.</p>
          ) : (
            <ol className="mt-4 space-y-3.5">
              {ind.masVendidos.map((p, i) => (
                <li key={p.platoId}>
                  <p className="flex items-baseline gap-2.5">
                    <span className="w-4 text-sm font-semibold text-crema/60 tabular-nums">{i + 1}</span>
                    <span className="min-w-0 flex-1 truncate font-heading text-linea font-semibold">{p.nombre}</span>
                  </p>
                  <p className="mt-1.5 flex items-center gap-3 pl-6.5">
                    <Barra fraccion={maxVendido === 0 ? 0 : p.cantidad / maxVendido} />
                    <span className="w-14 shrink-0 text-right text-sm font-semibold text-crema tabular-nums">
                      {p.cantidad} <span className="font-normal text-crema/70">{p.cantidad === 1 ? "ud." : "uds."}</span>
                    </span>
                  </p>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section aria-labelledby="titulo-modalidades">
          <h2 id="titulo-modalidades" className="font-heading text-plato font-bold">
            Cómo pidieron
          </h2>
          <ul className="mt-4 space-y-3">
            {(Object.keys(nombresModalidad) as Modalidad["id"][]).map((m) => {
              const n = ind.modalidades[m];
              const pct = ind.pedidos === 0 ? 0 : Math.round((n / ind.pedidos) * 100);
              return (
                <li key={m} className="flex items-center gap-3">
                  <span className="w-24 shrink-0 text-cuerpo">{nombresModalidad[m]}</span>
                  <Barra pista fraccion={ind.pedidos === 0 ? 0 : n / ind.pedidos} />
                  <span className="w-20 shrink-0 text-right text-sm font-semibold tabular-nums">
                    {n} <span className="font-normal text-crema/70">· {pct} %</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      {/* Sin pedidos, el estado vacío ya ofrece el día de ejemplo: un solo botón a la vista. */}
      {!sinPedidos && (
        <section
          aria-labelledby="titulo-ejemplo"
          className="mt-10 border-t border-dashed border-crema/20 pt-5 text-sm text-crema/75"
        >
          <h2 id="titulo-ejemplo" className="font-semibold text-crema">
            Para presentaciones
          </h2>
          <p className="mt-1 max-w-prose text-pretty">
            Un día de ejemplo simula unos 40 pedidos de hoy para mostrar el panel. Solo se ve aquí: no llega a la cocina ni a
            los comensales, y no se mezcla con los pedidos reales.
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => cargarEjemplo(generarDiaDeEjemplo(platos, Date.now()))}
              className="flex h-11 items-center gap-1.5 rounded-full border border-crema/30 px-4 font-semibold text-crema/90 hover:border-crema/60"
            >
              <FlaskConical className="size-4" aria-hidden="true" />
              {hayEjemplo ? "Generar otro día de ejemplo" : "Cargar día de ejemplo"}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
