import Link from "next/link";
import Faq from "@/components/Faq";
import { faqItems } from "@/lib/faq-data";

const SITE = "https://www.lerelaisweb.com";

const localBusiness = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": `${SITE}/#business`,
  name: "Le Relais Web",
  legalName: "Le Relais Web — Thierry Bailleul",
  description:
    "Création de sites web rapides pour artisans, commerçants et associations à Ermont et dans le Val-d'Oise. Livré en 7 jours, hébergement et maintenance inclus.",
  url: `${SITE}/`,
  telephone: "+33695382157",
  email: "contact@lerelaisweb.com",
  image: `${SITE}/lerelaisweb_logo.png`,
  logo: `${SITE}/lerelaisweb_logo.png`,
  priceRange: "€€",
  slogan: "Votre partenaire digital local.",
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
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Création de site web",
    itemListElement: [
      { "@type": "Offer", name: "Pack Présence", priceSpecification: { "@type": "UnitPriceSpecification", price: "25.00", priceCurrency: "EUR", unitText: "MONTH" } },
      { "@type": "Offer", name: "Pack Pro", priceSpecification: { "@type": "UnitPriceSpecification", price: "40.00", priceCurrency: "EUR", unitText: "MONTH" } },
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

const scores = [
  { nm: "Vitesse", v: 99 },
  { nm: "Référencement", v: 100 },
  { nm: "Accessibilité", v: 96 },
  { nm: "Bonnes pratiques", v: 100 },
];

const examples = [
  { img: "/hero-boulangerie.webp", cat: "Boulangerie", name: "Boulangerie Dumont", desc: "Pains au levain, viennoiseries, commande en ligne.", href: "/demos/demo-boulangerie.html" },
  { img: "/hero-salon.webp", cat: "Coiffeur", name: "Studio Élise", desc: "Prestations, équipe, galerie & prise de rendez-vous.", href: "/demos/demo-coiffeur.html" },
  { img: "/hero-kebab.webp", cat: "Restauration", name: "Istanbul Grill", desc: "Menu, formules & commande pour la livraison.", href: "/demos/demo-kebab.html" },
];

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusiness) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      {/* ── 1. HERO ── */}
      <section className="hero">
        <div className="container">
          <div className="hero-grid">
            <div>
              <span className="eyebrow">Agence web · Ermont, Val-d&apos;Oise</span>
              <h1>
                Un site qui vous amène<br />de vrais clients.
              </h1>
              <p className="lead">
                On crée votre site, on le met sur Google, et on s&apos;occupe de tout ensuite. Rapide,
                impeccable sur téléphone, livré en 7 jours. Vous, vous gardez votre métier.
              </p>
              <div className="hero-cta">
                <Link href="/contact" className="btn-primary">
                  Demander un devis gratuit →
                </Link>
                <Link href="/services" className="btn-secondary">
                  Voir les offres
                </Link>
              </div>
              <div className="hero-trust">
                <span><span className="tick">✓</span> Livré en 7 jours</span>
                <span><span className="tick">✓</span> Dès 25 €/mois, tout compris</span>
                <span><span className="tick">✓</span> Satisfait ou remboursé 30 j</span>
              </div>
            </div>

            <div className="score-card reveal">
              <div className="score-card-top">
                <div className="score-ring">
                  <svg viewBox="0 0 96 96" aria-hidden="true">
                    <circle className="bg" cx="48" cy="48" r="40" />
                    <circle className="fg" cx="48" cy="48" r="40" />
                  </svg>
                  <span className="score-ring-num">99</span>
                </div>
                <div className="score-card-label">
                  <strong>Note Google de vitesse</strong>
                  <span>Mesurée sur PageSpeed — sur 100</span>
                </div>
              </div>
              <div className="score-rows">
                {scores.map((s) => (
                  <div className="score-row" key={s.nm}>
                    <span className="nm">{s.nm}</span>
                    <span className="bar"><i style={{ width: `${s.v}%` }} /></span>
                    <span className="vl">{s.v}</span>
                  </div>
                ))}
              </div>
              <a
                className="link-accent score-test"
                href="https://pagespeed.web.dev/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Vérifiez n&apos;importe quel site vous-même →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. PROBLÈME ── */}
      <section className="section">
        <div className="container">
          <div className="sec-head center">
            <span className="eyebrow">Le constat</span>
            <h2>Vos clients vous cherchent. Vous trouvent-ils&nbsp;?</h2>
            <p>
              Avant de pousser votre porte, ils tapent votre nom sur leur téléphone. S&apos;ils ne
              trouvent rien — ou un site lent — ils vont chez le concurrent d&apos;à côté.
            </p>
          </div>
          <div className="prob-grid">
            <div className="prob-card reveal">
              <div className="prob-ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
              <h3>Ils ne vous trouvent pas</h3>
              <p>Sans site, vous êtes invisible sur Google. Vos concurrents apparaissent — et récupèrent le client à votre place.</p>
            </div>
            <div className="prob-card reveal">
              <div className="prob-ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 15 14" />
                </svg>
              </div>
              <h3>Votre site est trop lent</h3>
              <p>Un site qui met 4 secondes à s&apos;ouvrir fait fuir un visiteur sur deux. Souvent, c&apos;est WordPress ou Wix qui plombe tout.</p>
            </div>
            <div className="prob-card reveal">
              <div className="prob-ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="7" y="3" width="10" height="18" rx="2" /><line x1="11" y1="18" x2="13" y2="18" />
                </svg>
              </div>
              <h3>Illisible sur téléphone</h3>
              <p>La plupart de vos clients regardent depuis leur mobile. Un site mal adapté, c&apos;est une vitrine pleine de poussière.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2 bis. COMMENT ÇA MARCHE ── */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="sec-head center">
            <span className="eyebrow">Simple, du début à la fin</span>
            <h2>Vous nous parlez. On s&apos;occupe du reste.</h2>
            <p>Pas de jargon, pas de logiciel à apprendre. Trois étapes, et votre site travaille pour vous.</p>
          </div>
          <div className="steps-grid">
            <div className="step-card reveal">
              <div className="step-num">1</div>
              <h3>On se rencontre</h3>
              <p>On vient chez vous, en Île-de-France. On comprend votre métier et vos clients — une vraie discussion, pas un questionnaire.</p>
            </div>
            <div className="step-card reveal">
              <div className="step-num">2</div>
              <h3>On crée votre site</h3>
              <p>En 7 jours, on conçoit un site rapide et soigné, à votre image. Vous le validez avant qu&apos;il soit mis en ligne.</p>
            </div>
            <div className="step-card reveal">
              <div className="step-num">3</div>
              <h3>On s&apos;occupe de tout</h3>
              <p>Hébergement, sécurité, mises à jour, dépannage : c&apos;est compris. Si quelque chose casse, on répare. Vous, vous faites votre métier.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. PREUVES ── */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="sec-head center">
            <span className="eyebrow">La preuve</span>
            <h2>Un site déjà en ligne, près de chez vous.</h2>
          </div>

          <div className="proof-flagship reveal">
            <div className="flag-info">
              <span className="proof-tag"><span className="dot" /> Réalisation cliente · En ligne</span>
              <h3>AME-JUDO — Arts Martiaux Ermontois</h3>
              <p className="flag-loc">Club de judo · Ermont (95) · fondé en 1978</p>
              <p>
                Le club avait besoin d&apos;un vrai site : horaires, inscription en ligne, galerie et
                actualités. On l&apos;a conçu de A à Z — et aujourd&apos;hui le bureau publie ses
                actualités lui-même, sans nous appeler. C&apos;est tout l&apos;intérêt du Pack Pro.
              </p>
              <ul className="flag-feats">
                <li>Espace d&apos;administration</li>
                <li>Inscription en ligne</li>
                <li>Galerie &amp; actualités</li>
                <li>9 pages sur-mesure</li>
              </ul>
              <div className="proof-stats">
                <div className="proof-stat"><span className="n">99</span><span className="l">note vitesse</span></div>
                <div className="proof-stat"><span className="n">240</span><span className="l">adhérents</span></div>
                <div className="proof-stat"><span className="n">7 j</span><span className="l">de création</span></div>
              </div>
              <a href="https://ame-judo.fr" target="_blank" rel="noopener noreferrer" className="btn-primary">
                Voir le site en ligne → ame-judo.fr
              </a>
            </div>

            <a
              href="https://ame-judo.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="flag-window"
              aria-label="Ouvrir le site ame-judo.fr dans un nouvel onglet"
            >
              <span className="flag-score"><b>99</b><i>/100 — vitesse Google</i></span>
              <div className="fw-bar">
                <span className="fw-dot" /><span className="fw-dot" /><span className="fw-dot" />
                <span className="fw-url">
                  <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth={2.4} aria-hidden="true">
                    <rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" />
                  </svg>
                  ame-judo.fr
                </span>
              </div>
              <div className="fw-screen" aria-hidden="true">
                <div className="fw-nav">
                  <span className="fw-brand">AME-JUDO<i>Arts Martiaux Ermontois</i></span>
                  <span className="fw-menu"><i /><i /><i /><i /></span>
                  <span className="fw-cta">S&apos;inscrire</span>
                </div>
                <div className="fw-hero">
                  <span className="fw-eyebrow">礼 · Tout commence par un salut</span>
                  <span className="fw-place">Ermont · Val-d&apos;Oise</span>
                  <h4 className="fw-title">Apprendre<br />à <em>saluer</em>,<br />à <em>vaincre</em>.</h4>
                  <span className="fw-logo">AME</span>
                </div>
              </div>
            </a>
          </div>

          <p className="proof-examples-head">
            <b>Et selon votre métier&nbsp;?</b> Visitez trois sites de démonstration qu&apos;on a conçus —{" "}
            cliquez pour les parcourir.{" "}
            <span style={{ color: "var(--color-ink-muted)" }}>
              (Commerces fictifs créés pour l&apos;exemple.)
            </span>
          </p>
          <div className="proof-grid">
            {examples.map((e) => (
              <a href={e.href} className="ex-card reveal" key={e.name} aria-label={`Voir la démo ${e.name}`}>
                <div className="ex-img" style={{ backgroundImage: `url('${e.img}')` }}>
                  <span className="ex-badge">Voir la démo →</span>
                </div>
                <div className="ex-body">
                  <span className="ex-cat">{e.cat}</span>
                  <h4>{e.name}</h4>
                  <p>{e.desc}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. OFFRES ── */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="sec-head center">
            <span className="eyebrow">Nos offres</span>
            <h2>Deux formules, un prix clair.</h2>
            <p>Sans engagement, sans surprise. Nom de domaine, hébergement et mises à jour toujours compris.</p>
          </div>
          <div className="price-grid">
            <div className="price-card reveal">
              <div className="price-name">Présence</div>
              <div className="price-tagline">On s&apos;occupe de tout. Vous ne touchez à rien.</div>
              <div className="price-amount">
                <span className="n">25 €</span><span className="per">/mois</span>
              </div>
              <div className="price-setup">+ <b>550 €</b> à la création</div>
              <ul className="price-feats">
                <li>Site vitrine sur-mesure (4 à 6 pages)</li>
                <li>Nom de domaine &amp; hébergement inclus</li>
                <li>Vous apparaissez sur Google, en local</li>
                <li>Modifications faites par nous, à la demande</li>
                <li>Maintenance &amp; dépannage compris</li>
              </ul>
              <Link href="/contact" className="btn-secondary">Demander un devis</Link>
            </div>
            <div className="price-card feat reveal">
              <div className="price-flag">Le plus complet</div>
              <div className="price-name">Pro</div>
              <div className="price-tagline">Vous modifiez tout vous-même, quand vous voulez.</div>
              <div className="price-amount">
                <span className="n">40 €</span><span className="per">/mois</span>
              </div>
              <div className="price-setup">+ <b>1 200 €</b> à la création</div>
              <ul className="price-feats">
                <li>Tout ce qui est dans le Pack Présence</li>
                <li><b>Espace d&apos;administration</b> : modifiez tout vous-même</li>
                <li>Produits, photos, horaires, menus, actualités</li>
                <li>Formation simple à l&apos;outil incluse</li>
                <li>Pour un contenu qui change souvent</li>
              </ul>
              <Link href="/contact" className="btn-primary">Demander un devis</Link>
            </div>
          </div>
          <div className="price-guarantee reveal">
            <span><span className="tick">✓</span> Satisfait ou remboursé 30 jours</span>
            <span><span className="tick">✓</span> Sans engagement</span>
            <span><span className="tick">✓</span> Le code vous appartient</span>
          </div>
          <p className="price-note">
            Vous hésitez entre les deux&nbsp;? <b>On en parle, sans engagement</b> — quitte à vous
            déconseiller le plus cher. <Link href="/services" className="link-accent">Voir le détail des offres →</Link>
          </p>

          <div className="incl reveal" style={{ marginTop: "3rem" }}>
            <div className="incl-title">Compris dans les deux formules</div>
            <div className="incl-grid">
              <div className="incl-item">
                <span className="incl-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20z"/></svg></span>
                <div><strong>Nom de domaine &amp; hébergement</strong><span>Votre adresse .fr et la mise en ligne, gérés par nous.</span></div>
              </div>
              <div className="incl-item">
                <span className="incl-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></span>
                <div><strong>Vitesse maximale</strong><span>Note Google 95-100. Votre site s&apos;ouvre en moins d&apos;une seconde.</span></div>
              </div>
              <div className="incl-item">
                <span className="incl-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></span>
                <div><strong>Référencement local</strong><span>Vos clients vous trouvent sur Google, près de chez eux.</span></div>
              </div>
              <div className="incl-item">
                <span className="incl-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="7" y="3" width="10" height="18" rx="2"/><line x1="11" y1="18" x2="13" y2="18"/></svg></span>
                <div><strong>Parfait sur téléphone</strong><span>Impeccable sur mobile, là où vos clients regardent vraiment.</span></div>
              </div>
              <div className="incl-item">
                <span className="incl-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></span>
                <div><strong>Sécurité &amp; maintenance</strong><span>Connexion sécurisée, mises à jour et dépannage compris.</span></div>
              </div>
              <div className="incl-item">
                <span className="incl-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 9h6v6H9z"/></svg></span>
                <div><strong>Votre espace client</strong><span>Suivez l&apos;avancement, vos factures et vos demandes en un coup d&apos;œil.</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. FAQ ── */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="sec-head center">
            <span className="eyebrow">Vos questions</span>
            <h2>Tout ce que vous vous demandez, en clair.</h2>
          </div>
          <Faq />
        </div>
      </section>

      {/* ── 6. CTA FINAL ── */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="cta-final reveal">
            <h2>Et si vos clients vous trouvaient enfin&nbsp;?</h2>
            <p>
              On vient vous rencontrer près de chez vous, on s&apos;occupe de tout, et si le résultat ne
              vous plaît pas, on vous rembourse. Vous ne prenez aucun risque.
            </p>
            <Link href="/contact" className="btn-primary">
              Demander mon devis gratuit →
            </Link>
            <p className="cta-final-sub">Réponse sous 24h · Par message WhatsApp · Sans engagement</p>
          </div>
        </div>
      </section>
    </>
  );
}
