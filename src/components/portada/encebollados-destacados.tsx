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
    <ul ref={raiz} className="mt-10 grid gap-10 md:grid-cols-3 md:gap-8">
      {platos.map((plato) => (
        <li key={plato.id}>
          <Link
            href="/menu#cat-encebollados"
            transitionTypes={["a-la-carta"]}
            className="group flex flex-col items-center rounded-2xl px-2 pb-2 text-center transition-[background-color,scale] duration-200 hover:bg-tostado/[0.03] motion-safe:active:scale-[0.98]"
          >
            {/* Al pasar el mouse el tazón gira y se levanta; su sombra se abre como si se alejara de la mesa. */}
            <span className="relative block size-48 transition-[rotate,translate] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] sm:size-52 motion-safe:group-hover:-translate-y-1.5 motion-safe:group-hover:rotate-12">
              <span data-servir className="relative block size-full">
                <Image
                  src={`/platos/${plato.id}-cenital.webp`}
                  alt=""
                  fill
                  sizes="(min-width: 640px) 208px, 192px"
                  className="object-contain drop-shadow-[0_14px_18px_color-mix(in_oklab,var(--tostado)_30%,transparent)] transition-[filter] duration-700 group-hover:drop-shadow-[0_26px_28px_color-mix(in_oklab,var(--tostado)_26%,transparent)]"
                />
              </span>
            </span>
            {plato.etiqueta ? (
              <span className="mt-4 rounded-full bg-rosa px-2.5 py-0.5 text-xs font-semibold text-white">
                {plato.etiqueta}
              </span>
            ) : (
              // En la fila de tres, el hueco de la etiqueta mantiene alineados los nombres.
              <span aria-hidden="true" className="mt-4 h-5 max-md:hidden" />
            )}
            <h3 className="mt-3 font-heading text-titulo leading-tight font-bold text-balance text-oceano">
              {/* El subrayado se traza de izquierda a derecha, como la tinta de la comanda. */}
              <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_2px] bg-[position:0_100%] bg-no-repeat pb-0.5 transition-[background-size] duration-300 ease-out group-hover:bg-[length:100%_2px]">
                {plato.nombre}
              </span>
            </h3>
            <p className="mt-2 max-w-xs text-cuerpo text-pretty text-tostado/80">{plato.descripcion}</p>
            <p className="mt-3 font-heading text-plato font-semibold tabular-nums text-aji-texto">
              {!plato.disponible ? "Agotado por hoy" : `${tienePrecioVariable(plato) ? "desde " : ""}${precio(plato.precio)}`}
            </p>
            <span className="mt-3 flex items-center gap-1 text-sm font-semibold text-oceano underline decoration-oceano/30 underline-offset-4 group-hover:decoration-oceano">
              Ver en la carta
              <ArrowRight
                className="size-4 transition-transform duration-300 ease-out motion-safe:group-hover:translate-x-1"
                aria-hidden="true"
              />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
