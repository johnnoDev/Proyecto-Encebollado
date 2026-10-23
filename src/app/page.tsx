import Image from "next/image";
import Link from "next/link";
import { MapPin, Phone } from "lucide-react";
import { ComandaComoPedir } from "@/components/portada/comanda-como-pedir";
import { EncebolladosDestacados } from "@/components/portada/encebollados-destacados";
import { Ornamento } from "@/components/portada/ornamento";
import { brand } from "@/config/brand";
import { cn } from "@/lib/utils";

// Borde dentado de la comanda: una superficie de color «se abre» sobre la anterior.
const dentado = "[mask:radial-gradient(circle_at_9px_0,transparent_6px,#000_6.5px)_0_0/18px_100%_repeat-x]";

function PideAhora({ className }: { className?: string }) {
  return (
    <Link
      href="/menu"
      className={cn(
        "inline-flex h-14 items-center justify-center rounded-2xl bg-aji-texto px-9 text-base font-semibold text-white shadow-[0_8px_22px_-8px_color-mix(in_oklab,var(--aji)_80%,transparent)] transition-[transform,background-color] duration-150 hover:bg-[color-mix(in_oklab,var(--aji-texto)_88%,black)] motion-safe:active:scale-[0.98]",
        className,
      )}
    >
      Pide ahora
    </Link>
  );
}

export default function Portada() {
  const telefono = brand.telefono.replace(/\s/g, "");
  return (
    <div className="bg-oceano text-crema">
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <p className="flex min-w-0 items-center gap-2 text-sm text-crema/80">
          <MapPin className="size-4 shrink-0 text-dorado" aria-hidden="true" />
          <span className="truncate">{brand.direccion}</span>
        </p>
        <nav aria-label="Secciones" className="shrink-0">
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
      </header>

      <main>
        {/* Portada: el local recibe; la acción está a la vista. */}
        <section className="mx-auto flex min-h-[calc(100svh-76px)] max-w-3xl flex-col items-center justify-center px-4 pt-6 pb-20 text-center sm:px-6">
          {/* El símbolo en arco y el nombre en crema: el logo completo está dibujado para papel claro. */}
          <Image
            src="/brand/logo-mark.svg"
            alt=""
            width={64}
            height={64}
            priority
            className="size-28 sm:size-32"
          />
          <h1 className="mt-6">
            <span className="block font-heading text-portada font-bold tracking-[-0.02em]">{brand.nombre}</span>
            <span className="mt-3 block text-sm font-semibold tracking-[0.3em] text-dorado uppercase">
              {brand.descriptor}
            </span>
          </h1>
          <Ornamento className="mt-7" />
          <p className="mt-6 font-heading text-titulo text-balance">{brand.bienvenida}</p>
          <p className="mt-3 max-w-md text-linea text-pretty text-crema/80">{brand.eslogan}.</p>
          <div className="mt-9 flex flex-col items-center gap-4 sm:flex-row">
            <PideAhora />
            <a
              href="#como-pedir"
              className="flex h-12 items-center px-3 text-cuerpo font-semibold text-crema underline decoration-dorado/60 decoration-2 underline-offset-[6px] hover:decoration-dorado"
            >
              ¿Cómo se pide?
            </a>
          </div>
        </section>

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
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
            <h2 id="titulo-donde" className="font-heading text-display font-bold text-oceano">
              Dónde estamos
            </h2>
            <Ornamento className="mx-auto mt-4" />
            <address className="mt-8 flex flex-col items-center gap-4 not-italic">
              <p className="flex flex-col items-center gap-2 font-heading text-titulo leading-snug font-semibold text-balance text-oceano">
                <MapPin className="size-7 shrink-0 text-aji-texto" aria-hidden="true" />
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
