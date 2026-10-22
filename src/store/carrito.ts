import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { LineaCarrito } from "@/types/menu";

// La comanda del comensal. skipHydration: se rehidrata al montar (ver
// src/store/hidratar.ts) para que el primer render coincida con el del servidor.
type CarritoState = {
  lineas: LineaCarrito[];
  agregar: (linea: Omit<LineaCarrito, "lineaId">) => void;
  cambiarCantidad: (lineaId: string, cantidad: number) => void;
  /** Quita la línea y devuelve lo necesario para deshacerlo. */
  quitar: (lineaId: string) => { linea: LineaCarrito; indice: number } | null;
  restaurar: (linea: LineaCarrito, indice: number) => void;
  vaciar: () => void;
};

const mismaSeleccion = (a: LineaCarrito["seleccion"], b: LineaCarrito["seleccion"]) =>
  JSON.stringify(Object.entries(a).sort()) === JSON.stringify(Object.entries(b).sort());

export const useCarrito = create<CarritoState>()(
  persist(
    (set, get) => ({
      lineas: [],
      agregar: (linea) =>
        set((s) => {
          // El mismo plato con las mismas opciones suma cantidad en vez de otra línea.
          const igual = s.lineas.find(
            (l) => l.platoId === linea.platoId && mismaSeleccion(l.seleccion, linea.seleccion),
          );
          if (igual) {
            return {
              lineas: s.lineas.map((l) =>
                l === igual ? { ...l, cantidad: l.cantidad + linea.cantidad } : l,
              ),
            };
          }
          const lineaId = crypto.randomUUID();
          return { lineas: [...s.lineas, { ...linea, lineaId }] };
        }),
      cambiarCantidad: (lineaId, cantidad) =>
        set((s) => ({
          lineas:
            cantidad <= 0
              ? s.lineas.filter((l) => l.lineaId !== lineaId)
              : s.lineas.map((l) => (l.lineaId === lineaId ? { ...l, cantidad } : l)),
        })),
      quitar: (lineaId) => {
        const indice = get().lineas.findIndex((l) => l.lineaId === lineaId);
        if (indice < 0) return null;
        const linea = get().lineas[indice];
        set((s) => ({ lineas: s.lineas.filter((l) => l.lineaId !== lineaId) }));
        return { linea, indice };
      },
      restaurar: (linea, indice) =>
        set((s) =>
          s.lineas.some((l) => l.lineaId === linea.lineaId)
            ? s
            : { lineas: [...s.lineas.slice(0, indice), linea, ...s.lineas.slice(indice)] },
        ),
      vaciar: () => set({ lineas: [] }),
    }),
    { name: "carrito", skipHydration: true },
  ),
);

export const totalCarrito = (lineas: LineaCarrito[]) =>
  lineas.reduce((acc, l) => acc + l.precioUnitario * l.cantidad, 0);

export const platosEnCarrito = (lineas: LineaCarrito[]) =>
  lineas.reduce((acc, l) => acc + l.cantidad, 0);
