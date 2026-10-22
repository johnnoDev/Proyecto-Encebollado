"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useCarrito } from "./carrito";
import { useMenu } from "./menu";

// Los stores persistidos usan skipHydration: el servidor y el primer render
// del cliente ven los datos semilla, y localStorage se aplica tras montar.
export function useRehidratar() {
  useEffect(() => {
    void useMenu.persist.rehydrate();
    void useCarrito.persist.rehydrate();
    // Cambios hechos en otra pestaña (ajustes de /admin u otra copia de la
    // carta) se reflejan aquí al instante, sin pisarse.
    const alCambiar = (e: StorageEvent) => {
      if (e.key === useMenu.persist.getOptions().name) void useMenu.persist.rehydrate();
      if (e.key === useCarrito.persist.getOptions().name) void useCarrito.persist.rehydrate();
    };
    window.addEventListener("storage", alCambiar);
    return () => window.removeEventListener("storage", alCambiar);
  }, []);
}

const sinSuscripcion = () => () => {};

/** false en el servidor y en la hidratación; true después de montar. */
export function useMontado() {
  return useSyncExternalStore(
    sinSuscripcion,
    () => true,
    () => false,
  );
}
