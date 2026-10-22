import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { brand } from "@/config/brand";

// Mesa del comensal, leída del QR (?mesa=7). undefined = aún no se leyó la URL;
// null = el enlace no trae mesa.
export const useMesa = create<{ mesa: string | null | undefined; fijar: (m: string | null) => void }>()(
  (set) => ({ mesa: undefined, fijar: (mesa) => set({ mesa }) }),
);

export const MESAS = Array.from({ length: brand.mesas }, (_, i) => String(i + 1));

/** Solo mesas que existen en el local; cualquier otro valor cuenta como «sin mesa». */
export const mesaValida = (valor: string | null) => {
  if (valor === null || !/^\d{1,3}$/.test(valor)) return null;
  const n = Number(valor);
  return n >= 1 && n <= brand.mesas ? String(n) : null;
};

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
