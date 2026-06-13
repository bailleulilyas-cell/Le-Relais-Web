import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { utilisateurs } from "@/lib/schema";
import { hashPassword } from "@/lib/password";
import { createSession } from "@/lib/session";
import { sendMail, emailLayout } from "@/lib/mail";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const prenom = String(body.prenom || "").trim().slice(0, 80);
    const nomEnseigne = String(body.enseigne || "").trim().slice(0, 120);
    const email = String(body.email || "").trim().toLowerCase().slice(0, 190);
    const password = String(body.password || "");

    if (!prenom || !nomEnseigne || !email || password.length < 8) {
      return NextResponse.json({ ok: false, error: "Champs invalides." }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ ok: false, error: "Email invalide." }, { status: 400 });
    }

    const db = getDb();
    const existing = await db
      .select({ id: utilisateurs.id })
      .from(utilisateurs)
      .where(eq(utilisateurs.email, email))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { ok: false, error: "Un compte existe déjà avec cet email." },
        { status: 409 }
      );
    }

    const hash = await hashPassword(password);
    const result = await db.insert(utilisateurs).values({
      prenom,
      nomEnseigne,
      email,
      motDePasse: hash,
    });
    const insertId = Number((result as unknown as [{ insertId: number }])[0].insertId);

    await createSession({ userId: insertId, role: "client", prenom });

    // Email de bienvenue — best-effort, ne bloque pas l'inscription.
    sendMail({
      to: email,
      subject: "Bienvenue chez Le Relais Web 👋",
      html: emailLayout(
        `Bienvenue ${prenom} !`,
        `<p style="font-size:15px;line-height:1.7;color:#5C6470;">Votre espace client est créé. Vous pourrez y suivre l'avancement de votre site, vos factures et vos demandes, en un coup d'œil.</p>
         <p style="font-size:15px;line-height:1.7;color:#5C6470;">Pour lancer votre projet, dites-nous tout — par message, c'est le plus simple :</p>
         <p style="text-align:center;margin:24px 0;"><a href="https://wa.me/33695382157" style="background:#0B6E4F;color:#fff;text-decoration:none;padding:13px 26px;border-radius:11px;font-weight:bold;display:inline-block;">Nous écrire sur WhatsApp</a></p>
         <p style="font-size:13px;line-height:1.6;color:#9b958a;">À très vite — l'équipe Le Relais Web, Ermont.</p>`
      ),
    }).catch(() => {});

    return NextResponse.json({ ok: true, role: "client" });
  } catch (e) {
    console.error("inscription:", e);
    return NextResponse.json({ ok: false, error: "Erreur serveur." }, { status: 500 });
  }
}
