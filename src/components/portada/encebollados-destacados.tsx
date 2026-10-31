"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { precio } from "@/lib/formato";
import { CONDICIONES, gsap, TINTA, useGSAP } from "@/lib/gsap";
import { tienePrecioVariable } from "@/lib/pedido";
import { useRehidratar } from "@/store/hidratar";
import { useMenu } from "@/store/menu";

/** Cada tazón llega a la mesa girando en su propio sentido. */
const GIROS = [-34, 22, -14];

/**
 * Los tres platos estrella, con el precio vigente (respeta los ajustes de /admin).
 *
 * Movimiento (GSAP): cada foto se descubre con una máscara circular, como un
 * plato que se apoya en la mesa. En la fila de tres el avance lo marca el
 * scroll; en una columna, cada plato se sirve al entrar en pantalla. Los
 * textos no se animan: se leen desde el primer momento.
 */
export function EncebolladosDestacados() {
  useRehidratar();
  const raiz = useRef<HTMLUListElement>(null);
  const platos = useMenu((s) => s.platos).filter((p) => p.categoriaId === "encebollados");

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(CONDICIONES, (contexto) => {
        const { fila, columna } = contexto.conditions as Record<keyof typeof CONDICIONES, boolean>;
        if (!fila && !columna) return;
        const fotos = gsap.utils.toArray<HTMLElement>("[data-servir]", raiz.current);
        const desde = (i: number) => ({
          clipPath: "circle(0% at 50% 50%)",
          rotate: GIROS[i % GIROS.length],
          scale: 0.86,
        });
        const hasta = { clipPath: "circle(71% at 50% 50%)", rotate: 0, scale: 1 };

        if (fila) {
          const servir = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: { trigger: raiz.current, start: "top 88%", end: "top 38%", scrub: 0.6 },
          });
          fotos.forEach((foto, i) => servir.fromTo(foto, desde(i), { ...hasta, duration: 1 }, i * 0.3));
        } else {
          fotos.forEach((foto, i) =>
            gsap.fromTo(foto, desde(i), {
              ...hasta,
              duration: 1,
              ease: TINTA,
              scrollTrigger: { trigger: foto, start: "top 85%", once: true },
            }),
          );
        }
      });
    },
    { scope: raiz, dependencies: [platos.length] },
  );

  return (
    // En celular cada plato es una fila (foto a la izquierda, como en la carta) para que
    // los tres se lean como una lista; desde 768 px, la fila de tres tarjetas.
    <ul
      ref={raiz}
      className="mt-6 grid divide-y divide-dashed divide-tostado/25 md:mt-10 md:grid-cols-3 md:gap-8 md:divide-y-0"
    >
      {platos.map((plato) => (
        <li key={plato.id}>
          <Link
            href={`/menu?plato=${plato.id}`}
            transitionTypes={["a-la-carta"]}
            className="group -mx-2 grid grid-cols-[7.5rem_minmax(0,1fr)] items-center gap-x-4 rounded-2xl px-2 py-5 text-left transition-[background-color,scale] duration-200 hover:bg-tostado/[0.03] motion-safe:active:scale-[0.98] md:mx-0 md:flex md:flex-col md:items-center md:py-0 md:pb-2 md:text-center"
          >
            {/* Al pasar el mouse el tazón gira y se levanta; su sombra se abre como si se alejara de la mesa. */}
            <span className="relative block size-[7.5rem] transition-[rotate,translate] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] md:size-48 lg:size-52 motion-safe:group-hover:-translate-y-1.5 motion-safe:group-hover:rotate-12">
              <span data-servir className="relative block size-full">
                <Image
                  src={`/platos/${plato.id}-cenital.webp`}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 208px, (min-width: 768px) 192px, 120px"
                  className="object-contain drop-shadow-[0_6px_8px_color-mix(in_oklab,var(--tostado)_28%,transparent)] transition-[filter] md:drop-shadow-[0_14px_18px_color-mix(in_oklab,var(--tostado)_30%,transparent)] duration-700 group-hover:drop-shadow-[0_26px_28px_color-mix(in_oklab,var(--tostado)_26%,transparent)]"
                />
              </span>
            </span>
            <div className="flex min-w-0 flex-col items-start md:items-center">
              {plato.etiqueta ? (
                <span className="mb-1.5 rounded-full bg-rosa px-2.5 py-0.5 text-xs font-semibold text-white md:mt-4 md:mb-0">
                  {plato.etiqueta}
                </span>
              ) : (
                // En la fila de tres, el hueco de la etiqueta mantiene alineados los nombres.
                <span aria-hidden="true" className="mt-4 h-5 max-md:hidden" />
              )}
              <h3 className="font-heading text-plato leading-tight font-bold text-balance text-oceano md:mt-3 md:text-titulo">
                {/* El subrayado se traza de izquierda a derecha, como la tinta de la comanda. */}
                <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_2px] bg-[position:0_100%] bg-no-repeat pb-0.5 transition-[background-size] duration-300 ease-out group-hover:bg-[length:100%_2px]">
                  {plato.nombre}
                </span>
              </h3>
              <p className="mt-1 line-clamp-2 max-w-xs text-sm text-pretty text-tostado/80 md:mt-2 md:line-clamp-none md:text-cuerpo">
                {plato.descripcion}
              </p>
              <p className="mt-2 flex w-full items-center justify-between gap-3 md:mt-3 md:w-auto md:justify-center">
                <span className="font-heading text-plato font-semibold tabular-nums text-aji-texto">
                  {!plato.disponible
                    ? "Agotado por hoy"
                    : `${tienePrecioVariable(plato) ? "desde " : ""}${precio(plato.precio)}`}
                </span>
                {/* En la fila basta la flecha: toda la fila es el enlace. */}
                <ArrowRight className="size-5 shrink-0 text-oceano md:hidden" aria-hidden="true" />
              </p>
              <span className="mt-3 hidden items-center gap-1 text-sm font-semibold text-oceano underline decoration-oceano/30 underline-offset-4 group-hover:decoration-oceano md:flex">
                Ver en la carta
                <ArrowRight
                  className="size-4 transition-transform duration-300 ease-out motion-safe:group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
