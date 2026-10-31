import { createCn } from "cn/config";

// La escala tipográfica propia (globals.css) se registra para que cn() sepa
// que text-cuerpo, text-plato… son tamaños y no los descarte frente a un color.
export const cn = createCn({
  extend: { theme: { text: ["portada", "display", "titular", "titulo", "plato", "linea", "cuerpo", "nota"] } },
});
