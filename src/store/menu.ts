import { create } from "zustand";
import { persist } from "zustand/middleware";
import menuInicial from "@/data/menu.json";
import type { Menu, Plato } from "@/types/menu";

// El menú arranca desde src/data/menu.json; los cambios hechos en /admin
// se guardan en localStorage para que la demo se sienta "real".
type MenuState = Menu & {
  actualizarPlato: (id: string, cambios: Partial<Plato>) => void;
  restablecer: () => void;
};

const semilla = menuInicial as Menu;

export const useMenu = create<MenuState>()(
  persist(
    (set) => ({
      ...semilla,
      actualizarPlato: (id, cambios) =>
        set((s) => ({
          platos: s.platos.map((p) => (p.id === id ? { ...p, ...cambios } : p)),
        })),
      restablecer: () => set({ ...semilla }),
    }),
    { name: "menu" },
  ),
);
