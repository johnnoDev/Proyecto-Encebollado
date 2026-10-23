"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";
import { brand } from "@/config/brand";
import { precio } from "@/lib/formato";
import { fechaPedido, indicacionPedidoEntregado, indicacionPedidoListo } from "@/lib/seguimiento";
import { cn } from "@/lib/utils";
import { useMontado } from "@/store/hidratar";
import { usePedidos } from "@/store/pedidos";
import type { EstadoPedido, Pedido } from "@/types/menu";

const estados: { id: EstadoPedido; nombre: string; titulo: string; detalle: string }[] = [
  { id: "nuevo", nombre: "Recibido", titulo: "Tu pedido ya está en cocina", detalle: "Tu pedido quedó anotado. Aquí verás cuando empiecen a prepararlo." },
  { id: "preparando", nombre: "Preparando", titulo: "Ya estamos con tu pedido", detalle: "En cocina están preparando lo que elegiste. El estado se actualizará aquí." },
  { id: "listo", nombre: "Listo", titulo: "¡Tu pedido está listo!", detalle: "Todo lo que anotaste en tu pedido está listo." },
  { id: "entregado", nombre: "Entregado", titulo: "¡Buen provecho!", detalle: "Tu pedido ya fue entregado. Gracias por elegirnos." },
];

function MarcoPedido({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-oceano text-crema">
      <header className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-5 sm:px-6 sm:py-7">
        <Image src="/brand/logo-mark.svg" alt="" width={44} height={44} priority className="size-11 shrink-0" />
        <div>
          <p className="font-heading text-titulo font-bold leading-none">{brand.nombre}</p>
          <p className="mt-1 text-nota text-crema/75">{brand.descriptor}</p>
        </div>
      </header>
      {children}
    </div>
  );
}

export function PedidoCargando() {
  return (
    <MarcoPedido>
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16" aria-busy="true">
        <h1 className="font-heading text-titular font-bold">Buscando tu pedido…</h1>
        <p role="status" className="mt-3 text-cuerpo text-crema/80">Un momento, estamos cargando tu pedido.</p>
      </main>
    </MarcoPedido>
  );
}

