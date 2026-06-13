import { NextResponse } from "next/server";
import { sendMail, emailLayout } from "@/lib/mail";

export const runtime = "nodejs";

const esc = (s: string) =>
  s.replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" })[c] as string);

/**
 * Capture d'une demande de devis : notifie l'équipe par email.
 * Le formulaire ouvre aussi WhatsApp côté client ; cette route garantit
 * qu'aucun prospect n'est perdu même si le message WhatsApp n'est pas envoyé.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const enseigne = String(body.enseigne || "").trim().slice(0, 150);
    const ville = String(body.ville || "").trim().slice(0, 100);
    const secteur = String(body.secteur || "").trim().slice(0, 120);
    const email = String(body.email || "").trim().slice(0, 190);
    const description = String(body.description || "").trim().slice(0, 2000);

    if (!enseigne || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ ok: false, error: "Champs invalides." }, { status: 400 });
    }

    const sent = await sendMail({
      to: "projet@lerelaisweb.com",
      replyTo: email,
      subject: `Nouvelle demande de devis — ${enseigne} (${ville || "ville ?"})`,
      html: emailLayout(
        "Nouvelle demande de devis",
        `<table style="font-size:14px;line-height:1.7;color:#14243B;">
          <tr><td style="color:#9b958a;padding-right:12px;">Enseigne</td><td><b>${esc(enseigne)}</b></td></tr>
          <tr><td style="color:#9b958a;padding-right:12px;">Ville</td><td>${esc(ville)}</td></tr>
          <tr><td style="color:#9b958a;padding-right:12px;">Secteur</td><td>${esc(secteur)}</td></tr>
          <tr><td style="color:#9b958a;padding-right:12px;">Email</td><td><a href="mailto:${esc(email)}">${esc(email)}</a></td></tr>
        </table>
        <p style="font-size:14px;line-height:1.7;color:#5C6470;margin-top:16px;"><b>Projet :</b><br>${esc(description).replace(/\n/g, "<br>")}</p>`
      ),
    });

    // On répond ok même si l'email échoue : le client a aussi WhatsApp,
    // et on ne veut pas afficher d'erreur anxiogène au prospect.
    return NextResponse.json({ ok: true, mailed: sent });
  } catch (e) {
    console.error("devis:", e);
    return NextResponse.json({ ok: true, mailed: false });
  }
}
