import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nos Réalisations — Sites Web Artisans & Associations Ermont, Val-d'Oise | Le Relais Web",
  description:
    "AME-JUDO Ermont et nos modèles par secteur : sites web rapides pour artisans, commerçants et associations du Val-d'Oise. Score Google 99/100, livraison 7 jours.",
  alternates: { canonical: "/realisations" },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://www.lerelaisweb.com/realisations",
    title: "Nos Réalisations — Sites Web Val-d'Oise | Le Relais Web",
    description:
      "AME-JUDO Ermont, un vrai site client en ligne, et nos modèles par secteur. Score Google 99/100.",
    images: ["/logo.webp"],
  },
};

const realisationsSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: "Création de site web",
  provider: { "@type": "LocalBusiness", name: "Le Relais Web", "@id": "https://www.lerelaisweb.com/#business" },
  areaServed: [
    { "@type": "AdministrativeArea", name: "Val-d'Oise" },
    { "@type": "AdministrativeArea", name: "Île-de-France" },
  ],
  hasPart: {
    "@type": "WebSite",
    name: "AME-JUDO — Arts Martiaux Ermontois",
    url: "https://ame-judo.fr",
    description:
      "Site du club de judo d'Ermont réalisé par Le Relais Web : 9 pages sur-mesure, adhésion en ligne et actualités gérées par le club.",
  },
};

const demos = [
  { img: "/hero-boulangerie.webp", cat: "Boulangerie · Ermont", name: "La Mie d'Ermont", desc: "Vitrine gourmande, pains, viennoiseries et commande." },
  { img: "/hero-salon.webp", cat: "Coiffeur · Sannois", name: "Studio Camille", desc: "Salon, prestations, galerie et prise de rendez-vous." },
  { img: "/hero-kebab.webp", cat: "Restauration · Argenteuil", name: "Le Bosphore", desc: "Menu, formules, livraison et contact." },
];

const eux = ["Construit sur WordPress ou Wix", "Des milliers de lignes inutiles chargées", "4 secondes pour s'afficher", "Pénalisé par Google", "Lourd et lent sur téléphone"];
const nous = ["Code écrit à la main, sans superflu", "Uniquement ce dont votre site a besoin", "Moins d'une seconde pour s'afficher", "Mis en avant par Google", "Rapide et net sur mobile"];

const AME_URL = "https://ame-judo.fr";

export default function RealisationsPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(realisationsSchema) }} />
      <div className="page-hero">
        <div className="container">
          <span className="eyebrow">Nos réalisations</span>
          <h1>Un vrai client, en ligne. Et le niveau qu&apos;on livre.</h1>
          <p>
            Notre dernier site est en ligne et tourne tous les jours. Découvrez-le, testez sa
            vitesse — puis imaginez le vôtre.
          </p>
        </div>
      </div>

      {/* ── Réalisation phare : AME-JUDO ── */}
      <section className="section">
        <div className="container">
          <div className="flagship reveal">
            <div className="flagship-text">
              <span className="flagship-tag">
                <span className="flagship-dot" /> Site en ligne · Ermont
              </span>
              <h2>AME-JUDO — Arts Martiaux Ermontois</h2>
              <p className="flagship-desc">
                Le club de judo d&apos;Ermont (240 adhérents, fondé en 1978) avait besoin d&apos;un
                site complet : horaires, enseignants, adhésion en ligne, galerie et actualités.
                On l&apos;a conçu de A à Z — et surtout, <strong>le club met à jour ses actualités
                et son contenu lui-même</strong>, sans nous appeler, depuis un espace
                d&apos;administration sur-mesure.
              </p>
              <ul className="flagship-points">
                <li>Inscription en ligne et documents d&apos;adhésion</li>
                <li>Actualités du dojo modifiables par le club</li>
                <li>Pensé mobile d&apos;abord — la majorité des parents consultent au téléphone</li>
              </ul>
              <div className="flagship-stats">
                <div className="flagship-stat">
                  <span className="fs-num">240</span>
                  <span className="fs-lbl">adhérents</span>
                </div>
                <div className="flagship-stat">
                  <span className="fs-num">9</span>
                  <span className="fs-lbl">pages sur-mesure</span>
                </div>
                <div className="flagship-stat">
                  <span className="fs-num">1978</span>
                  <span className="fs-lbl">club historique</span>
                </div>
              </div>
              <a href={AME_URL} target="_blank" rel="noopener noreferrer" className="btn-primary flagship-cta">
                Voir le site en ligne → ame-judo.fr
              </a>
            </div>

            <a href={AME_URL} target="_blank" rel="noopener noreferrer" className="flagship-window" aria-label="Ouvrir ame-judo.fr">
              <div className="fw-bar">
                <span className="fw-dot" />
                <span className="fw-dot" />
                <span className="fw-dot" />
                <span className="fw-url">ame-judo.fr</span>
              </div>
              <div className="fw-screen">
                <span className="fw-kanji">柔道</span>
                <span className="fw-club">AME-JUDO</span>
                <span className="fw-sub">Arts Martiaux Ermontois · depuis 1978</span>
                <span className="fw-open">Ouvrir le site →</span>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* ── Modèles par secteur ── */}
      <section className="section section-alt">
        <div className="container">
          <div className="sec-head center">
            <span className="eyebrow">Modèles par secteur</span>
            <h2 className="sec-title">Et pour les commerçants ?</h2>
            <p className="sec-sub">
              Voici le style qu&apos;on livre selon votre métier. Le vôtre sera unique, à votre image.
            </p>
          </div>
          <div className="proof-grid">
            {demos.map((d) => (
              <a href="/devis" className="demo-card reveal" key={d.name}>
                <div className="demo-img" style={{ backgroundImage: `url('${d.img}')` }} />
                <div className="demo-body">
                  <span className="demo-cat">{d.cat}</span>
                  <h3>{d.name}</h3>
                  <p>{d.desc}</p>
                  <span className="demo-link">Je veux ce style →</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="sec-head center">
            <span className="eyebrow">La différence</span>
            <h2 className="sec-title">Pourquoi pas Wix ou WordPress ?</h2>
            <p className="sec-sub">
              La même boutique, deux technologies. Sur Google, la vitesse se paie en clients perdus.
            </p>
          </div>
          <div className="compare-wrap">
            <div className="compare-card them reveal">
              <h3>Un site Wix / WordPress</h3>
              <div className="compare-score">~40</div>
              <div className="compare-score-lbl">Score Google moyen</div>
              {eux.map((t) => (
                <div className="compare-li" key={t}>
                  <span style={{ color: "var(--amber)", fontWeight: 900 }}>✕</span>
                  {t}
                </div>
              ))}
            </div>
            <div className="compare-card us reveal">
              <h3>Un site Le Relais Web</h3>
              <div className="compare-score">99</div>
              <div className="compare-score-lbl">Score Google visé</div>
              {nous.map((t) => (
                <div className="compare-li" key={t}>
                  <span style={{ color: "var(--signal)", fontWeight: 900 }}>✓</span>
                  {t}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="cta-final reveal">
            <h2>Vous voulez un site comme ça ?</h2>
            <p>On vous fait le vôtre, à votre image, livré en 7 jours. Parlons-en sans engagement.</p>
            <a href="/devis" className="btn-primary">
              Demander mon devis gratuit →
            </a>
            <p className="cta-final-sub">Réponse sous 24h · Par message WhatsApp · Zéro spam</p>
          </div>
        </div>
      </section>
    </>
  );
}
