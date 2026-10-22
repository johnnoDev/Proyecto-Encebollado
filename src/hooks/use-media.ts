"use client";

import { useSyncExternalStore } from "react";

/** Coincidencia de una media query; false en el servidor. */
export function useMedia(query: string) {
  return useSyncExternalStore(
    (avisar) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", avisar);
      return () => mql.removeEventListener("change", avisar);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}
