import type { CSSProperties } from "react";

// Ilustraciones vectoriales planas, vistas desde arriba, mientras no haya
// fotografías. Todos los colores salen de las variables de marca.
// `b` es un token de marca («crema»), «transparent» o una mezcla ya armada.
const mezcla = (a: string, pa: number, b: string) =>
  `color-mix(in oklab, var(--${a}) ${pa}%, ${b === "transparent" || b.startsWith("color-mix") ? b : `var(--${b})`})`;

const C = {
  crema: "var(--crema)",
  borde: mezcla("crema", 84, "tostado"),
  caldo: mezcla("dorado", 62, "aji"),
  caldoClaro: mezcla("dorado", 80, "crema"),
  yuca: mezcla("crema", 76, "dorado"),
  yucaBorde: mezcla("dorado", 55, "tostado"),
  albacora: mezcla("crema", 66, "tostado"),
  cebolla: "var(--rosa)",
  tomate: "var(--aji)",
  cilantro: "var(--cilantro)",
  camaron: mezcla("aji", 48, "crema"),
  camaronBorde: mezcla("aji", 70, "tostado"),
  sombra: mezcla("tostado", 55, "transparent"),
  platoInt: mezcla("crema", 93, "tostado"),
  chifle: mezcla("dorado", 85, "crema"),
  chifleBorde: mezcla("dorado", 60, "tostado"),
  pan: mezcla("dorado", 55, "tostado"),
  panLuz: mezcla("dorado", 70, "crema"),
  palta: mezcla("cilantro", 35, mezcla("dorado", 45, "crema")),
  cascara: mezcla("cilantro", 55, "tostado"),
  pepa: mezcla("tostado", 70, "aji"),
  vidrio: mezcla("crema", 55, "transparent"),
  hielo: mezcla("crema", 45, "transparent"),
  naranjilla: mezcla("dorado", 72, "cilantro"),
  gaseosa: mezcla("tostado", 78, "aji"),
  agua: mezcla("oceano", 22, "crema"),
  burbuja: mezcla("crema", 55, "transparent"),
} as const;

const f = (fill: string): { style: CSSProperties } => ({ style: { fill } });
const s = (stroke: string, width: number): { style: CSSProperties } => ({
  style: { fill: "none", stroke, strokeWidth: width, strokeLinecap: "round" },
});

function Camaron({ x, y, r = 0, k = 1 }: { x: number; y: number; r?: number; k?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${k})`}>
      <path d="M-6.5 3.5A7.5 7.5 0 1 1 5.5 5.5" {...s(C.camaronBorde, 8)} />
      <path d="M-6.5 3.5A7.5 7.5 0 1 1 5.5 5.5" {...s(C.camaron, 5.6)} />
      <path d="M5.5 5.5l5 1.5-2.4 3.6z" style={{ fill: C.camaron, stroke: C.camaronBorde, strokeWidth: 1.2, strokeLinejoin: "round" }} />
      <path d="M-3.4-4.8l1.6 3M1.4-6.6l.4 3.2M5.6-3.8l-1.6 2.6" {...s(C.crema, 1.1)} opacity={0.75} />
    </g>
  );
}

function Yuca({ x, y, r, w = 17, h = 11 }: { x: number; y: number; r: number; w?: number; h?: number }) {
  return (
    <rect
      x={-w / 2}
      y={-h / 2}
      width={w}
      height={h}
      rx={3.5}
      transform={`translate(${x} ${y}) rotate(${r})`}
      style={{ fill: C.yuca, stroke: C.yucaBorde, strokeWidth: 1.2 }}
    />
  );
}

function Pescado({ x, y, r }: { x: number; y: number; r: number }) {
  return <rect x={-8} y={-5.5} width={16} height={11} rx={5} transform={`translate(${x} ${y}) rotate(${r})`} {...f(C.albacora)} />;
}

function Cebolla({ x, y, rx, ry, r }: { x: number; y: number; rx: number; ry: number; r: number }) {
  return <ellipse cx={0} cy={0} rx={rx} ry={ry} transform={`translate(${x} ${y}) rotate(${r})`} {...s(C.cebolla, 2.6)} />;
}

function Culantro({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`} {...f(C.cilantro)}>
      <circle cx={0} cy={0} r={2.4} />
      <circle cx={3.4} cy={-1.6} r={2} />
      <circle cx={1.4} cy={3} r={1.9} />
    </g>
  );
}

