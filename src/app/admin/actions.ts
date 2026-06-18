"use server";

import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db";
import {
  utilisateurs,
  projets,
  etapes,
  documents,
  interventions,
  factures,
  demandes,
} from "@/lib/schema";
import { getSession } from "@/lib/session";

type ActionResult = { ok: boolean; error?: string; [k: string]: unknown };

async function requireAdmin(): Promise<boolean> {
  const session = await getSession();
  return session?.role === "admin";
}

const STATUTS_PROJET = ["en_cours", "en_ligne", "suspendu"] as const;
const STATUTS_DOC = ["missing", "pending", "ok"] as const;
const TYPES_INTERV = ["security", "perf", "update", "content"] as const;
const STATUTS_FACTURE = ["paid", "pending"] as const;
const STATUTS_DEMANDE = ["new", "in_progress", "done"] as const;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
function validDate(d: string): string {
  return ISO_DATE.test(d) ? d : new Date().toISOString().slice(0, 10);
}
function clamp100(n: number): number {
  return Math.min(100, Math.max(0, Math.round(n || 0)));
}

const PACKS_PRIX = {
  presence: { setup: "550.00", mensuel: "25.00" },
  pro: { setup: "1200.00", mensuel: "40.00" },
} as const;

/* ── Initialiser un client : projet + 5 étapes + 5 documents par défaut ── */
export async function initClient(
  userId: number,
  urlSite: string,
  abonnementDebut: string,
  pack: "presence" | "pro" = "presence"
): Promise<ActionResult> {
  if (!(await requireAdmin())) return { ok: false, error: "Non autorisé." };
  const db = getDb();
  const url = urlSite.trim().slice(0, 500);
  const debut = validDate(abonnementDebut);
  const prix = PACKS_PRIX[pack] ?? PACKS_PRIX.presence;

  try {
    await db.transaction(async (tx) => {
      await tx.delete(projets).where(eq(projets.userId, userId));
      await tx.insert(projets).values({
        userId,
        urlSite: url,
        statut: "en_cours",
        progression: 0,
        abonnementDebut: debut,
        montantSetup: prix.setup,
        montantMensuel: prix.mensuel,
      });

      await tx.delete(etapes).where(eq(etapes.userId, userId));
      const etapesDefaut: [string, number, string, number][] = [
        ["Découverte & Brief", 0, "À démarrer", 1],
        ["Maquette & Design", 0, "À démarrer", 2],
        ["Développement", 0, "À démarrer", 3],
        ["Contenu & Textes", 0, "À démarrer", 4],
        ["Tests & Mise en ligne", 0, "À démarrer", 5],
      ];
      for (const [nom, prog, txt, ordre] of etapesDefaut) {
        await tx.insert(etapes).values({ userId, nom, progression: prog, statutTexte: txt, ordre });
      }

      await tx.delete(documents).where(eq(documents.userId, userId));
      const docsDefaut: [string, string, "missing" | "pending" | "ok", number][] = [
        ["Logo haute qualité (.PNG/.SVG)", "🎨", "missing", 1],
        ["Photos produits/services", "📷", "missing", 2],
        ["Texte « À propos »", "✏️", "missing", 3],
        ["Horaires & coordonnées", "📍", "missing", 4],
        ["Avis clients", "⭐", "pending", 5],
      ];
      for (const [nom, icone, statut, ordre] of docsDefaut) {
        await tx.insert(documents).values({ userId, nom, icone, statut, ordre });
      }
    });
    revalidatePath("/admin", "layout");
    return { ok: true };
  } catch (e) {
    console.error("initClient:", e);
    return { ok: false, error: "Erreur lors de l'initialisation." };
  }
}

/* ── Mettre à jour le projet ── */
export async function updateProjet(
  userId: number,
  statut: string,
  progression: number,
  urlSite: string,
  stripeSubscriptionId: string,
  urlAdminClient: string = ""
): Promise<ActionResult> {
  if (!(await requireAdmin())) return { ok: false, error: "Non autorisé." };
  if (!STATUTS_PROJET.includes(statut as (typeof STATUTS_PROJET)[number]))
    return { ok: false, error: "Statut invalide." };
  let sub = stripeSubscriptionId.trim().slice(0, 255);
  if (sub && !/^sub_[a-zA-Z0-9]+$/.test(sub)) sub = "";
  try {
    const db = getDb();
    await db
      .update(projets)
      .set({
        statut: statut as (typeof STATUTS_PROJET)[number],
        progression: clamp100(progression),
        urlSite: urlSite.trim().slice(0, 500),
        stripeSubscriptionId: sub || null,
        urlAdminClient: urlAdminClient.trim().slice(0, 500) || null,
      })
      .where(eq(projets.userId, userId));
    revalidatePath("/admin", "layout");
    return { ok: true };
  } catch (e) {
    console.error("updateProjet:", e);
    return { ok: false, error: "Erreur serveur." };
  }
}

