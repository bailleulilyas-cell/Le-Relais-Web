import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de Confidentialité | Le Relais Web",
  description:
    "Politique de confidentialité de Le Relais Web, conforme RGPD. Données collectées, cookies, services tiers et vos droits.",
  alternates: { canonical: "/politique-confidentialite" },
};

const toc = [
  ["s1", "1. Qui sommes-nous ?"],
  ["s2", "2. Données collectées"],
  ["s3", "3. Finalités"],
  ["s4", "4. Cookies"],
  ["s5", "5. Services tiers"],
  ["s6", "6. Conservation"],
  ["s7", "7. Vos droits"],
  ["s8", "8. Sécurité"],
  ["s9", "9. Contact"],
  ["s10", "10. Espace client"],
];

const sections: { id: string; num: string; title: string; html: string }[] = [
  {
    id: "s1",
    num: "1",
    title: "Qui sommes-nous ?",
    html: `
      <p><strong>Le Relais Web</strong> est une agence web spécialisée dans la création de sites rapides pour artisans et commerçants locaux.</p>
      <p><strong>Responsable du traitement :</strong> Thierry Bailleul<br><strong>Nom commercial :</strong> Le Relais Web<br><strong>Statut :</strong> Micro-entrepreneur individuel<br><strong>SIREN :</strong> 101 586 428 · <strong>SIRET :</strong> 101 586 428 00019<br><strong>Code APE :</strong> 6201Z — Programmation informatique<br><strong>Immatriculé le :</strong> 23/02/2026<br><strong>Email :</strong> <a href="mailto:contact@lerelaisweb.com">contact@lerelaisweb.com</a></p>`,
  },
  {
    id: "s2",
    num: "2",
    title: "Données collectées",
    html: `
      <p><strong>Via le formulaire de contact / devis :</strong></p>
      <ul><li><strong>Prénom</strong> et <strong>nom de l'établissement</strong></li><li><strong>Adresse e-mail</strong></li><li><strong>Numéro de téléphone</strong></li><li><strong>Ville</strong> et <strong>secteur d'activité</strong></li><li>Quelques informations sur le projet : présence d'un site existant, d'un logo, et description libre</li></ul>
      <p>Nous ne collectons jamais de données bancaires.</p>
      <p><strong>Via la création de compte (espace client) :</strong></p>
      <ul>
        <li><strong>Nom complet</strong></li>
        <li><strong>Adresse e-mail</strong></li>
        <li><strong>Mot de passe</strong> (hashé via bcrypt — jamais stocké en clair)</li>
        <li><strong>Données de projet</strong> : URL du site, avancement, étapes, documents</li>
        <li><strong>Historique des interventions</strong> et <strong>factures</strong></li>
        <li><strong>Demandes de support</strong> soumises via l'espace client</li>
      </ul>
      <p>Ces données sont stockées sur des serveurs sécurisés situés dans l'Union européenne, dans une base de données accessible uniquement par Le Relais Web.</p>`,
  },
  {
    id: "s3",
    num: "3",
    title: "Finalités du traitement",
    html: `
      <p>Vos données sont utilisées exclusivement pour traiter votre demande de devis, vous contacter et assurer le suivi de votre commande via Stripe.</p>
      <p>Base légale : <strong>exécution d'un contrat</strong> (art. 6.1.b RGPD) et <strong>consentement</strong> (art. 6.1.a). Nous ne vendons ni ne partageons jamais vos données.</p>`,
  },
  {
    id: "s4",
    num: "4",
    title: "Cookies",
    html: `
      <p>Ce site n'utilise <strong>que des cookies strictement nécessaires</strong> à son fonctionnement. Il n'y a <strong>aucun cookie de mesure d'audience, de publicité ou de traçage</strong>. Les polices d'écriture sont hébergées sur notre propre serveur (elles n'envoient aucune donnée à Google). À ce titre, et conformément aux recommandations de la CNIL, <strong>aucune bannière de consentement n'est nécessaire</strong>.</p>
      <div class="ck-table-wrap">
      <table class="ck-table">
        <thead><tr><th>Cookie</th><th>Source</th><th>Finalité</th><th>Durée</th></tr></thead>
        <tbody>
          <tr><td><strong>session</strong></td><td>Le Relais Web</td><td>Maintient votre connexion à l'espace client</td><td>Session</td></tr>
          <tr><td><strong>Stripe</strong></td><td>Stripe Inc.</td><td>Sécurisation du paiement (déposé uniquement au moment du règlement)</td><td>30 jours</td></tr>
        </tbody>
      </table>
      </div>
      <p>Vous pouvez à tout moment effacer ces cookies depuis les réglages de votre navigateur.</p>`,
  },
  {
    id: "s5",
    num: "5",
    title: "Services tiers",
    html: `
      <p>Les polices d'écriture (Google Fonts) sont <strong>auto-hébergées</strong> sur notre serveur : aucune donnée n'est transmise à Google lors de votre visite.</p>
      <ul>
        <li><strong>Stripe Inc.</strong> (paiement) — <a href="https://stripe.com/fr/privacy" target="_blank" rel="noopener noreferrer">stripe.com/fr/privacy</a></li>
        <li><strong>Vercel Inc.</strong> (hébergement) — <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">vercel.com/legal/privacy-policy</a></li>
      </ul>`,
  },
  {
    id: "s6",
    num: "6",
    title: "Durée de conservation",
    html: `
      <ul>
        <li><strong>Demandes de devis</strong> — 3 ans à compter du dernier contact</li>
        <li><strong>Données de paiement</strong> — gérées par Stripe selon leurs propres règles</li>
        <li><strong>Cookies</strong> — durées indiquées dans le tableau ci-dessus</li>
        <li><strong>Compte espace client</strong> — conservées pendant toute la durée du contrat, puis 30 jours après résiliation avant suppression définitive</li>
        <li><strong>Demandes de support</strong> — conservées 2 ans après la résolution</li>
      </ul>`,
  },
  {
    id: "s7",
    num: "7",
    title: "Vos droits (RGPD)",
    html: `
      <p>Vous disposez des droits d'accès, rectification, effacement, limitation, portabilité et opposition. Pour les exercer : <a href="mailto:contact@lerelaisweb.com">contact@lerelaisweb.com</a>. Réponse sous 1 mois.</p>
      <p>Vous pouvez également saisir la <strong>CNIL</strong> : <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">www.cnil.fr</a></p>`,
  },
  {
    id: "s8",
    num: "8",
    title: "Sécurité",
    html: `
      <ul><li>Transmission via protocole <strong>HTTPS</strong> (SSL/TLS)</li><li>Paiements via <strong>Stripe</strong>, certifié PCI DSS niveau 1</li><li>Accès aux données restreint aux seules personnes habilitées</li><li>Mots de passe chiffrés (bcrypt), jamais stockés en clair</li></ul>`,
  },
  {
    id: "s9",
    num: "9",
    title: "Contact & modifications",
    html: `
      <p><strong>Le Relais Web</strong> — <a href="mailto:contact@lerelaisweb.com">contact@lerelaisweb.com</a></p>
      <div class="hl">Cette politique peut être modifiée. La date de mise à jour est toujours affichée en haut de page. Dernière mise à jour : <strong>juin 2026</strong>.</div>`,
  },
  {
    id: "s10",
    num: "10",
    title: "Espace client — données personnelles",
    html: `
      <p>L'espace client est un service permettant à chaque client de suivre son projet, ses factures et son historique de maintenance sur lerelaisweb.com.</p>
      <p><strong>Base légale du traitement :</strong> exécution du contrat (art. 6.1.b RGPD). Les données de compte sont nécessaires à la fourniture du service.</p>
      <p><strong>Hébergement :</strong> Les données sont hébergées dans l'Union européenne, dans le respect du RGPD.</p>
      <p><strong>Sécurité :</strong> Mots de passe chiffrés (bcrypt), connexions HTTPS, sessions sécurisées côté serveur.</p>
      <p><strong>Droits :</strong> Vous pouvez demander l'accès, la rectification ou la suppression de votre compte à tout moment à <a href="mailto:contact@lerelaisweb.com">contact@lerelaisweb.com</a>. Suppression effective sous 30 jours.</p>`,
  },
];

export default function PolitiquePage() {
  return (
    <>
      <div className="page-hero">
        <div className="container">
          <span className="eyebrow">Vos données</span>
          <h1>Politique de Confidentialité</h1>
          <p>Dernière mise à jour : juin 2026 · Conforme RGPD (Règlement UE 2016/679)</p>
        </div>
      </div>
      <div className="container doc-wrap">
        <aside className="toc">
          <h3>Sommaire</h3>
          {toc.map(([id, label]) => (
            <a key={id} href={`#${id}`}>
              {label}
            </a>
          ))}
        </aside>
        <div className="doc-sections">
          {sections.map((s) => (
            <div className="doc-sec" id={s.id} key={s.id}>
              <h2>
                <span className="sn">{s.num}</span>
                {s.title}
              </h2>
              <div dangerouslySetInnerHTML={{ __html: s.html }} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
