"use client";

import { useEffect, useState } from "react";

/* Générateur de devis (admin). Saisie à gauche, aperçu A4 imprimable à droite.
 * « Imprimer → Enregistrer en PDF » produit un devis propre à envoyer au client.
 * Le print masque tout sauf la feuille (.devis-sheet) — cf. @media print dans globals.css. */

type Pack = "presence" | "pro" | "custom";

const PACKS: Record<
  Exclude<Pack, "custom">,
  { titre: string; setup: number; mensuel: number; pages: string; feats: string[] }
> = {
  presence: {
    titre: "Pack Présence",
    setup: 550,
    mensuel: 25,
    pages: "4 à 6",
    feats: [
      "Nom de domaine + hébergement inclus",
      "Référencement local sur Google",
      "Modifications faites par nos soins, à la demande",
      "Maintenance, sécurité & dépannage compris",
    ],
  },
  pro: {
    titre: "Pack Pro",
    setup: 1200,
    mensuel: 40,
    pages: "6 à 10",
    feats: [
      "Espace d’administration : gérez votre contenu vous-même",
      "Produits, photos, horaires, menus, actualités",
      "Formation simple à l’outil incluse",
      "Maintenance, sécurité & dépannage compris",
    ],
  },
};

function eur(n: number): string {
  return n.toLocaleString("fr-FR");
}

