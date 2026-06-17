// Guides / blog — contenu SEO qui capte les recherches d'information
// (« combien coûte un site web », « wordpress vs sur-mesure »…).

export type Guide = {
  slug: string;
  titre: string;
  description: string;
  /** Date ISO de publication (pour Article schema + affichage). */
  date: string;
  /** Temps de lecture affiché. */
  lecture: string;
  /** Corps en HTML simple (rendu dans .guide-body). */
  html: string;
};

export const GUIDES: Guide[] = [
  {
    slug: "combien-coute-un-site-web",
    titre: "Combien coûte un site web pour un commerçant en 2026 ?",
    description:
      "Prix réel d'un site web pour un artisan ou commerçant : création, abonnement, hébergement. Les fourchettes du marché et comment éviter les mauvaises surprises.",
    date: "2026-06-01",
    lecture: "5 min",
    html: `
<p>C'est la première question que tout commerçant se pose, et c'est normal. La réponse honnête : <strong>ça dépend de ce que vous voulez faire</strong>. Mais on peut donner des fourchettes claires, sans langue de bois.</p>

<h2>Les vraies fourchettes du marché</h2>
<p>En France, pour un site de commerçant ou d'artisan, on observe trois grandes familles de prix :</p>
<ul>
<li><strong>Le « gratuit » (Wix, site fait soi-même)</strong> : 0 à 150 € + un abonnement mensuel. Le piège : c'est lent, partagé avec des milliers d'autres, et souvent mal référencé. Vous payez en clients perdus.</li>
<li><strong>L'agence classique</strong> : 2 500 € à 6 000 € pour un site vitrine, parfois plus. La qualité est là, mais le budget bloque la plupart des petits commerces.</li>
<li><strong>Le sur-mesure accessible (notre positionnement)</strong> : à partir de <strong>550 € à la création + 25 €/mois</strong> tout compris. Un vrai site rapide, sans le ticket d'entrée d'une grosse agence.</li>
</ul>

<h2>Ce qui doit toujours être inclus</h2>
<p>Un prix « bas » qui cache des frais, c'est le vrai problème. Vérifiez que sont compris :</p>
<ul>
<li>Le <strong>nom de domaine</strong> (votre adresse .fr) et l'<strong>hébergement</strong>.</li>
<li>La <strong>maintenance</strong> et le <strong>dépannage</strong> : si quelque chose casse, qui répare ?</li>
<li>Le <strong>référencement local</strong> de base, pour apparaître sur Google près de chez vous.</li>
<li>Un site <strong>rapide et impeccable sur mobile</strong> — là où vos clients regardent vraiment.</li>
</ul>

<h2>Création vs abonnement : la bonne façon de raisonner</h2>
<p>La création est un coût ponctuel. L'abonnement (hébergement + maintenance) est récurrent, mais c'est lui qui garantit que votre site reste en ligne, sécurisé et à jour. Un site « payé une fois puis abandonné » finit par tomber ou devenir une faille de sécurité.</p>

<h2>Et le retour sur investissement ?</h2>
<p>400 à 600 €, c'est le prix de deux mois de publicité sur les réseaux. Sauf qu'un site travaille pour vous <strong>pendant des années</strong>, 24h/24, et vous appartient. Un seul nouveau client par mois rentabilise largement l'abonnement.</p>
`,
  },
  {
    slug: "wordpress-wix-vs-site-sur-mesure",
    titre: "WordPress, Wix ou site sur-mesure : lequel choisir ?",
    description:
      "Comparatif honnête entre WordPress, Wix et un site codé sur-mesure pour un commerçant : vitesse, référencement, coût réel et sécurité.",
    date: "2026-06-05",
    lecture: "6 min",
    html: `
<p>WordPress, Wix, Squarespace, ou un site codé à la main : pour un commerçant, le choix a des conséquences très concrètes sur la <strong>vitesse</strong>, le <strong>référencement Google</strong> et le coût réel. Voici un comparatif sans détour.</p>

<h2>La vitesse : le critère qui change tout</h2>
<p>Google le dit clairement : un site lent est pénalisé, et un visiteur sur deux part si une page met plus de 3 secondes à s'ouvrir. Or :</p>
<ul>
<li><strong>Wix / WordPress avec thème</strong> : souvent 3 à 5 secondes de chargement, à cause des dizaines de scripts et plugins chargés en arrière-plan.</li>
<li><strong>Site sur-mesure (code pur)</strong> : moins d'une seconde. C'est ce qui permet d'atteindre une note Google de 95 à 100/100.</li>
</ul>

<h2>Le référencement local</h2>
<p>Sur le papier, tout le monde « fait du SEO ». En pratique, un site rapide et bien structuré ressort mieux qu'un site lourd. La vitesse est un facteur de classement direct, surtout sur mobile.</p>

<h2>Le coût réel sur 3 ans</h2>
<p>Wix paraît bon marché au départ, mais entre l'abonnement, les options payantes et le temps passé à se débrouiller seul, la facture grimpe. Et vous ne possédez pas vraiment votre site. Un site sur-mesure avec abonnement clair revient souvent <strong>moins cher sur la durée</strong>, et il vous appartient.</p>

<h2>La sécurité et la maintenance</h2>
<p>WordPress est la cible n°1 des piratages, à cause de ses plugins. Sans mises à jour régulières, un site WordPress devient une porte d'entrée. Un site sur-mesure, sans plugins, offre beaucoup moins de prise — à condition d'être maintenu.</p>

<h2>Alors, quoi choisir ?</h2>
<ul>
<li><strong>Vous bricolez et le budget est nul</strong> : Wix peut dépanner, en acceptant les limites.</li>
<li><strong>Vous voulez un outil qui vous amène vraiment des clients</strong>, rapide et durable, sans vous en occuper : un site sur-mesure est le meilleur rapport résultat/tranquillité.</li>
</ul>
`,
  },
  {
    slug: "site-web-artisan-vaut-il-le-coup",
    titre: "Un site web pour un artisan, ça vaut vraiment le coup ?",
    description:
      "Plombier, coiffeur, boulanger, électricien : pourquoi un site web rapide rapporte plus qu'une page Facebook, et comment il vous fait gagner des clients locaux.",
    date: "2026-06-10",
    lecture: "4 min",
    html: `
<p>« J'ai déjà une page Facebook, ça suffit, non ? » C'est ce qu'on entend souvent. Réponse courte : <strong>non, plus en 2026</strong>. Voici pourquoi un vrai site change la donne pour un artisan.</p>

<h2>Vos clients vous cherchent d'abord sur Google</h2>
<p>Avant d'appeler un plombier ou de choisir un coiffeur, on tape le besoin sur son téléphone : « plombier Ermont », « coiffeur près de moi ». Si vous n'avez pas de site, vous êtes invisible à ce moment précis — et c'est un concurrent qui récupère l'appel.</p>

<h2>Une page Facebook ne suffit pas</h2>
<ul>
<li>Elle n'apparaît pas bien dans les résultats Google.</li>
<li>Vos horaires, tarifs et services y sont noyés dans le fil d'actualité.</li>
<li>Vous ne la possédez pas : les règles changent, la portée chute.</li>
</ul>

<h2>Ce qu'un bon site apporte concrètement</h2>
<ul>
<li><strong>De la crédibilité</strong> : un site propre rassure avant même le premier contact.</li>
<li><strong>Des appels en plus</strong> : numéro, adresse et bouton de contact accessibles en un clic.</li>
<li><strong>Du référencement local</strong> : vous ressortez sur « votre métier + votre ville ».</li>
<li><strong>Du temps gagné</strong> : les questions courantes (horaires, zone d'intervention, tarifs) trouvent leur réponse seules.</li>
</ul>

<h2>« Mais je suis nul en informatique »</h2>
<p>C'est justement le but de passer par quelqu'un : vous faites votre métier, on fait le site. Hébergement, mises à jour, dépannage — tout est géré. Vous n'avez rien à apprendre.</p>
`,
  },
];

export function getGuide(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug);
}
