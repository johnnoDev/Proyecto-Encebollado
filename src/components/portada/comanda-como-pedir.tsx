"use client";

import { useRef } from "react";
import Image from "next/image";
import { QrCode, Send, Soup, type LucideIcon } from "lucide-react";
import { PideAhora } from "@/components/portada/pide-ahora";
import { CONDICIONES, gsap, TINTA, useGSAP } from "@/lib/gsap";

const pasos: { titulo: string; detalle: string; Icono: LucideIcon }[] = [
  { titulo: "Escanea el QR de tu mesa", detalle: "La carta se abre con tu mesa ya anotada.", Icono: QrCode },
  { titulo: "Anota tus platos", detalle: "Tamaño, con o sin cebolla, limón y ají aparte.", Icono: Soup },
  { titulo: "Envía a cocina", detalle: "Sigue tu pedido en el celular hasta que llega a tu mesa.", Icono: Send },
];

const papel =
  "bg-crema text-tostado [mask:radial-gradient(circle_at_9px_0,transparent_6px,#000_6.5px)_0_0/18px_100%_repeat-x]";

const ESCRITA = "inset(0 0% 0 0)";
const EN_BLANCO = "inset(0 100% 0 0)";

/** Flecha punteada a mano alzada, en dorado: lleva de la comanda a la acción. */
function Flecha({ d, punta, className }: { d: string; punta: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 120 60"
      aria-hidden="true"
      focusable="false"
      data-flecha
      className={className}
      fill="none"
      stroke="var(--dorado)"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={d} strokeDasharray="1 7" />
      <path d={punta} />
    </svg>
  );
}

/**
 * «Cómo pedir» contado como lo que es: una comanda que la mesera presenta.
 *
 * Movimiento (GSAP, solo con movimiento permitido):
 * - Escritorio: la sección entera (con su fondo y su título) se fija mientras
 *   bajas; el primer paso ya está escrito y cada tramo de scroll escribe el
 *   siguiente. Al final cae el sello «A COCINA» (un golpe, no ligado al
 *   scroll), la flecha se traza como tinta hasta «Pide ahora» y el botón late.
 *   La tercera columna está visible desde el inicio. Sin snap: el scroll nunca
 *   se secuestra.
 * - Celular y tablet: sin fijar; cada paso se escribe al entrar en pantalla.
 * Las instrucciones están siempre en el HTML y en orden.
 */
