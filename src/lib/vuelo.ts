"use client";

import { animate } from "motion";

// Al anotar un plato, una copia de su foto vuela desde donde se tocó (la fila
// o la ficha) hasta «Tu pedido», que late al recibirla. Es solo una capa
// visual: no espera a nada ni bloquea el siguiente toque.

const TINTA = [0.16, 1, 0.3, 1] as const;

const visible = (el: Element | null | undefined) => {
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < window.innerHeight ? r : null;
};

function latido(destino: HTMLElement) {
  void animate(destino, { scale: [1, 1.12, 1] }, { duration: 0.35, ease: TINTA });
}

export function volarAComanda(platoId: string) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const destino = [...document.querySelectorAll<HTMLElement>("[data-destino-comanda]")].find((el) => visible(el));
  const d = visible(destino);
  if (!destino || !d) return;
  // La ficha abierta tapa la fila: si está, el vuelo sale de ella.
  const origen = [
    document.querySelector(`[data-foto="ficha"][data-plato="${platoId}"]`),
    document.querySelector(`[data-foto="fila"][data-plato="${platoId}"]`),
  ].find((el) => visible(el));
  const o = visible(origen);
  if (!origen || !o) return latido(destino);

  const copia = origen.cloneNode(true) as HTMLElement;
  copia.removeAttribute("data-foto");
  copia.setAttribute("aria-hidden", "true");
  Object.assign(copia.style, {
    position: "fixed",
    left: `${o.left}px`,
    top: `${o.top}px`,
    width: `${o.width}px`,
    height: `${o.height}px`,
    margin: "0",
    zIndex: "70",
    pointerEvents: "none",
  });
  document.body.appendChild(copia);

  const dx = d.left + d.width / 2 - (o.left + o.width / 2);
  const dy = d.top + d.height / 2 - (o.top + o.height / 2);
  // Un arco corto: sube un poco y cae sobre la comanda.
  const alto = Math.min(90, Math.abs(dy) * 0.35 + 30);
  const vuelo = animate(
    copia,
    {
      x: [0, dx * 0.45, dx],
      y: [0, Math.min(0, dy) * 0.45 - alto, dy],
      scale: [1, 0.72, 0.22],
      rotate: [0, -10, -18],
      opacity: [1, 1, 0.35],
    },
    { duration: 0.5, ease: "easeInOut" },
  );
  void vuelo.then(() => {
    copia.remove();
    latido(destino);
  });
}
