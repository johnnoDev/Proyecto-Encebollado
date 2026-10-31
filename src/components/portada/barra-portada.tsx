"use client";

import { useEffect, useState, ViewTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { brand } from "@/config/brand";
import { cn } from "@/lib/utils";

const SECCIONES = [
  { id: "como-pedir", nombre: "Cómo pedir", corto: null },
  { id: "donde-estamos", nombre: "Dónde estamos", corto: null },
  // Quien evalúa el demo llega a la cocina y al panel desde la primera pantalla.
  { id: "duenos", nombre: "Para dueños", corto: "Dueños" },
] as const;

/** Subrayado de los enlaces: crece desde la izquierda; dorado en la sección donde estás. */
function Subrayado({ activo }: { activo: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "absolute inset-x-3 bottom-2 h-0.5 origin-left rounded-full transition-[scale,background-color] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none",
        activo ? "scale-x-100 bg-dorado" : "scale-x-0 bg-crema/60 group-hover:scale-x-100",
      )}
    />
  );
}

/**
 * Barra superior de la portada. Al bajar se esconde para dejar la página al
 * plato; al subir (o al recibir foco con el teclado) vuelve, ya con fondo
 * océano para leerse sobre cualquier sección.
 */
export function BarraPortada() {
  const [oculta, setOculta] = useState(false);
  const [solida, setSolida] = useState(false);
  const [activa, setActiva] = useState<string | null>(null);

  useEffect(() => {
    let ultimo = window.scrollY;
    let pendiente = false;
    const revisar = () => {
      pendiente = false;
      const y = window.scrollY;
      setSolida(y > 24);
      // Un margen de 6 px evita que tiemble con el rebote del scroll táctil.
      if (Math.abs(y - ultimo) > 6) {
        setOculta(y > ultimo && y > 240);
        ultimo = y;
      }
    };
    const alScroll = () => {
      if (pendiente) return;
      pendiente = true;
      requestAnimationFrame(revisar);
    };
    alScroll();
    window.addEventListener("scroll", alScroll, { passive: true });
    return () => window.removeEventListener("scroll", alScroll);
  }, []);

  useEffect(() => {
    const visibles = new Set<string>();
    const observador = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          if (e.isIntersecting) visibles.add(e.target.id);
          else visibles.delete(e.target.id);
        }
        setActiva(SECCIONES.find((s) => visibles.has(s.id))?.id ?? null);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    for (const s of SECCIONES) {
      const el = document.getElementById(s.id);
      if (el) observador.observe(el);
    }
    return () => observador.disconnect();
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-30 transition-[translate,background-color,box-shadow] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] focus-within:translate-y-0 motion-reduce:transition-none",
        oculta && "-translate-y-full",
        solida ? "bg-oceano shadow-[0_10px_20px_-14px_rgb(0_0_0/0.6)]" : "bg-transparent",
      )}
    >
      <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3 sm:px-6 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
        <p className="flex items-center gap-2.5">
          {/* El símbolo viaja a la barra de la carta al navegar. */}
          <ViewTransition name="marca" share="marca" default="none">
            <Image src="/brand/logo-mark.svg" alt="" width={40} height={40} priority className="size-10" />
          </ViewTransition>
          <span className="font-heading text-plato font-bold">{brand.nombre}</span>
        </p>
        <nav aria-label="Secciones">
          <ul className="flex items-center gap-1 text-sm font-semibold">
            <li>
              <Link href="/menu" transitionTypes={["a-la-carta"]} className="group relative flex h-11 items-center px-3">
                Carta
                <Subrayado activo={false} />
              </Link>
            </li>
            {SECCIONES.map((s) => (
              <li key={s.id} className={cn(!s.corto && "max-sm:hidden")}>
                <a
                  href={`#${s.id}`}
                  aria-current={activa === s.id ? "location" : undefined}
                  className={cn(
                    "group relative flex h-11 items-center px-3 transition-colors",
                    activa === s.id ? "text-crema" : "text-crema/85 hover:text-crema",
                  )}
                >
                  {s.corto ? (
                    <>
                      <span className="sm:hidden">{s.corto}</span>
                      <span className="max-sm:hidden">{s.nombre}</span>
                    </>
                  ) : (
                    s.nombre
                  )}
                  <Subrayado activo={activa === s.id} />
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <p className="hidden min-w-0 items-center justify-self-end gap-2 text-sm text-crema lg:flex">
          <MapPin className="size-4 shrink-0 text-dorado" aria-hidden="true" />
          <span className="truncate">{brand.direccion}</span>
        </p>
      </div>
    </header>
  );
}
