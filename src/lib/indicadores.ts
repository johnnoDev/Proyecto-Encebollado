import { brand } from "@/config/brand";
import { MINUTOS_DEMORA } from "@/lib/cocina";
import type { Modalidad, Pedido, Plato } from "@/types/menu";

// Indicadores del panel de administración. Funciones puras: reciben los pedidos,
// los platos y «ahora», y nunca devuelven NaN; sin datos, devuelven 0 o listas vacías.

const dia = new Intl.DateTimeFormat(brand.locale, {
  timeZone: brand.zonaHoraria, year: "numeric", month: "2-digit", day: "2-digit",
});

/** «Hoy» se calcula en la zona del local, igual que en el seguimiento del pedido. */
export function esDeHoy(instante: number, ahora: number): boolean {
  return dia.format(instante) === dia.format(ahora);
}

export function pedidosDeHoy(pedidos: Pedido[], ahora: number): Pedido[] {
  return pedidos.filter((p) => esDeHoy(p.creadoEn, ahora));
}

const centavos = (valor: number) => Math.round(valor * 100) / 100;
const MS_DEMORA = MINUTOS_DEMORA * 60_000;

/** Total vendido hoy en dólares, redondeado a centavos. */
export function vendidoHoy(pedidos: Pedido[], ahora: number): number {
  return centavos(pedidosDeHoy(pedidos, ahora).reduce((suma, p) => suma + p.total, 0));
}

/** Ticket promedio de hoy; 0 si aún no hay pedidos. */
export function ticketPromedio(pedidos: Pedido[], ahora: number): number {
  const hoy = pedidosDeHoy(pedidos, ahora);
  return hoy.length === 0 ? 0 : centavos(vendidoHoy(hoy, ahora) / hoy.length);
}

/**
 * Minutos promedio desde que llega un pedido hasta que queda listo, con un
 * decimal. Solo cuentan los que tienen listoEn: un pedido que volvió atrás lo
 * pierde y deja de contar. 0 si ninguno quedó listo hoy.
 */
export function tiempoPromedioListo(pedidos: Pedido[], ahora: number): number {
  const medidos = pedidosDeHoy(pedidos, ahora).filter((p) => p.listoEn !== undefined);
  if (medidos.length === 0) return 0;
  const minutos = medidos.reduce((suma, p) => suma + ((p.listoEn as number) - p.creadoEn) / 60_000, 0);
  return Math.round((minutos / medidos.length) * 10) / 10;
}

const pendiente = (p: Pedido) => p.estado === "nuevo" || p.estado === "preparando";

/**
 * Un pedido está demorado si tardó MINUTOS_DEMORA o más en quedar listo, o si
 * sigue pendiente y ya superó ese tiempo. Un pedido que volvió atrás (sin
 * listoEn) cuenta como pendiente.
 */
export function esDemorado(pedido: Pedido, ahora: number): boolean {
  if (pedido.listoEn !== undefined) return pedido.listoEn - pedido.creadoEn >= MS_DEMORA;
  return pendiente(pedido) && ahora - pedido.creadoEn >= MS_DEMORA;
}

/** Cantidad de pedidos demorados hoy y su porcentaje entero sobre los pedidos de hoy. */
export function demorados(pedidos: Pedido[], ahora: number): { cantidad: number; porcentaje: number } {
  const hoy = pedidosDeHoy(pedidos, ahora);
  const cantidad = hoy.filter((p) => esDemorado(p, ahora)).length;
  return { cantidad, porcentaje: hoy.length === 0 ? 0 : Math.round((cantidad / hoy.length) * 100) };
}

/** Pedidos de hoy por modalidad; las tres siempre presentes, en 0 si no hay. */
export function porModalidad(pedidos: Pedido[], ahora: number): Record<Modalidad["id"], number> {
  const conteo: Record<Modalidad["id"], number> = { mesa: 0, llevar: 0, retiro: 0 };
  for (const p of pedidosDeHoy(pedidos, ahora)) conteo[p.modalidad] += 1;
  return conteo;
}

export type PlatoVendido = { platoId: string; nombre: string; cantidad: number };

/** Los platos más vendidos hoy por cantidad (empates por nombre), hasta `limite`. */
export function masVendidos(pedidos: Pedido[], ahora: number, limite = 5): PlatoVendido[] {
  const porPlato = new Map<string, PlatoVendido>();
  for (const p of pedidosDeHoy(pedidos, ahora)) {
    for (const l of p.lineas) {
      const actual = porPlato.get(l.platoId) ?? { platoId: l.platoId, nombre: l.nombre, cantidad: 0 };
      actual.cantidad += l.cantidad;
      porPlato.set(l.platoId, actual);
    }
  }
  return Array.from(porPlato.values())
    .sort((a, b) => b.cantidad - a.cantidad || a.nombre.localeCompare(b.nombre, brand.locale))
    .slice(0, limite);
}

/** Platos marcados como agotados en /admin. */
export function agotados(platos: Plato[]): Pick<Plato, "id" | "nombre">[] {
  return platos.filter((p) => !p.disponible).map(({ id, nombre }) => ({ id, nombre }));
}

/** Pedidos de hoy que siguen en cocina (nuevos o en preparación). */
export function enCocina(pedidos: Pedido[], ahora: number): number {
  return pedidosDeHoy(pedidos, ahora).filter(pendiente).length;
}

export type Indicadores = {
  pedidos: number;
  enCocina: number;
  vendido: number;
  ticket: number;
  minutosListo: number;
  demorados: { cantidad: number; porcentaje: number };
  modalidades: Record<Modalidad["id"], number>;
  masVendidos: PlatoVendido[];
  agotados: Pick<Plato, "id" | "nombre">[];
};

/** Todos los indicadores del día de una sola vez, para el panel. */
export function calcularIndicadores(pedidos: Pedido[], platos: Plato[], ahora: number): Indicadores {
  const hoy = pedidosDeHoy(pedidos, ahora);
  return {
    pedidos: hoy.length,
    enCocina: enCocina(hoy, ahora),
    vendido: vendidoHoy(hoy, ahora),
    ticket: ticketPromedio(hoy, ahora),
    minutosListo: tiempoPromedioListo(hoy, ahora),
    demorados: demorados(hoy, ahora),
    modalidades: porModalidad(hoy, ahora),
    masVendidos: masVendidos(hoy, ahora),
    agotados: agotados(platos),
  };
}
