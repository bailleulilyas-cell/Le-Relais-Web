import { eq, desc, asc, sql, and, inArray } from "drizzle-orm";
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
} from "./schema";

export type AdminClientRow = {
  id: number;
  prenom: string;
  nomFamille: string | null;
  nomEnseigne: string;
  email: string;
  secteurActivite: string | null;
  dateInscription: string;
  paiementConfirme: boolean;
  aProjet: boolean;
  statutProjet: "en_cours" | "en_ligne" | "suspendu" | null;
  nbDemandesNew: number;
};

export type AdminStats = {
  totalClients: number;
  prospects: number;
  payesNonConfigures: number;
  actifs: number;
  enLigne: number;
  suspendus: number;
  mrr: number;
  revenusMois: number;
  revenusTotal: number;
  nbDemandesNew: number;
  derniersInscrits: { id: number; prenom: string; nomEnseigne: string; date: string }[];
};

function isoDay(v: unknown): string {
  if (!v) return "";
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  return String(v).slice(0, 10);
}

/** Liste de tous les clients (role=client) pour la sidebar admin. */
export async function getAdminClients(): Promise<AdminClientRow[]> {
  const db = getDb();

  const rows = await db
    .select({
      id: utilisateurs.id,
      prenom: utilisateurs.prenom,
      nomFamille: utilisateurs.nomFamille,
      nomEnseigne: utilisateurs.nomEnseigne,
      email: utilisateurs.email,
      secteurActivite: utilisateurs.secteurActivite,
      dateInscription: utilisateurs.dateInscription,
      paiementConfirme: utilisateurs.paiementConfirme,
      projetId: projets.id,
      statutProjet: projets.statut,
    })
    .from(utilisateurs)
    .leftJoin(projets, eq(projets.userId, utilisateurs.id))
    .where(eq(utilisateurs.role, "client"))
    .orderBy(desc(utilisateurs.dateInscription));

  // Compte des demandes "new" par client
  const demCounts = await db
    .select({ userId: demandes.userId, n: sql<number>`count(*)` })
    .from(demandes)
    .where(eq(demandes.statut, "new"))
    .groupBy(demandes.userId);
  const countMap = new Map<number, number>();
  for (const d of demCounts) countMap.set(d.userId, Number(d.n));

  return rows.map((r) => ({
    id: r.id,
    prenom: r.prenom,
    nomFamille: r.nomFamille,
    nomEnseigne: r.nomEnseigne,
    email: r.email,
    secteurActivite: r.secteurActivite,
    dateInscription: isoDay(r.dateInscription),
    paiementConfirme: r.paiementConfirme,
    aProjet: r.projetId != null,
    statutProjet: r.statutProjet ?? null,
    nbDemandesNew: countMap.get(r.id) ?? 0,
  }));
}

/** Statistiques globales pour le tableau de bord admin. */
export async function getAdminStats(): Promise<AdminStats> {
  const db = getDb();
  const clients = await getAdminClients();

  const totalClients = clients.length;
  const actifs = clients.filter((c) => c.aProjet).length;
  const prospects = clients.filter((c) => !c.aProjet && !c.paiementConfirme).length;
  const payesNonConfigures = clients.filter((c) => !c.aProjet && c.paiementConfirme).length;
  const enLigne = clients.filter((c) => c.statutProjet === "en_ligne").length;
  const suspendus = clients.filter((c) => c.statutProjet === "suspendu").length;
  const nbDemandesNew = clients.reduce((s, c) => s + c.nbDemandesNew, 0);

  // MRR = somme des montants mensuels des projets non suspendus
  const projetsActifs = await db
    .select({ montant: projets.montantMensuel, statut: projets.statut })
    .from(projets);
  const mrr = projetsActifs
    .filter((p) => p.statut !== "suspendu")
    .reduce((s, p) => s + Number(p.montant ?? 0), 0);

  // Revenus : factures payées (mois en cours + total)
  const facturesPaid = await db
    .select({ montant: factures.montant, date: factures.dateFacture })
    .from(factures)
    .where(eq(factures.statut, "paid"));
  const now = new Date();
  const moisCourant = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const revenusMois = facturesPaid
    .filter((f) => isoDay(f.date).startsWith(moisCourant))
    .reduce((s, f) => s + Number(f.montant), 0);
  const revenusTotal = facturesPaid.reduce((s, f) => s + Number(f.montant), 0);

  const derniersInscrits = clients.slice(0, 5).map((c) => ({
    id: c.id,
    prenom: c.prenom,
    nomEnseigne: c.nomEnseigne,
    date: c.dateInscription,
  }));

  return {
    totalClients,
    prospects,
    payesNonConfigures,
    actifs,
    enLigne,
    suspendus,
    mrr,
    revenusMois,
    revenusTotal,
    nbDemandesNew,
    derniersInscrits,
  };
}

export type PendingDemande = {
  id: number;
  userId: number;
  prenom: string;
  nomEnseigne: string;
  typeDemande: string;
  description: string;
  statut: "new" | "in_progress" | "done";
  createdAt: string;
};

