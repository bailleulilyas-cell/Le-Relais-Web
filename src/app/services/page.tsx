import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Nos offres — Création de site web à Ermont, Val-d'Oise | Le Relais Web",
  description:
    "Pack Présence (on s'occupe de tout) ou Pack Pro (vous gérez vous-même). Sites web rapides livrés en 7 jours, hébergement et maintenance inclus. Ermont & Val-d'Oise.",
  alternates: { canonical: "/services" },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://www.lerelaisweb.com/services",
    title: "Nos offres — Création de site web | Le Relais Web",
    description: "Deux formules claires pour votre site web. Livré en 7 jours, tout compris.",
    images: ["/logo.webp"],
  },
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: "Création de site web",
  provider: { "@type": "LocalBusiness", name: "Le Relais Web", "@id": "https://www.lerelaisweb.com/#business" },
  areaServed: [
    { "@type": "AdministrativeArea", name: "Val-d'Oise" },
    { "@type": "AdministrativeArea", name: "Île-de-France" },
  ],
};

export default function ServicesPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />

      <div className="page-hero">
        <div className="container">
          <span className="eyebrow">Nos offres</span>
          <h1>Deux façons d&apos;avoir un site qui travaille pour vous.</h1>
          <p>
            La même qualité, la même vitesse, le même soin. La seule différence&nbsp;: qui s&apos;occupe
            des mises à jour — nous, ou vous.
          </p>
        </div>
      </div>

      <section className="section-sm">
        <div className="container">
          {/* ── Pack Présence ── */}
          <div className="svc-block">
            <aside className="svc-aside">
              <div className="price-name">Présence</div>
              <div className="price-tagline">On s&apos;occupe de tout.</div>
              <div className="price-amount">
                <span className="n">25 €</span><span className="per">/mois</span>
              </div>
              <div className="price-setup">+ <b>550 €</b> à la création</div>
              <Link href="/contact" className="btn-primary">Demander un devis</Link>
            </aside>
            <div className="svc-detail">
              <h3>Pour qui&nbsp;?</h3>
              <p>
                Pour le commerçant ou l&apos;artisan dont le contenu bouge peu : coiffeur, plombier,
                électricien, fleuriste… Vous voulez être visible et joignable, sans rien avoir à gérer.
              </p>
              <h3>Comment ça marche</h3>
              <p>
                On vient vous rencontrer, vous nous donnez vos infos et vos photos une fois, et 7 jours
                plus tard votre site est en ligne. Besoin d&apos;un changement&nbsp;? Vous nous envoyez un
                message, on le fait.
              </p>
              <h3>Ce qui est compris</h3>
              <ul>
                <li>Site vitrine sur-mesure, 4 à 6 pages</li>
                <li>Nom de domaine &amp; hébergement inclus</li>
                <li>Référencement local : vous apparaissez sur Google près de chez vos clients</li>
                <li>Site ultra-rapide, parfait sur téléphone</li>
                <li>Toutes les modifications faites par nous, à la demande</li>
                <li>Maintenance, sécurité et dépannage compris</li>
                <li>Un espace client pour suivre votre projet et vos factures</li>
              </ul>
            </div>
          </div>

          {/* ── Pack Pro ── */}
          <div className="svc-block">
            <aside className="svc-aside">
              <div className="price-name">Pro</div>
              <div className="price-tagline">Vous gérez vous-même.</div>
              <div className="price-amount">
                <span className="n">40 €</span><span className="per">/mois</span>
              </div>
              <div className="price-setup">+ <b>1 200 €</b> à la création</div>
              <Link href="/contact" className="btn-primary">Demander un devis</Link>
            </aside>
            <div className="svc-detail">
              <h3>Pour qui&nbsp;?</h3>
              <p>
                Pour celui dont le contenu change souvent : boucherie, restaurant, club, association…
                Vous voulez la main sur vos produits, vos photos, vos menus ou vos actualités, sans nous
                solliciter à chaque fois.
              </p>
              <h3>Ce que vous avez en plus</h3>
              <p>
                Un véritable <b>espace d&apos;administration sur-mesure</b> : une application sécurisée, à
                vous, où vous modifiez votre contenu en quelques clics. C&apos;est exactement ce qu&apos;on
                a livré au club AME-JUDO d&apos;Ermont, qui gère ses actualités tout seul.
              </p>
              <h3>Ce qui est compris</h3>
              <ul>
                <li>Tout ce qui est dans le Pack Présence</li>
                <li>Espace d&apos;administration : vous modifiez tout vous-même</li>
                <li>Gérez produits, photos, horaires, menus, actualités</li>
                <li>Formation simple à l&apos;outil incluse</li>
                <li>Accompagnement prioritaire</li>
              </ul>
              <h3>Pourquoi 1 200 € et non 550 €&nbsp;?</h3>
              <p>
                Le Pack Pro ne comprend pas qu&apos;un site : il inclut un outil de gestion complet, avec
                sa propre base de données sécurisée. C&apos;est plusieurs semaines de travail en plus —
                vous ne payez pas une page de plus, vous payez un outil que vous gardez.
              </p>
            </div>
          </div>

          <div className="price-guarantee" style={{ marginTop: "2.5rem" }}>
            <span><span className="tick">✓</span> Satisfait ou remboursé 30 jours</span>
            <span><span className="tick">✓</span> Sans engagement, vous partez quand vous voulez</span>
            <span><span className="tick">✓</span> Le code de votre site vous appartient</span>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="cta-final reveal">
            <h2>Pas sûr de la formule&nbsp;?</h2>
            <p>
              Dites-nous ce que vous faites, on vous oriente vers ce qui vous convient vraiment — quitte
              à vous déconseiller le plus cher. Sans engagement.
            </p>
            <Link href="/contact" className="btn-primary">Demander un devis gratuit →</Link>
            <p className="cta-final-sub">Réponse sous 24h · Par message WhatsApp</p>
          </div>
        </div>
      </section>
    </>
  );
}
