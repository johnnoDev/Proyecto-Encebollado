"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { fechaPedido, nombresEstadoPedido, pedidosParaMesa } from "@/lib/seguimiento";
import { usePedidos } from "@/store/pedidos";

export function PedidosEnviados({ mesa, montado }: { mesa: string | null | undefined; montado: boolean }) {
  const pedidos = usePedidos((s) => s.pedidos);
  if (!montado || mesa === undefined) return null;

  const visibles = pedidosParaMesa(pedidos, mesa);
  if (visibles.length === 0) return null;

  return (
    <nav aria-label="Pedidos enviados" className="mx-auto max-w-6xl px-4 pb-2 sm:px-6">
      <ul className="divide-y divide-dashed divide-crema/20 border-y border-dashed border-crema/20">
        {visibles.map((pedido) => (
          <li key={pedido.id}>
            <Link href={`/pedido/${pedido.id}`} aria-label={`Pedido ${pedido.numero}, ${nombresEstadoPedido[pedido.estado]}. Ver pedido`} className="flex min-h-16 items-center justify-between gap-4 rounded-lg py-3 transition-colors hover:bg-crema/5">
              <div className="min-w-0">
                <p className="break-words font-heading text-linea font-semibold tabular-nums text-crema">Pedido {pedido.numero}</p>
                <p className="mt-0.5 text-sm text-crema/80">
                  <span role="status">{nombresEstadoPedido[pedido.estado]}</span>
                  {" · "}<time dateTime={new Date(pedido.creadoEn).toISOString()} className="tabular-nums">{fechaPedido(pedido.creadoEn)}</time>
                </p>
              </div>
              <span className="flex shrink-0 items-center gap-2 text-sm font-semibold text-dorado">
                Ver pedido <ArrowRight className="size-4" aria-hidden="true" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
