"use client";

import { motion, useReducedMotion } from "motion/react";
import { IlustracionPlato } from "@/components/menu/ilustracion-plato";
import { Ornamento } from "@/components/portada/ornamento";
import { PideAhora } from "@/components/portada/pide-ahora";
import { brand } from "@/config/brand";
import { precio } from "@/lib/formato";
import { tienePrecioVariable } from "@/lib/pedido";
import { cn } from "@/lib/utils";
import { useRehidratar } from "@/store/hidratar";
import { useMenu } from "@/store/menu";

const TINTA = [0.16, 1, 0.3, 1] as const;
const mezcla = (a: string, pa: number, b: string) => `color-mix(in oklab, var(--${a}) ${pa}%, ${b})`;

/** Medio limón visto desde arriba, con los mismos tokens que las ilustraciones de la carta. */
function Limon({ className }: { className?: string }) {
  const pulpa = mezcla("cilantro", 42, mezcla("dorado", 40, "var(--crema)"));
  const piel = mezcla("crema", 82, "var(--cilantro)");
  return (
    <svg viewBox="0 0 60 60" aria-hidden="true" focusable="false" className={className}>
      <circle cx={31.5} cy={33} r={27} style={{ fill: mezcla("tostado", 50, "transparent") }} />
      <circle cx={30} cy={30} r={27} style={{ fill: "var(--cilantro)" }} />
      <circle cx={30} cy={30} r={23.5} style={{ fill: piel }} />
      <circle cx={30} cy={30} r={21} style={{ fill: pulpa }} />
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i * Math.PI) / 4;
        return (
          <line
            key={i}
            x1={30}
            y1={30}
            x2={30 + Math.cos(a) * 21}
            y2={30 + Math.sin(a) * 21}
            style={{ stroke: piel, strokeWidth: 1.8, strokeLinecap: "round" }}
          />
        );
      })}
      <circle cx={30} cy={30} r={2.6} style={{ fill: piel }} />
    </svg>
  );
}

/** Granos de pimienta y ají picado esparcidos sobre la mesa. */
function Granos({ className }: { className?: string }) {
  const puntos: [number, number, number, string][] = [
    [8, 10, 2.4, "aji"],
    [20, 4, 1.8, "dorado"],
    [26, 16, 2.2, "aji"],
    [14, 24, 1.6, "dorado"],
    [36, 8, 1.4, "aji"],
  ];
  return (
    <svg viewBox="0 0 44 30" aria-hidden="true" focusable="false" className={className}>
      {puntos.map(([x, y, r, c]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={r} style={{ fill: `var(--${c})` }} opacity={0.85} />
      ))}
    </svg>
  );
}

/** Vapor del caldo recién servido: tres hilos que suben y se desvanecen. */
function Vapor({ reducir }: { reducir: boolean | null }) {
  const hilos = [
    "M22 96C10 76 34 62 22 42S32 12 24 2",
    "M50 100C38 78 62 64 50 44S60 14 52 4",
    "M78 96C66 76 90 62 78 42S88 12 80 2",
  ];
  return (
    <svg
      viewBox="0 0 100 100"
      aria-hidden="true"
      focusable="false"
      className="pointer-events-none absolute top-[2%] left-1/2 h-[46%] w-[42%] -translate-x-1/2"
    >
      {hilos.map((d, i) => (
        <motion.path
          key={d}
          d={d}
          fill="none"
          stroke="var(--crema)"
          strokeWidth={2.4}
          strokeLinecap="round"
          initial={{ opacity: 0.22 }}
          animate={reducir ? { opacity: 0.22 } : { opacity: [0, 0.4, 0], y: [10, -4, -16] }}
          transition={reducir ? { duration: 0 } : { duration: 4.2, repeat: Infinity, delay: i * 1.4, ease: "easeInOut" }}
        />
      ))}
    </svg>
  );
}

/** Nombre y precio vigente de un plato, anotados junto a su ilustración. */
function Anotacion({ platoId, className }: { platoId: string; className?: string }) {
  const plato = useMenu((s) => s.platos.find((p) => p.id === platoId));
  if (!plato) return null;
  const valor = !plato.disponible
    ? "Agotado por hoy"
    : `${tienePrecioVariable(plato) ? "desde " : ""}${precio(plato.precio)}`;
  return (
    <p className={cn("absolute z-10 flex max-w-[10rem] flex-col gap-1 lg:max-w-[12rem]", className)}>
      <span aria-hidden="true" className="mb-1 h-px w-12 bg-dorado/70" />
      <span className="text-nota leading-snug font-semibold text-crema sm:text-sm">{plato.nombre}</span>{" "}
      <span className="font-heading text-linea font-semibold tabular-nums text-dorado">{valor}</span>
    </p>
  );
}

/**
 * Banner de la portada: el encebollado servido es el protagonista, sobre el
 * océano, con su nombre gigante detrás y la mesa puesta alrededor.
 */
