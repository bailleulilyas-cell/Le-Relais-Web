import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { eq, and } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { utilisateurs, projets, factures, demandes } from "@/lib/schema";
import { getStripe, STRIPE_WEBHOOK_SECRET } from "@/lib/stripe";
import { notifyAdmin, sendMail, emailLayout } from "@/lib/mail";

export const runtime = "nodejs";

/**
 * Notifie Ilyas par mail d'un événement Stripe.
 * ⚠️ Renvoie la promesse : sur Vercel (serverless) il FAUT l'attendre (await)
 * avant de répondre au webhook, sinon la fonction est gelée et l'email abandonné.
 */
function notifyStripe(subject: string, message: string) {
  return notifyAdmin({
    subject,
    html: emailLayout(subject, `<p style="font-size:15px;line-height:1.7;color:#5C6470;">${message}</p>`),
  }).catch(() => {});
}

function dateFromTs(ts: number): string {
  return new Date(ts * 1000).toISOString().slice(0, 10);
}

function numeroFacture(userId: number): string {
  const now = new Date();
  const ym = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  return `LRW-${ym}-${String(userId).padStart(3, "0")}`;
}
function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/** L'abonnement lié à une facture Stripe (l'emplacement du champ varie selon la version d'API). */
function subscriptionIdFromInvoice(inv: Stripe.Invoice): string {
  const anyInv = inv as unknown as {
    subscription?: string | { id: string };
    parent?: { subscription_details?: { subscription?: string | { id: string } } };
  };
  const direct = anyInv.subscription;
  if (typeof direct === "string") return direct;
  if (direct && typeof direct === "object") return direct.id;
  const nested = anyInv.parent?.subscription_details?.subscription;
  if (typeof nested === "string") return nested;
  if (nested && typeof nested === "object") return nested.id;
  return "";
}

/**
 * Webhook Stripe — reçoit les événements automatiquement.
 * Vérifie la signature via le SDK, puis traite les événements paiement/abonnement.
 */