/** Toutes les demandes en attente (new + in_progress), pour la vue globale. */
export async function getPendingDemandes(): Promise<PendingDemande[]> {
  const db = getDb();
  const rows = await db
    .select({
      id: demandes.id,
      userId: demandes.userId,
      prenom: utilisateurs.prenom,
      nomEnseigne: utilisateurs.nomEnseigne,
      typeDemande: demandes.typeDemande,
      description: demandes.description,
      statut: demandes.statut,
      createdAt: demandes.createdAt,
    })
    .from(demandes)
    .innerJoin(utilisateurs, eq(demandes.userId, utilisateurs.id))
    .where(inArray(demandes.statut, ["new", "in_progress"]))
    .orderBy(desc(demandes.createdAt))
    .limit(50);

  return rows.map((r) => ({
    id: r.id,
    userId: r.userId,
    prenom: r.prenom,
    nomEnseigne: r.nomEnseigne,
    typeDemande: r.typeDemande ?? "autre",
    description: r.description ?? "",
    statut: r.statut ?? "new",
    createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : String(r.createdAt ?? ""),
  }));
}

export type ClientDetail = {
  utilisateur: {
    id: number;
    prenom: string;
    nomFamille: string | null;
    nomEnseigne: string;
    email: string;
    telephone: string | null;
    ville: string | null;
    aDejaSite: boolean | null;
    urlSiteActuel: string | null;
    aLogo: boolean | null;
    secteurActivite: string | null;
    packSouhaite: "presence" | "pro" | "indecis" | null;
    descriptionProjet: string | null;
    dateInscription: string;
    paiementConfirme: boolean;
  };
  projet: (Omit<Projet, "abonnementDebut" | "scoreDate" | "montantMensuel" | "montantSetup"> & {
    abonnementDebut: string | null;
    scoreDate: string | null;
    montantMensuel: string;
    montantSetup: string;
  }) | null;
  etapes: Etape[];
  documents: Document[];
  interventions: (Omit<Intervention, "dateIntervention"> & { dateIntervention: string })[];
  factures: (Omit<Facture, "dateFacture" | "montant"> & { dateFacture: string; montant: string })[];
  demandes: {
    id: number;
    typeDemande: string;
    description: string;
    statut: "new" | "in_progress" | "done";
    createdAt: string;
  }[];
};

/** Détail complet d'un client pour l'écran de gestion admin. */
export async function getClientDetail(userId: number): Promise<ClientDetail | null> {
  const db = getDb();

  const userRows = await db
    .select()
    .from(utilisateurs)
    .where(eq(utilisateurs.id, userId))
    .limit(1);
  if (userRows.length === 0) return null;
  const u = userRows[0];

  const projetRows = await db.select().from(projets).where(eq(projets.userId, userId)).limit(1);
  const p = projetRows[0] ?? null;

  const [etapesRows, documentsRows, interventionsRows, facturesRows, demandesRows] =
    await Promise.all([
      db.select().from(etapes).where(eq(etapes.userId, userId)).orderBy(asc(etapes.ordre)),
      db.select().from(documents).where(eq(documents.userId, userId)).orderBy(asc(documents.ordre)),
      db
        .select()
        .from(interventions)
        .where(eq(interventions.userId, userId))
        .orderBy(desc(interventions.dateIntervention)),
      db.select().from(factures).where(eq(factures.userId, userId)).orderBy(desc(factures.dateFacture)),
      db.select().from(demandes).where(eq(demandes.userId, userId)).orderBy(desc(demandes.createdAt)),
    ]);

  return {
    utilisateur: {
      id: u.id,
      prenom: u.prenom,
      nomFamille: u.nomFamille,
      nomEnseigne: u.nomEnseigne,
      email: u.email,
      telephone: u.telephone,
      ville: u.ville,
      aDejaSite: u.aDejaSite,
      urlSiteActuel: u.urlSiteActuel,
      aLogo: u.aLogo,
      secteurActivite: u.secteurActivite,
      packSouhaite: u.packSouhaite,
      descriptionProjet: u.descriptionProjet,
      dateInscription: isoDay(u.dateInscription),
      paiementConfirme: u.paiementConfirme,
    },
    projet: p
      ? {
          ...p,
          abonnementDebut: isoDay(p.abonnementDebut) || null,
          scoreDate: isoDay(p.scoreDate) || null,
          montantMensuel: String(p.montantMensuel ?? "25.00"),
          montantSetup: String(p.montantSetup ?? "550.00"),
        }
      : null,
    etapes: etapesRows,
    documents: documentsRows,
    interventions: interventionsRows.map((iv) => ({ ...iv, dateIntervention: isoDay(iv.dateIntervention) })),
    factures: facturesRows.map((f) => ({ ...f, dateFacture: isoDay(f.dateFacture), montant: String(f.montant) })),
    demandes: demandesRows.map((d) => ({
      id: d.id,
      typeDemande: d.typeDemande ?? "autre",
      description: d.description ?? "",
      statut: d.statut ?? "new",
      createdAt: d.createdAt instanceof Date ? d.createdAt.toISOString() : String(d.createdAt ?? ""),
    })),
  };
}

export { and };
