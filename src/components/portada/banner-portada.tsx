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

/** Nombre y precio vigente de un plato, anotados junto a su foto. */
function Anotacion({ platoId, className }: { platoId: string; className?: string }) {
  const plato = useMenu((s) => s.platos.find((p) => p.id === platoId));
  if (!plato) return null;
  const valor = !plato.disponible
    ? "Agotado por hoy"
    : `${tienePrecioVariable(plato) ? "desde " : ""}${precio(plato.precio)}`;
  return (
    <p
      data-revela
      data-anotacion
      className={cn("absolute z-10 flex max-w-[10rem] flex-col gap-1 lg:max-w-[12rem]", className)}
    >
      <span aria-hidden="true" className="mb-1 h-px w-12 bg-dorado/70" />
      <span className="text-nota leading-snug font-semibold text-crema sm:text-sm">{plato.nombre}</span>{" "}
      <span className="font-heading text-linea font-semibold tabular-nums text-dorado">{valor}</span>
    </p>
  );
}

/**
 * Banner de la portada: el encebollado servido es el protagonista, sobre el
 * océano, con su nombre gigante detrás y la mesa puesta alrededor.
 *
 * Movimiento (GSAP, solo con movimiento permitido): el tazón se descubre con una
 * máscara circular mientras gira, el título sube línea por línea y la mesa se
 * arma alrededor. Al bajar, el tazón se queda atrás y el papel crema lo tapa.
 * «Pide ahora» nunca espera: está visible e interactivo desde el primer cuadro.
 */
