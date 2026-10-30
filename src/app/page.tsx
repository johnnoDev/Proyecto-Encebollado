import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ChefHat, MapPin, Phone, SlidersHorizontal } from "lucide-react";
import { ViewTransition } from "react";
import { BannerPortada } from "@/components/portada/banner-portada";
import { BarraPortada } from "@/components/portada/barra-portada";
import { ComandaComoPedir } from "@/components/portada/comanda-como-pedir";
import { EncebolladosDestacados } from "@/components/portada/encebollados-destacados";
import { MovimientoLocal } from "@/components/portada/movimiento-local";
import { Ornamento } from "@/components/portada/ornamento";
import { PideAhora } from "@/components/portada/pide-ahora";
import { brand } from "@/config/brand";
import { cn } from "@/lib/utils";

// Borde dentado de la comanda: una superficie de color «se abre» sobre la anterior.
const dentado = "[mask:radial-gradient(circle_at_9px_0,transparent_6px,#000_6.5px)_0_0/18px_100%_repeat-x]";

export default function Portada() {
  const telefono = brand.telefono.replace(/\s/g, "");
  return (
    // Al ir a la carta, la portada se aparta hacia arriba (ver «a-la-carta» en globals.css).
    <ViewTransition exit={{ "a-la-carta": "a-la-carta", default: "none" }} default="none">
    <div className="bg-oceano text-crema">
      <BarraPortada />

      <main>
        <BannerPortada />

        {/* El papel de la comanda se abre sobre el océano. */}
        <section aria-labelledby="los-encebollados" className={cn(dentado, "bg-crema pt-16 pb-20 text-tostado sm:pt-20")}>
          <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
            <h2 id="los-encebollados" className="font-heading text-display font-bold text-oceano">
              Los encebollados
            </h2>
            <Ornamento className="mx-auto mt-4" />
            <p className="mx-auto mt-4 max-w-md text-cuerpo text-pretty text-tostado/80">
              Caldo de albacora, yuca, cebolla curtida y culantro. Elige el tuyo.
            </p>
            <EncebolladosDestacados />
          </div>
        </section>

        <section
          id="como-pedir"
          aria-labelledby="titulo-como-pedir"
          className={cn(dentado, "-mt-px scroll-mt-4 overflow-x-clip bg-oceano pt-16 pb-24 sm:pt-20")}
        >
          <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
            <h2 id="titulo-como-pedir" className="font-heading text-display font-bold">
              Cómo pedir
            </h2>
            <Ornamento className="mx-auto mt-4" />
            <p className="mx-auto mt-4 max-w-md text-cuerpo text-pretty text-crema/80">
              Sin esperar al mesero: desde tu celular, en tu mesa.
            </p>
            <ComandaComoPedir />
            <PideAhora className="mt-16" />
          </div>
        </section>

        <section
          id="donde-estamos"
          aria-labelledby="titulo-donde"
          className={cn(dentado, "-mt-px scroll-mt-4 bg-crema pt-16 pb-20 text-tostado sm:pt-20")}
        >
          <MovimientoLocal className="mx-auto max-w-6xl px-4 sm:px-6 lg:grid lg:grid-cols-2 lg:items-center lg:gap-16">
            {/* Dos fotos del local, apoyadas sobre el papel como recuerdos. */}
            <div data-fotos-local className="relative mx-auto h-[19rem] w-full max-w-md sm:h-[24rem] lg:order-2 lg:h-[30rem] lg:max-w-none">
              <figure data-foto-local className="absolute top-0 left-0 w-[80%] -rotate-3 bg-white transition-[rotate] duration-500 ease-out hover:rotate-0 p-2 pb-9 shadow-[0_14px_28px_-10px_rgb(0_0_0/0.35)]">
                <Image
                  src="/local/servicio.webp"
                  alt="Un comensal sonríe al recibir su encebollado en la mesa"
                  width={848}
                  height={630}
                  sizes="(min-width: 1024px) 27rem, 80vw"
                  className="h-auto w-full"
                />
                <figcaption className="absolute bottom-2.5 left-3 font-heading text-sm text-tostado/75">
                  A la mesa
                </figcaption>
              </figure>
              <figure data-foto-local className="absolute right-0 bottom-0 w-[44%] rotate-3 bg-white transition-[rotate] duration-500 ease-out hover:rotate-0 p-2 pb-9 shadow-[0_14px_28px_-10px_rgb(0_0_0/0.35)]">
                <Image
                  src="/local/cocina.webp"
                  alt="En la cocina se sirven los encebollados del día"
                  width={758}
                  height={936}
                  sizes="(min-width: 1024px) 15rem, 44vw"
                  className="h-auto w-full"
                />
                <figcaption className="absolute bottom-2.5 left-3 font-heading text-sm text-tostado/75">
                  En la cocina
                </figcaption>
              </figure>
            </div>

            <div className="mt-14 text-center lg:order-1 lg:mt-0 lg:text-left">
              <h2 id="titulo-donde" className="font-heading text-display font-bold text-oceano">
                Dónde estamos
              </h2>
              <Ornamento className="mx-auto mt-4 lg:mx-0" />
              <address className="mt-8 flex flex-col items-center gap-4 not-italic lg:items-start">
                <p className="flex flex-col items-center gap-2 font-heading text-titulo leading-snug font-semibold text-balance text-oceano lg:flex-row lg:items-start">
                  <MapPin data-pin className="size-7 shrink-0 text-aji-texto lg:mt-0.5" aria-hidden="true" />
                  {brand.direccion}
                </p>
                <a
                  href={`tel:${telefono}`}
                  className="flex h-12 items-center gap-2 rounded-full border border-tostado/20 px-5 text-cuerpo font-semibold text-tostado transition-colors hover:border-oceano/50"
                >
                  <Phone className="size-4 text-aji-texto" aria-hidden="true" />
                  {brand.telefono}
                </a>
              </address>
              <p className="mt-10 text-cuerpo text-pretty text-tostado/80">¿Ya estás en tu mesa? Escanea el QR o:</p>
              <PideAhora className="mt-4" />
            </div>
          </MovimientoLocal>
        </section>

        {/* Para quien evalúa el demo: la otra mitad del producto, a un toque. */}
        <section
          aria-labelledby="titulo-duenos"
          className={cn(dentado, "-mt-px bg-oceano pt-16 pb-16 sm:pt-20")}
        >
          <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
            <div>
              <h2 id="titulo-duenos" className="font-heading text-display font-bold text-balance">
                ¿Tienes un restaurante?
              </h2>
              <Ornamento className="mt-4" />
              <p className="mt-5 max-w-md text-linea text-pretty text-crema/80">
                Esto es lo que ve tu equipo mientras tus clientes piden desde la mesa.
              </p>
              <p className="mt-6 max-w-md font-heading text-titulo leading-snug text-balance text-dorado">
                Abre la cocina en otra pestaña, pide algo en{" "}
                <Link
                  href="/menu"
                  transitionTypes={["a-la-carta"]}
                  className="underline decoration-dorado/50 decoration-2 underline-offset-[5px] hover:decoration-dorado"
                >
                  la carta
                </Link>{" "}
                y míralo llegar.
              </p>
            </div>
            <ul className="lg:pt-2">
              {[
                {
                  href: "/cocina",
                  nombre: "La cocina",
                  detalle: "Cada pedido llega al instante con su mesa, y pasa de nuevo a listo y entregado.",
                  Icono: ChefHat,
                },
                {
                  href: "/admin",
                  nombre: "El panel del local",
                  detalle: "Cambia precios y marca platos agotados; la carta se actualiza en el momento.",
                  Icono: SlidersHorizontal,
                },
              ].map(({ href, nombre, detalle, Icono }) => (
                <li key={href} className="border-b border-dashed border-crema/20 first:border-t">
                  <a
                    href={href}
                    target="_blank"
                    className="group grid grid-cols-[2.5rem_minmax(0,1fr)_auto] items-start gap-4 py-6"
                  >
                    <Icono className="mt-1 size-7 text-dorado" aria-hidden="true" />
                    <span>
                      <span className="block font-heading text-titular leading-tight font-bold">{nombre}</span>
                      <span className="mt-1.5 block text-cuerpo text-pretty text-crema/80">{detalle}</span>
                      <span className="sr-only"> (se abre en otra pestaña)</span>
                    </span>
                    <ArrowUpRight
                      className="mt-1.5 size-6 text-crema/70 transition-[translate,color] duration-300 ease-out group-hover:text-dorado motion-safe:group-hover:translate-x-1 motion-safe:group-hover:-translate-y-1"
                      aria-hidden="true"
                    />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <footer className="mx-auto flex max-w-6xl items-center gap-3 border-t border-crema/15 px-4 py-8 sm:px-6">
        <Image src="/brand/logo-mark.svg" alt="" width={36} height={36} className="size-9" />
        <p className="text-sm text-crema/75">
          <span className="font-heading text-linea font-bold text-crema">{brand.nombre}</span> · {brand.descriptor}
        </p>
      </footer>
    </div>
    </ViewTransition>
  );
}