export function PedidoCliente() {
  const { id } = useParams<{ id: string }>();
  const montado = useMontado();
  const pedido = usePedidos((s) => s.pedidos.find((p) => p.id === id));

  // No mostrar «no encontrado» durante el primer render de hidratación.
  if (!montado) return <PedidoCargando />;

  if (!pedido) {
    return (
      <MarcoPedido>
        <main className="mx-auto max-w-xl px-4 pt-12 pb-16 sm:px-6 sm:pt-20">
          <h1 className="font-heading text-display font-bold leading-tight text-balance">No encontramos este pedido</h1>
          <p className="mt-5 text-cuerpo leading-relaxed text-crema/80">
            Este pedido no está guardado en este navegador. Si lo hiciste desde otro, abre el enlace allí.
          </p>
          <p className="mt-3 text-cuerpo leading-relaxed text-crema/80">También puedes volver a la carta para hacer un pedido.</p>
          <VolverCarta href="/menu" className="mt-8" />
        </main>
      </MarcoPedido>
    );
  }

  const indice = estados.findIndex((e) => e.id === pedido.estado);
  const estado = estados[indice];
  const carta = pedido.modalidad === "mesa" && pedido.mesa ? `/menu?mesa=${encodeURIComponent(pedido.mesa)}` : "/menu";

  return (
    <MarcoPedido>
      <main className="mx-auto grid max-w-5xl items-start gap-8 px-4 pt-5 pb-12 sm:px-6 sm:pt-10 sm:pb-16 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-14 lg:pt-16">
        <section aria-label="Estado del pedido" className="lg:pt-5">
          <div role="status" aria-live="polite" aria-atomic="true">
            <h1 className="max-w-md font-heading text-display font-bold leading-[1.1] tracking-[-0.02em] text-balance">{estado.titulo}</h1>
            <p className="mt-4 max-w-sm text-cuerpo leading-relaxed text-crema/80">{pedido.estado === "listo" ? indicacionPedidoListo(pedido) : pedido.estado === "entregado" ? indicacionPedidoEntregado(pedido) : estado.detalle}</p>
          </div>
          <ol aria-label="Progreso del pedido" className="mt-7 flex lg:mt-9 lg:flex-col lg:gap-5">
            {estados.map((paso, i) => (
              <li key={paso.id} aria-current={i === indice ? "step" : undefined} className="flex min-w-0 flex-1 flex-col items-center gap-1.5 text-center lg:flex-none lg:flex-row lg:gap-3 lg:text-left">
                <span aria-hidden="true" className={cn("flex size-7 shrink-0 items-center justify-center rounded-full border", i <= indice ? "border-dorado bg-dorado text-oceano" : "border-crema/40 text-crema/75")}>
                  {i <= indice ? <Check className="size-4" strokeWidth={2.5} /> : <span className="size-1.5 rounded-full bg-current" />}
                </span>
                <span className={cn("text-xs sm:text-sm", i <= indice ? "font-semibold text-crema" : "text-crema/75")}>{paso.nombre}</span>
              </li>
            ))}
          </ol>
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-crema/80">
            Si necesitas corregir algo, avisa al personal con el número de tu pedido.
          </p>
        </section>

        <div className="min-w-0 drop-shadow-[0_18px_30px_rgb(0_0_0/0.35)]">
          <section aria-labelledby="numero-pedido" data-superficie="clara" className="rounded-b-[14px] bg-crema px-5 pt-7 pb-5 text-tostado [mask:radial-gradient(circle_at_9px_0,transparent_6px,#000_6.5px)_0_0/18px_100%_repeat-x] sm:px-6 sm:pb-6">
            <header className="flex flex-wrap items-start justify-between gap-3 border-b-2 border-tostado pb-4">
              <div className="min-w-0">
                <h2 id="numero-pedido" className="break-words font-heading text-titular font-bold tabular-nums text-oceano">{pedido.numero}</h2>
                <p className="mt-1 text-sm text-tostado/75">Tu pedido · <HoraPedido creadoEn={pedido.creadoEn} /></p>
              </div>
              <span className="mt-1 -rotate-3 rounded-[5px] border-2 border-oceano px-2.5 py-1 font-heading text-linea font-bold tabular-nums text-oceano">
                {pedido.modalidad === "mesa" ? (pedido.mesa ? `Mesa ${pedido.mesa}` : "En mesa") : pedido.modalidad === "llevar" ? "Para llevar" : "Retiro"}
              </span>
            </header>

            <ul aria-label="Platos del pedido" className="divide-y divide-dashed divide-tostado/25">
              {pedido.lineas.map((linea) => (
                <li key={linea.lineaId} className="grid grid-cols-[auto_minmax(0,1fr)_auto] gap-x-2 py-4">
                  <span className="font-heading text-linea font-semibold whitespace-nowrap tabular-nums text-oceano"><span className="sr-only">Cantidad: </span>{linea.cantidad}<span aria-hidden="true"> ×</span></span>
                  <div className="min-w-0">
                    <p className="break-words font-heading text-linea font-semibold">{linea.nombre}</p>
                    {linea.detalle && <p className="mt-1 break-words text-sm text-tostado/75">{linea.detalle}</p>}
                    {linea.cantidad > 1 && <p className="mt-1 text-xs tabular-nums text-tostado/70">{precio(linea.precioUnitario)} c/u</p>}
                  </div>
                  <p className="font-heading text-linea font-semibold whitespace-nowrap tabular-nums">{precio(linea.precioUnitario * linea.cantidad)}</p>
                </li>
              ))}
            </ul>

            <div className="flex items-baseline justify-between gap-4 border-t-2 border-tostado pt-4 font-heading text-titulo font-bold text-oceano">
              <p>Total</p>
              <p className="tabular-nums">{precio(pedido.total)}</p>
            </div>
            <p className="mt-4 text-center text-sm text-tostado/75">Gracias por pedir en {brand.nombre}.</p>
            <VolverCarta href={carta} className="mt-5" />
          </section>
        </div>
      </main>
    </MarcoPedido>
  );
}

function HoraPedido({ creadoEn }: Pick<Pedido, "creadoEn">) {
  return <time dateTime={new Date(creadoEn).toISOString()} className="tabular-nums">{fechaPedido(creadoEn)}</time>;
}

function VolverCarta({ href, className }: { href: string; className?: string }) {
  return (
    <Link href={href} className={cn("flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-aji-texto px-5 py-3 text-base font-semibold text-white transition-colors hover:bg-[color-mix(in_oklab,var(--aji-texto)_88%,black)]", className)}>
      <ArrowLeft className="size-4 shrink-0" aria-hidden="true" />
      Volver a la carta
    </Link>
  );
}