export function BannerPortada() {
  useRehidratar();
  const raiz = useRef<HTMLElement>(null);
  const [primera, ...resto] = brand.descriptor.split(" ");

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(CONDICIONES, (contexto) => {
        const { movimiento, puntero } = contexto.conditions as Record<keyof typeof CONDICIONES, boolean>;
        if (!movimiento) return;
        const q = gsap.utils.selector(raiz);

        const entrada = gsap.timeline({ defaults: { ease: TINTA } });
        entrada
          // La máscara arranca ya abierta: la foto (el elemento más grande) se pinta desde el inicio.
          .fromTo(
            q("[data-tazon-entrada]"),
            { clipPath: "circle(34% at 50% 50%)", rotate: -20, scale: 0.96 },
            { clipPath: "circle(72% at 50% 50%)", rotate: 0, scale: 1, duration: 1.4 },
            0,
          )
          .from(q("[data-linea]"), { yPercent: 110, duration: 0.9, stagger: 0.09 }, 0.12)
          .from(q("[data-ornamento]"), { scaleX: 0, duration: 0.7 }, 0.5)
          .from(q("[data-apoyo]"), { y: 14, autoAlpha: 0, duration: 0.7, stagger: 0.07 }, 0.55)
          .from(q("[data-fondo]"), { xPercent: 5, autoAlpha: 0, duration: 1.3 }, 0.4)
          .from(
            q("[data-satelite]"),
            {
              y: 26,
              rotate: (i: number) => [-24, 18, -14][i % 3],
              autoAlpha: 0,
              duration: 1.1,
              stagger: 0.09,
            },
            0.6,
          )
          .from(q("[data-anotacion]"), { clipPath: "inset(0 100% 0 0)", duration: 0.8, stagger: 0.12 }, 0.95);
        // Las entradas ya fijaron su estado inicial: ahora sí puede mostrarse lo protegido.
        gsap.set(q("[data-revela]"), { visibility: "visible" });

        // Al bajar, el tazón gira y se queda atrás; el papel de la siguiente sección lo tapa.
        gsap.to(q("[data-tazon-scroll]"), {
          rotate: 24,
          yPercent: 14,
          scale: 0.92,
          ease: "none",
          scrollTrigger: { trigger: raiz.current, start: "top top", end: "bottom top", scrub: 0.6 },
        });
        gsap.to(q("[data-fondo]"), {
          xPercent: -8,
          ease: "none",
          scrollTrigger: { trigger: raiz.current, start: "top top", end: "bottom top", scrub: 0.6 },
        });

        // Profundidad mínima con mouse: cada acompañante se corre según su plano.
        if (puntero) {
          const capas = q("[data-profundidad]").map((el) => ({
            k: Number(el.getAttribute("data-profundidad")),
            x: gsap.quickTo(el, "x", { duration: 0.9, ease: "power3.out" }),
            y: gsap.quickTo(el, "y", { duration: 0.9, ease: "power3.out" }),
          }));
          const mover = (e: PointerEvent) => {
            const dx = e.clientX / window.innerWidth - 0.5;
            const dy = e.clientY / window.innerHeight - 0.5;
            for (const c of capas) {
              c.x(dx * c.k);
              c.y(dy * c.k);
            }
          };
          window.addEventListener("pointermove", mover);
          return () => window.removeEventListener("pointermove", mover);
        }
      });
    },
    { scope: raiz },
  );

  return (
    // Sube bajo la barra superior (4.25rem) para que el pozo de luz no deje costura.
    <section
      ref={raiz}
      aria-labelledby="titulo-portada"
      className="relative isolate -mt-[4.25rem] overflow-hidden pt-[4.25rem]"
    >
      {/* Pozo de luz donde se apoya el tazón. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_68%_24%,color-mix(in_oklab,var(--oceano)_84%,var(--crema))_0%,transparent_58%)] lg:bg-[radial-gradient(circle_at_70%_50%,color-mix(in_oklab,var(--oceano)_84%,var(--crema))_0%,transparent_46%)]"
      />
      {/* La canasta de pan asoma en la esquina, como en una mesa servida. */}
      <div aria-hidden="true" data-profundidad="10" className="absolute -bottom-20 -left-16 hidden size-64 lg:block">
        <div data-revela data-satelite className="relative size-full">
          <Image src="/platos/pan.webp" alt="" fill sizes="256px" className="object-contain" />
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl px-4 pb-16 sm:px-6 lg:min-h-[calc(100svh-4.25rem)] lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-center lg:pb-12">
        {/* Escena: el tazón, su nombre de fondo y la mesa alrededor. */}
        <div className="relative h-[22rem] sm:h-[30rem] lg:order-2 lg:h-[40rem]">
          <p
            aria-hidden="true"
            data-revela
            data-fondo
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
            <div data-tazon-scroll className="size-full">
              <div data-tazon-entrada className="relative size-full">
                <Image
                  src="/platos/encebollado-albacora-cenital.webp"
                  alt="Encebollado de albacora con yuca, cebolla curtida y culantro, visto desde arriba"
                  fill
                  sizes="(min-width: 1024px) 31rem, (min-width: 640px) 25rem, 19rem"
                  loading="eager"
                  fetchPriority="high"
                  className="object-contain drop-shadow-[0_28px_36px_rgb(0_0_0/0.45)]"
                />
              </div>
            </div>
          </div>

          <Granos className="absolute top-[56%] left-6 w-10 sm:left-10 lg:top-[44%] lg:left-[6%] lg:w-12" />
          <Granos className="absolute top-[8%] right-[8%] hidden w-10 rotate-90 lg:block" />

          {/* Los chifles, el acompañante de siempre. */}
          <div
            aria-hidden="true"
            data-profundidad="18"
            className="absolute top-16 left-0 size-28 sm:left-4 sm:size-36 lg:top-auto lg:right-[-2%] lg:bottom-[12%] lg:left-auto lg:size-44"
          >
            <div data-revela data-satelite className="relative size-full">
              <Image
                src="/platos/chifles.webp"
                alt=""
                fill
                sizes="(min-width: 1024px) 11rem, (min-width: 640px) 9rem, 7rem"
                className="object-contain drop-shadow-[0_16px_20px_rgb(0_0_0/0.4)]"
              />
            </div>
          </div>

          <Anotacion
            platoId="encebollado-albacora"
            className="bottom-1 left-0 max-w-[7.5rem] sm:left-4 sm:max-w-[10rem] lg:bottom-[3%] lg:left-[4%]"
          />
          <Anotacion platoId="chifles" className="right-[4%] bottom-[2%] hidden lg:flex" />
        </div>

        {/* Texto y acción. */}
        <div className="relative z-10 mt-6 lg:order-1 lg:mt-0">
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
          <div data-revela data-ornamento className="mt-6 w-fit lg:mt-8">
            <Ornamento />
          </div>
          <p data-revela data-apoyo className="mt-5 font-heading text-titulo text-balance">
            {brand.bienvenida}
          </p>
          <p data-revela data-apoyo className="mt-2 max-w-md text-linea text-pretty text-crema/80">
            {brand.eslogan}.
          </p>
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
