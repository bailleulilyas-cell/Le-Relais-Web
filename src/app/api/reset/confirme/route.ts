import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { utilisateurs } from "@/lib/schema";
import { hashPassword } from "@/lib/password";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const token = String(body.token || "").trim();
    const password = String(body.password || "");

    if (!/^[0-9a-f]{64}$/.test(token)) {
      return NextResponse.json({ ok: false, error: "Lien invalide." }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json(
        { ok: false, error: "Le mot de passe doit faire au moins 8 caractères." },
        { status: 400 }
      );
    }

    const db = getDb();
    const rows = await db
      .select({
        id: utilisateurs.id,
        expiry: utilisateurs.resetTokenExpiry,
      })
      .from(utilisateurs)
      .where(eq(utilisateurs.resetToken, token))
      .limit(1);

    if (rows.length === 0) {
      return NextResponse.json(
        { ok: false, error: "Ce lien est invalide ou a déjà été utilisé." },
        { status: 400 }
      );
    }

    const expiry = rows[0].expiry ? new Date(rows[0].expiry) : null;
    if (!expiry || expiry.getTime() < Date.now()) {
      return NextResponse.json(
        { ok: false, error: "Ce lien a expiré. Refaites une demande." },
        { status: 400 }
      );
    }

    const hash = await hashPassword(password);
    await db
      .update(utilisateurs)
      .set({ motDePasse: hash, resetToken: null, resetTokenExpiry: null })
      .where(eq(utilisateurs.id, rows[0].id));

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("reset/confirme:", e);
    return NextResponse.json({ ok: false, error: "Erreur serveur." }, { status: 500 });
  }
}
