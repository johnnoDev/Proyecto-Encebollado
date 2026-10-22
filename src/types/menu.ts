export type Opcion = {
  id: string;
  nombre: string;
  /** Precio adicional en dólares; 0 si no cambia el precio. */
  precio: number;
};

export type GrupoOpciones = {
  id: string;
  nombre: string;
  tipo: "unica" | "multiple";
  obligatorio: boolean;
  opciones: Opcion[];
};

export type Plato = {
  id: string;
  categoriaId: string;
  nombre: string;
  descripcion: string;
  precio: number;
  /** Ruta dentro de /public, p. ej. "/platos/encebollado-clasico.jpg". */
  imagen: string;
  disponible: boolean;
  destacado?: boolean;
  grupos: GrupoOpciones[];
};

export type Categoria = {
  id: string;
  nombre: string;
  descripcion?: string;
};

export type Menu = {
  categorias: Categoria[];
  platos: Plato[];
};

export type EstadoPedido = "nuevo" | "preparando" | "listo";

export type LineaCarrito = {
  /** Identificador único de la línea (mismo plato con distintas opciones = líneas distintas). */
  lineaId: string;
  platoId: string;
  nombre: string;
  precioUnitario: number;
  cantidad: number;
  /** Opciones elegidas por grupo: { [grupoId]: opcionId[] } */
  seleccion: Record<string, string[]>;
  nota?: string;
};

export type Pedido = {
  id: string;
  numero: string;
  lineas: LineaCarrito[];
  total: number;
  estado: EstadoPedido;
  nombreCliente?: string;
  creadoEn: number;
};
