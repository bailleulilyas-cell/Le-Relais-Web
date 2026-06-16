import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { utilisateurs, projets } from "@/lib/schema";
import { getSession } from "@/lib/session";
import { getStripe, appUrl, PRIX_MISE_EN_SERVICE, PRIX_ABONNEMENT_MENSUEL } from "@/lib/stripe";

export const runtime = "nodejs";

/**
 * Crée une session Stripe Checkout (mode abonnement).
 * Le montant facturé est celui défini sur le PROJET du client (montant_setup /
 * montant_mensuel) — fixé par l'admin à l'initialisation selon le pack choisi
 * (Présence ou Pro). Jamais de prix fixe en dur : chaque client peut avoir un
 * montant différent. Si aucun projet n'existe encore, on retombe sur le tarif
 * Présence par défaut.
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

    // Tarif réel du projet (fixé par l'admin selon le pack). Fallback Présence si pas encore de projet.
    const projetRows = await db
      .select({ montantSetup: projets.montantSetup, montantMensuel: projets.montantMensuel })
      .from(projets)
      .where(eq(projets.userId, targetUserId))
      .limit(1);
    const setupCents = projetRows[0]?.montantSetup
      ? Math.round(Number(projetRows[0].montantSetup) * 100)
      : PRIX_MISE_EN_SERVICE;
    const mensuelCents = projetRows[0]?.montantMensuel
      ? Math.round(Number(projetRows[0].montantMensuel) * 100)
      : PRIX_ABONNEMENT_MENSUEL;

    const checkout = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: rows[0].email,
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: { name: "Frais de mise en service" },
            unit_amount: setupCents,
          },
          quantity: 1,
        },
        {
          price_data: {
            currency: "eur",
            product_data: { name: "Maintenance du site web" },
            unit_amount: mensuelCents,
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
