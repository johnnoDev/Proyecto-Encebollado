"use client";

import { Suspense, useEffect, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MotionConfig } from "motion/react";
import { AvisoEscritorio, ComandaLateral, TiraComanda, type AvisoComanda } from "@/components/menu/comanda";
import { EncabezadoMenu } from "@/components/menu/encabezado-menu";
import { FichaPlato } from "@/components/menu/ficha-plato";
import { FilaPlato } from "@/components/menu/fila-plato";
import { idSeccion, PestanasCategorias } from "@/components/menu/pestanas-categorias";
import { detalleSeleccion, precioUnitario, seleccionInicial } from "@/lib/pedido";
import { totalCarrito, useCarrito } from "@/store/carrito";
import { useMontado, useRehidratar } from "@/store/hidratar";
import { mesaValida, useMesa, useMesaActual } from "@/store/mesa";
import { useMenu } from "@/store/menu";
import { usePedidos } from "@/store/pedidos";
import type { LineaCarrito, Plato } from "@/types/menu";

/** Lee ?mesa= del QR. Aislado en su propio Suspense para que la carta se prerenderice. */
function SincronizarMesa() {
  const valor = useSearchParams().get("mesa");
  const fijar = useMesa((s) => s.fijar);
  useEffect(() => fijar(mesaValida(valor)), [valor, fijar]);
  return null;
}

export function MenuCliente() {
  useRehidratar();
  const montado = useMontado();
  const router = useRouter();
  const { categorias, platos } = useMenu();
  const agregar = useCarrito((s) => s.agregar);
  const mesa = useMesaActual();

  const [platoAbierto, setPlatoAbierto] = useState<Plato | null>(null);
  const [comandaAbierta, setComandaAbierta] = useState(false);
  const [selectorMesa, setSelectorMesa] = useState(false);
  const [aviso, setAviso] = useState<AvisoComanda>(null);
  const [enviando, iniciarEnvio] = useTransition();
  const temporizador = useRef<ReturnType<typeof setTimeout>>(undefined);
  const enviado = useRef(false);

  useEffect(() => () => clearTimeout(temporizador.current), []);

  const avisar = (nuevo: NonNullable<AvisoComanda>, ms: number) => {
    setAviso(nuevo);
    clearTimeout(temporizador.current);
    temporizador.current = setTimeout(() => setAviso(null), ms);
  };

  const anotar = (linea: Omit<LineaCarrito, "lineaId">) => {
    agregar(linea);
    setPlatoAbierto(null);
    const texto = `${linea.cantidad > 1 ? `${linea.cantidad} × ` : ""}${linea.nombre}${linea.detalle ? ` · ${linea.detalle.toLowerCase()}` : ""}`;
    avisar({ id: Date.now(), tipo: "anotado", texto }, 2600);
  };

  // Quitar nunca es definitivo al instante: el aviso ofrece deshacerlo.
  const quitar = (lineaId: string) => {
    const quitada = useCarrito.getState().quitar(lineaId);
    if (!quitada) return;
    avisar(
      {
        id: Date.now(),
        tipo: "quitado",
        texto: quitada.linea.nombre,
        onDeshacer: () => {
          useCarrito.getState().restaurar(quitada.linea, quitada.indice);
          setAviso(null);
        },
      },
      5000,
    );
  };

  const elegir = (plato: Plato) => {
    if (plato.grupos.length > 0) return setPlatoAbierto(plato);
    const seleccion = seleccionInicial(plato);
    anotar({
      platoId: plato.id,
      nombre: plato.nombre,
      precioUnitario: precioUnitario(plato, seleccion),
      cantidad: 1,
      seleccion,
      detalle: detalleSeleccion(plato, seleccion),
    });
  };

  const elegirMesa = (m: string) => {
    setSelectorMesa(false);
    router.replace(`/menu?mesa=${m}`, { scroll: false });
  };

  const enviar = () => {
    if (!mesa) return setSelectorMesa(true);
    const lineas = useCarrito.getState().lineas;
    // Un doble toque no crea dos pedidos.
    if (lineas.length === 0 || enviado.current) return;
    enviado.current = true;
    iniciarEnvio(() => {
      const pedido = usePedidos
        .getState()
        .crear({ lineas, total: totalCarrito(lineas), modalidad: "mesa", mesa });
      useCarrito.getState().vaciar();
      setComandaAbierta(false);
      router.push(`/pedido/${pedido.id}`);
    });
  };

  const comun = { mesa, montado, enviando, onEnviar: enviar, onQuitar: quitar };

  return (
    <MotionConfig reducedMotion="user">
      <Suspense fallback={null}>
        <SincronizarMesa />
      </Suspense>
      <div className="min-h-dvh bg-oceano pb-32 text-crema lg:pb-16">
        <EncabezadoMenu
          mesa={mesa}
          selectorAbierto={selectorMesa}
          onSelector={setSelectorMesa}
          onElegirMesa={elegirMesa}
        />
        <PestanasCategorias categorias={categorias} />

        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:grid lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-14 lg:pt-4">
          <main>
            <h1 className="sr-only">Carta</h1>
            {categorias.map((categoria) => (
              <section
                key={categoria.id}
                id={idSeccion(categoria.id)}
                aria-labelledby={`${idSeccion(categoria.id)}-titulo`}
                className="scroll-mt-16 pt-9 lg:pt-8"
              >
                <h2
                  id={`${idSeccion(categoria.id)}-titulo`}
                  className="font-heading text-[2.1rem] leading-none font-bold tracking-[-0.02em] text-crema"
                >
                  {categoria.nombre}
                </h2>
                {categoria.descripcion && (
                  <p className="mt-2 text-[0.95rem] text-crema/75">{categoria.descripcion}</p>
                )}
                <ul className="mt-3">
                  {platos
                    .filter((p) => p.categoriaId === categoria.id)
                    .map((plato) => (
                      <FilaPlato key={plato.id} plato={plato} onElegir={elegir} />
                    ))}
                </ul>
              </section>
            ))}
          </main>
          <ComandaLateral {...comun} />
        </div>
      </div>

      <TiraComanda
        {...comun}
        aviso={aviso}
        abierta={comandaAbierta}
        onAbrir={() => setComandaAbierta(true)}
        onCerrar={() => setComandaAbierta(false)}
      />
      <AvisoEscritorio aviso={aviso} />
      <FichaPlato plato={platoAbierto} onCerrar={() => setPlatoAbierto(null)} onAnotar={anotar} />
      <p aria-live="polite" className="sr-only">
        {aviso ? `${aviso.tipo === "anotado" ? "Anotado en" : "Quitado de"} la comanda: ${aviso.texto}` : ""}
      </p>
    </MotionConfig>
  );
}
