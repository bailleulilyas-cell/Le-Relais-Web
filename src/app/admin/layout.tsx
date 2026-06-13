import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getAdminClients } from "@/lib/admin-data";
import AdminShell from "@/components/admin/AdminShell";

export const metadata: Metadata = {
  title: "Administration | Le Relais Web",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/compte?from=/admin");
  if (session.role !== "admin") redirect("/espace-client");

  const clients = await getAdminClients();
  const totalNew = clients.reduce((s, c) => s + c.nbDemandesNew, 0);

  return (
    <AdminShell clients={clients} totalNew={totalNew}>
      {children}
    </AdminShell>
  );
}
