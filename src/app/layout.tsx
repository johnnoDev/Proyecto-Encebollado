import type { Metadata, Viewport } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import { brand, variablesDeColor } from "@/config/brand";
import "./globals.css";

// Títulos con carácter (Fraunces) + texto legible en pantallas pequeñas (DM Sans).
const titulos = Fraunces({
  variable: "--font-titulos",
  subsets: ["latin"],
});

const texto = DM_Sans({
  variable: "--font-texto",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: `${brand.nombre} — ${brand.descriptor}`,
    template: `%s · ${brand.nombre}`,
  },
  description: brand.eslogan,
};

export const viewport: Viewport = {
  themeColor: brand.colores.oceano,
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      style={variablesDeColor}
      className={`${titulos.variable} ${texto.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
