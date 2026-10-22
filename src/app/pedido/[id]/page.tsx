import type { Metadata } from "next";
import { Suspense } from "react";
import { PedidoCliente, PedidoCargando } from "@/components/pedido/pedido-cliente";

export const metadata: Metadata = { title: "Tu pedido" };

export default function PedidoPage() {
  return (
    <Suspense fallback={<PedidoCargando />}>
      <PedidoCliente />
    </Suspense>
  );
}
