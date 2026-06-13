import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "À propos — Agence Web Locale Ermont Val-d'Oise | Le Relais Web",
  description:
    "Le Relais Web, une agence web locale à Ermont. On écrit chaque site à la main pour les commerçants du Val-d'Oise. Proximité, honnêteté, rapidité.",
  alternates: { canonical: "/equipe" },
};

const values = [
  { t: "Local avant tout", d: "On est d'Ermont, on connaît le Val-d'Oise. On se déplace chez vous, on parle votre langue — pas celle des grandes agences parisiennes." },
  { t: "Honnête sur le prix", d: "400 € une fois, 25 € par mois. Rien de caché, rien de surprise. Si une formule ne vous sert pas, on vous le dit." },
  { t: "Fait à la main", d: "Chaque site est écrit ligne par ligne, sans usine à gaz. C'est ce qui le rend deux fois plus rapide que la concurrence." },
  { t: "Joignable, pour de vrai", d: "Un message WhatsApp et vous avez une réponse sous 24h. Pas de standard, pas d'attente — quelqu'un de votre région." },
];

export default function EquipePage() {
  return (
    <>
      <div className="page-hero">
        <div className="container">
          <span className="eyebrow">À propos</span>
          <h1>Une agence locale, à taille humaine.</h1>
          <p>Pas une usine à sites. Une personne de votre région qui crée le vôtre, avec soin.</p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className="team-wrap">
            <div className="team-card reveal">
              <div className="team-avatar">I</div>
              <div className="team-name">Ilyas</div>
              <div className="team-role">Fondateur · Le Relais Web · Ermont</div>
              <div className="team-bio">
                <p>
                  J&apos;ai lancé Le Relais Web avec une idée simple : les commerçants de mon quartier
                  méritent un site aussi rapide et soigné que ceux des grandes enseignes — sans payer le
                  prix d&apos;une agence parisienne.
                </p>
                <p>
                  J&apos;écris chaque site à la main, sans WordPress ni Wix. C&apos;est plus long pour moi,
                  mais c&apos;est ce qui rend votre site ultra-rapide et bien placé sur Google. Vous, vous
                  faites votre métier ; moi, je m&apos;occupe de toute la technique.
                </p>
                <p>
                  Je préfère le contact en vrai. Je me déplace dans tout le Val-d&apos;Oise, on prend le
                  temps de comprendre votre commerce, et je reste joignable par message une fois le site en
                  ligne. C&apos;est ça, un relais : quelqu&apos;un sur qui vous pouvez compter, près de chez
                  vous.
                </p>
              </div>
            </div>

            <div className="values-grid">
              {values.map((v) => (
                <div className="value-card reveal" key={v.t}>
                  <h3>{v.t}</h3>
                  <p>{v.d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <div className="cta-final reveal">
            <h2>On en parle ?</h2>
            <p>Une question, un projet, ou juste l&apos;envie de savoir ce qu&apos;on pourrait faire pour votre commerce — écrivez-moi.</p>
            <a href="/devis" className="btn-primary">
              Demander un devis gratuit →
            </a>
            <p className="cta-final-sub">Réponse sous 24h · Par message WhatsApp · Ermont · Val-d&apos;Oise</p>
          </div>
        </div>
      </section>
    </>
  );
}
