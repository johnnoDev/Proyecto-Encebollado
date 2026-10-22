import { create } from "zustand";
import { persist } from "zustand/middleware";
import { brand } from "@/config/brand";
import type { EstadoPedido, Pedido } from "@/types/menu";

// No hay backend: los pedidos viven en localStorage. /menu los crea y
// /cocina los lee en el mismo navegador (abrir ambas vistas en pestañas).
type NuevoPedido = Pick<Pedido, "lineas" | "total" | "modalidad" | "mesa" | "nombreCliente">;

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
          pedidos: s.pedidos.map((p) => (p.id === id ? { ...p, estado } : p)),
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
