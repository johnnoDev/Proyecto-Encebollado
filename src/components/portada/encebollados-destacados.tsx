"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { precio } from "@/lib/formato";
import { tienePrecioVariable } from "@/lib/pedido";
import { useRehidratar } from "@/store/hidratar";
import { useMenu } from "@/store/menu";

/** Los tres platos estrella, con el precio vigente (respeta los ajustes de /admin). */
export function EncebolladosDestacados() {
  useRehidratar();
  const platos = useMenu((s) => s.platos).filter((p) => p.categoriaId === "encebollados");

  return (
    <ul className="mt-10 grid gap-10 md:grid-cols-3 md:gap-8">
      {platos.map((plato) => (
        <li key={plato.id}>
          <Link
            href="/menu#cat-encebollados"
            className="group flex flex-col items-center rounded-2xl px-2 pb-2 text-center transition-colors hover:bg-tostado/[0.03]"
          >
            {/* Foto cenital del tazón: gira como si se lo acercaran a la mesa. */}
            <span className="relative block size-48 transition-transform duration-700 ease-out motion-safe:group-hover:rotate-[10deg] sm:size-52">
              <Image
                src={`/platos/${plato.id}-cenital.webp`}
                alt=""
                fill
                sizes="(min-width: 640px) 208px, 192px"
                className="object-contain drop-shadow-[0_14px_18px_color-mix(in_oklab,var(--tostado)_30%,transparent)]"
              />
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
              {plato.nombre.replace(/^Encebollado /, "Encebollado ")}
            </h3>
            <p className="mt-2 max-w-xs text-cuerpo text-pretty text-tostado/80">{plato.descripcion}</p>
            <p className="mt-3 font-heading text-plato font-semibold tabular-nums text-aji-texto">
              {!plato.disponible ? "Agotado por hoy" : `${tienePrecioVariable(plato) ? "desde " : ""}${precio(plato.precio)}`}
            </p>
            <span className="mt-3 flex items-center gap-1 text-sm font-semibold text-oceano underline decoration-oceano/30 underline-offset-4 group-hover:decoration-oceano">
              Ver en la carta <ArrowRight className="size-4" aria-hidden="true" />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
