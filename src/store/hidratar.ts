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
    // Un cambio hecho en /admin desde otra pestaña se refleja aquí al instante.
    const alCambiar = (e: StorageEvent) => {
      if (e.key === useMenu.persist.getOptions().name) void useMenu.persist.rehydrate();
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
