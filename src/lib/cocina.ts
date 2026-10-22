import type { EstadoPedido, Pedido } from "@/types/menu";

/** Cuántos listos se muestran: lo reciente para entregar, no el historial del día. */
export const LISTOS_VISIBLES = 8;

/** A partir de estos minutos de espera, la comanda se marca como demorada. */
export const MINUTOS_DEMORA = 10;

export const siguienteEstado: Record<EstadoPedido, EstadoPedido | null> = {
  nuevo: "preparando",
  preparando: "listo",
  listo: null,
};

/**
 * Reparte los pedidos en columnas. Los pendientes salen del más antiguo al más
 * nuevo (se cocina en orden de llegada); los listos, del más reciente.
 */
export function columnasCocina(pedidos: Pedido[]): Record<EstadoPedido, Pedido[]> {
  const porLlegada = [...pedidos].sort((a, b) => a.creadoEn - b.creadoEn);
  return {
    nuevo: porLlegada.filter((p) => p.estado === "nuevo"),
    preparando: porLlegada.filter((p) => p.estado === "preparando"),
    listo: porLlegada
      .filter((p) => p.estado === "listo")
      .reverse()
      .slice(0, LISTOS_VISIBLES),
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
