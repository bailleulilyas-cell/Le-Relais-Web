import PerfPanel from "@/components/PerfPanel";
import EspaceClientScreen from "@/components/EspaceClientScreen";
import Faq from "@/components/Faq";
import { faqItems } from "@/lib/faq-data";

const SITE = "https://www.lerelaisweb.com";

const schema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": `${SITE}/#business`,
  name: "Le Relais Web",
  legalName: "Le Relais Web — Thierry Bailleul",
  description:
    "Agence de création de sites web rapides pour artisans, commerçants et associations en Val-d'Oise. Site livré en 7 jours, hébergement et maintenance inclus.",
  url: `${SITE}/`,
  telephone: "+33695382157",
  email: "contact@lerelaisweb.com",
  image: `${SITE}/logo.webp`,
  logo: `${SITE}/logo.webp`,
  priceRange: "€€",
  currenciesAccepted: "EUR",
  paymentAccepted: "Carte bancaire",
  vatID: "FR",
  taxID: "10158642800019",
  knowsLanguage: "fr-FR",
  slogan: "On crée votre site. Vous, vous gardez votre métier.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Ermont",
    addressLocality: "Ermont",
    postalCode: "95120",
    addressRegion: "Val-d'Oise",
    addressCountry: "FR",
  },
  geo: { "@type": "GeoCoordinates", latitude: 48.9908, longitude: 2.2578 },
  areaServed: [
    { "@type": "City", name: "Ermont" },
    { "@type": "City", name: "Argenteuil" },
    { "@type": "City", name: "Sannois" },
    { "@type": "City", name: "Eaubonne" },
    { "@type": "City", name: "Franconville" },
    { "@type": "City", name: "Enghien-les-Bains" },
    { "@type": "City", name: "Taverny" },
    { "@type": "AdministrativeArea", name: "Val-d'Oise" },
    { "@type": "AdministrativeArea", name: "Île-de-France" },
  ],
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    opens: "09:00",
    closes: "19:00",
  },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Création de site web",
    itemListElement: [
      {
        "@type": "Offer",
        name: "Pack Présence — site vitrine",
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          price: "25.00",
          priceCurrency: "EUR",
          unitText: "MONTH",
        },
        description:
          "Site vitrine professionnel, hébergement, maintenance et SEO local. 400 € de mise en service puis 25 €/mois, sans engagement.",
      },
      {
        "@type": "Offer",
        name: "Pack Pro — site avec espace d'administration",
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          price: "40.00",
          priceCurrency: "EUR",
          unitText: "MONTH",
        },
        description:
          "Site sur-mesure avec un espace d'administration : le client modifie son contenu lui-même. À partir de 40 €/mois.",
      },
    ],
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((it) => ({
    "@type": "Question",
    name: it.q,
    acceptedAnswer: { "@type": "Answer", text: it.a },
  })),
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE}/#website`,
  url: `${SITE}/`,
  name: "Le Relais Web",
  inLanguage: "fr-FR",
  publisher: { "@id": `${SITE}/#business` },
};

