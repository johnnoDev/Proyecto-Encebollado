import type { EstadoPedido, Pedido } from "@/types/menu";

/** A partir de estos minutos de espera, la comanda se marca como demorada. */
export const MINUTOS_DEMORA = 10;

/** Segundo umbral: la comanda entera se tiñe para que no se pierda de vista. */
export const MINUTOS_URGENTE = 15;

/** Un listo que espera más que esto se está enfriando: hay que llevarlo ya. */
export const MINUTOS_ENFRIA = 5;

/** Minutos que lleva un pedido listo esperando salir (desde que quedó listo). */
export function minutosListo(pedido: Pick<Pedido, "listoEn" | "creadoEn">, ahora: number): number {
  return minutosEspera(pedido.listoEn ?? pedido.creadoEn, ahora);
}

export function textoListo(minutos: number): string {
  return minutos < 1 ? "Recién listo" : `Listo hace ${textoEspera(minutos)}`;
}

/** Las columnas del panel; los entregados ya no se muestran en cocina. */
export type ColumnaCocina = Exclude<EstadoPedido, "entregado">;

export const siguienteEstado: Record<EstadoPedido, EstadoPedido | null> = {
  nuevo: "preparando",
  preparando: "listo",
  listo: "entregado",
  entregado: null,
};

/**
 * Reparte los pedidos en columnas. Los pendientes salen del más antiguo al más
 * nuevo (se cocina en orden de llegada); los listos, del más reciente.
 */
export function columnasCocina(pedidos: Pedido[]): Record<ColumnaCocina, Pedido[]> {
  // Los pedidos del día de ejemplo (Indicadores) nunca llegan a cocina.
  const porLlegada = pedidos.filter((p) => !p.ejemplo).sort((a, b) => a.creadoEn - b.creadoEn);
  return {
    nuevo: porLlegada.filter((p) => p.estado === "nuevo"),
    preparando: porLlegada.filter((p) => p.estado === "preparando"),
    listo: porLlegada
      .filter((p) => p.estado === "listo")
      .reverse(),
  };
}

export function minutosEspera(creadoEn: number, ahora: number): number {
  return Math.max(0, Math.floor((ahora - creadoEn) / 60000));
}

export function textoEspera(minutos: number): string {
  if (minutos < 1) return "Recién llegado";
  if (minutos < 60) return `${minutos} min`;
  const h = Math.floor(minutos / 60);
  return `${h} h ${minutos % 60} min`;
}

export function nombreDestino(pedido: Pick<Pedido, "modalidad" | "mesa">): string {
  if (pedido.modalidad === "mesa") return pedido.mesa ? `Mesa ${pedido.mesa}` : "En mesa";
  return pedido.modalidad === "llevar" ? "Para llevar" : "Retiro";
}
