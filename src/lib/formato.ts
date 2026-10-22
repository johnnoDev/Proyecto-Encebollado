import { brand } from "@/config/brand";

const moneda = new Intl.NumberFormat(brand.locale, {
  style: "currency",
  currency: brand.moneda,
});

/** 3.5 → "$3,50" según el locale de la marca. */
export const precio = (valor: number) => moneda.format(valor);
