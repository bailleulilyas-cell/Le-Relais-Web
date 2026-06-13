import type { Metadata } from "next";
import AuthForm from "@/components/AuthForm";

export const metadata: Metadata = {
  title: "Espace client — Connexion | Le Relais Web",
  description:
    "Connectez-vous à votre espace client Le Relais Web : suivi de projet, factures, interventions et support.",
  alternates: { canonical: "/compte" },
  robots: { index: false, follow: true },
};

export default function ComptePage() {
  return (
    <>
      <div className="page-hero">
        <div className="container">
          <span className="eyebrow">Espace client</span>
          <h1>Votre tableau de bord, rien que pour vous.</h1>
          <p>Suivi de projet, factures, interventions et support — disponible jour et nuit.</p>
        </div>
      </div>
      <section className="section">
        <div className="container">
          <AuthForm />
        </div>
      </section>
    </>
  );
}
