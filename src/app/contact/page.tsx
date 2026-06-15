import type { Metadata } from "next";
import DevisForm from "@/components/DevisForm";

export const metadata: Metadata = {
  title: "Demander un devis gratuit — Site web Ermont & Val-d'Oise | Le Relais Web",
  description:
    "Votre devis gratuit pour un site web rapide à Ermont et dans le Val-d'Oise. Réponse sous 24h par message, livraison en 7 jours, sans engagement.",
  alternates: { canonical: "/contact" },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://www.lerelaisweb.com/contact",
    title: "Demander un devis gratuit | Le Relais Web",
    description: "Parlez-nous de votre projet. Réponse sous 24h, livré en 7 jours.",
    images: ["/logo.webp"],
  },
};

const contactSchema = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  name: "Contact — Le Relais Web",
  url: "https://www.lerelaisweb.com/contact",
};

export default function ContactPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(contactSchema) }} />

      <div className="page-hero">
        <div className="container">
          <span className="eyebrow">Devis gratuit</span>
          <h1>Parlons de votre projet.</h1>
          <p>
            Remplissez ce formulaire&nbsp;: votre espace client est créé aussitôt, et on revient vers
            vous sous 24h. Sans engagement, sans la moindre pression.
          </p>
        </div>
      </div>

      <section className="section-sm">
        <div className="container">
          <div className="price-guarantee" style={{ marginTop: 0, marginBottom: "2rem" }}>
            <span><span className="tick">✓</span> Réponse sous 24h, par message</span>
            <span><span className="tick">✓</span> On se déplace chez vous, en Île-de-France</span>
            <span><span className="tick">✓</span> Sans engagement · Garantie 30 jours</span>
          </div>
          <DevisForm />
        </div>
      </section>
    </>
  );
}
