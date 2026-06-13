import type { Metadata } from "next";
import ForgotForm from "@/components/ForgotForm";

export const metadata: Metadata = {
  title: "Mot de passe oublié | Le Relais Web",
  robots: { index: false, follow: true },
};

export default function MotDePasseOubliePage() {
  return (
    <div className="page-hero">
      <div className="container" style={{ maxWidth: 480 }}>
        <span className="eyebrow">Espace client</span>
        <h1>Mot de passe oublié&nbsp;?</h1>
        <p>Entrez votre email : on vous envoie un lien pour en choisir un nouveau.</p>
        <ForgotForm />
      </div>
    </div>
  );
}
