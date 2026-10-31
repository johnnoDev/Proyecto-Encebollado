"use client";

import { useRef } from "react";
import Image from "next/image";
import { Ornamento } from "@/components/portada/ornamento";
import { PideAhora } from "@/components/portada/pide-ahora";
import { brand } from "@/config/brand";
import { precio } from "@/lib/formato";
import { CONDICIONES, gsap, TINTA, useGSAP } from "@/lib/gsap";
import { tienePrecioVariable } from "@/lib/pedido";
import { cn } from "@/lib/utils";
import { useRehidratar } from "@/store/hidratar";
import { useMenu } from "@/store/menu";

/**
 * Comandita: el plato de la foto anotado en un papelito de comanda apoyado en
 * la mesa, con su precio vigente (respeta los ajustes de /admin).
 */
function Comandita({ className }: { className?: string }) {
  const plato = useMenu((s) => s.platos.find((p) => p.id === "encebollado-albacora"));
  if (!plato) return null;
  return (
    <div
      data-revela
      data-anotacion
      className={cn(
        "absolute z-10 w-56 -rotate-3 rounded-b-[10px] bg-crema px-4 pt-4 pb-3 text-tostado shadow-[0_14px_24px_-10px_rgb(0_0_0/0.55)] [mask:radial-gradient(circle_at_7px_0,transparent_5px,#000_5.5px)_0_0/14px_100%_repeat-x] lg:w-64",
        className,
      )}
    >
      <p className="sr-only">En la foto:</p>
      <p className="grid grid-cols-[auto_minmax(0,1fr)] items-baseline gap-x-2 font-heading text-linea leading-snug font-semibold">
        <span aria-hidden="true" className="font-bold text-oceano">
          1 ×
        </span>
        {plato.nombre}
      </p>
      <p className="mt-2 flex items-baseline justify-between border-t border-dashed border-tostado/30 pt-1.5">
        <span className="text-nota text-tostado/75">
          {!plato.disponible ? "Hoy" : tienePrecioVariable(plato) ? "desde" : "precio"}
        </span>
        <span className="font-heading text-plato font-bold tabular-nums text-aji-texto">
          {!plato.disponible ? "Agotado" : precio(plato.precio)}
        </span>
      </p>
    </div>
  );
}

/**
 * Banner de la portada: una mesa costeña servida sobre madera azul. El tazón de
 * la foto es el protagonista; el texto vive en la madera, a la izquierda.
 *
 * Movimiento (GSAP, solo con movimiento permitido): la foto se asienta con un
 * acercamiento lento, el título sube línea por línea y el precio se escribe. Al
 * bajar, la foto se queda atrás y el papel crema la tapa. «Pide ahora» nunca
 * espera: está visible e interactivo desde el primer cuadro.
 */