export async function POST(req: Request) {
  const stripe = getStripe();
  const secret = STRIPE_WEBHOOK_SECRET();
  if (!stripe || !secret) {
    console.error("stripe/webhook: Stripe ou webhook secret non configuré");
    return NextResponse.json({ error: "Webhook non configuré." }, { status: 503 });
  }

  const body = await req.text();
  const sig = req.headers.get("stripe-signature") ?? "";

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, sig, secret);
  } catch (e) {
    console.error("stripe/webhook signature:", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "Signature invalide." }, { status: 400 });
  }

  const db = getDb();

  try {
    switch (event.type) {
      /* ── Un client a payé via Checkout ── */
      case "checkout.session.completed": {
        const s = event.data.object as Stripe.Checkout.Session;
        const email = (s.customer_details?.email ?? "").toLowerCase().trim();
        const subscriptionId = typeof s.subscription === "string" ? s.subscription : s.subscription?.id ?? "";
        const amount = (s.amount_total ?? 0) / 100;

        // Identité du client : on lit d'abord client_reference_id (l'ID interne,
        // collé dans le lien, NON modifiable par le visiteur) ; sinon l'email
        // saisi au paiement. Garantit l'attribution au bon compte.
        const refId = Number(s.client_reference_id);
        const cols = { id: utilisateurs.id, prenom: utilisateurs.prenom, nomFamille: utilisateurs.nomFamille };
        let u = Number.isInteger(refId) && refId > 0
          ? await db.select(cols).from(utilisateurs).where(eq(utilisateurs.id, refId)).limit(1)
          : [];
        if (u.length === 0 && email) {
          u = await db.select(cols).from(utilisateurs).where(eq(utilisateurs.email, email)).limit(1);
        }
        if (u.length === 0 && !email) break;

        if (u.length > 0) {
          const uid = u[0].id;
          await db.transaction(async (tx) => {
            await tx.update(utilisateurs).set({ paiementConfirme: true }).where(eq(utilisateurs.id, uid));
            if (subscriptionId) {
              await tx
                .update(projets)
                .set({ stripeSubscriptionId: subscriptionId })
                .where(eq(projets.userId, uid));
            }
            const nom = `${u[0].prenom} ${u[0].nomFamille ?? ""}`.trim();
            await tx.insert(demandes).values({
              userId: uid,
              typeDemande: "systeme",
              description: `Paiement Stripe reçu : ${amount.toFixed(2)} € — ${nom} (${email})${subscriptionId ? ` — Abo: ${subscriptionId}` : ""}`.slice(0, 500),
              statut: "new",
              createdAt: new Date(),
            });
            // Paiement unique (mise en service) = mode "payment" : on crée NOUS-MÊMES
            // la facture. Le PDF est généré gratuitement par /api/facture/[id]
            // (pdf-lib, avec SIRET + mention TVA) — pas besoin de la « facture
            // postpaiement » Stripe qui prélève 0,4 %. L'abonnement (mode
            // "subscription"), lui, est facturé par l'événement invoice.paid.
            if (s.mode === "payment" && amount > 0) {
              const numero = `${numeroFacture(uid)}-MES`;
              const exists = await tx
                .select({ id: factures.id })
                .from(factures)
                .where(and(eq(factures.userId, uid), eq(factures.numero, numero)))
                .limit(1);
              if (exists.length === 0) {
                await tx.insert(factures).values({
                  userId: uid,
                  numero,
                  description: "Mise en service du site",
                  montant: amount.toFixed(2),
                  dateFacture: today(),
                  statut: "paid",
                });
              }
            }
          });
          const nom = `${u[0].prenom} ${u[0].nomFamille ?? ""}`.trim();
          // Email de confirmation au client — critique pour la confiance après un paiement.
          if (email) {
            const montantFormate = amount.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            await sendMail({
              to: email,
              subject: "Paiement reçu — Le Relais Web",
              html: emailLayout(
                `Merci ${u[0].prenom} !`,
                `<p style="font-size:15px;line-height:1.7;color:#5C6470;">Votre paiement de <b style="color:#0F1E3C;">${montantFormate} €</b> a bien été reçu. Votre facture est disponible dans votre espace client.</p>
                 <p style="font-size:15px;line-height:1.7;color:#5C6470;">On vous recontacte sous 24 h pour la suite. Si vous avez la moindre question, écrivez-nous sur WhatsApp.</p>
                 <p style="text-align:center;margin:24px 0;">
                   <a href="https://lerelaisweb.com/espace-client" style="background:#2563EB;color:#fff;text-decoration:none;padding:13px 26px;border-radius:11px;font-weight:bold;display:inline-block;">Voir mon espace client</a>
                 </p>
                 <p style="font-size:13px;line-height:1.6;color:#9b958a;">À très vite — l'équipe Le Relais Web, Ermont.</p>`
              ),
            }).catch(() => {});
          }
          await notifyStripe(
            `💸 Paiement reçu — ${nom}`,
            `<b>${amount.toFixed(2)} €</b> reçus de ${nom} (${email}). Le compte est marqué payé : pense à initialiser le projet dans l'admin.`
          );
        } else {
          // Client non trouvé → notifier l'admin (user_id 1 par convention)
          await db.insert(demandes).values({
            userId: 1,
            typeDemande: "systeme",
            description: `Paiement Stripe de ${email} (${amount.toFixed(2)} €) — client non trouvé en BDD. À traiter manuellement.`.slice(0, 500),
            statut: "new",
            createdAt: new Date(),
          });
          await notifyStripe(
            `⚠️ Paiement à rattacher — ${email}`,
            `Paiement de <b>${amount.toFixed(2)} €</b> reçu de ${email}, mais aucun compte ne correspond en base. À traiter manuellement.`
          );
        }
        break;
      }

      /* ── Nouvel abonnement créé ── */
      case "customer.subscription.created": {
        const sub = event.data.object as Stripe.Subscription;
        const subId = sub.id;
        const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
        if (!subId || !customerId) break;
        const customer = await stripe.customers.retrieve(customerId);
        const email =
          !("deleted" in customer) && customer.email ? customer.email.toLowerCase().trim() : "";
        if (!email) break;
        const u = await db
          .select({ id: utilisateurs.id })
          .from(utilisateurs)
          .where(eq(utilisateurs.email, email))
          .limit(1);
        if (u.length > 0) {
          await db
            .update(projets)
            .set({
              stripeSubscriptionId: subId,
              // Début de l'abonnement récupéré directement depuis Stripe.
              abonnementDebut: dateFromTs(sub.start_date),
            })
            .where(eq(projets.userId, u[0].id));
        }
        break;
      }

      /* ── Paiement reçu (mise en service OU mensualité) → facture + PDF Stripe ── */
      case "invoice.paid": {
        const inv = event.data.object as Stripe.Invoice;
        const subId = subscriptionIdFromInvoice(inv);
        const amount = (inv.amount_paid ?? 0) / 100;
        if (amount <= 0) break;

        // Retrouver le client : par abonnement, sinon par email (événements possiblement hors-ordre).
        let userId: number | null = null;
        if (subId) {
          const bySub = await db
            .select({ userId: projets.userId })
            .from(projets)
            .where(eq(projets.stripeSubscriptionId, subId))
            .limit(1);
          if (bySub.length > 0) userId = bySub[0].userId;
        }
        if (userId == null) {
          const email = (inv.customer_email ?? "").toLowerCase().trim();
          if (email) {
            const byEmail = await db
              .select({ id: utilisateurs.id })
              .from(utilisateurs)
              .where(eq(utilisateurs.email, email))
              .limit(1);
            if (byEmail.length > 0) userId = byEmail[0].id;
          }
        }
        if (userId == null) break;

        // Numéro de facture : celui de Stripe (apparaît sur le PDF), sinon notre format.
        const numero = inv.number || numeroFacture(userId);

        // Idempotence : ne pas recréer si une facture avec ce numéro existe déjà.
        const existing = await db
          .select({ id: factures.id })
          .from(factures)
          .where(and(eq(factures.userId, userId), eq(factures.numero, numero)))
          .limit(1);
        if (existing.length > 0) break;

        const moisAnnee = new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
        // Pas d'abonnement rattaché → c'est le paiement unique de mise en service
        // (lien « Création Pack… » avec facture postpaiement activée dans Stripe).
        const description = !subId
          ? "Mise en service du site"
          : inv.billing_reason === "subscription_create"
            ? `Abonnement — 1er mois (${moisAnnee})`
            : `Abonnement mensuel — ${moisAnnee}`;

        const insertResult = await db.insert(factures).values({
          userId,
          numero,
          description,
          montant: amount.toFixed(2),
          dateFacture: today(),
          statut: "paid",
          facturePdf: inv.invoice_pdf ?? null,
          factureUrl: inv.hosted_invoice_url ?? null,
        });
        const factureId = Number((insertResult as unknown as [{ insertId: number }])[0].insertId);

        // Email au client avec lien vers sa facture — uniquement pour les abonnements
        // (la mise en service est déjà couverte par checkout.session.completed).
        if (subId && factureId) {
          const clientRow = await db
            .select({ prenom: utilisateurs.prenom, email: utilisateurs.email })
            .from(utilisateurs)
            .where(eq(utilisateurs.id, userId))
            .limit(1);
          if (clientRow.length > 0) {
            const { prenom, email: clientEmail } = clientRow[0];
            const appUrl = (process.env.APP_URL ?? "https://lerelaisweb.com").replace(/\/$/, "");
            const montantFormate = amount.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            await sendMail({
              to: clientEmail,
              subject: `Votre facture ${moisAnnee} — Le Relais Web`,
              html: emailLayout(
                `Facture ${moisAnnee}`,
                `<p style="font-size:15px;line-height:1.7;color:#5C6470;">Bonjour ${prenom},</p>
                 <p style="font-size:15px;line-height:1.7;color:#5C6470;">Votre abonnement du mois de <b style="color:#0F1E3C;">${moisAnnee}</b> a bien été prélevé (<b>${montantFormate} €</b>). Votre facture est disponible ci-dessous.</p>
                 <p style="text-align:center;margin:24px 0;">
                   <a href="${appUrl}/api/facture/${factureId}" style="background:#2563EB;color:#fff;text-decoration:none;padding:13px 26px;border-radius:11px;font-weight:bold;display:inline-block;">Télécharger ma facture</a>
                 </p>
                 <p style="font-size:13px;line-height:1.6;color:#9b958a;">Vous retrouvez toutes vos factures dans votre espace client à tout moment.<br>À très vite — l'équipe Le Relais Web, Ermont.</p>`
              ),
            }).catch(() => {});
          }
        }
        break;
      }

      /* ── Échec de paiement mensuel ── */
      case "invoice.payment_failed": {
        const inv = event.data.object as Stripe.Invoice & { subscription?: string; attempt_count?: number };
        const subId = typeof inv.subscription === "string" ? inv.subscription : "";
        if (!subId) break;
        const row = await db
          .select({ userId: projets.userId, prenom: utilisateurs.prenom, email: utilisateurs.email })
          .from(projets)
          .innerJoin(utilisateurs, eq(utilisateurs.id, projets.userId))
          .where(eq(projets.stripeSubscriptionId, subId))
          .limit(1);
        if (row.length > 0) {
          await db.insert(demandes).values({
            userId: row[0].userId,
            typeDemande: "systeme",
            description: `ÉCHEC paiement mensuel pour ${row[0].prenom} (${row[0].email}) — tentative ${inv.attempt_count ?? "?"}. Vérifier avec le client.`.slice(0, 500),
            statut: "new",
            createdAt: new Date(),
          });
          await notifyStripe(
            `🔴 Échec de paiement — ${row[0].prenom}`,
            `Le paiement mensuel de ${row[0].prenom} (${row[0].email}) a échoué (tentative ${inv.attempt_count ?? "?"}). Contacte le client pour vérifier sa carte.`
          );
        }
        break;
      }

      /* ── Abonnement résilié/supprimé ── */
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const subId = sub.id;
        if (!subId) break;
        const row = await db
          .select({ userId: projets.userId, prenom: utilisateurs.prenom, email: utilisateurs.email })
          .from(projets)
          .innerJoin(utilisateurs, eq(utilisateurs.id, projets.userId))
          .where(eq(projets.stripeSubscriptionId, subId))
          .limit(1);
        await db.update(projets).set({ statut: "suspendu" }).where(eq(projets.stripeSubscriptionId, subId));
        if (row.length > 0) {
          await db.insert(demandes).values({
            userId: row[0].userId,
            typeDemande: "systeme",
            description: `Abonnement résilié pour ${row[0].prenom} (${row[0].email}). Projet passé en suspendu.`.slice(0, 500),
            statut: "new",
            createdAt: new Date(),
          });
          await notifyStripe(
            `⏸ Abonnement résilié — ${row[0].prenom}`,
            `L'abonnement de ${row[0].prenom} (${row[0].email}) a été résilié. Le projet est passé en « suspendu ».`
          );
        }
        break;
      }

      default:
        break;
    }
  } catch (e) {
    console.error("stripe/webhook handler:", e);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
