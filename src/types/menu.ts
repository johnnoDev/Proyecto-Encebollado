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
  /** Precio base (opción más barata); los grupos suman sobre este valor. */
  precio: number;
  /** Ruta dentro de /public. Mientras sea null se muestra una ilustración de marcador. */
  imagen: string | null;
  disponible: boolean;
  /** Etiqueta corta opcional ("El favorito"); se pinta en rosa. */
  etiqueta?: string;
  grupos: GrupoOpciones[];
};

export type Categoria = {
  id: string;
  nombre: string;
  descripcion?: string;
};

export type Modalidad = {
  id: "mesa" | "llevar" | "retiro";
  nombre: string;
  descripcion: string;
};

export type Menu = {
  categorias: Categoria[];
  platos: Plato[];
  modalidades: Modalidad[];
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
  /** Opciones en texto («Mediano · sin cebolla»), guardado para que cocina lo lea tal cual. */
  detalle: string;
};

export type Pedido = {
  id: string;
  numero: string;
  lineas: LineaCarrito[];
  total: number;
  estado: EstadoPedido;
  modalidad: Modalidad["id"];
  /** Número de mesa cuando la modalidad es "mesa". */
  mesa?: string;
  nombreCliente?: string;
  creadoEn: number;
};
