import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { eq, and } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { utilisateurs, projets, factures, demandes } from "@/lib/schema";
import { getStripe, STRIPE_WEBHOOK_SECRET } from "@/lib/stripe";

export const runtime = "nodejs";

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
        if (!email) break;

        const u = await db
          .select({ id: utilisateurs.id, prenom: utilisateurs.prenom, nomFamille: utilisateurs.nomFamille })
          .from(utilisateurs)
          .where(eq(utilisateurs.email, email))
          .limit(1);

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
              typeDemande: "autre",
              description: `Paiement Stripe reçu : ${amount.toFixed(2)} € — ${nom} (${email})${subscriptionId ? ` — Abo: ${subscriptionId}` : ""}`.slice(0, 500),
              statut: "new",
              createdAt: new Date(),
            });
            // La facture (avec PDF) est créée par l'événement invoice.paid (mise en service + mensualités).
          });
        } else {
          // Client non trouvé → notifier l'admin (user_id 1 par convention)
          await db.insert(demandes).values({
            userId: 1,
            typeDemande: "autre",
            description: `Paiement Stripe de ${email} (${amount.toFixed(2)} €) — client non trouvé en BDD. À traiter manuellement.`.slice(0, 500),
            statut: "new",
            createdAt: new Date(),
          });
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
            .set({ stripeSubscriptionId: subId })
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
        const description =
          inv.billing_reason === "subscription_create"
            ? "Mise en service + 1er mois"
            : `Abonnement mensuel — ${moisAnnee}`;

        await db.insert(factures).values({
          userId,
          numero,
          description,
          montant: amount.toFixed(2),
          dateFacture: today(),
          statut: "paid",
          facturePdf: inv.invoice_pdf ?? null,
          factureUrl: inv.hosted_invoice_url ?? null,
        });
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
            typeDemande: "autre",
            description: `ÉCHEC paiement mensuel pour ${row[0].prenom} (${row[0].email}) — tentative ${inv.attempt_count ?? "?"}. Vérifier avec le client.`.slice(0, 500),
            statut: "new",
            createdAt: new Date(),
          });
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
            typeDemande: "autre",
            description: `Abonnement résilié pour ${row[0].prenom} (${row[0].email}). Projet passé en suspendu.`.slice(0, 500),
            statut: "new",
            createdAt: new Date(),
          });
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