/* ── Scores PageSpeed ── */
export async function updateScores(
  userId: number,
  perf: number,
  acc: number,
  bp: number,
  seo: number,
  date: string
): Promise<ActionResult> {
  if (!(await requireAdmin())) return { ok: false, error: "Non autorisé." };
  try {
    const db = getDb();
    await db
      .update(projets)
      .set({
        scorePerformance: clamp100(perf),
        scoreAccessibility: clamp100(acc),
        scoreBestPractices: clamp100(bp),
        scoreSeo: clamp100(seo),
        scoreDate: validDate(date),
      })
      .where(eq(projets.userId, userId));
    revalidatePath("/admin", "layout");
    return { ok: true };
  } catch (e) {
    console.error("updateScores:", e);
    return { ok: false, error: "Erreur serveur." };
  }
}

/* ── Étapes : sauvegarde groupée + recalcul progression globale ── */
export async function saveEtapes(
  userId: number,
  rows: { id: number; progression: number; statutTexte: string }[]
): Promise<ActionResult> {
  if (!(await requireAdmin())) return { ok: false, error: "Non autorisé." };
  try {
    const db = getDb();
    for (const r of rows) {
      await db
        .update(etapes)
        .set({ progression: clamp100(r.progression), statutTexte: r.statutTexte.trim().slice(0, 150) })
        .where(eq(etapes.id, r.id));
    }
    // Recalcul de la progression globale = moyenne des étapes
    const avg = await db
      .select({ a: sql<number>`ROUND(AVG(progression))` })
      .from(etapes)
      .where(eq(etapes.userId, userId));
    const newProg = Number(avg[0]?.a ?? 0);
    await db.update(projets).set({ progression: newProg }).where(eq(projets.userId, userId));
    revalidatePath("/admin", "layout");
    return { ok: true, progression: newProg };
  } catch (e) {
    console.error("saveEtapes:", e);
    return { ok: false, error: "Erreur serveur." };
  }
}

/* ── Documents : sauvegarde groupée ── */
export async function saveDocs(
  rows: { id: number; statut: string }[]
): Promise<ActionResult> {
  if (!(await requireAdmin())) return { ok: false, error: "Non autorisé." };
  try {
    const db = getDb();
    for (const r of rows) {
      if (!STATUTS_DOC.includes(r.statut as (typeof STATUTS_DOC)[number])) continue;
      await db
        .update(documents)
        .set({ statut: r.statut as (typeof STATUTS_DOC)[number] })
        .where(eq(documents.id, r.id));
    }
    revalidatePath("/admin", "layout");
    return { ok: true };
  } catch (e) {
    console.error("saveDocs:", e);
    return { ok: false, error: "Erreur serveur." };
  }
}

/* ── Interventions ── */
export async function addIntervention(
  userId: number,
  titre: string,
  description: string,
  type: string,
  dateIntervention: string
): Promise<ActionResult> {
  if (!(await requireAdmin())) return { ok: false, error: "Non autorisé." };
  if (!TYPES_INTERV.includes(type as (typeof TYPES_INTERV)[number]))
    return { ok: false, error: "Type invalide." };
  const t = titre.trim().slice(0, 200);
  if (!t) return { ok: false, error: "Titre requis." };
  try {
    const db = getDb();
    await db.insert(interventions).values({
      userId,
      titre: t,
      description: description.trim().slice(0, 2000),
      type: type as (typeof TYPES_INTERV)[number],
      dateIntervention: validDate(dateIntervention),
    });
    revalidatePath("/admin", "layout");
    return { ok: true };
  } catch (e) {
    console.error("addIntervention:", e);
    return { ok: false, error: "Erreur serveur." };
  }
}

export async function delIntervention(id: number): Promise<ActionResult> {
  if (!(await requireAdmin())) return { ok: false, error: "Non autorisé." };
  try {
    const db = getDb();
    await db.delete(interventions).where(eq(interventions.id, id));
    revalidatePath("/admin", "layout");
    return { ok: true };
  } catch (e) {
    console.error("delIntervention:", e);
    return { ok: false, error: "Erreur serveur." };
  }
}

