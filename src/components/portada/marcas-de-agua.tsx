import { cn } from "@/lib/utils";

// Marcas de agua de la portada: dibujos de línea en crema muy tenue que viven en
// los espacios vacíos del fondo, nunca detrás del texto. Son decorativas.

/** La albacora del logo, grabada: contorno y líneas de buril dentro del cuerpo. */
export function PezGrabado({ className }: { className?: string }) {
  const cuerpo = "M52.6 31c-3-5.6-9.4-9-17.4-9-7.2 0-12.8 3.9-16.4 7.6v2.8c3.6 3.7 9.2 7.6 16.4 7.6 8 0 14.4-3.4 17.4-9z";
  return (
    <svg
      viewBox="10 12 46 38"
      aria-hidden="true"
      focusable="false"
      className={cn("pointer-events-none", className)}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <defs>
        <clipPath id="pez-grabado-cuerpo">
          <path d={cuerpo} />
        </clipPath>
      </defs>
      <g strokeWidth={0.35}>
        <path d="M20.6 29.4C20 25.8 16.8 22 12.6 20c1.8 3.4 2.9 7 3.1 11-.2 4-1.3 7.6-3.1 11 4.2-2 7.4-5.8 8-9.4z" />
        <path d="M37.6 22.6c-1.6-3.4-3.8-6-6.8-7.8.6 2.9.6 5.6-.4 8.4z" />
        <path d="M27 24.9c-1-2.6-2.6-4.6-4.4-5.6.6 2.2.6 4.4 0 7.2zM27 37.1c-1 2.6-2.6 4.6-4.4 5.6.6-2.2.6-4.4 0-7.2z" />
        <path d={cuerpo} />
        <path d="M43.6 25.2c1.7 3.7 1.7 7.9 0 11.6" />
        <path d="M41.8 30.6l-7.4 4.6 7.2-1.6z" />
        <circle cx={47.6} cy={29.4} r={1.1} />
      </g>
      {/* Líneas de buril que siguen la curva del lomo. */}
      <g clipPath="url(#pez-grabado-cuerpo)" strokeWidth={0.18} opacity={0.8}>
        {Array.from({ length: 9 }, (_, i) => (
          <path key={i} d={`M18 ${23.4 + i * 1.7}c8-2.2 22-2.2 36 0`} />
        ))}
      </g>
    </svg>
  );
}

/** Matasellos «Sabor de nuestra costa»: doble anillo, texto y líneas de cancelación. */
export function Matasellos({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 160 100"
      aria-hidden="true"
      focusable="false"
      className={cn("pointer-events-none", className)}
      fill="none"
      stroke="currentColor"
    >
      <circle cx={50} cy={50} r={46} strokeWidth={1.6} />
      <circle cx={50} cy={50} r={40} strokeWidth={0.8} />
      <g
        fill="currentColor"
        stroke="none"
        textAnchor="middle"
        style={{ fontFamily: "var(--font-titulos)", fontWeight: 700, letterSpacing: "0.12em" }}
      >
        <text x={50} y={39} fontSize={11}>
          SABOR
        </text>
        <text x={50} y={54} fontSize={9.5}>
          DE NUESTRA
        </text>
        <text x={50} y={69} fontSize={11}>
          COSTA
        </text>
      </g>
      <g strokeWidth={1.4} strokeLinecap="round">
        {[34, 44, 54, 64].map((y) => (
          <path key={y} d={`M100 ${y}q7.5-6 15 0t15 0 15 0 12 0`} />
        ))}
      </g>
    </svg>
  );
}