export function BannerPortada() {
  useRehidratar();
  const raiz = useRef<HTMLElement>(null);
  const [primera, ...resto] = brand.descriptor.split(" ");

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(CONDICIONES.movimiento, () => {
        const q = gsap.utils.selector(raiz);

        const entrada = gsap.timeline({ defaults: { ease: TINTA } });
        entrada
          // La foto es el elemento más grande: se pinta desde el inicio y solo se asienta.
          .fromTo(q("[data-banner]"), { scale: 1.08 }, { scale: 1, duration: 2.2 }, 0)
          .from(q("[data-linea]"), { yPercent: 110, duration: 0.9, stagger: 0.09 }, 0.15)
          .from(q("[data-ornamento]"), { scaleX: 0, duration: 0.7 }, 0.5)
          .from(q("[data-apoyo]"), { y: 14, autoAlpha: 0, duration: 0.7, stagger: 0.07 }, 0.55)
          // La comandita cae sobre la mesa y su línea se escribe como tinta.
          .from(q("[data-anotacion]"), { y: -14, autoAlpha: 0, duration: 0.6 }, 0.9)
          .from(q("[data-anotacion] p"), { clipPath: "inset(0 100% 0 0)", duration: 0.8, stagger: 0.15 }, 1.1);

        // Si el navegador no está animando (pestaña en segundo plano, capturas sin
        // requestAnimationFrame), la entrada se completa de golpe: el título y la
        // foto nunca quedan invisibles. El temporizador corre aunque no haya cuadros.
        const cuadroInicial = gsap.ticker.frame;
        const respaldo = window.setTimeout(() => {
          if (gsap.ticker.frame - cuadroInicial < 2) entrada.progress(1);
        }, 2000);

        // Las entradas ya fijaron su estado inicial: ahora sí puede mostrarse lo protegido.
        gsap.set(q("[data-revela]"), { visibility: "visible" });

        // Al bajar, la foto se queda atrás; el papel de la siguiente sección la tapa.
        gsap.to(q("[data-banner-scroll]"), {
          yPercent: 12,
          ease: "none",
          scrollTrigger: { trigger: raiz.current, start: "top top", end: "bottom top", scrub: 0.6 },
        });

        return () => window.clearTimeout(respaldo);
      });
    },
    { scope: raiz },
  );

  return (
    // Sube bajo la barra superior (4.25rem) para que la foto llegue al borde de arriba.
    <section
      ref={raiz}
      aria-labelledby="titulo-portada"
      className="relative isolate -mt-[4.25rem] overflow-hidden lg:flex lg:min-h-svh lg:items-center"
    >
      {/* La foto: en celular y tablet, una franja arriba centrada en el tazón; en escritorio, todo el fondo. */}
      <div className="relative h-[clamp(17rem,48svh,30rem)] overflow-hidden lg:absolute lg:inset-0 lg:-z-10 lg:h-auto">
        <div data-banner-scroll className="absolute inset-0">
          <div data-banner className="absolute inset-0">
            <Image
              src="/portada/banner-hero.webp"
              alt="Encebollado de albacora servido sobre una mesa de madera azul, con limón, cebolla curtida, culantro y chifles"
              fill
              sizes="100vw"
              loading="eager"
              fetchPriority="high"
              className="object-cover object-[76%_50%] lg:object-[70%_50%]"
            />
          </div>
        </div>
        {/* Arriba, una sombra para leer la barra; abajo, la foto se funde con el océano. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(to_bottom,color-mix(in_oklab,var(--oceano)_88%,transparent)_0%,color-mix(in_oklab,var(--oceano)_62%,transparent)_12%,transparent_30%,transparent_62%,var(--oceano)_100%)] lg:bg-[linear-gradient(to_right,color-mix(in_oklab,var(--oceano)_55%,transparent)_0%,color-mix(in_oklab,var(--oceano)_28%,transparent)_32%,transparent_50%),linear-gradient(to_bottom,color-mix(in_oklab,var(--oceano)_90%,transparent)_0%,color-mix(in_oklab,var(--oceano)_72%,transparent)_8%,transparent_20%,transparent_80%,color-mix(in_oklab,var(--oceano)_70%,transparent)_100%)]"
        />
        {/* La comandita del plato de la foto, apoyada en la mesa junto al tazón. */}
        <Comandita className="top-[30%] left-4 sm:left-6 lg:top-auto lg:bottom-[14%] lg:left-[45%]" />
      </div>

      {/* Texto y acción, sobre la madera. */}
      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 lg:pt-[4.25rem] lg:pb-12">
        <div className="-mt-10 max-w-xl sm:-mt-14 lg:mt-0">
          <h1 id="titulo-portada" className="font-heading text-portada font-bold tracking-[-0.025em]">
            <span className="sr-only">{brand.nombre}: </span>
            {/* Cada línea sube desde su propia máscara; el relleno inferior deja ver la tilde y los descendentes. */}
            <span aria-hidden="true" className="block overflow-y-clip pb-[0.08em]">
              <span data-revela data-linea className="block">
                {primera}
              </span>
            </span>
            <span className="sr-only">{primera} </span>
            <span aria-hidden="true" className="-mt-[0.08em] block overflow-y-clip pb-[0.08em]">
              <span data-revela data-linea className="block text-dorado">
                {resto.join(" ")}
              </span>
            </span>
            <span className="sr-only">{resto.join(" ")}</span>
          </h1>
          <div data-revela data-ornamento className="mt-4 w-fit sm:mt-6 lg:mt-8">
            <Ornamento />
          </div>
          <p data-revela data-apoyo className="mt-4 font-heading text-titulo text-balance sm:mt-5">
            {brand.bienvenida}
          </p>
          {/* En celular la bienvenida basta: el eslogan dice lo mismo y empujaría el botón fuera de pantalla. */}
          <p data-revela data-apoyo className="mt-2 hidden max-w-md text-linea text-pretty text-crema/80 sm:block">
            {brand.eslogan}.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 sm:mt-8">
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
