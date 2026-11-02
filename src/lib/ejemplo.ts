import { brand } from "@/config/brand";
import { detalleSeleccion, precioUnitario, seleccionInicial, type Seleccion } from "@/lib/pedido";
import type { LineaCarrito, Pedido, Plato } from "@/types/menu";

// «Día de ejemplo» para presentar Indicadores sin un servicio real. Genera pedidos
// de hoy con platos, modalidades y tiempos variados, armados con las mismas
// funciones de la carta. Todos llevan `ejemplo: true` y numeración propia (EJ-).

const MIN = 60_000;

const partesHora = new Intl.DateTimeFormat("en-US", {
  timeZone: brand.zonaHoraria, hour: "numeric", minute: "numeric", second: "numeric", hourCycle: "h23",
});

/** Medianoche de hoy en la zona del local. */
export function inicioDelDia(ahora: number): number {
  const p = Object.fromEntries(partesHora.formatToParts(ahora).map((x) => [x.type, Number(x.value)]));
  return ahora - ((p.hour * 60 + p.minute) * 60 + p.second) * 1000 - (ahora % 1000);
}

const centavos = (valor: number) => Math.round(valor * 100) / 100;

/** Elige con pesos: [valor, peso][]. */
function elegir<T>(opciones: [T, number][], azar: () => number): T {
  const total = opciones.reduce((s, [, peso]) => s + peso, 0);
  let r = azar() * total;
  for (const [valor, peso] of opciones) {
    r -= peso;
    if (r <= 0) return valor;
  }
  return opciones[opciones.length - 1][0];
}

function lineaDe(plato: Plato, id: string, azar: () => number): LineaCarrito {
  const seleccion: Seleccion = seleccionInicial(plato);
  for (const g of plato.grupos) {
    // Tamaño y otras elecciones únicas: la primera opción es la más pedida.
    if (g.tipo === "unica" && g.obligatorio) {
      seleccion[g.id] = [elegir(g.opciones.map((o, i): [string, number] => [o.id, i === 0 ? 5 : 3 - Math.min(i, 2)]), azar)];
    } else if (g.tipo === "multiple" && azar() < 0.3) {
      seleccion[g.id] = [g.opciones[Math.floor(azar() * g.opciones.length)].id];
    }
  }
  return {
    lineaId: id,
    platoId: plato.id,
    nombre: plato.nombre,
    precioUnitario: precioUnitario(plato, seleccion),
    cantidad: azar() < 0.8 ? 1 : 2,
    seleccion,
    detalle: detalleSeleccion(plato, seleccion),
  };
}

/**
 * Unos `cantidad` pedidos de hoy, desde las 11:00 del local (o las últimas
 * horas, si es más temprano) hasta hace un minuto. Uno de cada cuatro tarda
 * 10 minutos o más en cocina; los más recientes siguen pendientes.
 */
export function generarDiaDeEjemplo(
  platos: Plato[],
  ahora: number,
  { cantidad = 40, azar = Math.random }: { cantidad?: number; azar?: () => number } = {},
): Pedido[] {
  const disponibles = platos.filter((p) => p.disponible);
  const fuertes = disponibles.filter((p) => p.categoriaId === "encebollados");
  const extras = disponibles.filter((p) => p.categoriaId === "extras");
  const bebidas = disponibles.filter((p) => p.categoriaId === "bebidas");
  if (disponibles.length === 0) return [];

  const dia = inicioDelDia(ahora);
  const apertura = dia + 11 * 60 * MIN;
  const desde = ahora - apertura >= 90 * MIN ? apertura : Math.max(dia, ahora - 4 * 60 * MIN);
  const hasta = ahora - MIN;
  const tramo = Math.max(hasta - desde, cantidad * MIN);

  const pedidos: Pedido[] = [];
  for (let i = 0; i < cantidad; i++) {
    const creadoEn = Math.min(hasta, Math.round(desde + (tramo * (i + azar() * 0.9)) / cantidad));
    const id = `ejemplo-${i + 1}-${creadoEn}`;
    const elegidos: Plato[] = [];
    if (fuertes.length > 0 && azar() < 0.9) elegidos.push(fuertes[Math.floor(azar() * fuertes.length)]);
    if (extras.length > 0 && azar() < 0.55) elegidos.push(extras[Math.floor(azar() * extras.length)]);
    if (bebidas.length > 0 && azar() < 0.5) elegidos.push(bebidas[Math.floor(azar() * bebidas.length)]);
    if (elegidos.length === 0) elegidos.push(disponibles[Math.floor(azar() * disponibles.length)]);
    const lineas = elegidos.map((plato, k) => lineaDe(plato, `${id}-${k}`, azar));

    const modalidad = elegir<Pedido["modalidad"]>([["mesa", 7], ["llevar", 2], ["retiro", 1]], azar);
    const minutosCocina = azar() < 0.25 ? 10 + Math.floor(azar() * 8) : 4 + Math.floor(azar() * 6);
    const listoEn = creadoEn + minutosCocina * MIN;
    const base = {
      id,
      numero: `EJ-${String(i + 1).padStart(3, "0")}`,
      lineas,
      total: centavos(lineas.reduce((s, l) => s + l.precioUnitario * l.cantidad, 0)),
      modalidad,
      ...(modalidad === "mesa" ? { mesa: String(1 + Math.floor(azar() * brand.mesas)) } : {}),
      creadoEn,
      ejemplo: true,
    };
    if (listoEn <= ahora) {
      pedidos.push({ ...base, estado: ahora - listoEn > 4 * MIN ? "entregado" : "listo", listoEn });
    } else {
      pedidos.push({ ...base, estado: ahora - creadoEn < 2 * MIN ? "nuevo" : "preparando" });
    }
  }
  return pedidos;
}
