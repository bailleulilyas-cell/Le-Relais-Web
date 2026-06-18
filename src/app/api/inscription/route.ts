import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { utilisateurs } from "@/lib/schema";
import { hashPassword } from "@/lib/password";
import { createSession } from "@/lib/session";
import { sendMail, notifyAdmin, emailLayout } from "@/lib/mail";

export const runtime = "nodejs";

const esc = (s: string) =>
  s.replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" })[c] as string);

const PACKS_VALIDES = ["presence", "pro", "indecis"] as const;
const PACK_LABEL: Record<string, string> = {
  presence: "Présence (550 € + 25 €/mois)",
  pro: "Pro (1 200 € + 40 €/mois)",
  indecis: "Indécis — à discuter",
};

/**
 * Inscription unifiée = création de compte + demande de devis.
 * Un prospect crée son espace ET envoie son projet en une seule action.
 * Champs : prenom, enseigne, email, password (obligatoires) ; ville, secteur, description (devis).
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const prenom = String(body.prenom || "").trim().slice(0, 80);
    const nomEnseigne = String(body.enseigne || "").trim().slice(0, 120);
    const email = String(body.email || "").trim().toLowerCase().slice(0, 190);
    const password = String(body.password || "");
    const ville = String(body.ville || "").trim().slice(0, 100);
    const telephone = String(body.telephone || "").trim().slice(0, 30);
    const secteur = String(body.secteur || "").trim().slice(0, 120);
    const description = String(body.description || "").trim().slice(0, 2000);
    const urlActuel = String(body.urlActuel || "").trim().slice(0, 255);
    const ouiNon = (v: unknown) =>
      v === "oui" ? true : v === "non" ? false : null;
    const aDejaSite = ouiNon(body.dejaSite);
    const aLogo = ouiNon(body.logo);
    const packRaw = String(body.pack || "");
    const pack = PACKS_VALIDES.includes(packRaw as (typeof PACKS_VALIDES)[number])
      ? (packRaw as (typeof PACKS_VALIDES)[number])
      : null;

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
        { ok: false, error: "Un compte existe déjà avec cet email.", exists: true },
        { status: 409 }
      );
    }

    const hash = await hashPassword(password);
    const result = await db.insert(utilisateurs).values({
      prenom,
      nomEnseigne,
      email,
      motDePasse: hash,
      telephone: telephone || null,
      ville: ville || null,
      aDejaSite,
      urlSiteActuel: aDejaSite ? urlActuel || null : null,
      aLogo,
      secteurActivite: secteur || null,
      packSouhaite: pack,
      descriptionProjet: description || null,
    });
    const insertId = Number((result as unknown as [{ insertId: number }])[0].insertId);

    await createSession({ userId: insertId, role: "client", prenom });

    // Notification équipe (nouvelle demande de devis) → Ilyas + projet@ — best-effort.
    const row = (k: string, v: string) =>
      `<tr><td style="color:#9b958a;padding:2px 12px 2px 0;vertical-align:top;">${k}</td><td>${v}</td></tr>`;
    notifyAdmin({
      alsoProjet: true,
      replyTo: email,
      subject: `Nouveau devis + compte — ${nomEnseigne}${ville ? ` (${ville})` : ""}`,
      html: emailLayout(
        "Nouveau compte client + demande de devis",
        `<table style="font-size:14px;line-height:1.7;color:#14243B;">
          ${row("Prénom", `<b>${esc(prenom)}</b>`)}
          ${row("Établissement", `<b>${esc(nomEnseigne)}</b>`)}
          ${row("Téléphone", telephone ? `<a href="tel:${esc(telephone.replace(/\s/g, ""))}"><b>${esc(telephone)}</b></a>` : "—")}
          ${row("Email", `<a href="mailto:${esc(email)}">${esc(email)}</a>`)}
          ${row("Ville", esc(ville) || "—")}
          ${row("Secteur", esc(secteur) || "—")}
          ${row("Formule souhaitée", `<b>${esc(pack ? PACK_LABEL[pack] : "—")}</b>`)}
          ${row("Déjà un site&nbsp;?", aDejaSite === true ? `Oui${urlActuel ? ` — ${esc(urlActuel)}` : ""}` : aDejaSite === false ? "Non" : "—")}
          ${row("A un logo&nbsp;?", aLogo === true ? "Oui" : aLogo === false ? "Non" : "—")}
        </table>
        <p style="font-size:14px;line-height:1.7;color:#5C6470;margin-top:16px;"><b>Projet :</b><br>${esc(description || "(non précisé)").replace(/\n/g, "<br>")}</p>`
      ),
    }).catch(() => {});

    // Email de bienvenue au client — best-effort.
    sendMail({
      to: email,
      subject: "Votre demande est bien reçue — Le Relais Web",
      html: emailLayout(
        `Merci ${prenom} !`,
        `<p style="font-size:15px;line-height:1.7;color:#5C6470;">Votre espace client est créé et votre demande nous est bien parvenue. On revient vers vous sous 24h.</p>
         <p style="font-size:15px;line-height:1.7;color:#5C6470;">Vous pouvez suivre l'avancement, vos factures et vos demandes depuis votre espace, à tout moment.</p>
         <p style="text-align:center;margin:24px 0;"><a href="https://wa.me/33695382157" style="background:#2563EB;color:#fff;text-decoration:none;padding:13px 26px;border-radius:11px;font-weight:bold;display:inline-block;">Nous écrire sur WhatsApp</a></p>
         <p style="font-size:13px;line-height:1.6;color:#9b958a;">À très vite — l'équipe Le Relais Web, Ermont.</p>`
      ),
    }).catch(() => {});

    return NextResponse.json({ ok: true, role: "client" });
  } catch (e) {
    console.error("inscription:", e);
    return NextResponse.json({ ok: false, error: "Erreur serveur." }, { status: 500 });
  }
}
