import { create } from "zustand";
import { persist } from "zustand/middleware";
import { brand } from "@/config/brand";
import type { EstadoPedido, LineaCarrito, Pedido } from "@/types/menu";

// No hay backend: los pedidos viven en localStorage. /menu los crea y
// /cocina los lee en el mismo navegador (abrir ambas vistas en pestañas).
type PedidosState = {
  pedidos: Pedido[];
  contador: number;
  crear: (lineas: LineaCarrito[], total: number, nombreCliente?: string) => Pedido;
  cambiarEstado: (id: string, estado: EstadoPedido) => void;
};

export const usePedidos = create<PedidosState>()(
  persist(
    (set, get) => ({
      pedidos: [],
      contador: 0,
      crear: (lineas, total, nombreCliente) => {
        const contador = get().contador + 1;
        const pedido: Pedido = {
          id: crypto.randomUUID(),
          numero: `${brand.prefijoPedido}-${String(contador).padStart(3, "0")}`,
          lineas,
          total,
          estado: "nuevo",
          nombreCliente,
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
