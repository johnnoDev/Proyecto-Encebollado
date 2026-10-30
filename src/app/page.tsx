import Image from "next/image";
import Link from "next/link";
import { MapPin, Phone } from "lucide-react";
import { BannerPortada } from "@/components/portada/banner-portada";
import { ComandaComoPedir } from "@/components/portada/comanda-como-pedir";
import { EncebolladosDestacados } from "@/components/portada/encebollados-destacados";
import { Ornamento } from "@/components/portada/ornamento";
import { PideAhora } from "@/components/portada/pide-ahora";
import { brand } from "@/config/brand";
import { cn } from "@/lib/utils";

// Borde dentado de la comanda: una superficie de color «se abre» sobre la anterior.
const dentado = "[mask:radial-gradient(circle_at_9px_0,transparent_6px,#000_6.5px)_0_0/18px_100%_repeat-x]";

export default function Portada() {
  const telefono = brand.telefono.replace(/\s/g, "");
  return (
    <div className="bg-oceano text-crema">
      <header className="relative z-20 mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3 sm:px-6 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
        <p className="flex items-center gap-2.5">
          <Image src="/brand/logo-mark.svg" alt="" width={40} height={40} priority className="size-10" />
          <span className="font-heading text-plato font-bold">{brand.nombre}</span>
        </p>
        <nav aria-label="Secciones">
          <ul className="flex items-center gap-1 text-sm font-semibold">
            <li>
              <Link href="/menu" className="flex h-11 items-center rounded-full px-3 hover:bg-crema/10">
                Carta
              </Link>
            </li>
            <li className="max-sm:hidden">
              <a href="#como-pedir" className="flex h-11 items-center rounded-full px-3 hover:bg-crema/10">
                Cómo pedir
              </a>
            </li>
            <li className="max-sm:hidden">
              <a href="#donde-estamos" className="flex h-11 items-center rounded-full px-3 hover:bg-crema/10">
                Dónde estamos
              </a>
            </li>
          </ul>
        </nav>
        <p className="hidden min-w-0 items-center justify-self-end gap-2 text-sm text-crema/80 lg:flex">
          <MapPin className="size-4 shrink-0 text-dorado" aria-hidden="true" />
          <span className="truncate">{brand.direccion}</span>
        </p>
      </header>

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
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:grid lg:grid-cols-2 lg:items-center lg:gap-16">
            {/* Dos fotos del local, apoyadas sobre el papel como recuerdos. */}
            <div className="relative mx-auto h-[19rem] w-full max-w-md sm:h-[24rem] lg:order-2 lg:h-[30rem] lg:max-w-none">
              <figure className="absolute top-0 left-0 w-[80%] -rotate-3 bg-white p-2 pb-9 shadow-[0_14px_28px_-10px_rgb(0_0_0/0.35)]">
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
              <figure className="absolute right-0 bottom-0 w-[44%] rotate-3 bg-white p-2 pb-9 shadow-[0_14px_28px_-10px_rgb(0_0_0/0.35)]">
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
                  <MapPin className="size-7 shrink-0 text-aji-texto lg:mt-0.5" aria-hidden="true" />
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
          </div>
        </section>
      </main>

      <footer className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-8 sm:px-6">
        <Image src="/brand/logo-mark.svg" alt="" width={36} height={36} className="size-9" />
        <p className="text-sm text-crema/75">
          <span className="font-heading text-linea font-bold text-crema">{brand.nombre}</span> · {brand.descriptor}
        </p>
      </footer>
    </div>
  );
}