function Tomate({ x, y, r }: { x: number; y: number; r: number }) {
  return <rect x={-2.4} y={-2.4} width={4.8} height={4.8} rx={1} transform={`translate(${x} ${y}) rotate(${r})`} {...f(C.tomate)} />;
}

function Encebollado({ variante }: { variante: "albacora" | "mixto" | "camaron" }) {
  return (
    <>
      <circle cx={62} cy={64} r={53} {...f(C.sombra)} />
      <circle cx={60} cy={60} r={54} {...f(C.crema)} />
      <circle cx={60} cy={60} r={46} {...f(C.borde)} />
      <circle cx={60} cy={60} r={43} {...f(C.caldo)} />
      <ellipse cx={48} cy={46} rx={16} ry={9} transform="rotate(-30 48 46)" {...f(C.caldoClaro)} opacity={0.35} />
      <Yuca x={42} y={58} r={-24} />
      <Yuca x={73} y={74} r={18} w={19} />
      <Yuca x={62} y={37} r={8} w={15} h={10} />
      {variante !== "camaron" && (
        <>
          <Pescado x={76} y={52} r={-12} />
          <Pescado x={50} y={78} r={20} />
          {variante === "albacora" && <Pescado x={60} y={60} r={-35} />}
        </>
      )}
      {variante !== "albacora" && (
        <>
          <Camaron x={60} y={59} r={-20} />
          {variante === "camaron" && <Camaron x={77} y={52} r={60} k={0.9} />}
          {variante === "camaron" && <Camaron x={48} y={79} r={150} k={0.95} />}
          <Camaron x={41} y={41} r={110} k={0.85} />
        </>
      )}
      <Cebolla x={48} y={42} rx={8.5} ry={5.5} r={-18} />
      <Cebolla x={79} y={64} rx={8} ry={5} r={30} />
      <Cebolla x={62} y={86} rx={9} ry={5.5} r={-6} />
      <Cebolla x={34} y={70} rx={6.5} ry={4.5} r={40} />
      <Cebolla x={70} y={40} rx={6} ry={4} r={-40} />
      <Tomate x={55} y={48} r={20} />
      <Tomate x={84} y={47} r={-10} />
      <Tomate x={38} y={84} r={35} />
      <Tomate x={68} y={67} r={5} />
      <Culantro x={51} y={66} />
      <Culantro x={74} y={34} />
      <Culantro x={33} y={53} />
      <Culantro x={82} y={80} />
    </>
  );
}

function Plato({ children }: { children: React.ReactNode }) {
  return (
    <>
      <circle cx={62} cy={64} r={53} {...f(C.sombra)} />
      <circle cx={60} cy={60} r={54} {...f(C.crema)} />
      <circle cx={60} cy={60} r={42} {...f(C.platoInt)} />
      {children}
    </>
  );
}

function Vaso({ liquido, hielo, burbujas }: { liquido: string; hielo?: boolean; burbujas?: boolean }) {
  return (
    <>
      <circle cx={62} cy={64} r={42} {...f(C.sombra)} />
      <circle cx={60} cy={60} r={42} {...f(C.vidrio)} />
      <circle cx={60} cy={60} r={36} {...f(liquido)} />
      {hielo && (
        <g {...f(C.hielo)}>
          <rect x={44} y={42} width={15} height={15} rx={3} transform="rotate(14 51 49)" />
          <rect x={62} y={58} width={14} height={14} rx={3} transform="rotate(-10 69 65)" />
          <rect x={45} y={64} width={12} height={12} rx={3} transform="rotate(30 51 70)" />
        </g>
      )}
      {burbujas && (
        <g {...f(C.burbuja)}>
          <circle cx={72} cy={44} r={2} />
          <circle cx={78} cy={52} r={1.4} />
          <circle cx={40} cy={58} r={1.6} />
          <circle cx={66} cy={80} r={1.8} />
          <circle cx={52} cy={84} r={1.2} />
        </g>
      )}
      <path d="M60 60L101 19" {...s("var(--aji)", 5)} />
      <circle cx={60} cy={60} r={3.2} {...f(mezcla("aji", 70, "tostado"))} />
      <circle cx={60} cy={60} r={41} {...s(C.crema, 2)} opacity={0.7} />
    </>
  );
}

