import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page introuvable | Le Relais Web",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="page-hero">
      <div className="container" style={{ textAlign: "center", maxWidth: 620 }}>
        <span className="eyebrow" style={{ justifyContent: "center" }}>
          Erreur 404
        </span>
        <h1>Cette page n&apos;existe pas (ou plus).</h1>
        <p>
          Le lien est peut-être ancien, ou l&apos;adresse comporte une faute. Pas de panique — on
          vous ramène en terrain connu.
        </p>
        <div className="cta-group" style={{ justifyContent: "center", marginTop: "1.5rem" }}>
          <Link href="/" className="btn-primary">
            Retour à l&apos;accueil
          </Link>
          <Link href="/devis" className="btn-secondary">
            Demander un devis
          </Link>
        </div>
      </div>
    </div>
  );
}