const demos = [
  { href: "/realisations", img: "/hero-boulangerie.webp", cat: "Boulangerie", name: "La Mie d'Ermont", desc: "Vitrine gourmande, pains & viennoiseries" },
  { href: "/realisations", img: "/hero-salon.webp", cat: "Coiffeur", name: "Studio Camille", desc: "Salon, prestations & prise de rendez-vous" },
  { href: "/realisations", img: "/hero-kebab.webp", cat: "Restauration", name: "Le Bosphore", desc: "Menu, formules & livraison" },
];

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />

      <div className="trust-strip">
        <div className="trust-strip-inner">
          <span>Chargement en moins d&apos;une seconde</span>
          <span className="trust-dot">·</span>
          <span>On se déplace chez vous</span>
          <span className="trust-dot">·</span>
          <span>Satisfait ou remboursé 30 jours</span>
          <span className="trust-dup" aria-hidden="true">
            <span className="trust-dot">·</span>
            <span>Chargement en moins d&apos;une seconde</span>
            <span className="trust-dot">·</span>
            <span>On se déplace chez vous</span>
            <span className="trust-dot">·</span>
            <span>Satisfait ou remboursé 30 jours</span>
          </span>
        </div>
      </div>

      <main>
        <section className="hero">
          <div className="container">
            <div className="hero-grid">
              <div>
                <span className="eyebrow">Agence web locale</span>
                <h1>
                  On crée votre site. Vous, vous gardez <span className="ital">votre métier.</span>
                </h1>
                <p className="hero-lead">
                  Pour les commerçants d&apos;Ermont, Argenteuil et du Val-d&apos;Oise. On s&apos;occupe de
                  tout — votre site s&apos;ouvre en moins d&apos;une seconde, et vos clients vous trouvent
                  sur Google. Vous n&apos;avez rien à gérer.
                </p>
                <div className="cta-group">
                  <a href="/devis" className="btn-primary">
                    Demander un devis gratuit →
                  </a>
                  <a href="/realisations" className="btn-secondary">
                    Voir nos réalisations
                  </a>
                </div>
                <div className="hero-trust">
                  <span>
                    <span className="ht-ic">✓</span> Moins d&apos;une seconde
                  </span>
                  <span>
                    <span className="ht-ic">✓</span> On vient chez vous
                  </span>
                  <span>
                    <span className="ht-ic">✓</span> Garantie 30 jours
                  </span>
                </div>
              </div>
              <PerfPanel />
            </div>
          </div>
        </section>

        <section className="section section-alt">
          <div className="container">
            <div className="sec-head">
              <span className="eyebrow">Le constat</span>
              <h2 className="sec-title">Aujourd&apos;hui, vos clients vous cherchent en ligne.</h2>
              <p className="sec-sub">
                Avant même de pousser votre porte, ils tapent votre nom sur leur téléphone. S&apos;ils ne
                trouvent rien — ou un site lent qui met du temps à s&apos;ouvrir — ils vont voir ailleurs.
                Pas par méchanceté. Juste parce que c&apos;est plus simple.
              </p>
            </div>
            <div className="prob-grid">
              <div className="prob-card reveal">
                <div className="ic">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="11" cy="11" r="7" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>
                <h3>Ils ne vous trouvent pas</h3>
                <p>Sans site, vous êtes invisible sur Google. Vos concurrents, eux, apparaissent — et récupèrent le client.</p>
              </div>
              <div className="prob-card reveal">
                <div className="ic">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="9" />
                    <polyline points="12 7 12 12 15 14" />
                  </svg>
                </div>
                <h3>Le site est trop lent</h3>
                <p>Un site qui met 4 secondes à s&apos;ouvrir fait fuir un visiteur sur deux. Souvent, c&apos;est WordPress ou Wix qui plombe tout.</p>
              </div>
              <div className="prob-card reveal">
                <div className="ic">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="7" y="3" width="10" height="18" rx="2" />
                    <line x1="11" y1="18" x2="13" y2="18" />
                  </svg>
                </div>
                <h3>Illisible sur téléphone</h3>
                <p>La plupart de vos clients regardent depuis leur mobile. Un site mal adapté, c&apos;est une vitrine pleine de poussière.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="sec-head">
              <span className="eyebrow">Ce qu&apos;on fait</span>
              <h2 className="sec-title">On s&apos;occupe de tout, du début à la fin.</h2>
              <p className="sec-sub">
                Vous n&apos;avez pas à devenir expert en informatique. Vous nous parlez de votre commerce, on
                fait le reste — et on continue de gérer votre site une fois qu&apos;il est en ligne.
              </p>
            </div>
            <div className="steps-grid">
              <div className="step reveal">
                <div className="step-num">01</div>
                <h3>On vient vous rencontrer</h3>
                <p>On se déplace chez vous, en Île-de-France. On comprend votre métier, vos clients, ce qui vous distingue. Pas de jargon, juste une discussion.</p>
                <div className="step-line" />
              </div>
              <div className="step reveal">
                <div className="step-num">02</div>
                <h3>On crée votre site</h3>
                <p>En 7 jours ouvrés, votre site sur-mesure est en ligne. Rapide, beau sur téléphone, prêt à être trouvé sur Google. Vous validez avant la mise en ligne.</p>
                <div className="step-line" />
              </div>
              <div className="step reveal">
                <div className="step-num">03</div>
                <h3>On le gère pour vous</h3>
                <p>Hébergement, mises à jour, petites modifications, pannes : tout est compris dans l&apos;abonnement. Si quelque chose casse, on répare. Vous, vous faites votre métier.</p>
                <div className="step-line" />
              </div>
            </div>
          </div>
        </section>

        <section className="section section-alt">
          <div className="container">
            <div className="sec-head center">
              <span className="eyebrow">Des exemples concrets</span>
              <h2 className="sec-title">À quoi ressemble un site Le Relais Web.</h2>
              <p className="sec-sub">
                Un de nos sites est déjà en ligne, à Ermont. Et voici les modèles qu&apos;on livre
                selon votre métier.
              </p>
            </div>

            <a
              href="/realisations"
              className="live-client reveal"
              aria-label="Voir la réalisation AME-JUDO"
            >
              <span className="live-client-badge">
                <span className="live-client-dot" /> Client en ligne · Ermont
              </span>
              <span className="live-client-body">
                <strong>AME-JUDO — Arts Martiaux Ermontois</strong>
                <span>
                  Le club de judo d&apos;Ermont met à jour ses actualités lui-même, depuis son
                  espace d&apos;administration sur-mesure.
                </span>
              </span>
              <span className="live-client-link">Voir la réalisation →</span>
            </a>

            <div className="proof-grid">
              {demos.map((d) => (
                <a href={d.href} className="demo-card reveal" key={d.name}>
                  <div className="demo-img" style={{ backgroundImage: `url('${d.img}')` }} />
                  <div className="demo-body">
                    <span className="demo-cat">{d.cat}</span>
                    <h3>{d.name}</h3>
                    <p>{d.desc}</p>
                    <span className="demo-link">Voir le modèle →</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="sec-head center">
              <span className="eyebrow">Nos formules</span>
              <h2 className="sec-title">Deux formules, selon vos besoins.</h2>
              <p className="sec-sub">
                Prix transparent, sans engagement, sans surprise. Hébergement et nom de domaine toujours
                compris.
              </p>
            </div>
            <div className="price-grid">
              <div className="price-card reveal">
                <div className="price-name">Présence</div>
                <div className="price-mode them">On s&apos;occupe de tout</div>
                <div className="price-for">
                  Vous nous envoyez vos infos et vos photos une fois. On crée le site, on le met en ligne, et
                  on s&apos;occupe de chaque modification à votre place.
                </div>
                <div className="price-amt">
                  <span className="n">25 €</span>
                  <span className="per">/mois</span>
                </div>
                <div className="price-setup">
                  + <b>400 €</b> à la mise en service
                </div>
                <ul className="price-feats">
                  <li>Site vitrine sur-mesure, 4 à 6 pages</li>
                  <li>Nom de domaine &amp; hébergement inclus</li>
                  <li>Référencement local sur Google</li>
                  <li>Modifications faites par nous, à la demande</li>
                  <li>Maintenance &amp; dépannage compris</li>
                  <li>Espace client pour suivre votre projet</li>
                </ul>
                <a href="/devis" className="price-btn outline">
                  Demander un devis
                </a>
              </div>
              <div className="price-card feat reveal">
                <div className="price-flag">Le plus complet</div>
                <div className="price-name">Pro</div>
                <div className="price-mode you">Vous gérez vous-même</div>
                <div className="price-for">
                  Pour un contenu qui bouge souvent — produits, photos, menus. Vous modifiez tout vous-même,
                  quand vous voulez, sans avoir à nous solliciter.
                </div>
                <div className="price-amt">
                  <span className="n">40 €</span>
                  <span className="per">/mois</span>
                </div>
                <div className="price-setup">
                  + <b>1 200 €</b> à la mise en service
                </div>
                <ul className="price-feats">
                  <li>Tout ce qui est dans le Pack Présence</li>
                  <li>
                    <b>Espace d&apos;administration</b> : vous modifiez tout vous-même
                  </li>
                  <li>Gérez produits, photos, horaires, actualités</li>
                  <li>Formation simple à l&apos;outil incluse</li>
                  <li>Idéal boucherie, club, restaurant, association</li>
                  <li>Accompagnement prioritaire</li>
                </ul>
                <a href="/devis" className="price-btn solid">
                  Demander un devis
                </a>
              </div>
            </div>

            <div className="price-compare reveal">
              <div className="pc-row pc-head">
                <div className="pc-label"></div>
                <div className="pc-pres">Présence</div>
                <div className="pc-pro">Pro</div>
              </div>
              <div className="pc-row">
                <div className="pc-label">Qui met le site à jour&nbsp;?</div>
                <div className="pc-pres">Nous, à votre demande</div>
                <div className="pc-pro">Vous, quand vous voulez</div>
              </div>
              <div className="pc-row">
                <div className="pc-label">Ce que vous obtenez</div>
                <div className="pc-pres">Un site vitrine professionnel</div>
                <div className="pc-pro">Un site + un espace d&apos;administration</div>
              </div>
              <div className="pc-row">
                <div className="pc-label">Idéal pour</div>
                <div className="pc-pres">Contenu stable — coiffeur, plombier, artisan</div>
                <div className="pc-pro">Contenu qui change — boucherie, restaurant, club</div>
              </div>
              <div className="pc-row">
                <div className="pc-label">Délai de livraison</div>
                <div className="pc-pres">7 jours ouvrés</div>
                <div className="pc-pro">2 à 3 semaines</div>
              </div>
            </div>
            <div className="price-why reveal">
              <b>Pourquoi 1 200 € et non 400 €&nbsp;?</b> Le Pack Pro ne comprend pas qu&apos;un site : il
              inclut un véritable espace d&apos;administration sur-mesure — une application sécurisée, avec sa
              propre base de données, que vous utilisez pour tout modifier vous-même. C&apos;est plusieurs
              semaines de travail en plus d&apos;un simple site vitrine. Vous ne payez pas une page de plus,
              vous payez un outil que vous gardez.
            </div>
            <p className="price-note">
              Vous hésitez entre les deux&nbsp;? <b>On en parle ensemble, sans engagement.</b> On vous oriente
              vers ce qui vous convient vraiment — quitte à vous déconseiller le plus cher.
            </p>
          </div>
        </section>

        <section className="section section-alt">
          <div className="container">
            <div className="ec-inner">
              <div className="reveal">
                <span className="eyebrow">Inclus dans l&apos;abonnement</span>
                <h2 className="sec-title">Un espace rien que pour vous.</h2>
                <p className="sec-sub">
                  Fini les messages pour savoir où en est votre site. Vous avez un tableau de bord clair,
                  disponible jour et nuit, qui vous montre tout ce qu&apos;on fait pour vous.
                </p>
                <div className="ec-feats">
                  <div className="ec-feat">
                    <span className="ic">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <line x1="4" y1="20" x2="4" y2="11" />
                        <line x1="10" y1="20" x2="10" y2="4" />
                        <line x1="16" y1="20" x2="16" y2="14" />
                      </svg>
                    </span>
                    L&apos;avancement de votre projet, étape par étape
                  </div>
                  <div className="ec-feat">
                    <span className="ic">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <polyline points="3 12 7 12 10 5 14 19 17 12 21 12" />
                      </svg>
                    </span>
                    Votre site en ligne, vérifié en temps réel
                  </div>
                  <div className="ec-feat">
                    <span className="ic">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <rect x="5" y="3" width="14" height="18" rx="1" />
                        <line x1="8" y1="8" x2="16" y2="8" />
                        <line x1="8" y1="12" x2="16" y2="12" />
                        <line x1="8" y1="16" x2="12" y2="16" />
                      </svg>
                    </span>
                    Vos factures, accessibles à tout moment
                  </div>
                  <div className="ec-feat">
                    <span className="ic">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M21 11.5a8.5 8.5 0 0 1-12.1 7.7L3 21l1.8-5.9A8.5 8.5 0 1 1 21 11.5z" />
                      </svg>
                    </span>
                    Vos demandes de modification, suivies
                  </div>
                </div>
                <a href="/compte" className="btn-primary">
                  Accéder à mon espace →
                </a>
              </div>
              <EspaceClientScreen />
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="sec-head center">
              <span className="eyebrow">Vos questions</span>
              <h2 className="sec-title">Tout ce que vous vous demandez, en clair.</h2>
            </div>
            <Faq />
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="cta-final reveal">
              <h2>Parlons de votre projet.</h2>
              <p>
                Un message, une rencontre près de chez vous, et on s&apos;occupe du reste. Sans engagement, et
                sans la moindre pression.
              </p>
              <a href="/devis" className="btn-primary">
                Demander mon devis gratuit →
              </a>
              <p className="cta-final-sub">Réponse sous 24h · Par message WhatsApp · Zéro spam</p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
