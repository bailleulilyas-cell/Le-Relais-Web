import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nos Réalisations — Sites Artisans Ermont, Argenteuil, Sannois | Le Relais Web",
  description:
    "Découvrez nos créations pour artisans et commerçants du Val-d'Oise. Boulangeries, coiffeurs, restaurants — sites rapides, livraison 7 jours.",
  alternates: { canonical: "/realisations" },
};

const demos = [
  { img: "/hero-boulangerie.webp", cat: "Boulangerie · Ermont", name: "La Mie d'Ermont", desc: "Vitrine gourmande, pains, viennoiseries et commande." },
  { img: "/hero-salon.webp", cat: "Coiffeur · Sannois", name: "Studio Camille", desc: "Salon, prestations, galerie et prise de rendez-vous." },
  { img: "/hero-kebab.webp", cat: "Restauration · Argenteuil", name: "Le Bosphore", desc: "Menu, formules, livraison et contact." },
];

const eux = ["Construit sur WordPress ou Wix", "Des milliers de lignes inutiles chargées", "4 secondes pour s'afficher", "Pénalisé par Google", "Lourd et lent sur téléphone"];
const nous = ["Code écrit à la main, sans superflu", "Uniquement ce dont votre site a besoin", "Moins d'une seconde pour s'afficher", "Mis en avant par Google", "Rapide et net sur mobile"];

export default function RealisationsPage() {
  return (
    <>
      <div className="page-hero">
        <div className="container">
          <span className="eyebrow">Nos réalisations</span>
          <h1>À quoi ressemble un site Le Relais Web.</h1>
          <p>
            Des démos réelles, par secteur. Cliquez, testez la vitesse, imaginez la vôtre — c&apos;est
            exactement le niveau qu&apos;on livre à nos clients.
          </p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className="proof-grid">
            {demos.map((d) => (
              <a href="#" className="demo-card reveal" key={d.name}>
                <div className="demo-img" style={{ backgroundImage: `url('${d.img}')` }} />
                <div className="demo-body">
                  <span className="demo-cat">{d.cat}</span>
                  <h3>{d.name}</h3>
                  <p>{d.desc}</p>
                  <span className="demo-link">Voir la démo →</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-alt">
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