export function BannerPortada() {
  useRehidratar();
  const reducir = useReducedMotion();
  const [primera, ...resto] = brand.descriptor.split(" ");
  const flota = (retraso: number, giro: number) =>
    reducir
      ? {}
      : {
          initial: { y: 18, rotate: giro - 25 },
          animate: { y: 0, rotate: giro },
          transition: { duration: 1.6, delay: retraso, ease: TINTA },
        };

  return (
    // Sube bajo la barra superior (4.25rem) para que el pozo de luz no deje costura.
    <section aria-labelledby="titulo-portada" className="relative isolate -mt-[4.25rem] overflow-hidden pt-[4.25rem]">
      {/* Pozo de luz donde se apoya el tazón. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_68%_24%,color-mix(in_oklab,var(--oceano)_84%,var(--crema))_0%,transparent_58%)] lg:bg-[radial-gradient(circle_at_70%_50%,color-mix(in_oklab,var(--oceano)_84%,var(--crema))_0%,transparent_46%)]"
      />
      {/* Un plato de chifles asoma en la esquina, como en una mesa servida. */}
      <motion.div
        aria-hidden="true"
        className="absolute -bottom-24 -left-24 hidden size-64 lg:block"
        {...flota(0.5, 20)}
      >
        <IlustracionPlato platoId="chifles" className="size-full" />
      </motion.div>

      <div className="mx-auto grid max-w-6xl px-4 pb-16 sm:px-6 lg:min-h-[calc(100svh-4.25rem)] lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-center lg:pb-12">
        {/* Escena: el tazón, su nombre de fondo y la mesa alrededor. */}
        <div className="relative h-[22rem] sm:h-[30rem] lg:order-2 lg:h-[40rem]">
          <p
            aria-hidden="true"
            className="absolute top-1 right-0 font-heading text-fondo font-bold tracking-[-0.03em] whitespace-nowrap text-crema/[0.07] select-none lg:top-6"
          >
            {brand.nombre.replace(/^La\s+/, "")}
          </p>

          <div className="absolute top-12 -right-16 size-[19rem] sm:top-14 sm:right-0 sm:size-[25rem] lg:top-1/2 lg:right-auto lg:left-1/2 lg:size-[31rem] lg:-translate-x-1/2 lg:-translate-y-1/2">
            {/* Aros finos alrededor del tazón. */}
            <svg
              viewBox="0 0 100 100"
              aria-hidden="true"
              focusable="false"
              className="pointer-events-none absolute -inset-[22%] size-[144%]"
            >
              <circle cx={50} cy={50} r={36} fill="none" stroke="var(--crema)" strokeOpacity={0.09} strokeWidth={0.25} />
              <circle cx={50} cy={50} r={49} fill="none" stroke="var(--crema)" strokeOpacity={0.06} strokeWidth={0.2} />
            </svg>
            <motion.div
              className="size-full"
              initial={reducir ? false : { rotate: -32, scale: 0.94 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ duration: 1.8, ease: TINTA }}
            >
              <IlustracionPlato
                platoId="encebollado-albacora"
                className="size-full drop-shadow-[0_28px_36px_rgb(0_0_0/0.45)]"
              />
            </motion.div>
            <Vapor reducir={reducir} />
          </div>

          <motion.div className="absolute top-16 left-2 size-14 sm:left-6 lg:top-[7%] lg:left-[20%] lg:size-20" {...flota(0.25, -18)}>
            <Limon className="size-full" />
          </motion.div>
          <motion.div
            className="absolute right-[34%] bottom-[4%] hidden size-14 sm:block lg:right-[30%] lg:bottom-[6%] lg:size-16"
            {...flota(0.4, 32)}
          >
            <Limon className="size-full" />
          </motion.div>
          <Granos className="absolute top-[42%] left-3 w-10 sm:left-10 lg:top-[44%] lg:left-[6%] lg:w-12" />
          <Granos className="absolute top-[8%] right-[8%] hidden w-10 rotate-90 lg:block" />

          <motion.div
            aria-hidden="true"
            className="absolute right-0 bottom-[10%] hidden size-36 lg:block"
            {...flota(0.55, -10)}
          >
            <IlustracionPlato platoId="jugo-natural" className="size-full" />
          </motion.div>

          <Anotacion platoId="encebollado-albacora" className="bottom-1 left-0 sm:left-4 lg:bottom-[16%] lg:left-[2%]" />
          <Anotacion platoId="jugo-natural" className="right-[2%] bottom-[2%] hidden lg:flex" />
        </div>

        {/* Texto y acción. */}
        <div className="relative z-10 mt-6 lg:order-1 lg:mt-0">
          <h1 id="titulo-portada" className="font-heading text-portada font-bold tracking-[-0.025em]">
            <span className="sr-only">{brand.nombre}: </span>
            <span className="block">{primera}</span>{" "}
            <span className="block text-dorado">{resto.join(" ")}</span>
          </h1>
          <Ornamento className="mt-6 lg:mt-8" />
          <p className="mt-5 font-heading text-titulo text-balance">{brand.bienvenida}</p>
          <p className="mt-2 max-w-md text-linea text-pretty text-crema/80">{brand.eslogan}.</p>
          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
            <PideAhora />
            <a
              href="#como-pedir"
              className="flex h-12 items-center text-cuerpo font-semibold text-crema underline decoration-dorado/60 decoration-2 underline-offset-[6px] hover:decoration-dorado"
            >
              ¿Cómo se pide?
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
