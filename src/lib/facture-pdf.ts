import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export type FacturePdfData = {
  numero: string;
  description: string;
  montant: number;
  date: string; // YYYY-MM-DD
  statut: "paid" | "pending";
  client: {
    enseigne: string;
    nom: string;
    email: string;
  };
};

const NAVY = rgb(0.059, 0.118, 0.235); // #0F1E3C
const GRAY = rgb(0.42, 0.45, 0.5);
const BLUE = rgb(0.145, 0.388, 0.922); // #2563EB
const LINE = rgb(0.9, 0.89, 0.87);

function eur(n: number): string {
  return n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " EUR";
}
function frDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso.length <= 10 ? iso + "T00:00:00" : iso);
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

/** Génère une facture PDF (A4) conforme micro-entrepreneur. Retourne les octets. */
export async function generateFacturePdf(f: FacturePdfData): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595.28, 841.89]); // A4
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const { width } = page.getSize();
  const M = 50;
  let y = 790;

  const text = (s: string, x: number, yy: number, size: number, f = font, color = NAVY) =>
    page.drawText(s, { x, y: yy, size, font: f, color });
  const right = (s: string, xr: number, yy: number, size: number, f = font, color = NAVY) =>
    page.drawText(s, { x: xr - f.widthOfTextAtSize(s, size), y: yy, size, font: f, color });

  // ── En-tête émetteur ──
  text("Le Relais Web", M, y, 18, bold);
  text("FACTURE", width - M - bold.widthOfTextAtSize("FACTURE", 18), y, 18, bold, BLUE);
  y -= 16;
  text("Votre partenaire digital local", M, y, 9, font, GRAY);
  right(`N° ${f.numero}`, width - M, y, 10, font, GRAY);
  y -= 26;
  const emetteur = [
    "Thierry Bailleul — Le Relais Web",
    "Ermont, 95120 Val-d'Oise",
    "SIRET 101 586 428 00019",
    "contact@lerelaisweb.com",
  ];
  emetteur.forEach((l, i) => text(l, M, y - i * 13, 9.5, font, GRAY));
  right(`Date : ${frDate(f.date)}`, width - M, y, 10, font, NAVY);

  y -= emetteur.length * 13 + 24;
  page.drawLine({ start: { x: M, y }, end: { x: width - M, y }, thickness: 1, color: LINE });
  y -= 26;

  // ── Facturé à ──
  text("FACTURÉ À", M, y, 9, bold, GRAY);
  y -= 16;
  text(f.client.enseigne || f.client.nom, M, y, 12, bold);
  y -= 14;
  if (f.client.nom && f.client.nom !== f.client.enseigne) {
    text(f.client.nom, M, y, 10, font, GRAY);
    y -= 13;
  }
  text(f.client.email, M, y, 10, font, GRAY);
  y -= 36;

  // ── Tableau ──
  page.drawRectangle({ x: M, y: y - 6, width: width - 2 * M, height: 24, color: rgb(0.97, 0.97, 0.96) });
  text("DESCRIPTION", M + 12, y, 9, bold, GRAY);
  right("MONTANT", width - M - 12, y, 9, bold, GRAY);
  y -= 30;
  text(f.description, M + 12, y, 11, font);
  right(eur(f.montant), width - M - 12, y, 11, font);
  y -= 16;
  page.drawLine({ start: { x: M, y }, end: { x: width - M, y }, thickness: 0.7, color: LINE });
  y -= 26;

  // ── Total ──
  text("Total", width - M - 200, y, 12, bold);
  right(eur(f.montant), width - M - 12, y, 13, bold);
  y -= 28;
  right(
    f.statut === "paid" ? "Statut : Payé" : "Statut : En attente de paiement",
    width - M - 12,
    y,
    10,
    font,
    f.statut === "paid" ? rgb(0.04, 0.43, 0.31) : GRAY
  );

  // ── Mentions légales ──
  y -= 60;
  page.drawLine({ start: { x: M, y }, end: { x: width - M, y }, thickness: 0.7, color: LINE });
  y -= 18;
  text("TVA non applicable, art. 293 B du CGI.", M, y, 9, font, GRAY);
  y -= 13;
  text("Le Relais Web — micro-entreprise. Paiement par carte via Stripe.", M, y, 9, font, GRAY);

  // ── Pied de page ──
  text("Merci de votre confiance — Le Relais Web, Ermont (95).", M, 40, 9, font, GRAY);

  return doc.save();
}
