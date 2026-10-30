import type { Metadata } from "next";
import { ViewTransition } from "react";
import { MenuCliente } from "@/components/menu/menu-cliente";

export const metadata: Metadata = { title: "Carta" };

export default function MenuPage() {
  // Desde la portada, la carta sube como una hoja de papel (ver «a-la-carta» en globals.css).
  return (
    <ViewTransition enter={{ "a-la-carta": "a-la-carta", default: "none" }} default="none">
      <MenuCliente />
    </ViewTransition>
  );
}
