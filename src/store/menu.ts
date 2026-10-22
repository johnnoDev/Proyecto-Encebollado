import { create } from "zustand";
import { persist } from "zustand/middleware";
import menuInicial from "@/data/menu.json";
import type { Menu, Plato } from "@/types/menu";

// El menú sale siempre de src/data/menu.json. Lo único que se guarda en
// localStorage son los ajustes hechos en /admin (precio y disponibilidad),
// que se aplican encima del JSON al cargar.
type Ajuste = Partial<Pick<Plato, "precio" | "disponible">>;

type MenuState = Menu & {
  ajustes: Record<string, Ajuste>;
  ajustarPlato: (id: string, ajuste: Ajuste) => void;
  /** Devuelve un plato a lo que dice menu.json. */
  quitarAjuste: (id: string) => void;
  restablecer: () => void;
};

const semilla = menuInicial as Menu;

/** El plato tal como viene en menu.json, para comparar y restablecer. */
export const platoOriginal = (id: string) => semilla.platos.find((p) => p.id === id);

/** Guarda solo lo que difiere del JSON: un ajuste igual al original se borra. */
export function limpiarAjuste(id: string, ajuste: Ajuste): Ajuste | null {
  const original = platoOriginal(id);
  const limpio: Ajuste = {};
  if (ajuste.precio !== undefined && ajuste.precio !== original?.precio) limpio.precio = ajuste.precio;
  if (ajuste.disponible !== undefined && ajuste.disponible !== original?.disponible) limpio.disponible = ajuste.disponible;
  return Object.keys(limpio).length > 0 ? limpio : null;
}

const aplicar = (ajustes: Record<string, Ajuste>) =>
  semilla.platos.map((p) => ({ ...p, ...ajustes[p.id] }));

export const useMenu = create<MenuState>()(
  persist(
    (set) => ({
      ...semilla,
      ajustes: {},
      ajustarPlato: (id, ajuste) =>
        set((s) => {
          const ajustes = { ...s.ajustes };
          const limpio = limpiarAjuste(id, { ...s.ajustes[id], ...ajuste });
          if (limpio) ajustes[id] = limpio;
          else delete ajustes[id];
          return { ajustes, platos: aplicar(ajustes) };
        }),
      quitarAjuste: (id) =>
        set((s) => {
          const ajustes = { ...s.ajustes };
          delete ajustes[id];
          return { ajustes, platos: aplicar(ajustes) };
        }),
      restablecer: () => set({ ajustes: {}, platos: semilla.platos }),
    }),
    {
      name: "menu-ajustes",
      skipHydration: true,
      partialize: (s) => ({ ajustes: s.ajustes }),
      merge: (guardado, actual) => {
        const ajustes = (guardado as Pick<MenuState, "ajustes"> | undefined)?.ajustes ?? {};
        return { ...actual, ajustes, platos: aplicar(ajustes) };
      },
    },
  ),
);
