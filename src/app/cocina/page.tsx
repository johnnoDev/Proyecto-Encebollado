import type { Metadata } from "next";
import { CocinaCliente } from "@/components/cocina/cocina-cliente";

export const metadata: Metadata = { title: "Cocina" };

export default function CocinaPage() {
  return <CocinaCliente />;
}
