import { NextResponse } from "next/server";
import crypto from "crypto";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { utilisateurs } from "@/lib/schema";
import { sendMail, emailLayout } from "@/lib/mail";

export const runtime = "nodejs";

function appUrl(): string {
  return (process.env.APP_URL ?? "http://localhost:3001").replace(/\/$/, "");
}

export async function POST(req: Request) {
  // Réponse toujours identique (anti-énumération de comptes).
  const generic = NextResponse.json({
    ok: true,
    message:
      "Si un compte existe avec cet email, un lien de réinitialisation vient d'être envoyé. Pensez à vérifier vos spams.",
  });

  try {
    const body = await req.json().catch(() => ({}));
    const email = String(body.email || "").trim().toLowerCase().slice(0, 190);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return generic;

    // Petit délai anti-bruteforce / timing.
    await new Promise((r) => setTimeout(r, 300));

    const db = getDb();
    const rows = await db
      .select({ id: utilisateurs.id, prenom: utilisateurs.prenom })
      .from(utilisateurs)
      .where(eq(utilisateurs.email, email))
      .limit(1);

    if (rows.length === 0) return generic;

    const token = crypto.randomBytes(32).toString("hex"); // 64 hex
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // +1h

    await db
      .update(utilisateurs)
      .set({ resetToken: token, resetTokenExpiry: expiry })
      .where(eq(utilisateurs.id, rows[0].id));

    const link = `${appUrl()}/reset-mot-de-passe?token=${token}`;
    await sendMail({
      to: email,
      subject: "Réinitialisation de votre mot de passe — Le Relais Web",
      html: emailLayout(
        "Réinitialisation de votre mot de passe",
        `<p style="font-size:15px;line-height:1.7;color:#5C6470;">Bonjour ${rows[0].prenom},</p>
         <p style="font-size:15px;line-height:1.7;color:#5C6470;">Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous (valable 1 heure) :</p>
         <p style="text-align:center;margin:24px 0;"><a href="${link}" style="background:#2563EB;color:#fff;text-decoration:none;padding:13px 26px;border-radius:11px;font-weight:bold;display:inline-block;">Choisir un nouveau mot de passe</a></p>
         <p style="font-size:13px;line-height:1.6;color:#9b958a;">Si vous n'êtes pas à l'origine de cette demande, ignorez cet email — votre mot de passe reste inchangé.</p>`
      ),
    });

    return generic;
  } catch (e) {
    console.error("reset/demande:", e);
    return generic; // ne jamais révéler d'erreur ici
  }
}
