import { eq, desc, asc, and, ne } from "drizzle-orm";
import { getDb } from "./db";
import {
  utilisateurs,
  projets,
  etapes,
  documents,
  interventions,
  factures,
  demandes,
  type Projet,
  type Etape,
  type Document,
  type Intervention,
  type Facture,
  type Demande,
} from "./schema";

export type ClientData = {
  utilisateur: {
    prenom: string;
    nomFamille: string | null;
    nomEnseigne: string;
    email: string;
    paiementConfirme: boolean;
    descriptionProjet: string | null;
    packSouhaite: "presence" | "pro" | "indecis" | null;
  };
  projet: Projet | null;
  etapes: Etape[];
  documents: Document[];
  interventions: Intervention[];
  factures: Facture[];
  demandes: Demande[];
  // Valeurs dérivées
  progressionGlobale: number;
  prochainPrelevement: string | null; // ISO date
  joursAvantPrelevement: number;
  totalPaye: number;
  nbDemandesNew: number;
};

/**
 * Récupère toutes les données de l'espace client d'un utilisateur en une seule passe.
 * Retourne null si l'utilisateur n'existe pas.
 */
export async function getClientData(userId: number): Promise<ClientData | null> {
  const db = getDb();

  const userRows = await db
    .select({
      prenom: utilisateurs.prenom,
      nomFamille: utilisateurs.nomFamille,
      nomEnseigne: utilisateurs.nomEnseigne,
      email: utilisateurs.email,
      paiementConfirme: utilisateurs.paiementConfirme,
      descriptionProjet: utilisateurs.descriptionProjet,
      packSouhaite: utilisateurs.packSouhaite,
    })
    .from(utilisateurs)
    .where(eq(utilisateurs.id, userId))
    .limit(1);

  if (userRows.length === 0) return null;
  const utilisateur = userRows[0];

  const projetRows = await db
    .select()
    .from(projets)
    .where(eq(projets.userId, userId))
    .limit(1);
  const projet = projetRows[0] ?? null;

  let etapesRows: Etape[] = [];
  let documentsRows: Document[] = [];
  let interventionsRows: Intervention[] = [];
  let facturesRows: Facture[] = [];
  let demandesRows: Demande[] = [];

  if (projet) {
    [etapesRows, documentsRows, interventionsRows, facturesRows, demandesRows] =
      await Promise.all([
        db.select().from(etapes).where(eq(etapes.userId, userId)).orderBy(asc(etapes.ordre)),
        db.select().from(documents).where(eq(documents.userId, userId)).orderBy(asc(documents.ordre)),
        db
          .select()
          .from(interventions)
          .where(eq(interventions.userId, userId))
          .orderBy(desc(interventions.dateIntervention))
          .limit(8),
        db
          .select()
          .from(factures)
          .where(eq(factures.userId, userId))
          .orderBy(desc(factures.dateFacture)),
        db
          .select()
          .from(demandes)
          .where(and(eq(demandes.userId, userId), ne(demandes.typeDemande, "systeme")))
          .orderBy(desc(demandes.createdAt))
          .limit(20),
      ]);
  } else {
    // Même sans projet, on récupère les demandes (le client peut écrire avant la mise en service)
    // Les notifications "systeme" (internes, destinées à l'admin) ne sont jamais affichées au client.
    demandesRows = await db
      .select()
      .from(demandes)
      .where(and(eq(demandes.userId, userId), ne(demandes.typeDemande, "systeme")))
      .orderBy(desc(demandes.createdAt))
      .limit(20);
  }

  // Progression globale = moyenne des étapes, sinon progression du projet
  const progressionGlobale =
    etapesRows.length > 0
      ? Math.round(
          etapesRows.reduce((s, e) => s + (e.progression ?? 0), 0) / etapesRows.length
        )
      : projet?.progression ?? 0;

  // Prochain prélèvement : même jour du mois que abonnement_debut
  let prochainPrelevement: string | null = null;
  let joursAvantPrelevement = 0;
  if (projet?.abonnementDebut) {
    const debut = new Date(projet.abonnementDebut + "T00:00:00");
    const auj = new Date();
    auj.setHours(0, 0, 0, 0);
    const prochain = new Date(auj.getFullYear(), auj.getMonth(), debut.getDate());
    if (prochain <= auj) prochain.setMonth(prochain.getMonth() + 1);
    prochainPrelevement = prochain.toISOString().slice(0, 10);
    joursAvantPrelevement = Math.round((prochain.getTime() - auj.getTime()) / 86400000);
  }

  const totalPaye = facturesRows
    .filter((f) => f.statut === "paid")
    .reduce((s, f) => s + Number(f.montant), 0);

  const nbDemandesNew = demandesRows.filter((d) => d.statut === "new").length;

  return {
    utilisateur,
    projet,
    etapes: etapesRows,
    documents: documentsRows,
    interventions: interventionsRows,
    factures: facturesRows,
    demandes: demandesRows,
    progressionGlobale,
    prochainPrelevement,
    joursAvantPrelevement,
    totalPaye,
    nbDemandesNew,
  };
}

export { and };
