import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conditions Générales de Vente | Le Relais Web",
  description:
    "CGV de Le Relais Web : tarifs transparents, satisfait ou remboursé 30 jours, sans engagement. Agence web à Ermont, Val-d'Oise.",
  alternates: { canonical: "/cgv" },
};

const toc = [
  ["s1", "1. Objet du service"],
  ["s2", "2. Tarifs & Paiement"],
  ["s3", "3. Livraison & Délais"],
  ["s4", "4. Obligations du client"],
  ["s5", "5. Résiliation & Garantie"],
  ["s6", "6. Propriété intellectuelle"],
  ["s7", "7. Responsabilité"],
  ["s8", "8. Droit applicable"],
  ["s9", "9. Clause de libération"],
  ["s10", "10. Espace client"],
];

const sections: { id: string; num: string; title: string; html: string }[] = [
  {
    id: "s1",
    num: "1",
    title: "Objet du service",
    html: `
      <p>Les présentes CGV régissent les relations entre <strong>Le Relais Web</strong> (micro-entreprise individuelle, SIRET 101 586 428 00019, représentée par Thierry Bailleul) et tout client ayant passé commande.</p>
      <p>Le Relais Web propose :</p>
      <ul>
        <li><strong>Création d'un site vitrine sur-mesure</strong> en code écrit à la main, avec design personnalisé et optimisation des performances.</li>
        <li><strong>Hébergement &amp; maintenance technique</strong> : mise en ligne, gestion du nom de domaine, mises à jour de sécurité et support.</li>
        <li><strong>Référencement local (SEO)</strong> : optimisation du code et des balises pour le positionnement sur Google.</li>
      </ul>
      <div class="hl">Toute commande implique l'acceptation sans réserve des présentes CGV.</div>`,
  },
  {
    id: "s2",
    num: "2",
    title: "Tarifs & Paiement",
    html: `
      <div class="price-box">
        <div class="pi"><div class="pi-am">400€</div><div class="pi-lb">MISE EN SERVICE</div><div class="pi-nt">Payable à la commande</div></div>
        <div class="pi"><div class="pi-am">25€</div><div class="pi-lb">ABONNEMENT / MOIS</div><div class="pi-nt">Prélevé via Stripe</div></div>
      </div>
      <p>Les frais de <strong>mise en service (400 €)</strong> sont dus intégralement à la commande via la plateforme sécurisée <strong>Stripe</strong>. L'<strong>abonnement mensuel (25 €/mois)</strong> couvre l'hébergement, le nom de domaine, la maintenance et le support. Le Pack Pro avec espace d'administration est proposé à 1 200 € de mise en service et 40 €/mois.</p>
      <div class="hl"><strong>Exonération de TVA</strong> — En application de l'article 293 B du CGI, Le Relais Web n'est pas assujetti à la TVA. Les prix affichés sont nets de taxe.</div>
      <p>Le transfert de propriété des éléments créés n'intervient qu'après le <strong>paiement intégral des factures</strong> dues.</p>`,
  },
  {
    id: "s3",
    num: "3",
    title: "Livraison & Délais",
    html: `
      <p>Le site sera livré dans un délai de <strong>7 à 10 jours ouvrés</strong> à compter de la réception complète des éléments nécessaires :</p>
      <ul>
        <li>Photos et visuels (format numérique)</li>
        <li>Textes de présentation, horaires, tarifs</li>
        <li>Logo et charte graphique si disponibles</li>
        <li>Toute information spécifique à l'activité</li>
      </ul>
      <div class="warn"><strong>Important :</strong> Le délai ne commence qu'à réception complète de ces éléments. Tout retard dans leur transmission reporte d'autant la date de livraison.</div>`,
  },
  {
    id: "s4",
    num: "4",
    title: "Obligations du client",
    html: `
      <p>Le client s'engage à :</p>
      <ul>
        <li>Fournir l'ensemble des contenus dans un délai raisonnable après commande.</li>
        <li>Garantir que les contenus fournis ne portent pas atteinte aux droits de tiers.</li>
        <li>Répondre aux demandes de validation sous <strong>5 jours ouvrés</strong>. Passé ce délai, la livraison est considérée acceptée.</li>
        <li>Maintenir ses informations de paiement à jour sur Stripe.</li>
      </ul>`,
  },
  {
    id: "s5",
    num: "5",
    title: "Résiliation & Garantie",
    html: `
      <p><strong>Garantie « Satisfait ou remboursé 30 jours » :</strong> Le client dispose de <strong>30 jours calendaires</strong> à compter de la mise en ligne pour demander le remboursement des frais de mise en service, par email à <a href="mailto:contact@lerelaisweb.com">contact@lerelaisweb.com</a>.</p>
      <p>Le remboursement porte sur les <strong>400 € de mise en service</strong> uniquement. L'éventuel abonnement mensuel déjà prélevé n'est pas concerné par cette garantie. Les frais techniques engagés pour le compte du client et non récupérables (notamment l'achat du nom de domaine auprès de l'hébergeur) seront <strong>déduits du montant remboursé</strong>.</p>
      <p><strong>Résiliation :</strong> Le client peut résilier à tout moment, soit directement depuis son espace client (bouton « Résilier mon abonnement »), soit par email à <a href="mailto:contact@lerelaisweb.com">contact@lerelaisweb.com</a>. La résiliation prend effet à la fin de la période mensuelle en cours.</p>
      <div class="warn">L'arrêt de l'abonnement entraîne la suppression du site sous 30 jours. Toute période mensuelle entamée est intégralement due, sans remboursement au prorata.</div>`,
  },
  {
    id: "s6",
    num: "6",
    title: "Propriété intellectuelle",
    html: `
      <p><strong>Contenus du client :</strong> Textes, photos et éléments fournis par le client restent sa propriété exclusive.</p>
      <p><strong>Éléments créés :</strong> Une fois les 400 € réglés, le client acquiert la propriété des éléments créés. Cette propriété est subordonnée à l'absence d'impayé.</p>
      <div class="hl"><strong>Code source :</strong> Le code source demeure la propriété intellectuelle de Le Relais Web. Le client bénéficie d'une licence d'utilisation exclusive tant qu'il règle l'abonnement. En cas de résiliation, cette licence prend fin.</div>`,
  },
  {
    id: "s7",
    num: "7",
    title: "Responsabilité",
    html: `
      <p>La responsabilité de Le Relais Web ne saurait être engagée pour :</p>
      <ul>
        <li>Interruption due à une panne de l'hébergeur ou d'un réseau tiers.</li>
        <li>Perte de chiffre d'affaires résultant d'une indisponibilité du site.</li>
        <li>Contenu inexact ou illicite fourni par le client.</li>
        <li>Force majeure au sens de l'article 1218 du Code Civil.</li>
      </ul>
      <p>En tout état de cause, la responsabilité est limitée aux sommes perçues au cours des 3 derniers mois précédant le litige.</p>`,
  },
  {
    id: "s8",
    num: "8",
    title: "Droit applicable & Litiges",
    html: `
      <p>Les présentes CGV sont soumises au <strong>droit français</strong>. En cas de litige, les parties s'engagent à rechercher une solution amiable avant toute action judiciaire. À défaut, le litige sera soumis aux <strong>tribunaux de Cergy-Pontoise (95)</strong>.</p>
      <div class="upd"><div><strong>Version en vigueur</strong><p>La version applicable est celle en vigueur à la date de la commande.</p></div><div class="upd-date">Mars 2026</div></div>`,
  },
  {
    id: "s9",
    num: "9",
    title: "Clause de libération du code source",
    html: `
      <p>Le client peut à tout moment demander la <strong>livraison du code source</strong> de son site. Cette livraison est soumise à des <strong>frais de libération</strong> selon l'ancienneté du contrat :</p>
      <div class="price-box three">
        <div class="pi"><div class="pi-am">500€</div><div class="pi-lb">MOINS DE 12 MOIS</div><div class="pi-nt">d'ancienneté</div></div>
        <div class="pi"><div class="pi-am">200€</div><div class="pi-lb">APRÈS 12 MOIS</div><div class="pi-nt">d'ancienneté</div></div>
        <div class="pi"><div class="pi-am">50€</div><div class="pi-lb">APRÈS 24 MOIS</div><div class="pi-nt">frais techniques</div></div>
      </div>
      <div class="hl"><strong>Ce que comprend la libération :</strong> Le Relais Web livre les fichiers source du site — les « clés et les briques ». Le client reçoit un code propre, fonctionnel et documenté, qu'il peut confier à un autre prestataire.</div>
      <div class="warn"><strong>Ce que la libération ne comprend pas :</strong> Le Relais Web ne procède pas au transfert, à la configuration ou à la mise en ligne du site chez un nouvel hébergeur. Cette prestation est à la charge du client ou de son nouveau prestataire.</div>
      <p>En cas de résiliation, le client dispose d'un délai de <strong>30 jours</strong> pour demander la livraison du code source. Passé ce délai, les fichiers peuvent être supprimés conformément à l'Article 5.</p>`,
  },
  {
    id: "s10",
    num: "10",
    title: "Espace client",
    html: `
      <p>Le Relais Web propose à ses clients un <strong>espace client personnel</strong> accessible via le site lerelaisweb.com. Cet espace permet de suivre en temps réel l'avancement du projet, consulter les factures, l'historique des interventions et adresser des demandes de support.</p>
      <p><strong>Création de compte :</strong> L'accès à l'espace client nécessite la création d'un compte avec nom, adresse e-mail et mot de passe. Les identifiants sont strictement personnels et confidentiels.</p>
      <div class="hl"><strong>Données stockées :</strong> Nom, e-mail, mot de passe chiffré (bcrypt), données du projet, historique des interventions et factures. Ces données sont hébergées sur des serveurs sécurisés et ne sont jamais vendues ni partagées à des tiers.</div>
      <p><strong>Suppression du compte :</strong> Le client peut demander la suppression de son compte et de toutes ses données à tout moment en écrivant à <a href="mailto:contact@lerelaisweb.com">contact@lerelaisweb.com</a>. La suppression sera effective sous 30 jours.</p>`,
  },
];

export default function CgvPage() {
  return (
    <>
      <div className="page-hero">
        <div className="container">
          <span className="eyebrow">Mentions légales</span>
          <h1>Conditions Générales de Vente</h1>
          <p>En vigueur depuis le 23 février 2026 · Mise à jour mars 2026 · SIRET 101 586 428 00019</p>
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
          <div className="cta-end">
            <h3>Prêt à démarrer ?</h3>
            <p>Sans engagement · Satisfait ou remboursé 30 jours · Livraison en 7 jours ouvrés.</p>
            <a href="/devis" className="btn-primary" style={{ background: "var(--signal)", color: "#06281b" }}>
              Lancer mon projet →
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
