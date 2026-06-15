import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { factures, utilisateurs } from "@/lib/schema";
import { getSession } from "@/lib/session";
import { generateFacturePdf } from "@/lib/facture-pdf";

export const runtime = "nodejs";

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return new Response("Non authentifié.", { status: 401 });

  const { id } = await ctx.params;
  const factureId = parseInt(id, 10);
  if (Number.isNaN(factureId)) return new Response("Identifiant invalide.", { status: 400 });

  const db = getDb();
  const rows = await db
    .select({
      id: factures.id,
      userId: factures.userId,
      numero: factures.numero,
      description: factures.description,
      montant: factures.montant,
      dateFacture: factures.dateFacture,
      statut: factures.statut,
      prenom: utilisateurs.prenom,
      nomFamille: utilisateurs.nomFamille,
      nomEnseigne: utilisateurs.nomEnseigne,
      email: utilisateurs.email,
    })
    .from(factures)
    .innerJoin(utilisateurs, eq(utilisateurs.id, factures.userId))
    .where(eq(factures.id, factureId))
    .limit(1);

  if (rows.length === 0) return new Response("Facture introuvable.", { status: 404 });
  const f = rows[0];

  // Un client ne peut télécharger que ses propres factures ; l'admin toutes.
  if (session.role !== "admin" && f.userId !== session.userId) {
    return new Response("Accès non autorisé.", { status: 403 });
  }

  const pdf = await generateFacturePdf({
    numero: f.numero,
    description: f.description,
    montant: Number(f.montant),
    date: String(f.dateFacture),
    statut: f.statut ?? "pending",
    client: {
      enseigne: f.nomEnseigne,
      nom: `${f.prenom} ${f.nomFamille ?? ""}`.trim(),
      email: f.email,
    },
  });

  const safeNum = f.numero.replace(/[^a-zA-Z0-9_-]/g, "-");
  return new Response(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="facture-${safeNum}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