/* ── Factures ── */
export async function addFacture(
  userId: number,
  numero: string,
  description: string,
  montant: number,
  dateFacture: string,
  statut: string,
  pdfBase64?: string
): Promise<ActionResult> {
  if (!(await requireAdmin())) return { ok: false, error: "Non autorisé." };
  if (!STATUTS_FACTURE.includes(statut as (typeof STATUTS_FACTURE)[number]))
    return { ok: false, error: "Statut invalide." };
  const num = numero.trim().slice(0, 50);
  const desc = description.trim().slice(0, 500);
  if (!num || !desc) return { ok: false, error: "Champs requis manquants." };

  // PDF joint (optionnel) : on vérifie que c'est bien un PDF et qu'il n'est pas trop gros.
  let pdf: string | null = null;
  if (pdfBase64) {
    const b64 = pdfBase64.includes(",") ? pdfBase64.split(",").pop()! : pdfBase64;
    if (b64.length > 8_000_000) return { ok: false, error: "PDF trop volumineux (max ~6 Mo)." };
    let buf: Buffer;
    try {
      buf = Buffer.from(b64, "base64");
    } catch {
      return { ok: false, error: "Fichier illisible." };
    }
    if (buf.subarray(0, 5).toString("latin1") !== "%PDF-") {
      return { ok: false, error: "Le fichier doit être un PDF." };
    }
    pdf = b64;
  }

  try {
    const db = getDb();
    const res = await db.insert(factures).values({
      userId,
      numero: num,
      description: desc,
      montant: String(Math.abs(Number(montant) || 0).toFixed(2)),
      dateFacture: validDate(dateFacture),
      statut: statut as (typeof STATUTS_FACTURE)[number],
    });
    if (pdf) {
      const insertId = Number((res as unknown as [{ insertId: number }])[0].insertId);
      await db.execute(sql`UPDATE factures SET facture_pdf_data = ${pdf} WHERE id = ${insertId}`);
    }
    revalidatePath("/admin", "layout");
    return { ok: true };
  } catch (e) {
    console.error("addFacture:", e);
    return { ok: false, error: "Erreur serveur." };
  }
}

export async function delFacture(id: number): Promise<ActionResult> {
  if (!(await requireAdmin())) return { ok: false, error: "Non autorisé." };
  try {
    const db = getDb();
    await db.delete(factures).where(eq(factures.id, id));
    revalidatePath("/admin", "layout");
    return { ok: true };
  } catch (e) {
    console.error("delFacture:", e);
    return { ok: false, error: "Erreur serveur." };
  }
}

/* ── Confirmation paiement ── */
export async function confirmPaiement(userId: number, valeur: boolean): Promise<ActionResult> {
  if (!(await requireAdmin())) return { ok: false, error: "Non autorisé." };
  try {
    const db = getDb();
    await db.update(utilisateurs).set({ paiementConfirme: valeur }).where(eq(utilisateurs.id, userId));
    revalidatePath("/admin", "layout");
    return { ok: true };
  } catch (e) {
    console.error("confirmPaiement:", e);
    return { ok: false, error: "Erreur serveur." };
  }
}

/* ── Mise en ligne : autoriser le client à souscrire l'abonnement ── */
export async function setPretMiseEnLigne(userId: number, valeur: boolean): Promise<ActionResult> {
  if (!(await requireAdmin())) return { ok: false, error: "Non autorisé." };
  try {
    const db = getDb();
    await db.update(projets).set({ pretMiseEnLigne: valeur }).where(eq(projets.userId, userId));
    revalidatePath("/admin", "layout");
    return { ok: true };
  } catch (e) {
    console.error("setPretMiseEnLigne:", e);
    return { ok: false, error: "Erreur serveur." };
  }
}

/* ── Statut d'une demande support ── */
export async function updateDemande(id: number, statut: string): Promise<ActionResult> {
  if (!(await requireAdmin())) return { ok: false, error: "Non autorisé." };
  if (!STATUTS_DEMANDE.includes(statut as (typeof STATUTS_DEMANDE)[number]))
    return { ok: false, error: "Statut invalide." };
  try {
    const db = getDb();
    await db
      .update(demandes)
      .set({ statut: statut as (typeof STATUTS_DEMANDE)[number] })
      .where(eq(demandes.id, id));
    revalidatePath("/admin", "layout");
    return { ok: true };
  } catch (e) {
    console.error("updateDemande:", e);
    return { ok: false, error: "Erreur serveur." };
  }
}

/* ── Suppression complète d'un client ── */
export async function deleteClient(userId: number): Promise<ActionResult> {
  if (!(await requireAdmin())) return { ok: false, error: "Non autorisé." };
  try {
    const db = getDb();
    await db.transaction(async (tx) => {
      await tx.delete(demandes).where(eq(demandes.userId, userId));
      await tx.delete(factures).where(eq(factures.userId, userId));
      await tx.delete(interventions).where(eq(interventions.userId, userId));
      await tx.delete(documents).where(eq(documents.userId, userId));
      await tx.delete(etapes).where(eq(etapes.userId, userId));
      await tx.delete(projets).where(eq(projets.userId, userId));
      await tx.delete(utilisateurs).where(eq(utilisateurs.id, userId));
    });
    revalidatePath("/admin", "layout");
    return { ok: true };
  } catch (e) {
    console.error("deleteClient:", e);
    return { ok: false, error: "Erreur lors de la suppression." };
  }
}
