// Única fuente de verdad de la marca: nombre, textos, contacto y colores.
// Los colores se inyectan como variables CSS en src/app/layout.tsx y
// globals.css los expone a Tailwind (bg-oceano, text-aji-texto, etc.).
// Excepción: public/brand/*.svg tiene los colores escritos dentro del archivo.
export const brand = {
  nombre: "La Albacora",
  descriptor: "Encebollado Costeño",
  eslogan: "El encebollado de la costa, recién servido",
  bienvenida: "Bienvenidos a la mesa costeña",
  direccion: "Malecón 123 y calle de la Ría, Guayaquil",
  telefono: "+593 99 000 0000",
  moneda: "USD",
  locale: "es-EC",
  // Prefijo visible del número de pedido (p. ej. "ALB-042").
  prefijoPedido: "ALB",

  colores: {
    oceano: "#0E3B5C", // primario, fondos oscuros, encabezados
    aji: "#E4572E", // acentos y superficies grandes
    dorado: "#F7B731", // detalles y ornamentos; nunca texto sobre crema
    rosa: "#C2417A", // uso mínimo, etiquetas
    cilantro: "#4C8C2B", // disponibilidad (íconos, superficies)
    crema: "#FFF6E3", // fondo principal
    tostado: "#2B1B12", // texto
    // Variantes que cumplen AA (≥4.5:1) sobre crema y con texto blanco.
    ajiTexto: "#C8411A", // botones y texto pequeño naranja
    cilantroTexto: "#447C26", // texto pequeño verde, confirmaciones
  },
} as const;

export type Brand = typeof brand;

/** Variables CSS (--oceano, --aji-texto, …) a partir de brand.colores. */
export const variablesDeColor = Object.fromEntries(
  Object.entries(brand.colores).map(([k, v]) => [
    `--${k.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)}`,
    v,
  ]),
) as React.CSSProperties;
