/** Rango aceptado para un precio en la demo (USD). */
export const PRECIO_MINIMO = 0.25;
export const PRECIO_MAXIMO = 99;

export type ResultadoPrecio = { ok: true; valor: number } | { ok: false; error: string };

/**
 * Lee un precio escrito a mano: acepta «3,50», «3.50», «$3,5» o «4».
 * Redondea a centavos y rechaza vacíos, letras y montos fuera de rango.
 */
export function leerPrecio(texto: string): ResultadoPrecio {
  const limpio = texto.trim().replace(/^\$\s*/, "").replace(",", ".");
  if (limpio === "") return { ok: false, error: "Escribe un precio, por ejemplo 3,50." };
  if (!/^\d+(\.\d{1,2})?$/.test(limpio)) return { ok: false, error: "Usa solo números, por ejemplo 3,50." };
  const valor = Math.round(Number(limpio) * 100) / 100;
  if (valor < PRECIO_MINIMO) return { ok: false, error: `El precio mínimo es $${PRECIO_MINIMO.toFixed(2).replace(".", ",")}.` };
  if (valor > PRECIO_MAXIMO) return { ok: false, error: `El precio máximo es $${PRECIO_MAXIMO},00.` };
  return { ok: true, valor };
}

/**
 * Un cambio de este tamaño suele ser un error de dedo (47,50 por 4,75):
 * se pide confirmación. Devuelve el aviso a mostrar, o null si es normal.
 */
export function avisoCambioGrande(anterior: number, nuevo: number): string | null {
  if (anterior <= 0 || nuevo === anterior) return null;
  const veces = nuevo / anterior;
  if (veces >= 3) return `Es ${Math.round(veces)} veces el precio anterior.`;
  if (veces <= 1 / 3) return "Es menos de un tercio del precio anterior.";
  return null;
}

/** 3.5 → «3,50» para mostrar en el campo de edición. */
export const precioEditable = (valor: number) => valor.toFixed(2).replace(".", ",");
