"use client";

import { motion, useReducedMotion } from "motion/react";

const TINTA = [0.16, 1, 0.3, 1] as const;

const pasos = [
  { titulo: "Escanea el QR de tu mesa", detalle: "La carta se abre con tu mesa ya anotada." },
  { titulo: "Anota tus platos", detalle: "Tamaño, con o sin cebolla, limón y ají aparte." },
  { titulo: "Envía a cocina", detalle: "Sigue tu pedido en el celular hasta que llega a tu mesa." },
];

const papel =
  "bg-crema text-tostado [mask:radial-gradient(circle_at_9px_0,transparent_6px,#000_6.5px)_0_0/18px_100%_repeat-x]";

/**
 * «Cómo pedir» contado como lo que es: una comanda. Las líneas se escriben al
 * entrar en pantalla y al final cae el sello «A COCINA».
 */
export function ComandaComoPedir() {
  const reducir = useReducedMotion();
  return (
    <div className="relative mx-auto mt-10 max-w-md drop-shadow-[0_18px_30px_rgb(0_0_0/0.35)]">
      <div className={`${papel} rounded-b-[14px] px-6 pt-7 pb-8 text-left`}>
        <div className="flex items-baseline justify-between border-b-2 border-tostado pb-3">
          <p className="font-heading text-titular leading-none font-bold text-oceano">Comanda</p>
          <p className="text-sm text-tostado/75">Así se pide</p>
        </div>
        <ol>
          {pasos.map((paso, i) => (
            <motion.li
              key={paso.titulo}
              initial={reducir ? false : { clipPath: "inset(0 100% 0 0)" }}
              whileInView={{ clipPath: "inset(0 0% 0 0)" }}
              viewport={{ once: true, margin: "-15% 0px" }}
              transition={{ duration: 0.8, delay: 0.15 + i * 0.35, ease: TINTA }}
              className="grid grid-cols-[2.25rem_minmax(0,1fr)] border-b border-dashed border-tostado/25 py-4"
            >
              <span aria-hidden="true" className="font-heading text-linea font-bold text-oceano">
                1 ×
              </span>
              <div>
                <p className="font-heading text-linea leading-snug font-semibold">{paso.titulo}</p>
                <p className="mt-0.5 text-cuerpo text-pretty text-tostado/80">{paso.detalle}</p>
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
      <motion.div
        aria-hidden="true"
        initial={reducir ? false : { opacity: 0, scale: 1.9, rotate: -16 }}
        whileInView={{ opacity: 1, scale: 1, rotate: -9 }}
        viewport={{ once: true, margin: "-15% 0px" }}
        transition={
          reducir ? { duration: 0 } : { type: "spring", stiffness: 700, damping: 26, mass: 0.8, delay: 1.45 }
        }
        className="absolute -right-2 -bottom-5 rounded-md border-[3.5px] border-aji-texto bg-crema/90 px-4 pt-1.5 pb-2 text-center text-aji-texto shadow-[0_0_0_4px_var(--crema),0_0_0_5.5px_var(--aji-texto)] sm:-right-8"
      >
        <span className="block font-heading text-display leading-none font-black tracking-[0.06em]">A COCINA</span>
      </motion.div>
    </div>
  );
}
