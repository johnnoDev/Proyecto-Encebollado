import Image from "next/image";
import { IlustracionPlato } from "@/components/menu/ilustracion-plato";
import { cn } from "@/lib/utils";

/**
 * Foto recortada del plato (`imagen` en menu.json) o, si aún no la tiene, su
 * ilustración vectorial. Es decorativa: el nombre del plato siempre va al lado.
 */
export function FotoPlato({
  platoId,
  imagen,
  sizes,
  className,
}: {
  platoId: string;
  imagen: string | null;
  /** Ancho con que se pinta, para que next/image elija el archivo justo. */
  sizes: string;
  className?: string;
}) {
  if (!imagen) return <IlustracionPlato platoId={platoId} className={className} />;
  return (
    <span aria-hidden="true" className={cn("relative block", className)}>
      <Image src={imagen} alt="" fill sizes={sizes} className="object-contain" />
    </span>
  );
}