export function ComandaComoPedir() {
  const raiz = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(CONDICIONES, (contexto) => {
        const { escritorio, movil } = contexto.conditions as Record<keyof typeof CONDICIONES, boolean>;
        if (!escritorio && !movil) return;
        const q = gsap.utils.selector(raiz);
        const lineas = q("[data-paso]");
        const sello = gsap.fromTo(
          q("[data-sello]"),
          { autoAlpha: 0, scale: 1.9, rotate: -16 },
          { autoAlpha: 1, scale: 1, rotate: -9, duration: 0.5, ease: "back.out(1.5)", paused: true },
        );

        if (escritorio) {
          // Se fija la sección entera: fondo, título y comanda nunca se separan.
          const seccion = raiz.current?.closest("section") ?? raiz.current;
          const haciaCocina = q("[data-flecha]")[0];
          // El cierre está siempre visible y alcanzable con el teclado; cuando cae el
          // sello, la flecha se traza hasta «Pide ahora» y el botón late una vez.
          const cierre = gsap
            .timeline({ paused: true })
            .fromTo(haciaCocina, { clipPath: EN_BLANCO }, { clipPath: ESCRITA, duration: 0.6, ease: TINTA })
            .to(q("[data-cierre] a"), { scale: 1.06, duration: 0.18, ease: "power2.out", yoyo: true, repeat: 1 }, 0.45);
          const relato = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: seccion,
              start: "top top",
              end: "+=80%",
              pin: seccion,
              scrub: 0.5,
              // El golpe del sello va aparte: cae al terminar de escribir y se levanta si vuelves.
              onUpdate: (st) => {
                if (st.progress > 0.86 && sello.progress() === 0) {
                  sello.play();
                  cierre.play();
                } else if (st.progress < 0.7 && sello.progress() > 0) {
                  sello.reverse();
                  cierre.reverse();
                }
              },
            },
          });
          // El primer paso ya está escrito: la comanda arranca con contenido.
          const [primera, ...siguientes] = lineas;
          gsap.set(primera, { clipPath: ESCRITA });
          siguientes.forEach((linea, i) => {
            relato.fromTo(linea, { clipPath: EN_BLANCO }, { clipPath: ESCRITA, duration: 1 }, 0.4 + i * 1.15);
          });
          // La mesera se asoma un poco más a medida que se completa el pedido.
          relato.fromTo(q("[data-mesera]"), { y: 14 }, { y: 0, duration: 0.4 + siguientes.length * 1.15 }, 0);
          relato.to({}, { duration: 0.6 });
        } else {
          for (const linea of lineas) {
            gsap.fromTo(
              linea,
              { clipPath: EN_BLANCO },
              {
                clipPath: ESCRITA,
                duration: 0.8,
                ease: TINTA,
                scrollTrigger: { trigger: linea, start: "top 85%", once: true },
              },
            );
          }
          const ultima = lineas.at(-1);
          if (ultima) {
            gsap.to(
              {},
              {
                scrollTrigger: {
                  trigger: ultima,
                  start: "top 70%",
                  once: true,
                  onEnter: () => void gsap.delayedCall(0.55, () => void sello.play()),
                },
              },
            );
          }
        }
        // Los estados iniciales ya están puestos: se puede mostrar lo protegido.
        gsap.set(q("[data-revela]"), { visibility: "visible" });
      });
    },
    { scope: raiz },
  );

  return (
    <div
      ref={raiz}
      className="relative mt-10 lg:mt-4 lg:grid lg:grid-cols-[minmax(0,1fr)_28rem_minmax(0,1fr)] lg:items-center lg:gap-10"
    >
      {/* Escritorio: la columna izquierda queda libre para el fondo y sus marcas de agua. */}
      <div aria-hidden="true" className="hidden lg:block" />

      <div>
        {/* La mesera presenta el encebollado y asoma detrás de la comanda. */}
        <div data-mesera className="relative mx-auto h-56 w-52 overflow-hidden lg:h-[min(11rem,22svh)] lg:w-36">
          <Image
            src="/local/mesera.webp"
            alt="Una mesera de La Albacora presenta un encebollado recién servido"
            width={404}
            height={1100}
            sizes="(min-width: 1024px) 144px, 208px"
            className="h-auto w-52 lg:w-36"
          />
        </div>

        <div className="relative z-10 mx-auto -mt-6 max-w-md drop-shadow-[0_18px_30px_rgb(0_0_0/0.35)] lg:-mt-4">
          <div className={`${papel} rounded-b-[14px] px-6 pt-7 pb-8 text-left`}>
            <div className="flex items-baseline justify-between border-b-2 border-tostado pb-3">
              <p className="font-heading text-titular leading-none font-bold text-oceano">Comanda</p>
              <p className="text-sm text-tostado/75">Así se pide</p>
            </div>
            <ol>
              {pasos.map(({ titulo, detalle, Icono }, i) => (
                <li
                  key={titulo}
                  data-revela
                  data-paso
                  className="grid grid-cols-[2rem_2.5rem_minmax(0,1fr)] items-start gap-x-3 border-b border-dashed border-tostado/25 py-4 lg:py-3"
                >
                  <span
                    aria-hidden="true"
                    className="grid size-8 place-items-center rounded-full bg-dorado font-heading text-base font-bold text-tostado tabular-nums"
                  >
                    {i + 1}
                  </span>
                  <Icono className="mt-0.5 size-9 text-oceano" strokeWidth={1.5} aria-hidden="true" />
                  <div>
                    <p className="font-heading text-linea leading-snug font-semibold">{titulo}</p>
                    <p className="mt-0.5 text-cuerpo text-pretty text-tostado/80">{detalle}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div
            aria-hidden="true"
            data-revela
            data-sello
            style={{ transform: "rotate(-9deg)" }}
            className="absolute -right-2 -bottom-5 rounded-md border-[3.5px] border-aji-texto bg-crema/90 px-4 pt-1.5 pb-2 text-center text-aji-texto shadow-[0_0_0_4px_var(--crema),0_0_0_5.5px_var(--aji-texto)] sm:-right-8"
          >
            <span className="block font-heading text-display leading-none font-black tracking-[0.06em]">A COCINA</span>
          </div>
        </div>
      </div>

      {/* Escritorio: la tercera columna cierra el relato con la acción; visible siempre, late cuando cae el sello. */}
      <div data-cierre className="hidden self-center text-left lg:block">
        <p className="font-heading text-titular leading-tight font-bold text-balance">
          Así llega tu pedido a la cocina.
        </p>
        <p className="mt-3 max-w-xs text-cuerpo text-pretty text-crema/85">Ahora te toca a ti.</p>
        <div className="relative mt-6 w-fit">
          {/* De la comanda a la acción: la flecha termina justo en el botón. */}
          <Flecha
            d="M4 42C32 14 72 12 102 30"
            punta="M92 20l12 11-15 5"
            className="pointer-events-none absolute top-1/2 right-full mr-1 hidden w-14 -translate-y-1/2 lg:block"
          />
          <PideAhora flecha />
        </div>
      </div>
    </div>
  );
}