export default function DevisGenerator() {
  const [pack, setPack] = useState<Pack>("presence");
  const [enseigne, setEnseigne] = useState("");
  const [clientNom, setClientNom] = useState("");
  const [ville, setVille] = useState("");
  const [email, setEmail] = useState("");
  const [pages, setPages] = useState("4 à 6");
  const [numero, setNumero] = useState("");
  const [dateStr, setDateStr] = useState("");
  const [validite, setValidite] = useState("30");

  // Sur-mesure
  const [cSetup, setCSetup] = useState("");
  const [cMensuel, setCMensuel] = useState("");
  const [cDesc, setCDesc] = useState("");

  useEffect(() => {
    const d = new Date();
    setDateStr(
      d.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })
    );
    setNumero(`DEV-${d.getFullYear()}-001`);
  }, []);

  // Quand on change de pack standard, on réaligne le nb de pages par défaut.
  function changePack(p: Pack) {
    setPack(p);
    if (p === "presence") setPages("4 à 6");
    if (p === "pro") setPages("6 à 10");
  }

  const isCustom = pack === "custom";
  const setup = isCustom ? Number(cSetup) || 0 : PACKS[pack].setup;
  const mensuel = isCustom ? Number(cMensuel) || 0 : PACKS[pack].mensuel;
  const titre = isCustom ? "Formule sur-mesure" : PACKS[pack].titre;

  const feats: string[] = isCustom
    ? cDesc.split("\n").map((l) => l.trim()).filter(Boolean)
    : [`Site sur-mesure (${pages} pages)`, ...PACKS[pack].feats];

  return (
    <>
      <div className="devis-tool">
        <div className="adm-head" style={{ marginBottom: "1rem" }}>
          <h1 className="adm-h1">Générer un devis</h1>
          <p className="adm-sub">
            Remplissez les champs, puis <strong>« Imprimer → Enregistrer en PDF »</strong> et envoyez-le au client.
          </p>
        </div>

        <div className="devis-tool-grid">
          <label className="devis-field">
            <span>Formule</span>
            <select value={pack} onChange={(e) => changePack(e.target.value as Pack)}>
              <option value="presence">Pack Présence — 550 € + 25 €/mois</option>
              <option value="pro">Pack Pro — 1 200 € + 40 €/mois</option>
              <option value="custom">Sur-mesure (prix libre)</option>
            </select>
          </label>
          <label className="devis-field">
            <span>Enseigne / commerce</span>
            <input value={enseigne} onChange={(e) => setEnseigne(e.target.value)} placeholder="Boulangerie Dumont" />
          </label>
          <label className="devis-field">
            <span>Nom du client</span>
            <input value={clientNom} onChange={(e) => setClientNom(e.target.value)} placeholder="M. Dumont" />
          </label>
          <label className="devis-field">
            <span>Ville</span>
            <input value={ville} onChange={(e) => setVille(e.target.value)} placeholder="Ermont (95)" />
          </label>
          <label className="devis-field">
            <span>Email</span>
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contact@client.fr" />
          </label>
          {!isCustom && (
            <label className="devis-field">
              <span>Nombre de pages</span>
              <input value={pages} onChange={(e) => setPages(e.target.value)} placeholder="4 à 6" />
            </label>
          )}
          {isCustom && (
            <>
              <label className="devis-field">
                <span>Mise en service (€)</span>
                <input value={cSetup} onChange={(e) => setCSetup(e.target.value)} placeholder="800" inputMode="numeric" />
              </label>
              <label className="devis-field">
                <span>Abonnement (€/mois)</span>
                <input value={cMensuel} onChange={(e) => setCMensuel(e.target.value)} placeholder="30" inputMode="numeric" />
              </label>
              <label className="devis-field devis-field-wide">
                <span>Prestations incluses (une par ligne)</span>
                <textarea value={cDesc} onChange={(e) => setCDesc(e.target.value)} rows={4} placeholder={"Site sur-mesure (8 pages)\nNom de domaine + hébergement\nRéférencement local"} />
              </label>
            </>
          )}
          <label className="devis-field">
            <span>N° de devis</span>
            <input value={numero} onChange={(e) => setNumero(e.target.value)} placeholder="DEV-2026-001" />
          </label>
          <label className="devis-field">
            <span>Date</span>
            <input value={dateStr} onChange={(e) => setDateStr(e.target.value)} />
          </label>
          <label className="devis-field">
            <span>Validité (jours)</span>
            <input value={validite} onChange={(e) => setValidite(e.target.value)} inputMode="numeric" />
          </label>
        </div>

        <button className="devis-print-btn" onClick={() => window.print()}>
          Imprimer / Enregistrer en PDF
        </button>
      </div>

      {/* ── Feuille A4 (seule partie imprimée) ── */}
      <div className="devis-sheet">
        <div className="devis-accent" />
        <header className="devis-head">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="devis-logo" src="/lerelaisweb_logo-removebg-preview.png" alt="Le Relais Web" />
          <div className="devis-titlebox">
            <div className="devis-title">Devis</div>
            <div className="devis-meta">
              <span>{numero || "DEV-2026-001"}</span>
              <span>{dateStr}</span>
            </div>
          </div>
        </header>

        <div className="devis-parties">
          <div className="devis-bloc">
            <span className="devis-bloc-h">Émetteur</span>
            <strong>Le Relais Web — Thierry Bailleul</strong>
            <span>Ermont, 95120 Val-d’Oise</span>
            <span>SIRET 101 586 428 00019</span>
            <span>contact@lerelaisweb.com</span>
          </div>
          <div className="devis-bloc">
            <span className="devis-bloc-h">Établi pour</span>
            <strong>{enseigne || "—"}</strong>
            {clientNom && <span>{clientNom}</span>}
            {ville && <span>{ville}</span>}
            {email && <span>{email}</span>}
          </div>
        </div>

        <table className="devis-table">
          <thead>
            <tr>
              <th>Désignation</th>
              <th className="devis-amt">Montant</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong>Création du site — {titre}</strong>
                <ul className="devis-feats">
                  {feats.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
                <span className="devis-once">Réglé une seule fois, à la commande</span>
              </td>
              <td className="devis-amt devis-amt-strong">{eur(setup)} €</td>
            </tr>
            <tr>
              <td>
                <strong>Abonnement mensuel</strong>
                <span className="devis-sub2">
                  Hébergement, nom de domaine, maintenance, sécurité & support. Sans engagement.
                </span>
              </td>
              <td className="devis-amt">{eur(mensuel)} €<span className="devis-permo">/mois</span></td>
            </tr>
          </tbody>
        </table>

        <div className="devis-total">
          <div className="devis-total-row">
            <span>À régler à la commande</span>
            <strong>{eur(setup)} €</strong>
          </div>
          <div className="devis-total-sub">
            puis {eur(mensuel)} €/mois — sans engagement, résiliable à tout moment
          </div>
        </div>

        <p className="devis-tva">TVA non applicable, art. 293 B du CGI.</p>

        <div className="devis-cond">
          <span className="devis-bloc-h">Conditions</span>
          <ul>
            <li>Livraison en 7 à 10 jours ouvrés à réception de vos éléments (textes, photos, logo).</li>
            <li>Satisfait ou remboursé 30 jours sur la mise en service (voir CGV).</li>
            <li>Sans engagement · Paiement sécurisé par carte via Stripe.</li>
            <li>Devis valable {validite} jours à compter de la date d’émission.</li>
          </ul>
        </div>

        <div className="devis-accept">
          <span className="devis-bloc-h">Pour accepter ce devis</span>
          <p>
            Réglez la mise en service via le lien de paiement sécurisé que nous vous transmettons,
            ou répondez simplement « bon pour accord » par email ou WhatsApp. Aucune signature
            manuscrite n’est nécessaire — le règlement vaut acceptation.
          </p>
        </div>

        <footer className="devis-foot">
          Le Relais Web — votre partenaire digital local · Ermont, Val-d’Oise · contact@lerelaisweb.com
        </footer>
      </div>
    </>
  );
}
