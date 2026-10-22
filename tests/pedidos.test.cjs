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
