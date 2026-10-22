import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { LineaCarrito } from "@/types/menu";

type CarritoState = {
  lineas: LineaCarrito[];
  agregar: (linea: Omit<LineaCarrito, "lineaId">) => void;
  cambiarCantidad: (lineaId: string, cantidad: number) => void;
  quitar: (lineaId: string) => void;
  vaciar: () => void;
};

export const useCarrito = create<CarritoState>()(
  persist(
    (set) => ({
      lineas: [],
      agregar: (linea) =>
        set((s) => ({
          lineas: [...s.lineas, { ...linea, lineaId: crypto.randomUUID() }],
        })),
      cambiarCantidad: (lineaId, cantidad) =>
        set((s) => ({
          lineas:
            cantidad <= 0
              ? s.lineas.filter((l) => l.lineaId !== lineaId)
              : s.lineas.map((l) => (l.lineaId === lineaId ? { ...l, cantidad } : l)),
        })),
      quitar: (lineaId) =>
        set((s) => ({ lineas: s.lineas.filter((l) => l.lineaId !== lineaId) })),
      vaciar: () => set({ lineas: [] }),
    }),
    { name: "carrito" },
  ),
);

export const totalCarrito = (lineas: LineaCarrito[]) =>
  lineas.reduce((acc, l) => acc + l.precioUnitario * l.cantidad, 0);
