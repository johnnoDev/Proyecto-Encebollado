import type { Metadata } from "next";
import { AdminCliente } from "@/components/admin/admin-cliente";

export const metadata: Metadata = { title: "Administración" };

export default function AdminPage() {
  return <AdminCliente />;
}
