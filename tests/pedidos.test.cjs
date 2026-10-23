const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const crypto = require("node:crypto");
const ts = require("typescript");

// Ejecuta los módulos de dominio reales; aísla solo la persistencia del navegador.
function cargar(ruta) {
  const archivo = path.resolve(ruta);
  const source = ts.transpileModule(fs.readFileSync(archivo, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText;
  const exports = {};
  vm.runInNewContext(source, {
    exports, crypto, structuredClone, Intl, Date,
    require: (nombre) => {
      if (nombre === "zustand/middleware") return { persist: (inicializar) => inicializar };
      if (nombre.startsWith("@/") && nombre.endsWith(".json")) {
        const datos = JSON.parse(fs.readFileSync(`src/${nombre.slice(2)}`, "utf8"));
        return { ...datos, default: datos };
      }
      if (nombre.startsWith("@/")) return cargar(`src/${nombre.slice(2)}.ts`);
      return require(nombre);
    },
  }, { filename: archivo });
  return exports;
}

const linea = (seleccion = { extras: ["limon", "aji"] }) => ({
  lineaId: "linea", platoId: "plato", nombre: "Encebollado", precioUnitario: 3.5,
  cantidad: 1, seleccion, detalle: "Limón y ají aparte",
});

test("agrupar extras no depende del orden ni modifica las opciones originales", () => {
  const { useCarrito } = cargar("src/store/carrito.ts");
  const primera = linea();
  useCarrito.getState().agregar(primera);
  useCarrito.getState().agregar(linea({ extras: ["aji", "limon"] }));
  assert.equal(useCarrito.getState().lineas.length, 1);
  assert.equal(useCarrito.getState().lineas[0].cantidad, 2);
  assert.deepEqual(primera.seleccion.extras, ["limon", "aji"]);
});

test("editar una línea fusiona las selecciones equivalentes", () => {
  const { useCarrito } = cargar("src/store/carrito.ts");
  useCarrito.getState().agregar(linea());
  useCarrito.getState().agregar(linea({ extras: ["limon"] }));
  const id = useCarrito.getState().lineas[1].lineaId;
  useCarrito.getState().reemplazar(id, linea({ extras: ["aji", "limon"] }));
  assert.equal(useCarrito.getState().lineas.length, 1);
  assert.equal(useCarrito.getState().lineas[0].cantidad, 2);
});

test("un envío estable pasa; vaciado, edición concurrente o agotamiento lo cancelan", () => {
  const { revisarEnvio } = cargar("src/lib/envio.ts");
  const copia = [linea()];
  const platos = [{ id: "plato", disponible: true }];
  assert.equal(revisarEnvio(copia, structuredClone(copia), platos), null);
  assert.ok(revisarEnvio(copia, [], platos));
  assert.ok(revisarEnvio([], [], platos));
  assert.ok(revisarEnvio(copia, [{ ...linea(), cantidad: 2 }], platos));
  assert.ok(revisarEnvio(copia, copia, [{ id: "plato", disponible: false }]));
  assert.ok(revisarEnvio(copia, copia, []));
});

test("un listo sigue accesible con otros pendientes y no mezcla mesas", () => {
  const { pedidosParaMesa } = cargar("src/lib/seguimiento.ts");
  const datos = [
    { id: "pendiente", modalidad: "mesa", mesa: "7", estado: "preparando", creadoEn: 1 },
    { id: "listo", modalidad: "mesa", mesa: "7", estado: "listo", creadoEn: 2 },
    { id: "otra", modalidad: "mesa", mesa: "8", estado: "nuevo", creadoEn: 3 },
  ];
  assert.deepEqual(Array.from(pedidosParaMesa(datos, "7"), (p) => p.id), ["listo", "pendiente"]);
  assert.equal(pedidosParaMesa(datos, "9").length, 0);
});

test("el historial limita listos pero conserva todos los pendientes", () => {
  const { pedidosParaMesa } = cargar("src/lib/seguimiento.ts");
  const datos = Array.from({ length: 5 }, (_, i) => ({ id: `listo-${i}`, modalidad: "mesa", mesa: "7", estado: "listo", creadoEn: i }));
  datos.push({ id: "pendiente-antiguo", modalidad: "mesa", mesa: "7", estado: "nuevo", creadoEn: -1 });
  const visibles = pedidosParaMesa(datos, "7");
  assert.equal(visibles.length, 4);
  assert.ok(visibles.some((p) => p.id === "pendiente-antiguo"));
  assert.deepEqual(datos.map((p) => p.id), ["listo-0", "listo-1", "listo-2", "listo-3", "listo-4", "pendiente-antiguo"]);
});

test("cocina: pendientes por orden de llegada y todos los listos visibles", () => {
  const { columnasCocina } = cargar("src/lib/cocina.ts");
  const datos = [
    { id: "n2", estado: "nuevo", creadoEn: 20 },
    { id: "n1", estado: "nuevo", creadoEn: 10 },
    { id: "p1", estado: "preparando", creadoEn: 5 },
    ...Array.from({ length: 12 }, (_, i) => ({ id: `l${i}`, estado: "listo", creadoEn: i })),
  ];
  const c = columnasCocina(datos);
  assert.deepEqual(Array.from(c.nuevo, (p) => p.id), ["n1", "n2"]);
  assert.deepEqual(Array.from(c.preparando, (p) => p.id), ["p1"]);
  assert.equal(c.listo.length, 12);
  assert.ok(c.listo.some((p) => p.id === "l0"));
  assert.equal(c.listo[0].id, "l11");
  assert.equal(datos[0].id, "n2");
});

test("cocina: el pedido avanza nuevo → preparando → listo → entregado y se detiene", () => {
  const { siguienteEstado, minutosEspera, textoEspera } = cargar("src/lib/cocina.ts");
  assert.equal(siguienteEstado.nuevo, "preparando");
  assert.equal(siguienteEstado.preparando, "listo");
  assert.equal(siguienteEstado.listo, "entregado");
  assert.equal(siguienteEstado.entregado, null);
  assert.equal(minutosEspera(0, 9 * 60000 + 59000), 9);
  assert.equal(minutosEspera(1000, 0), 0);
  assert.equal(textoEspera(0), "Recién llegado");
  assert.equal(textoEspera(75), "1 h 15 min");
});

test("entregados salen de cocina y cuentan como terminados en el seguimiento", () => {
  const { columnasCocina } = cargar("src/lib/cocina.ts");
  const { pedidosParaMesa } = cargar("src/lib/seguimiento.ts");
  const datos = [
    { id: "e", modalidad: "mesa", mesa: "7", estado: "entregado", creadoEn: 3 },
    { id: "l", modalidad: "mesa", mesa: "7", estado: "listo", creadoEn: 2 },
    { id: "n", modalidad: "mesa", mesa: "7", estado: "nuevo", creadoEn: 1 },
  ];
  const c = columnasCocina(datos);
  assert.equal([...c.nuevo, ...c.preparando, ...c.listo].some((p) => p.id === "e"), false);
  assert.equal(c.entregado, undefined);
  const viejos = Array.from({ length: 4 }, (_, i) => ({ id: `v${i}`, modalidad: "mesa", mesa: "7", estado: "entregado", creadoEn: -10 - i }));
  const visibles = pedidosParaMesa([...datos, ...viejos], "7");
  assert.deepEqual(Array.from(visibles, (p) => p.id), ["e", "l", "n", "v0"]);
});

test("listos: se guarda cuándo quedó listo y se borra al volver atrás", () => {
  const { conEstado } = cargar("src/store/pedidos.ts");
  const { minutosListo, textoListo, MINUTOS_ENFRIA } = cargar("src/lib/cocina.ts");
  const base = { id: "p", estado: "preparando", creadoEn: 0 };
  const listo = conEstado(base, "listo", 10 * 60000);
  assert.equal(listo.listoEn, 10 * 60000);
  assert.equal(conEstado(listo, "listo", 99).listoEn, 10 * 60000);
  assert.equal(minutosListo(listo, 13 * 60000), 3);
  assert.equal(textoListo(0), "Recién listo");
  assert.equal(textoListo(7), "Listo hace 7 min");
  assert.ok(MINUTOS_ENFRIA > 0);
  assert.equal("listoEn" in conEstado(listo, "preparando", 0), false);
  assert.equal(conEstado(listo, "entregado", 0).listoEn, 10 * 60000);
});

test("admin: lee precios escritos a mano y rechaza los inválidos", () => {
  const { leerPrecio, precioEditable } = cargar("src/lib/admin.ts");
  assert.equal(leerPrecio("3,50").valor, 3.5);
  assert.equal(leerPrecio(" $4.5 ").valor, 4.5);
  assert.equal(leerPrecio("4").valor, 4);
  for (const malo of ["", "abc", "3,555", "-2", "0,10", "120"]) assert.equal(leerPrecio(malo).ok, false, malo);
  assert.equal(precioEditable(3.5), "3,50");
});

test("admin: los ajustes iguales al menú original no se guardan", () => {
  const { useMenu, platoOriginal } = cargar("src/store/menu.ts");
  const original = platoOriginal("chifles");
  useMenu.getState().ajustarPlato("chifles", { precio: 1.75 });
  assert.equal(useMenu.getState().ajustes.chifles.precio, 1.75);
  assert.equal(useMenu.getState().platos.find((p) => p.id === "chifles").precio, 1.75);
  useMenu.getState().ajustarPlato("chifles", { precio: original.precio });
  assert.equal(useMenu.getState().ajustes.chifles, undefined);
  useMenu.getState().ajustarPlato("chifles", { disponible: false });
  useMenu.getState().quitarAjuste("chifles");
  assert.equal(useMenu.getState().platos.find((p) => p.id === "chifles").disponible, original.disponible);
});

test("admin: un cambio de precio de 3× o de un tercio pide confirmación", () => {
  const { avisoCambioGrande } = cargar("src/lib/admin.ts");
  assert.equal(avisoCambioGrande(4.75, 47.5), "Es 10 veces el precio anterior.");
  assert.ok(avisoCambioGrande(4.5, 1.5));
  assert.equal(avisoCambioGrande(4.5, 5.5), null);
  assert.equal(avisoCambioGrande(4.5, 4.5), null);
  assert.equal(avisoCambioGrande(3, 8.99), null);
});

test("la confirmación de entrega corresponde a cada modalidad", () => {
  const { indicacionPedidoEntregado } = cargar("src/lib/seguimiento.ts");
  assert.match(indicacionPedidoEntregado({ modalidad: "mesa" }), /en la mesa/);
  assert.match(indicacionPedidoEntregado({ modalidad: "llevar" }), /para llevar/);
  assert.match(indicacionPedidoEntregado({ modalidad: "retiro" }), /retiraste/);
  for (const modalidad of ["llevar", "retiro"]) assert.doesNotMatch(indicacionPedidoEntregado({ modalidad }), /mesa/);
});
