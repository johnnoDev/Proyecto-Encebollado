// Única fuente de verdad de la marca. Cambiar aquí el nombre, textos y datos
// del local; los colores viven en `src/app/globals.css` (bloque "Paleta de marca").
export const brand = {
  nombre: "La Albacora",
  eslogan: "Encebollado de la costa, como en casa",
  ciudad: "Guayaquil, Ecuador",
  moneda: "USD",
  locale: "es-EC",
  // Prefijo visible del número de pedido (p. ej. "ALB-042").
  prefijoPedido: "ALB",
} as const;

export type Brand = typeof brand;
