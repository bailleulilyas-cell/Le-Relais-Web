import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pack Présence & Pack Pro — Quel site pour vous ? | Le Relais Web",
  description:
    "Vitrine sur-mesure (Pack Présence, 550€) ou site avec back-office (Pack Pro, 1200€). Livré en 7 jours, hébergement inclus, sans engagement. Val-d'Oise.",
  alternates: { canonical: "/services" },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://www.lerelaisweb.com/services",
    title: "Pack Présence & Pack Pro — Quel site pour vous ? | Le Relais Web",
    description: "Deux formules claires, prix transparents. Livré en 7 jours, tout compris.",
    images: ["/lerelaisweb_logo.png"],
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

const inclus = [
  ["Nom de domaine & hébergement", "Votre adresse .fr et la mise en ligne, gérés par nous."],
  ["Vitesse maximale", "Note Google 95-100. Le site s'ouvre en moins d'une seconde."],
  ["Référencement local", "Vos clients vous trouvent sur Google, près de chez eux."],
  ["Parfait sur téléphone", "Impeccable sur mobile, là où vos clients regardent."],
  ["Sécurité & maintenance", "Connexion sécurisée, mises à jour et dépannage compris."],
  ["Votre espace client", "Suivez l'avancement, vos factures et vos demandes."],
];

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

      {/* ── Comment ça se passe ── */}
      <section className="section-sm">
        <div className="container">
          <div className="sec-head center">
            <span className="eyebrow">Comment ça se passe</span>
            <h2>De la première rencontre à la mise en ligne.</h2>
          </div>
          <div className="steps-grid">
            <div className="step-card reveal">
              <div className="step-num">1</div>
              <h3>On se rencontre</h3>
              <p>On vient chez vous, en Île-de-France. On comprend votre métier, vos clients, ce qui vous distingue.</p>
            </div>
            <div className="step-card reveal">
              <div className="step-num">2</div>
              <h3>On crée &amp; vous validez</h3>
              <p>On conçoit votre site à votre image. Vous le relisez et le validez avant la mise en ligne — rien ne passe sans votre accord.</p>
            </div>
            <div className="step-card reveal">
              <div className="step-num">3</div>
              <h3>On reste à vos côtés</h3>
              <p>Une fois en ligne, on continue de gérer l&apos;hébergement, la sécurité et les mises à jour. Vous n&apos;êtes jamais seul.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Les deux packs ── */}
      <section className="section-sm">
        <div className="container">
          <div className="svc-block">
            <aside className="svc-aside">
              <div className="price-name">Présence</div>
              <div className="price-tagline">On s&apos;occupe de tout.</div>
              <div className="price-amount"><span className="n">25 €</span><span className="per">/mois</span></div>
              <div className="price-setup">+ <b>550 €</b> à la création</div>
              <Link href="/contact" className="btn-primary">Demander un devis</Link>
            </aside>
            <div className="svc-detail">
              <h3>Pour qui&nbsp;?</h3>
              <p>
                Pour vous si le contenu de votre site bouge peu — vos informations, vos services, vos
                coordonnées restent globalement les mêmes au fil de l&apos;année. Vous voulez être
                visible et joignable, sans rien avoir à gérer vous-même.
              </p>
              <h3>Comment ça marche</h3>
              <p>
                On vient vous rencontrer, vous nous donnez vos infos et vos photos une fois, et 7 jours
                plus tard votre site est en ligne. Un changement à faire&nbsp;? Vous nous envoyez un
                message, on s&apos;en occupe.
              </p>
              <h3>Ce que vous avez</h3>
              <ul>
                <li>Site vitrine sur-mesure, 4 à 6 pages</li>
                <li>Toutes les modifications faites par nous, à la demande</li>
                <li>Tout ce qui est compris dans nos sites (ci-dessous)</li>
              </ul>
            </div>
          </div>

          <div className="svc-block">
            <aside className="svc-aside">
              <div className="price-name">Pro</div>
              <div className="price-tagline">Vous gérez vous-même.</div>
              <div className="price-amount"><span className="n">40 €</span><span className="per">/mois</span></div>
              <div className="price-setup">+ <b>1 200 €</b> à la création</div>
              <Link href="/contact" className="btn-primary">Demander un devis</Link>
            </aside>
            <div className="svc-detail">
              <h3>Pour qui&nbsp;?</h3>
              <p>
                Pour vous si votre contenu change souvent et que vous voulez en garder la main —
                modifier vos produits, vos photos, vos prix ou vos actualités quand vous le décidez,
                sans avoir à nous solliciter à chaque fois.
              </p>
              <h3>Ce que vous avez en plus</h3>
              <p>
                Un véritable <b>espace d&apos;administration sur-mesure</b>&nbsp;: une application
                sécurisée, à vous, où vous modifiez votre contenu en quelques clics. C&apos;est ce type
                d&apos;outil qu&apos;on a livré au club AME-JUDO d&apos;Ermont, qui gère ses actualités
                tout seul.
              </p>
              <h3>Ce que vous avez</h3>
              <ul>
                <li>Tout le Pack Présence</li>
                <li>Votre espace pour tout modifier vous-même</li>
                <li>Formation simple à l&apos;outil incluse</li>
                <li>Accompagnement prioritaire</li>
              </ul>
              <h3>Pourquoi 1 200 € et non 550 €&nbsp;?</h3>
              <p>
                Le Pack Pro ne comprend pas qu&apos;un site&nbsp;: il inclut un outil de gestion complet,
                avec sa propre base de données sécurisée. C&apos;est plusieurs semaines de travail en
                plus — vous ne payez pas une page de plus, vous payez un outil que vous gardez.
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

      {/* ── Inclus dans tous nos sites ── */}
      <section className="section-sm">
        <div className="container">
          <div className="incl reveal">
            <div className="incl-title">Compris dans les deux formules, sans supplément</div>
            <div className="incl-grid">
              {inclus.map(([t, d]) => (
                <div className="incl-item" key={t}>
                  <span className="incl-ic">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  <div><strong>{t}</strong><span>{d}</span></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Comparatif marché ── */}
      <section className="section-sm">
        <div className="container">
          <div className="sec-head center">
            <span className="eyebrow">Le vrai prix d&apos;un site</span>
            <h2>Moins cher qu&apos;une agence classique.</h2>
            <p>À qualité égale, voire supérieure sur la vitesse. Et sans frais cachés.</p>
          </div>
          <div className="compare-market">
            <div className="cm-card them">
              <div className="cm-tag">Agence classique</div>
              <div className="cm-price">1 500 – 3 500 €</div>
              <div className="cm-sub">à la création</div>
              <p className="cm-note">+ 80 à 200 €/mois de frais récurrents. Et bien souvent, vous n&apos;êtes pas propriétaire de votre site.</p>
            </div>
            <div className="cm-card us">
              <div className="cm-tag">Le Relais Web</div>
              <div className="cm-price">550 €</div>
              <div className="cm-sub">à la création, puis 25 €/mois</div>
              <p className="cm-note">Tout compris : domaine, hébergement, mises à jour, dépannage. Le site et le code sont à vous.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: "24px" }}>
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
