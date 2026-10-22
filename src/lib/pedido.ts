import type { Plato } from "@/types/menu";

export type Seleccion = Record<string, string[]>;

/** Primera opción en los grupos obligatorios de elección única; nada en los demás. */
export function seleccionInicial(plato: Plato): Seleccion {
  return Object.fromEntries(
    plato.grupos.map((g) => [
      g.id,
      g.tipo === "unica" && g.obligatorio ? [g.opciones[0].id] : [],
    ]),
  );
}

export function precioUnitario(plato: Plato, seleccion: Seleccion): number {
  return plato.grupos.reduce((total, g) => {
    const elegidas = seleccion[g.id] ?? [];
    return total + g.opciones.filter((o) => elegidas.includes(o.id)).reduce((s, o) => s + o.precio, 0);
  }, plato.precio);
}

/** true si alguna opción cambia el precio: la carta muestra «desde». */
export function tienePrecioVariable(plato: Plato): boolean {
  return plato.grupos.some((g) => g.opciones.some((o) => o.precio > 0));
}

/** «Mediano · sin cebolla · limón aparte»: lo que cocina necesita leer. */
export function detalleSeleccion(plato: Plato, seleccion: Seleccion): string {
  return plato.grupos
    .flatMap((g) =>
      g.opciones.filter((o) => (seleccion[g.id] ?? []).includes(o.id)).map((o) => o.nombre),
    )
    .map((nombre, i) => (i === 0 ? nombre : nombre.toLowerCase()))
    .join(" · ");
}

export function faltaObligatorio(plato: Plato, seleccion: Seleccion): boolean {
  return plato.grupos.some((g) => g.obligatorio && (seleccion[g.id] ?? []).length === 0);
}
