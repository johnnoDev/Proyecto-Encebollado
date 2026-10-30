"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * Una cifra que rueda al cambiar: sube si aumenta, baja si disminuye. El valor
 * nuevo y el que se va comparten celda, así el ancho nunca salta.
 */
export function CifraRodante({ valor, numero, className }: { valor: string; numero: number; className?: string }) {
  const [anterior, setAnterior] = useState(numero);
  const [sentido, setSentido] = useState(1);
  if (numero !== anterior) {
    setSentido(numero > anterior ? 1 : -1);
    setAnterior(numero);
  }

  return (
    <span className={cn("inline-grid overflow-hidden align-bottom", className)}>
      {/* Los lectores de pantalla leen un solo valor, no el que entra y el que sale. */}
      <span className="sr-only">{valor}</span>
      <AnimatePresence initial={false} custom={sentido}>
        <motion.span
          key={valor}
          custom={sentido}
          aria-hidden="true"
          className="col-start-1 row-start-1"
          variants={{
            entra: (s: number) => ({ y: `${70 * s}%`, opacity: 0 }),
            quieta: { y: "0%", opacity: 1 },
            sale: (s: number) => ({ y: `${-70 * s}%`, opacity: 0 }),
          }}
          initial="entra"
          animate="quieta"
          exit="sale"
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        >
          {valor}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
