"use client";

import { useRef, type ReactNode } from "react";
import { CONDICIONES, gsap, TINTA, useGSAP } from "@/lib/gsap";

/**
 * Movimiento de «Dónde estamos» sobre contenido renderizado en el servidor:
 * las fotos del local caen sobre el papel y se asientan con su giro, y el pin
 * del mapa se dibuja con su trazo. Ocurre una vez, al entrar en pantalla.
 */
export function MovimientoLocal({ children, className }: { children: ReactNode; className?: string }) {
  const raiz = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(CONDICIONES.movimiento, () => {
        const q = gsap.utils.selector(raiz);
        const caer = gsap.timeline({
          scrollTrigger: { trigger: q("[data-fotos-local]")[0], start: "top 78%", once: true },
        });
        caer.from(q("[data-foto-local]"), {
          y: -46,
          rotate: (i: number) => (i % 2 === 0 ? -7 : 8),
          autoAlpha: 0,
          duration: 0.75,
          ease: TINTA,
          stagger: 0.16,
        });
        gsap.from(q("[data-pin] path, [data-pin] circle"), {
          drawSVG: 0,
          duration: 0.9,
          ease: "power2.inOut",
          stagger: 0.25,
          scrollTrigger: { trigger: q("[data-pin]")[0], start: "top 85%", once: true },
        });
      });
    },
    { scope: raiz },
  );

  return (
    <div ref={raiz} className={className}>
      {children}
    </div>
  );
}
