import { notFound } from "next/navigation";
import { getClientDetail } from "@/lib/admin-data";
import ClientDetail from "@/components/admin/ClientDetail";

export const dynamic = "force-dynamic";

export default async function AdminClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const userId = parseInt(id, 10);
  if (Number.isNaN(userId)) notFound();

  const detail = await getClientDetail(userId);
  if (!detail) notFound();

  return <ClientDetail detail={detail} />;
}