function Contenido({ platoId }: { platoId: string }) {
  switch (platoId) {
    case "encebollado-albacora":
      return <Encebollado variante="albacora" />;
    case "encebollado-mixto":
      return <Encebollado variante="mixto" />;
    case "encebollado-camaron":
      return <Encebollado variante="camaron" />;
    case "chifles":
      return (
        <Plato>
          {[
            [44, 44, 13, 12],
            [70, 40, 12.5, -20],
            [82, 62, 12, 30],
            [38, 68, 12.5, -35],
            [62, 84, 12.5, 10],
            [58, 60, 13.5, 0],
            [74, 78, 11, 50],
            [46, 86, 10.5, -10],
            [32, 50, 10, 25],
          ].map(([x, y, r, g]) => (
            <ellipse
              key={`${x}-${y}`}
              cx={x}
              cy={y}
              rx={r}
              ry={r * 0.88}
              transform={`rotate(${g} ${x} ${y})`}
              style={{ fill: C.chifle, stroke: C.chifleBorde, strokeWidth: 1.4 }}
            />
          ))}
        </Plato>
      );
    case "pan":
      return (
        <Plato>
          {[
            [46, 52, -20],
            [74, 70, 15],
          ].map(([x, y, r]) => (
            <g key={x} transform={`translate(${x} ${y}) rotate(${r})`}>
              <ellipse rx={25} ry={18} {...f(C.pan)} />
              <ellipse cx={-3} cy={-4} rx={18} ry={11} {...f(C.panLuz)} />
              <path d="M-12 -2q12 -7 24 0" {...s(C.pan, 2.2)} />
            </g>
          ))}
        </Plato>
      );
    case "yuca":
      return (
        <Plato>
          <Yuca x={44} y={48} r={-30} w={36} h={20} />
          <Yuca x={76} y={54} r={22} w={34} h={19} />
          <Yuca x={56} y={78} r={-5} w={38} h={20} />
          <Culantro x={70} y={78} />
        </Plato>
      );
    case "aguacate":
      return (
        <Plato>
          {[
            [47, 58, -25],
            [73, 62, 25],
          ].map(([x, y, r]) => (
            <g key={x} transform={`translate(${x} ${y}) rotate(${r})`}>
              <path d="M0-24c9 0 15 12 15 25s-7 21-15 21-15-8-15-21 6-25 15-25z" {...f(C.cascara)} />
              <path d="M0-20c7 0 12 10 12 21S6 18 0 18s-12-6-12-17 5-21 12-21z" {...f(C.palta)} />
              <circle cx={0} cy={4} r={7} {...f(C.pepa)} />
            </g>
          ))}
        </Plato>
      );
    case "camarones-adicionales":
      return (
        <Plato>
          <Camaron x={46} y={46} r={-30} k={1.3} />
          <Camaron x={74} y={48} r={60} k={1.3} />
          <Camaron x={60} y={70} r={10} k={1.4} />
          <Camaron x={40} y={74} r={140} k={1.1} />
          <Camaron x={80} y={76} r={-120} k={1.1} />
        </Plato>
      );
    case "gaseosa":
      return <Vaso liquido={C.gaseosa} hielo burbujas />;
    case "agua":
      return <Vaso liquido={C.agua} hielo />;
    default:
      return <Vaso liquido={C.naranjilla} hielo />;
  }
}

export function IlustracionPlato({
  platoId,
  className,
  datos,
}: {
  platoId: string;
  className?: string;
  /** Atributos data-* extra (p. ej. para ubicar la foto de origen del vuelo a la comanda). */
  datos?: Record<`data-${string}`, string>;
}) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden="true" focusable="false" {...datos}>
      <Contenido platoId={platoId} />
    </svg>
  );
}
