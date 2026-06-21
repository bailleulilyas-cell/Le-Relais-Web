import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { demandes, utilisateurs } from "@/lib/schema";
import { getSession } from "@/lib/session";
import { notifyAdmin, emailLayout } from "@/lib/mail";

export const runtime = "nodejs";

const esc = (s: string) =>
  s.replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" })[c] as string);

const TYPES_VALIDES = ["modification", "prix", "photo", "bug", "autre"] as const;
type TypeDemande = (typeof TYPES_VALIDES)[number];
const TYPE_LABEL: Record<TypeDemande, string> = {
  modification: "Modification",
  prix: "Prix / horaires",
  photo: "Photo",
  bug: "Problème technique",
  autre: "Autre",
};

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ ok: false, error: "Non authentifié." }, { status: 401 });
    }

    const body = await req.json();
    const type = String(body.type || "");
    const description = String(body.description || "").trim().slice(0, 1000);

    if (!TYPES_VALIDES.includes(type as TypeDemande)) {
      return NextResponse.json({ ok: false, error: "Type invalide." }, { status: 400 });
    }
    if (description.length < 3) {
      return NextResponse.json({ ok: false, error: "Description trop courte." }, { status: 400 });
    }

    const db = getDb();
    await db.insert(demandes).values({
      userId: session.userId,
      typeDemande: type as TypeDemande,
      description,
      statut: "new",
      createdAt: new Date(),
    });

    // Notification équipe → Ilyas + projet@.
    // ⚠️ Sur Vercel (serverless), il FAUT attendre la fin de l'envoi avant de
    // répondre, sinon la fonction est gelée et l'email est abandonné.
    const u = await db
      .select({
        prenom: utilisateurs.prenom,
        nomEnseigne: utilisateurs.nomEnseigne,
        email: utilisateurs.email,
        telephone: utilisateurs.telephone,
      })
      .from(utilisateurs)
      .where(eq(utilisateurs.id, session.userId))
      .limit(1);
    if (u.length > 0) {
      const c = u[0];
      await Promise.allSettled([
        notifyAdmin({
          alsoProjet: true,
          replyTo: c.email,
          subject: `Demande client (${TYPE_LABEL[type as TypeDemande]}) — ${c.nomEnseigne}`,
          html: emailLayout(
            "Nouvelle demande depuis l'espace client",
            `<table style="font-size:14px;line-height:1.7;color:#14243B;">
              <tr><td style="color:#9b958a;padding:2px 12px 2px 0;">Client</td><td><b>${esc(c.prenom)}</b> — ${esc(c.nomEnseigne)}</td></tr>
              <tr><td style="color:#9b958a;padding:2px 12px 2px 0;">Type</td><td><b>${esc(TYPE_LABEL[type as TypeDemande])}</b></td></tr>
              <tr><td style="color:#9b958a;padding:2px 12px 2px 0;">Email</td><td><a href="mailto:${esc(c.email)}">${esc(c.email)}</a></td></tr>
              ${c.telephone ? `<tr><td style="color:#9b958a;padding:2px 12px 2px 0;">Téléphone</td><td><a href="tel:${esc(c.telephone.replace(/\s/g, ""))}">${esc(c.telephone)}</a></td></tr>` : ""}
            </table>
            <p style="font-size:14px;line-height:1.7;color:#5C6470;margin-top:16px;"><b>Demande :</b><br>${esc(description).replace(/\n/g, "<br>")}</p>`
          ),
        }),
        // Accusé de réception au client.
        sendMail({
          to: c.email,
          subject: `Demande reçue — ${TYPE_LABEL[type as TypeDemande]} — Le Relais Web`,
          html: emailLayout(
            `Demande bien reçue, ${c.prenom} !`,
            `<p style="font-size:15px;line-height:1.7;color:#5C6470;">Votre demande de <b style="color:#0F1E3C;">${TYPE_LABEL[type as TypeDemande].toLowerCase()}</b> est enregistrée. On s'en occupe et on revient vers vous sous 48 h.</p>
             <p style="font-size:15px;line-height:1.7;color:#5C6470;">Si c'est urgent, écrivez-nous directement sur WhatsApp.</p>
             <p style="text-align:center;margin:24px 0;"><a href="https://wa.me/33695382157" style="background:#2563EB;color:#fff;text-decoration:none;padding:13px 26px;border-radius:11px;font-weight:bold;display:inline-block;">Nous écrire sur WhatsApp</a></p>
             <p style="font-size:13px;line-height:1.6;color:#9b958a;">À très vite — l'équipe Le Relais Web, Ermont.</p>`
          ),
        }),
      ]);
    }


    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("demande:", e);
    return NextResponse.json({ ok: false, error: "Erreur serveur." }, { status: 500 });
  }
}
