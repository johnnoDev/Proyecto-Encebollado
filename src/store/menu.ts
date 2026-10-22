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
  restablecer: () => void;
};

const semilla = menuInicial as Menu;

const aplicar = (ajustes: Record<string, Ajuste>) =>
  semilla.platos.map((p) => ({ ...p, ...ajustes[p.id] }));

export const useMenu = create<MenuState>()(
  persist(
    (set) => ({
      ...semilla,
      ajustes: {},
      ajustarPlato: (id, ajuste) =>
        set((s) => {
          const ajustes = { ...s.ajustes, [id]: { ...s.ajustes[id], ...ajuste } };
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
