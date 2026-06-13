import type { Metadata } from "next";
import ResetForm from "@/components/ResetForm";

export const metadata: Metadata = {
  title: "Nouveau mot de passe | Le Relais Web",
  robots: { index: false, follow: false },
};

export default async function ResetPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <div className="page-hero">
      <div className="container" style={{ maxWidth: 480 }}>
        <span className="eyebrow">Espace client</span>
        <h1>Nouveau mot de passe</h1>
        <p>Choisissez un mot de passe d&apos;au moins 8 caractères.</p>
        <ResetForm token={token ?? ""} />
      </div>
    </div>
  );
}
