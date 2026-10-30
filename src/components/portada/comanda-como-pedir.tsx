"use client";

import { useRef } from "react";
import Image from "next/image";
import { CONDICIONES, gsap, TINTA, useGSAP } from "@/lib/gsap";

const pasos = [
  { titulo: "Escanea el QR de tu mesa", detalle: "La carta se abre con tu mesa ya anotada." },
  { titulo: "Anota tus platos", detalle: "Tamaño, con o sin cebolla, limón y ají aparte." },
  { titulo: "Envía a cocina", detalle: "Sigue tu pedido en el celular hasta que llega a tu mesa." },
];

const papel =
  "bg-crema text-tostado [mask:radial-gradient(circle_at_9px_0,transparent_6px,#000_6.5px)_0_0/18px_100%_repeat-x]";

const ESCRITA = "inset(0 0% 0 0)";
const EN_BLANCO = "inset(0 100% 0 0)";

/**
 * «Cómo pedir» contado como lo que es: una comanda que la mesera presenta.
 *
 * Movimiento (GSAP, solo con movimiento permitido):
 * - Escritorio: el conjunto se fija mientras bajas y cada tramo de scroll
 *   escribe un paso; al llegar al final cae el sello «A COCINA» (no ligado al
 *   scroll: es un golpe). Sin snap: el scroll nunca se secuestra.
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
          const relato = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: raiz.current,
              start: "center center",
              end: "+=120%",
              pin: true,
              scrub: 0.5,
              // El golpe del sello va aparte: cae al terminar de escribir y se levanta si vuelves.
              onUpdate: (st) => {
                if (st.progress > 0.86 && sello.progress() === 0) sello.play();
                else if (st.progress < 0.7 && sello.progress() > 0) sello.reverse();
              },
            },
          });
          lineas.forEach((linea, i) => {
            relato.fromTo(linea, { clipPath: EN_BLANCO }, { clipPath: ESCRITA, duration: 1 }, i * 1.15);
          });
          // La mesera se acerca a la mesa a medida que se completa el pedido.
          relato.fromTo(q("[data-mesera]"), { x: -18 }, { x: 14, duration: lineas.length * 1.15 }, 0);
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
      className="mt-10 lg:grid lg:grid-cols-[minmax(0,1fr)_28rem_minmax(0,1fr)] lg:items-end lg:gap-10"
    >
      {/* La mesera presenta el encebollado; en celular asoma detrás de la comanda. */}
      <div
        data-mesera
        className="relative mx-auto h-56 w-52 overflow-hidden lg:mx-0 lg:h-[34rem] lg:w-auto lg:justify-self-end lg:overflow-visible"
      >
        <Image
          src="/local/mesera.webp"
          alt="Una mesera de La Albacora presenta un encebollado recién servido"
          width={404}
          height={1100}
          sizes="(min-width: 1024px) 200px, 208px"
          className="h-auto w-52 lg:h-full lg:w-auto"
        />
      </div>

      <div className="relative z-10 mx-auto -mt-6 max-w-md drop-shadow-[0_18px_30px_rgb(0_0_0/0.35)] lg:mt-0 lg:mb-6">
        <div className={`${papel} rounded-b-[14px] px-6 pt-7 pb-8 text-left`}>
          <div className="flex items-baseline justify-between border-b-2 border-tostado pb-3">
            <p className="font-heading text-titular leading-none font-bold text-oceano">Comanda</p>
            <p className="text-sm text-tostado/75">Así se pide</p>
          </div>
          <ol>
            {pasos.map((paso) => (
              <li
                key={paso.titulo}
                data-revela
                data-paso
                className="grid grid-cols-[2.25rem_minmax(0,1fr)] border-b border-dashed border-tostado/25 py-4"
              >
                <span aria-hidden="true" className="font-heading text-linea font-bold text-oceano">
                  1 ×
                </span>
                <div>
                  <p className="font-heading text-linea leading-snug font-semibold">{paso.titulo}</p>
                  <p className="mt-0.5 text-cuerpo text-pretty text-tostado/80">{paso.detalle}</p>
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
  );
}
