import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { projets, demandes, interventions, utilisateurs } from "@/lib/schema";
import { getSession } from "@/lib/session";
import { getStripe } from "@/lib/stripe";
import { notifyAdmin, emailLayout } from "@/lib/mail";

export const runtime = "nodejs";

/** Alerte Ilyas immédiatement qu'un client veut résilier — moment clé pour le retenir. */
async function alerteResiliation(userId: number, contexte: string): Promise<void> {
  const db = getDb();
  const u = await db
    .select({ prenom: utilisateurs.prenom, nomEnseigne: utilisateurs.nomEnseigne, email: utilisateurs.email })
    .from(utilisateurs)
    .where(eq(utilisateurs.id, userId))
    .limit(1);
  if (u.length === 0) return;
  const c = u[0];
  await notifyAdmin({
    subject: `⚠️ Résiliation demandée — ${c.nomEnseigne}`,
    replyTo: c.email,
    html: emailLayout(
      "Un client souhaite résilier",
      `<p style="font-size:15px;line-height:1.7;color:#5C6470;"><b style="color:#0F1E3C;">${c.prenom}</b> (${c.nomEnseigne}, ${c.email}) vient de demander la résiliation de son abonnement.</p>
       <p style="font-size:15px;line-height:1.7;color:#5C6470;">${contexte}</p>
       <p style="font-size:15px;line-height:1.7;color:#5C6470;">C'est le bon moment pour le contacter et comprendre pourquoi.</p>`
    ),
  }).catch(() => {});
}

/**
 * Résiliation d'abonnement.
 * - Si un abonnement Stripe est lié : annulation en fin de période (cancel_at_period_end).
 * - Sinon : enregistre une demande de résiliation manuelle traitée par l'admin.
 */
export async function POST() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ ok: false, error: "Non authentifié." }, { status: 401 });
    }

    const db = getDb();
    const rows = await db
      .select({
        id: projets.id,
        statut: projets.statut,
        stripeSubscriptionId: projets.stripeSubscriptionId,
      })
      .from(projets)
      .where(eq(projets.userId, session.userId))
      .limit(1);

    if (rows.length === 0) {
      return NextResponse.json({ ok: false, error: "Aucun projet trouvé." }, { status: 404 });
    }
    const projet = rows[0];
    if (projet.statut === "suspendu") {
      return NextResponse.json({ ok: false, error: "Votre abonnement est déjà résilié." }, { status: 400 });
    }

    const subId = projet.stripeSubscriptionId;

    // Pas d'abonnement Stripe lié → demande manuelle
    if (!subId) {
      await db.insert(demandes).values({
        userId: session.userId,
        typeDemande: "autre",
        description: "[RÉSILIATION] Demande de résiliation d'abonnement via l'espace client.",
        statut: "new",
        createdAt: new Date(),
      });
      await alerteResiliation(
        session.userId,
        "Aucun abonnement Stripe n'est rattaché : à traiter manuellement."
      );
      return NextResponse.json({
        ok: true,
        mode: "manual",
        message:
          "Votre demande de résiliation a été enregistrée. Nous la traiterons sous 24h ouvrées.",
      });
    }

    // Abonnement Stripe → annulation en fin de période
    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Service de résiliation temporairement indisponible. Contactez contact@lerelaisweb.com.",
        },
        { status: 503 }
      );
    }

    const sub = await stripe.subscriptions.update(subId, { cancel_at_period_end: true });

    if (sub.cancel_at_period_end) {
      const fin = sub.cancel_at
        ? new Date(sub.cancel_at * 1000).toLocaleDateString("fr-FR")
        : "";
      await db.insert(interventions).values({
        userId: session.userId,
        titre: "Résiliation demandée",
        description: "Abonnement annulé en fin de période via l'espace client.",
        type: "update",
        dateIntervention: new Date().toISOString().slice(0, 10),
      });
      await alerteResiliation(
        session.userId,
        fin
          ? `L'abonnement Stripe est annulé pour le ${fin} (le site reste en ligne jusque-là).`
          : "L'abonnement Stripe est annulé en fin de période en cours."
      );
      return NextResponse.json({
        ok: true,
        mode: "stripe",
        message: fin
          ? `Votre abonnement sera résilié le ${fin}. Votre site restera en ligne jusqu'à cette date.`
          : "Votre abonnement sera résilié en fin de période. Votre site reste en ligne jusque-là.",
      });
    }

    return NextResponse.json(
      { ok: false, error: "Erreur inattendue. Contactez contact@lerelaisweb.com." },
      { status: 502 }
    );
  } catch (e) {
    console.error("resilier:", e);
    return NextResponse.json({ ok: false, error: "Erreur serveur." }, { status: 500 });
  }
}
