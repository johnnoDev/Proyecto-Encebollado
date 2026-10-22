"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import { fechaPedido, nombresEstadoPedido, pedidosParaMesa } from "@/lib/seguimiento";
import { usePedidos } from "@/store/pedidos";
import type { Pedido } from "@/types/menu";

function FilaPedido({ pedido }: { pedido: Pedido }) {
  return (
    <li>
      <Link
        href={`/pedido/${pedido.id}`}
        aria-label={`Pedido ${pedido.numero}, ${nombresEstadoPedido[pedido.estado]}. Ver pedido`}
        className="flex min-h-16 items-center justify-between gap-4 rounded-lg py-3 transition-colors hover:bg-crema/5"
      >
        <div className="min-w-0">
          <p className="break-words font-heading text-linea font-semibold tabular-nums text-crema">Pedido {pedido.numero}</p>
          <p className="mt-0.5 text-sm text-crema/80">
            {nombresEstadoPedido[pedido.estado]}
            {" · "}
            <time dateTime={new Date(pedido.creadoEn).toISOString()} className="tabular-nums">
              {fechaPedido(pedido.creadoEn)}
            </time>
          </p>
        </div>
        <span className="flex shrink-0 items-center gap-2 text-sm font-semibold text-dorado">
          Ver pedido <ArrowRight className="size-4" aria-hidden="true" />
        </span>
      </Link>
    </li>
  );
}

/** Seguimiento en la carta: el pedido más reciente a la vista; el resto, plegado. */
export function PedidosEnviados({ mesa, montado }: { mesa: string | null | undefined; montado: boolean }) {
  const pedidos = usePedidos((s) => s.pedidos);
  const [abierto, setAbierto] = useState(false);
  if (!montado || mesa === undefined) return null;

  const visibles = pedidosParaMesa(pedidos, mesa);
  if (visibles.length === 0) return null;
  const [reciente, ...anteriores] = visibles;

  return (
    <nav aria-label="Pedidos enviados" className="mx-auto max-w-6xl px-4 pb-2 sm:px-6">
      <ul className="divide-y divide-dashed divide-crema/20 border-y border-dashed border-crema/20">
        <FilaPedido pedido={reciente} />
        {abierto && anteriores.map((p) => <FilaPedido key={p.id} pedido={p} />)}
      </ul>
      {anteriores.length > 0 && (
        <button
          type="button"
          onClick={() => setAbierto((v) => !v)}
          aria-expanded={abierto}
          className="mt-1 flex h-11 items-center gap-1.5 text-sm font-semibold text-crema/80 hover:text-crema"
        >
          {abierto ? "Ver solo el último" : `Ver los ${visibles.length} pedidos`}
          <ChevronDown className={`size-4 transition-transform ${abierto ? "rotate-180" : ""}`} aria-hidden="true" />
        </button>
      )}
      {/* Una sola región anuncia el estado del pedido más reciente cuando cambia. */}
      <p aria-live="polite" className="sr-only">
        Pedido {reciente.numero}: {nombresEstadoPedido[reciente.estado]}
      </p>
    </nav>
  );
}
