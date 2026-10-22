import { useSyncExternalStore } from "react";
import { create } from "zustand";

// Mesa del comensal, leída del QR (?mesa=7). undefined = aún no se leyó la URL;
// null = el enlace no trae mesa.
export const useMesa = create<{ mesa: string | null | undefined; fijar: (m: string | null) => void }>()(
  (set) => ({ mesa: undefined, fijar: (mesa) => set({ mesa }) }),
);

export const MESAS = Array.from({ length: 12 }, (_, i) => String(i + 1));

export const mesaValida = (valor: string | null) =>
  valor !== null && /^\d{1,3}$/.test(valor) ? String(Number(valor)) : null;

/**
 * Mesa actual, disponible apenas hidrata: si la URL aún no se sincronizó con el
 * store, la lee directo de location. En el servidor es undefined.
 */
export function useMesaActual() {
  return useSyncExternalStore(
    useMesa.subscribe,
    () => {
      const { mesa } = useMesa.getState();
      return mesa !== undefined ? mesa : mesaValida(new URLSearchParams(window.location.search).get("mesa"));
    },
    () => undefined,
  );
}
