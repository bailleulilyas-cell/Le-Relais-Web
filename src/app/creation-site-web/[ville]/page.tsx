import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { VILLES, getVille } from "@/lib/villes";

const SITE = "https://www.lerelaisweb.com";

export function generateStaticParams() {
  return VILLES.map((v) => ({ ville: v.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ ville: string }>;
}): Promise<Metadata> {
  const { ville } = await params;
  const v = getVille(ville);
  if (!v) return {};
  const title = `Création site web à ${v.nom} (${v.cp}) — rapide & pas cher | Le Relais Web`;
  const description = `Agence web à ${v.nom} : création de site internet sur-mesure, 100/100 sur Google, livré en 7 jours. Pour artisans, commerçants et associations. Devis gratuit.`;
  const url = `${SITE}/creation-site-web/${v.slug}`;
  return {
    title,
    description,
    alternates: { canonical: `/creation-site-web/${v.slug}` },
    openGraph: {
      type: "website",
      locale: "fr_FR",
      url,
      title,
      description,
      images: ["/lerelaisweb_logo.png"],
    },
  };
}

export default async function VillePage({
  params,
}: {
  params: Promise<{ ville: string }>;
}) {
  const { ville } = await params;
  const v = getVille(ville);
  if (!v) notFound();

  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Création de site web",
    provider: {
      "@type": "LocalBusiness",
      name: "Le Relais Web",
      telephone: "+33695382157",
      email: "contact@lerelaisweb.com",
      image: `${SITE}/lerelaisweb_logo.png`,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Ermont",
        postalCode: "95120",
        addressRegion: "Val-d'Oise",
        addressCountry: "FR",
      },
    },
    areaServed: { "@type": "City", name: v.nom },
    url: `${SITE}/creation-site-web/${v.slug}`,
    description: `Création de sites web rapides pour les commerces, artisans et associations de ${v.nom} (${v.cp}).`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      {/* HERO */}
      <section className="section ville-hero">
        <div className="container">
          <span className="eyebrow">Agence web · {v.nom} ({v.cp}) · Val-d&apos;Oise</span>
          <h1 className="ville-h1">
            Création de site web à <span className="accent-ink">{v.nom}</span>
          </h1>
          <p className="ville-lead">{v.lead}</p>
          <div className="hero-cta">
            <Link href="/contact" className="btn-primary">Demander un devis gratuit →</Link>
            <Link href="/services" className="btn-secondary">Voir les offres</Link>
          </div>
          <div className="hero-trust" style={{ marginTop: "1.6rem" }}>
            <span><span className="tick">✓</span> Livré en 7 jours</span>
            <span><span className="tick">✓</span> Dès 25 €/mois, tout compris</span>
            <span><span className="tick">✓</span> On se déplace à {v.nom}</span>
          </div>
        </div>
      </section>

      {/* POURQUOI LOCAL */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="sec-head center">
            <span className="eyebrow">Pourquoi nous, à {v.nom}</span>
            <h2>Un site qui vous amène des clients de {v.nom}.</h2>
          </div>
          <div className="prob-grid">
            {v.points.map((p, i) => (
              <div className="prob-card reveal" key={i}>
                <div className="prob-ic">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </div>
                <p style={{ fontSize: "1rem", color: "var(--color-ink)" }}>{p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OFFRE */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="sec-head center">
            <span className="eyebrow">Nos offres à {v.nom}</span>
            <h2>Deux formules claires, un prix transparent.</h2>
            <p>
              <b>Pack Présence</b> dès 25 €/mois (+ 550 € à la création) pour une vitrine dont on
              s&apos;occupe de tout. <b>Pack Pro</b> dès 40 €/mois (+ 1 200 €) si vous voulez gérer
              vous-même vos contenus. Sans engagement, satisfait ou remboursé 30 jours.
            </p>
            <div className="hero-cta" style={{ justifyContent: "center" }}>
              <Link href="/services" className="btn-secondary">Comparer les offres</Link>
              <a href="/demos/demo-boulangerie.html" className="btn-secondary">Voir une démo</a>
            </div>
          </div>
        </div>
      </section>

      {/* PREUVE */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="sec-head center">
            <span className="eyebrow">La preuve</span>
            <h2>Un site déjà en ligne, dans le Val-d&apos;Oise.</h2>
            <p>
              On a créé le site du club <b>AME-JUDO</b> à Ermont, à deux pas de {v.nom} : note de
              vitesse 99/100, et le club gère ses actualités lui-même.{" "}
              <a href="https://ame-judo.fr" target="_blank" rel="noopener noreferrer" className="link-accent">
                Voir ame-judo.fr →
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* VILLES VOISINES — maillage interne */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="ville-near">
            <span>On intervient aussi à&nbsp;:</span>
            {v.voisines.map((slug) => {
              const vv = getVille(slug);
              if (!vv) return null;
              return (
                <Link key={slug} href={`/creation-site-web/${slug}`} className="link-accent">
                  {vv.nom}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="cta-final reveal">
            <h2>Votre site à {v.nom}, prêt en 7 jours.</h2>
            <p>
              On vient vous rencontrer à {v.nom}, on s&apos;occupe de tout, et si le résultat ne vous
              plaît pas, on vous rembourse. Vous ne prenez aucun risque.
            </p>
            <Link href="/contact" className="btn-primary">Demander mon devis gratuit →</Link>
            <p className="cta-final-sub">Réponse sous 24h · Par message WhatsApp · Sans engagement</p>
          </div>
        </div>
      </section>
    </>
  );
}
