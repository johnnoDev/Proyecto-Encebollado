import type { Metadata } from "next";
import { MenuCliente } from "@/components/menu/menu-cliente";

export const metadata: Metadata = { title: "Carta" };

export default function MenuPage() {
  return <MenuCliente />;
}
