"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import type { Categoria } from "@/types/menu";

export const idSeccion = (categoriaId: string) => `cat-${categoriaId}`;

/** Pestañas fijas: saltan a cada sección y se marcan solas al recorrer la carta. */
export function PestanasCategorias({ categorias }: { categorias: Categoria[] }) {
  const [activa, setActiva] = useState(categorias[0]?.id);

  useEffect(() => {
    const observador = new IntersectionObserver(
      (entradas) => {
        const visible = entradas.find((e) => e.isIntersecting);
        if (visible) setActiva(visible.target.id.replace(/^cat-/, ""));
      },
      { rootMargin: "-35% 0px -60% 0px" },
    );
    categorias.forEach((c) => {
      const el = document.getElementById(idSeccion(c.id));
      if (el) observador.observe(el);
    });
    return () => observador.disconnect();
  }, [categorias]);

  return (
    <nav
      aria-label="Categorías"
      className="sticky top-0 z-30 border-b border-crema/15 bg-oceano shadow-[0_10px_20px_-14px_rgb(0_0_0/0.6)]"
    >
      <motion.ul layoutScroll className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-2 [scrollbar-width:none] sm:px-4">
        {categorias.map((c) => (
          <li key={c.id}>
            <a
              href={`#${idSeccion(c.id)}`}
              aria-current={activa === c.id ? "true" : undefined}
              onClick={() => setActiva(c.id)}
              className={cn(
                "relative flex h-14 items-center px-3 text-cuerpo font-semibold whitespace-nowrap transition-colors",
                activa === c.id ? "text-crema" : "text-crema/65 hover:text-crema",
              )}
            >
              {c.nombre}
              {/* La marca dorada se desliza de una pestaña a otra. */}
              {activa === c.id && (
                <motion.span
                  layoutId="pestana-activa"
                  aria-hidden="true"
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-x-3 bottom-0 h-[3px] rounded-full bg-dorado"
                />
              )}
            </a>
          </li>
        ))}
      </motion.ul>
    </nav>
  );
}
