import type { Metadata } from "next";
import Link from "next/link";
import { GUIDES } from "@/lib/guides";

export const metadata: Metadata = {
  title: "Guides — Tout comprendre sur la création de site web | Le Relais Web",
  description:
    "Nos guides clairs pour les commerçants et artisans : combien coûte un site web, WordPress vs sur-mesure, l'intérêt d'un site pour un artisan. Sans jargon.",
  alternates: { canonical: "/guides" },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://www.lerelaisweb.com/guides",
    title: "Guides création de site web | Le Relais Web",
    description: "Des réponses claires, sans jargon, pour bien choisir votre site web.",
    images: ["/lerelaisweb_logo.png"],
  },
};

export default function GuidesIndex() {
  return (
    <section className="section">
      <div className="container">
        <div className="sec-head center">
          <span className="eyebrow">Guides</span>
          <h1 className="ville-h1">Tout comprendre, sans jargon.</h1>
          <p className="ville-lead" style={{ marginInline: "auto" }}>
            Avant de vous lancer, voici nos réponses claires aux questions que se posent tous les
            commerçants et artisans sur leur site web.
          </p>
        </div>
        <div className="guide-list">
          {GUIDES.map((g) => (
            <Link key={g.slug} href={`/guides/${g.slug}`} className="guide-card">
              <p className="guide-meta">{g.lecture} de lecture</p>
              <h3>{g.titre}</h3>
              <p>{g.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
