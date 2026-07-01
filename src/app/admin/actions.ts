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
import { STRIPE_LINKS } from "@/lib/stripe";
import { sendMail, emailLayout } from "@/lib/mail";
import { GOOGLE_REVIEW_URL } from "@/lib/links";

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

  // Si l'admin a déjà défini une formule (notamment un prix personnalisé), on
  // facture ces montants-là. Sinon on retombe sur le tarif standard du pack.
  const devis = await db
    .select({ s: utilisateurs.montantSetupDevis, m: utilisateurs.montantMensuelDevis })
    .from(utilisateurs)
    .where(eq(utilisateurs.id, userId))
    .limit(1);
  const montantSetup = devis[0]?.s ?? prix.setup;
  const montantMensuel = devis[0]?.m ?? prix.mensuel;

  try {
    await db.transaction(async (tx) => {
      await tx.delete(projets).where(eq(projets.userId, userId));
      await tx.insert(projets).values({
        userId,
        urlSite: url,
        statut: "en_cours",
        progression: 0,
        abonnementDebut: debut,
        montantSetup,
        montantMensuel,
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
    const cleanUrl = urlSite.trim().slice(0, 500);

    // Statut précédent : on n'envoie l'email « site en ligne » qu'à la
    // TRANSITION vers en_ligne, pas à chaque enregistrement (anti-spam client).
    const before = await db
      .select({ statut: projets.statut })
      .from(projets)
      .where(eq(projets.userId, userId))
      .limit(1);
    const etaitEnLigne = before[0]?.statut === "en_ligne";

    await db
      .update(projets)
      .set({
        statut: statut as (typeof STATUTS_PROJET)[number],
        progression: clamp100(progression),
        urlSite: cleanUrl,
        stripeSubscriptionId: sub || null,
        urlAdminClient: urlAdminClient.trim().slice(0, 500) || null,
      })
      .where(eq(projets.userId, userId));

    // Première mise en ligne → email de félicitations + demande d'avis (fer chaud).
    // Best-effort : un échec SMTP ne doit pas faire échouer l'enregistrement.
    if (statut === "en_ligne" && !etaitEnLigne) {
      await sendMiseEnLigneEmail(userId, cleanUrl).catch(() => {});
    }

    revalidatePath("/admin", "layout");
    return { ok: true };
  } catch (e) {
    console.error("updateProjet:", e);
    return { ok: false, error: "Erreur serveur." };
  }
}

/**
 * Email envoyé au client quand son site passe « en ligne » : félicitations +
 * demande d'avis Google au pic de satisfaction. Meilleur moment pour convertir.
 */
async function sendMiseEnLigneEmail(userId: number, urlSite: string): Promise<void> {
  const db = getDb();
  const u = await db
    .select({
      prenom: utilisateurs.prenom,
      nomEnseigne: utilisateurs.nomEnseigne,
      email: utilisateurs.email,
    })
    .from(utilisateurs)
    .where(eq(utilisateurs.id, userId))
    .limit(1);
  if (u.length === 0) return;
  const { prenom, nomEnseigne, email } = u[0];
  const siteLink = urlSite ? (urlSite.startsWith("http") ? urlSite : `https://${urlSite}`) : "";
  const esc = (s: string) =>
    s.replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" })[c] as string);

  await sendMail({
    to: email,
    subject: `Votre site est en ligne — ${nomEnseigne} 🎉`,
    html: emailLayout(
      "Votre site est en ligne 🎉",
      `<p style="font-size:15px;line-height:1.7;color:#5C6470;">Bonjour ${esc(prenom)},</p>
       <p style="font-size:15px;line-height:1.7;color:#5C6470;">Ça y est — le site de <b style="color:#0F1E3C;">${esc(nomEnseigne)}</b> est <b>en ligne</b> ! Rapide, soigné, et prêt à vous amener des clients. Merci de votre confiance. 🙌</p>
       ${siteLink ? `<p style="text-align:center;margin:22px 0;"><a href="${esc(siteLink)}" style="background:#0F1E3C;color:#fff;text-decoration:none;padding:12px 24px;border-radius:11px;font-weight:bold;display:inline-block;">Voir mon site en ligne →</a></p>` : ""}
       <div style="margin-top:24px;background:#FFFBEB;border:1px solid #FCE9B8;border-radius:14px;padding:24px 20px;text-align:center;">
         <div style="font-size:26px;letter-spacing:4px;color:#F5B301;line-height:1;margin-bottom:8px;">★★★★★</div>
         <div style="font-family:Georgia,serif;font-size:18px;color:#0F1E3C;margin-bottom:8px;">Votre avis vaut de l'or pour nous</div>
         <p style="font-size:14px;line-height:1.6;color:#8a763a;margin:0 0 18px;">On débute, et chaque avis nous aide à gagner la confiance des prochains commerçants. Si le résultat vous plaît, ça nous ferait un bien fou — 30 secondes, pas plus. 💛</p>
         <a href="${GOOGLE_REVIEW_URL}" style="background:#F5B301;color:#3a2c00;text-decoration:none;padding:14px 28px;border-radius:11px;font-weight:bold;display:inline-block;font-size:15px;">⭐ Laisser un avis Google →</a>
       </div>
       <p style="font-size:13px;line-height:1.6;color:#9b958a;margin-top:22px;">Une question ou une modification&nbsp;? Répondez à cet email, on s'en occupe. À très vite — l'équipe Le Relais Web, Ermont.</p>`
    ),
  });
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

/* ── Formule & paiement assignés au client (débloque le lien de paiement côté client) ── */
const FORMULES = ["presence", "pro", "custom"] as const;
export async function setFormuleDevis(
  userId: number,
  formule: string,
  montantSetup: string,
  montantMensuel: string,
  lienSetup: string,
  lienAbonnement: string,
  avecBackoffice: boolean
): Promise<ActionResult> {
  if (!(await requireAdmin())) return { ok: false, error: "Non autorisé." };
  if (!FORMULES.includes(formule as (typeof FORMULES)[number]))
    return { ok: false, error: "Formule invalide." };

  let setup: string, mensuel: string, lSetup: string, lAbo: string;
  if (formule === "presence" || formule === "pro") {
    // Pack standard : montants et liens Stripe officiels, jamais saisis à la main.
    const prix = PACKS_PRIX[formule];
    setup = prix.setup;
    mensuel = prix.mensuel;
    lSetup = STRIPE_LINKS[formule].creation;
    lAbo = STRIPE_LINKS[formule].abonnement;
  } else {
    // Personnalisé : montants + liens Stripe sur-mesure fournis par l'admin.
    const ns = Number(montantSetup);
    const nm = Number(montantMensuel);
    if (!Number.isFinite(ns) || ns < 0 || !Number.isFinite(nm) || nm < 0)
      return { ok: false, error: "Montants invalides." };
    setup = ns.toFixed(2);
    mensuel = nm.toFixed(2);
    lSetup = lienSetup.trim().slice(0, 500);
    lAbo = lienAbonnement.trim().slice(0, 500);
    if (!/^https:\/\//i.test(lSetup) || !/^https:\/\//i.test(lAbo))
      return { ok: false, error: "Les deux liens de paiement doivent commencer par https://" };
  }

  try {
    const db = getDb();
    await db
      .update(utilisateurs)
      .set({
        formuleDevis: formule as (typeof FORMULES)[number],
        montantSetupDevis: setup,
        montantMensuelDevis: mensuel,
        lienPaiementSetup: lSetup,
        lienPaiementAbonnement: lAbo,
        avecBackofficeDevis: avecBackoffice,
      })
      .where(eq(utilisateurs.id, userId));
    revalidatePath("/admin", "layout");
    return { ok: true };
  } catch (e) {
    console.error("setFormuleDevis:", e);
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
