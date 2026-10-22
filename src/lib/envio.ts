import type { LineaCarrito, Plato } from "@/types/menu";

/** Comprueba que sigue vigente lo que el comensal revisó antes de sellarlo. */
export function revisarEnvio(esperadas: LineaCarrito[], actuales: LineaCarrito[], platos: Plato[]): string | null {
  if (esperadas.length === 0 || actuales.length === 0 || JSON.stringify(esperadas) !== JSON.stringify(actuales)) {
    return "Tu pedido cambió en otra pestaña. No se envió; revísalo antes de volver a enviar.";
  }
  if (esperadas.some((linea) => !platos.find((p) => p.id === linea.platoId)?.disponible)) {
    return "Un plato se agotó. No se envió el pedido; quítalo y vuelve a revisar.";
  }
  return null;
}
