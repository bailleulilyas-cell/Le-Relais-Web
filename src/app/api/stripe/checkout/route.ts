import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { utilisateurs } from "@/lib/schema";
import { getSession } from "@/lib/session";
import {
  getStripe,
  appUrl,
  PRIX_MISE_EN_SERVICE,
  PRIX_ABONNEMENT_MENSUEL,
} from "@/lib/stripe";

export const runtime = "nodejs";

/**
 * Crée une session Stripe Checkout (mode abonnement).
 * Première facture = 400 € mise en service + 25 €/mois.
 * Accessible par l'admin (pour n'importe quel client) ou par un client (pour son propre compte).
 */
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ ok: false, error: "Non authentifié." }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const targetUserId = Number(body.userId) || session.userId;

    // Un client ne peut payer que pour son propre compte ; l'admin pour n'importe qui.
    if (session.role !== "admin" && targetUserId !== session.userId) {
      return NextResponse.json({ ok: false, error: "Accès non autorisé." }, { status: 403 });
    }

    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json(
        { ok: false, error: "Paiement temporairement indisponible (Stripe non configuré)." },
        { status: 503 }
      );
    }

    const db = getDb();
    const rows = await db
      .select({ email: utilisateurs.email })
      .from(utilisateurs)
      .where(eq(utilisateurs.id, targetUserId))
      .limit(1);
    if (rows.length === 0) {
      return NextResponse.json({ ok: false, error: "Client introuvable." }, { status: 404 });
    }

    const checkout = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: rows[0].email,
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: { name: "Frais de mise en service" },
            unit_amount: PRIX_MISE_EN_SERVICE,
          },
          quantity: 1,
        },
        {
          price_data: {
            currency: "eur",
            product_data: { name: "Maintenance du site web" },
            unit_amount: PRIX_ABONNEMENT_MENSUEL,
            recurring: { interval: "month" },
          },
          quantity: 1,
        },
      ],
      metadata: { user_id: String(targetUserId) },
      subscription_data: { metadata: { user_id: String(targetUserId) } },
      success_url: `${appUrl()}/espace-client?paiement=ok`,
      cancel_url: `${appUrl()}/espace-client?paiement=annule`,
    });

    if (!checkout.url) {
      return NextResponse.json({ ok: false, error: "Réponse Stripe inattendue." }, { status: 502 });
    }
    return NextResponse.json({ ok: true, url: checkout.url });
  } catch (e) {
    console.error("stripe/checkout:", e);
    const msg = e instanceof Error ? e.message : "Erreur Stripe.";
    return NextResponse.json({ ok: false, error: `Erreur Stripe : ${msg}` }, { status: 500 });
  }
}
