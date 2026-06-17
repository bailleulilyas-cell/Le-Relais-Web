// Données des pages locales SEO — une page par ville cible du Val-d'Oise.
// Contenu différencié par ville (intro + accroche locale) pour éviter le contenu dupliqué.

export type Ville = {
  slug: string;
  nom: string;
  cp: string;
  /** Accroche unique affichée en intro — propre à la ville. */
  lead: string;
  /** 3 arguments locaux, formulés différemment d'une ville à l'autre. */
  points: string[];
  /** Villes voisines pour le maillage interne (slugs). */
  voisines: string[];
};

export const VILLES: Ville[] = [
  {
    slug: "ermont",
    nom: "Ermont",
    cp: "95120",
    lead: "Le Relais Web, c'est ici, à Ermont. On connaît le centre-ville, le marché, les commerces de la rue de la Gare — et le type de clients que vous cherchez à attirer. Votre site, on vient en parler chez vous, pas par téléphone depuis l'autre bout de la France.",
    points: [
      "On est basés à Ermont : un rendez-vous se cale en quelques minutes, en personne.",
      "On a déjà créé le site du club AME-JUDO, à Ermont — une vraie référence locale, en ligne.",
      "Votre commerce ermontois doit sortir sur Google quand un voisin cherche « près de moi ».",
    ],
    voisines: ["eaubonne", "franconville", "sannois"],
  },
  {
    slug: "argenteuil",
    nom: "Argenteuil",
    cp: "95100",
    lead: "Argenteuil est la plus grande ville du Val-d'Oise : la concurrence entre commerces y est forte, et un client qui ne vous trouve pas sur Google file chez le voisin. Un site rapide et bien référencé fait la différence, surtout sur mobile.",
    points: [
      "Beaucoup de recherches « près de chez moi » à Argenteuil : il faut y apparaître en premier.",
      "On se déplace à Argenteuil pour comprendre votre commerce avant de concevoir quoi que ce soit.",
      "Site livré en 7 jours, pensé d'abord pour le téléphone — là où vos clients regardent.",
    ],
    voisines: ["sannois", "ermont", "enghien-les-bains"],
  },
  {
    slug: "sannois",
    nom: "Sannois",
    cp: "95110",
    lead: "À Sannois, le bouche-à-oreille compte encore beaucoup — mais aujourd'hui il commence sur Google. Quand on vous recommande, le premier réflexe est de taper votre nom : si rien n'apparaît, le doute s'installe. Un site clair et rapide rassure tout de suite.",
    points: [
      "Un site qui charge en moins d'une seconde, même sur une connexion mobile moyenne.",
      "On vient vous rencontrer à Sannois — proximité réelle, pas une agence anonyme en ligne.",
      "Vos horaires, votre adresse et vos services trouvables en un coup d'œil.",
    ],
    voisines: ["ermont", "argenteuil", "franconville"],
  },
  {
    slug: "eaubonne",
    nom: "Eaubonne",
    cp: "95600",
    lead: "Eaubonne, c'est la porte d'à côté pour nous. Commerces de centre-ville, professions libérales, artisans : tous gagnent à avoir un site qui les présente mieux qu'une simple fiche, et qui répond aux questions de leurs clients avant même qu'ils appellent.",
    points: [
      "Rendez-vous facile à Eaubonne, on est juste à côté.",
      "Un site sur-mesure, pas un modèle Wix lent partagé avec des milliers d'autres.",
      "Référencement local soigné pour ressortir sur « votre métier + Eaubonne ».",
    ],
    voisines: ["ermont", "franconville", "enghien-les-bains"],
  },
  {
    slug: "franconville",
    nom: "Franconville",
    cp: "95130",
    lead: "À Franconville, entre les zones commerçantes et les artisans de quartier, se démarquer en ligne devient essentiel. Un site rapide, propre et bien référencé vous place devant des concurrents qui se contentent encore d'une page Facebook.",
    points: [
      "On transforme votre activité en un site clair qui inspire confiance dès la première seconde.",
      "Déplacement à Franconville inclus : on parle de votre projet en face à face.",
      "Maintenance, hébergement et dépannage compris — vous ne touchez à rien.",
    ],
    voisines: ["ermont", "sannois", "taverny"],
  },
  {
    slug: "enghien-les-bains",
    nom: "Enghien-les-Bains",
    cp: "95880",
    lead: "Enghien-les-Bains a une clientèle exigeante, habituée à la qualité. Votre site doit être à la hauteur : élégant, rapide et impeccable sur mobile. Un site lent ou daté donne exactement la mauvaise impression au mauvais moment.",
    points: [
      "Un design soigné qui reflète le standing de votre établissement.",
      "Performance Google 95-100 : votre image en ligne reste irréprochable.",
      "On se déplace à Enghien-les-Bains pour caler chaque détail avec vous.",
    ],
    voisines: ["argenteuil", "eaubonne", "ermont"],
  },
  {
    slug: "taverny",
    nom: "Taverny",
    cp: "95150",
    lead: "À Taverny, vos futurs clients cherchent d'abord sur leur téléphone, souvent entre deux rendez-vous. S'ils tombent sur un site lent ou illisible, ils repartent. On crée un site qui charge instantanément et qui donne envie de pousser votre porte.",
    points: [
      "Site pensé mobile d'abord, parfait sur l'écran où vos clients vous découvrent.",
      "On vient à Taverny : un vrai interlocuteur local, joignable et réactif.",
      "Vous apparaissez sur Google pour les recherches autour de Taverny.",
    ],
    voisines: ["franconville", "ermont", "eaubonne"],
  },
  {
    slug: "cergy",
    nom: "Cergy",
    cp: "95000",
    lead: "Cergy, cœur économique du Val-d'Oise, concentre commerces, services et jeunes actifs ultra-connectés. Ici, ne pas avoir de site (ou en avoir un lent) revient à laisser la place aux concurrents mieux référencés. On corrige ça en 7 jours.",
    points: [
      "Une clientèle connectée qui juge un commerce d'abord sur son site.",
      "Référencement local pour capter les recherches « + Cergy » et alentours.",
      "Code sur-mesure et rapide, sans les lenteurs de WordPress ou Wix.",
    ],
    voisines: ["ermont", "franconville", "taverny"],
  },
];

export function getVille(slug: string): Ville | undefined {
  return VILLES.find((v) => v.slug === slug);
}
