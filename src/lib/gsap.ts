"use client";

// GSAP solo se usa en la portada (secuencias de cine y scroll). La carta, la
// comanda, cocina y admin siguen con Motion: ningún elemento lo animan ambas.
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger, CustomEase, DrawSVGPlugin);

/** La curva de tinta del sistema, la misma cubic-bezier(0.16, 1, 0.3, 1) de Motion. */
export const TINTA = CustomEase.create("tinta", "0.16,1,0.3,1");

/** Condiciones de gsap.matchMedia(): con movimiento reducido no se registra nada. */
export const CONDICIONES = {
  movimiento: "(prefers-reduced-motion: no-preference)",
  escritorio: "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
  movil: "(max-width: 1023.98px) and (prefers-reduced-motion: no-preference)",
  puntero: "(pointer: fine) and (prefers-reduced-motion: no-preference)",
  /** Platos destacados en fila de tres (md) o en una columna. */
  fila: "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
  columna: "(max-width: 767.98px) and (prefers-reduced-motion: no-preference)",
} as const;

export { gsap, ScrollTrigger, useGSAP };
