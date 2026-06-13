import type { Metadata } from "next";
import DevisForm from "@/components/DevisForm";

export const metadata: Metadata = {
  title: "Devis Gratuit — Site Internet Artisan Val-d'Oise | Le Relais Web",
  description:
    "Demandez votre devis gratuit pour un site vitrine artisan à Ermont, Val-d'Oise. Réponse sous 24h, livraison 7 jours, dès 25€/mois tout inclus.",
  alternates: { canonical: "/devis" },
};

export default function DevisPage() {
  return (
    <>
      <div className="page-hero">
        <div className="container">
          <span className="eyebrow">Devis gratuit</span>
          <h1>Parlons de votre projet.</h1>
          <p>
            Quelques infos et c&apos;est parti. On vous répond sous 24h, par message, sans engagement et
            sans la moindre pression.
          </p>
        </div>
      </div>
      <section className="section">
        <div className="container">
          <DevisForm />
        </div>
      </section>
    </>
  );
}
