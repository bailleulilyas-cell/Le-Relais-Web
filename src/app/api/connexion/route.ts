import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { utilisateurs } from "@/lib/schema";
import { verifyPassword } from "@/lib/password";
import { createSession } from "@/lib/session";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body.email || "").trim().toLowerCase().slice(0, 190);
    const password = String(body.password || "");

    if (!email || !password) {
      return NextResponse.json({ ok: false, error: "Champs requis." }, { status: 400 });
    }

    const db = getDb();
    const rows = await db
      .select()
      .from(utilisateurs)
      .where(eq(utilisateurs.email, email))
      .limit(1);

    const user = rows[0];
    // Anti-énumération : on hache toujours, message identique en cas d'échec.
    const ok = user ? await verifyPassword(password, user.motDePasse) : false;
    await new Promise((r) => setTimeout(r, 300));

    if (!user || !ok) {
      return NextResponse.json(
        { ok: false, error: "Email ou mot de passe incorrect." },
        { status: 401 }
      );
    }

    await createSession({ userId: user.id, role: user.role, prenom: user.prenom });
    return NextResponse.json({ ok: true, role: user.role });
  } catch (e) {
    console.error("connexion:", e);
    return NextResponse.json({ ok: false, error: "Erreur serveur." }, { status: 500 });
  }
}
