import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { demandes } from "@/lib/schema";
import { getSession } from "@/lib/session";

export const runtime = "nodejs";

const TYPES_VALIDES = ["modification", "prix", "photo", "bug", "autre"] as const;
type TypeDemande = (typeof TYPES_VALIDES)[number];

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

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("demande:", e);
    return NextResponse.json({ ok: false, error: "Erreur serveur." }, { status: 500 });
  }
}
