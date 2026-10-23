import { brand } from "@/config/brand";
import type { EstadoPedido, Pedido } from "@/types/menu";

export const nombresEstadoPedido: Record<EstadoPedido, string> = {
  nuevo: "Recibido",
  preparando: "Preparando",
  listo: "Listo",
  entregado: "Entregado",
};

const terminado = (p: Pedido) => p.estado === "listo" || p.estado === "entregado";

/** Mantiene pendientes y los tres últimos terminados (listos o entregados) en cada mesa. */
export function pedidosParaMesa(pedidos: Pedido[], mesa: string | null): Pedido[] {
  const deEstaMesa = pedidos.filter((p) => mesa ? p.modalidad === "mesa" && p.mesa === mesa : p.modalidad !== "mesa");
  const recientes = [...deEstaMesa].sort((a, b) => b.creadoEn - a.creadoEn);
  const terminados = new Set(recientes.filter(terminado).slice(0, 3).map((p) => p.id));
  return recientes.filter((p) => !terminado(p) || terminados.has(p.id));
}

const dia = new Intl.DateTimeFormat(brand.locale, {
  timeZone: brand.zonaHoraria, year: "numeric", month: "2-digit", day: "2-digit",
});
const hora = new Intl.DateTimeFormat(brand.locale, {
  timeZone: brand.zonaHoraria, hour: "2-digit", minute: "2-digit", hourCycle: "h23",
});
const fecha = new Intl.DateTimeFormat(brand.locale, {
  timeZone: brand.zonaHoraria, day: "numeric", month: "short", year: "numeric",
});

/** Los comprobantes antiguos incluyen fecha; «hoy» se calcula en la zona del local. */
export function fechaPedido(creadoEn: number, ahora = Date.now()): string {
  const textoHora = hora.format(creadoEn);
  return dia.format(creadoEn) === dia.format(ahora)
    ? textoHora
    : `${fecha.format(creadoEn)} · ${textoHora}`;
}

export function indicacionPedidoListo(pedido: Pick<Pedido, "modalidad" | "mesa">): string {
  if (pedido.modalidad === "mesa") {
    return pedido.mesa ? `Te lo llevamos a la mesa ${pedido.mesa}.` : "Te lo llevamos a tu mesa.";
  }
  return pedido.modalidad === "llevar"
    ? "Acércate al personal para recoger tu pedido para llevar."
    : "Acércate al personal para retirar tu pedido.";
}

/** Confirmación final según cómo recibe el comensal su pedido. */
export function indicacionPedidoEntregado(pedido: Pick<Pedido, "modalidad">): string {
  if (pedido.modalidad === "mesa") return "Tu pedido ya está en la mesa. Gracias por elegirnos.";
  if (pedido.modalidad === "llevar") return "Ya te entregamos tu pedido para llevar. Gracias por elegirnos.";
  return "Ya retiraste tu pedido. Gracias por elegirnos.";
}
