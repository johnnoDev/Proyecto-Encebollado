import { create } from "zustand";
import { persist } from "zustand/middleware";
import { brand } from "@/config/brand";
import type { EstadoPedido, Pedido } from "@/types/menu";

// No hay backend: los pedidos viven en localStorage. /menu los crea y
// /cocina los lee en el mismo navegador (abrir ambas vistas en pestañas).
type NuevoPedido = Pick<Pedido, "lineas" | "total" | "modalidad" | "mesa" | "nombreCliente">;

/** Aplica un estado: al quedar listo guarda el momento; al volver atrás lo borra. */
export function conEstado(pedido: Pedido, estado: EstadoPedido, ahora: number): Pedido {
  if (estado === "listo") return { ...pedido, estado, listoEn: pedido.estado === "listo" ? pedido.listoEn : ahora };
  if (estado === "entregado") return { ...pedido, estado };
  const resto = { ...pedido, estado };
  delete resto.listoEn;
  return resto;
}

type PedidosState = {
  pedidos: Pedido[];
  contador: number;
  crear: (datos: NuevoPedido) => Pedido;
  cambiarEstado: (id: string, estado: EstadoPedido) => void;
};

export const usePedidos = create<PedidosState>()(
  persist(
    (set, get) => ({
      pedidos: [],
      contador: 0,
      crear: (datos) => {
        const contador = get().contador + 1;
        const pedido: Pedido = {
          ...datos,
          id: crypto.randomUUID(),
          numero: `${brand.prefijoPedido}-${String(contador).padStart(3, "0")}`,
          estado: "nuevo",
          creadoEn: Date.now(),
        };
        set((s) => ({ pedidos: [pedido, ...s.pedidos], contador }));
        return pedido;
      },
      cambiarEstado: (id, estado) =>
        set((s) => ({
          pedidos: s.pedidos.map((p) => (p.id === id ? conEstado(p, estado, Date.now()) : p)),
        })),
    }),
    { name: "pedidos" },
  ),
);

// Sincroniza entre pestañas: cuando /menu crea un pedido, /cocina lo ve al instante.
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === usePedidos.persist.getOptions().name) usePedidos.persist.rehydrate();
  });
}
