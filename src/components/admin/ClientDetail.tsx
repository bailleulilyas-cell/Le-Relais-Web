"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ClientDetail as ClientDetailData } from "@/lib/admin-data";
import { buildPayLink } from "@/lib/pay-link";
import {
  initClient,
  updateProjet,
  updateScores,
  saveEtapes,
  saveDocs,
  addIntervention,
  delIntervention,
  addFacture,
  delFacture,
  confirmPaiement,
  setPretMiseEnLigne,
  setFormuleDevis,
  updateDemande,
  deleteClient,
} from "@/app/admin/actions";

const TYPE_INTERV_LABEL: Record<string, string> = {
  security: "Sécurité",
  perf: "Performance",
  update: "Maintenance",
  content: "Contenu",
};
const TYPE_DEMANDE_LABEL: Record<string, string> = {
  modification: "Modification",
  prix: "Prix / horaires",
  photo: "Photo",
  bug: "Problème technique",
  autre: "Autre",
  systeme: "Notification système",
};
const PACK_SOUHAITE_LABEL: Record<string, string> = {
  presence: "Présence (550 € + 25 €/mois)",
  pro: "Pro (1 200 € + 40 €/mois)",
  indecis: "Indécis — à discuter avec le client",
};
const today = () => new Date().toISOString().slice(0, 10);

/** "Oui" / "Non" / "—" pour les champs booléens optionnels. */
function ouiNon(v: boolean | null | undefined): string {
  return v === true ? "Oui" : v === false ? "Non" : "—";
}
/** Ajoute https:// si l'URL saisie par le client n'a pas de protocole. */
function withHttp(url: string): string {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

function frDate(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso.length <= 10 ? iso + "T00:00:00" : iso);
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function ClientDetail({ detail }: { detail: ClientDetailData }) {
  const router = useRouter();
  const { utilisateur: u, projet } = detail;
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [, startTransition] = useTransition();

  function showToast(msg: string, ok = true) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 2800);
  }

  const nomComplet = `${u.prenom} ${u.nomFamille ?? ""}`.trim();
  const statutBadge = projet
    ? { txt: "Client actif", cls: "actif" }
    : u.paiementConfirme
      ? { txt: "Paiement reçu", cls: "paye" }
      : { txt: "Prospect", cls: "prospect" };

  return (
    <>
      {/* En-tête */}
      <div className="adm-client-head">
        <div>
          <h1 className="adm-h1">
            {nomComplet}
            {u.nomEnseigne && <span className="adm-client-ens">{u.nomEnseigne}</span>}
            <span className={`adm-client-badge ${statutBadge.cls}`}>{statutBadge.txt}</span>
          </h1>
          <div className="adm-client-meta">
            <span>Inscrit le {frDate(u.dateInscription)}</span>
            {u.secteurActivite && <span>{u.secteurActivite}</span>}
          </div>
        </div>
      </div>

      {/* Coordonnées & contexte — toujours visibles, séparés des demandes et du texte libre */}
      <div className="adm-grid2">
        <div className="adm-card">
          <div className="adm-card-h">
            <span className="adm-card-t">Coordonnées</span>
          </div>
          <div className="adm-field-static">
            <span className="adm-field-k">Email</span>
            <span className="adm-field-v">
              <a href={`mailto:${u.email}`}>{u.email}</a>
            </span>
          </div>
          <div className="adm-field-static">
            <span className="adm-field-k">Téléphone</span>
            <span className="adm-field-v">
              {u.telephone ? (
                <a href={`tel:${u.telephone.replace(/\s/g, "")}`}>{u.telephone}</a>
              ) : (
                <span className="adm-muted">non renseigné</span>
              )}
            </span>
          </div>
          <div className="adm-field-static">
            <span className="adm-field-k">Ville</span>
            <span className="adm-field-v">{u.ville || "—"}</span>
          </div>
        </div>

        <div className="adm-card">
          <div className="adm-card-h">
            <span className="adm-card-t">Contexte du projet</span>
          </div>
          <div className="adm-field-static">
            <span className="adm-field-k">Secteur</span>
            <span className="adm-field-v">{u.secteurActivite || "—"}</span>
          </div>
          <div className="adm-field-static">
            <span className="adm-field-k">Formule souhaitée</span>
            <span className="adm-field-v">
              {u.packSouhaite ? PACK_SOUHAITE_LABEL[u.packSouhaite] : "—"}
            </span>
          </div>
          <div className="adm-field-static">
            <span className="adm-field-k">Déjà un site</span>
            <span className="adm-field-v">
              {ouiNon(u.aDejaSite)}
              {u.aDejaSite && u.urlSiteActuel ? (
                <>
                  {" — "}
                  <a href={withHttp(u.urlSiteActuel)} target="_blank" rel="noopener noreferrer">
                    {u.urlSiteActuel}
                  </a>
                </>
              ) : null}
            </span>
          </div>
          <div className="adm-field-static">
            <span className="adm-field-k">Logo</span>
            <span className="adm-field-v">{ouiNon(u.aLogo)}</span>
          </div>
        </div>
      </div>

      {!projet ? (
        <ProspectView u={u} showToast={showToast} startTransition={startTransition} />
      ) : (
        <>
          <ProjetCard userId={u.id} projet={projet} avecBackoffice={u.avecBackofficeDevis ?? false} showToast={showToast} startTransition={startTransition} />
          <ScoresCard userId={u.id} projet={projet} showToast={showToast} startTransition={startTransition} />
          <EtapesCard userId={u.id} etapes={detail.etapes} showToast={showToast} startTransition={startTransition} />
          <DocsCard documents={detail.documents} showToast={showToast} startTransition={startTransition} />
          <InterventionsCard
            userId={u.id}
            interventions={detail.interventions}
            showToast={showToast}
            startTransition={startTransition}
          />
          <FacturesCard
            userId={u.id}
            factures={detail.factures}
            showToast={showToast}
            startTransition={startTransition}
          />
          <DemandesCard demandes={detail.demandes} showToast={showToast} startTransition={startTransition} />
        </>
      )}

      {/* Zone dangereuse */}
      <div className="adm-card adm-danger">
        <div className="adm-card-h">
          <span className="adm-card-t danger">Zone dangereuse</span>
        </div>
        <p className="adm-danger-text">
          Supprimer définitivement ce client et toutes ses données (projet, étapes, documents,
          factures, interventions, demandes). Cette action est <strong>irréversible</strong>.
        </p>
        <button
          className="adm-btn-danger"
          onClick={() => {
            if (!confirm(`Supprimer définitivement ${nomComplet} et toutes ses données ?`)) return;
            if (!confirm(`Dernière confirmation : supprimer ${nomComplet} ?`)) return;
            startTransition(async () => {
              const r = await deleteClient(u.id);
              if (r.ok) {
                showToast("Client supprimé.");
                router.push("/admin");
              } else showToast(r.error || "Erreur.", false);
            });
          }}
        >
          Supprimer ce client
        </button>
      </div>

      {toast && <div className={`adm-toast show ${toast.ok ? "ok" : "err"}`}>{toast.msg}</div>}
    </>
  );
}

type ToastFn = (msg: string, ok?: boolean) => void;
type StartT = (cb: () => void) => void;

/* ── Vue prospect (pas de projet) ── */
function ProspectView({
  u,
  showToast,
  startTransition,
}: {
  u: ClientDetailData["utilisateur"];
  showToast: ToastFn;
  startTransition: StartT;
}) {
  const [showInit, setShowInit] = useState(false);
  const [url, setUrl] = useState("");
  const [debut, setDebut] = useState(today());
  const [pack, setPack] = useState<"presence" | "pro">(u.packSouhaite === "pro" ? "pro" : "presence");

  return (
    <>
      <FormuleCard u={u} showToast={showToast} startTransition={startTransition} />

      <div className="adm-grid2">
        <div className="adm-card">
          <div className="adm-card-h">
            <span className="adm-card-t">Projet décrit à l’inscription</span>
          </div>
          {u.descriptionProjet ? (
            <div className="adm-desc-box">{u.descriptionProjet}</div>
          ) : (
            <p className="adm-empty-mini">Aucune description renseignée.</p>
          )}
        </div>

        <div className="adm-card">
          <div className="adm-card-h">
            <span className="adm-card-t">Confirmation du paiement</span>
          </div>
          {!u.paiementConfirme ? (
            <>
              <p className="adm-muted">
                Ce client n’a pas encore payé. Confirme quand Stripe valide le paiement de mise en
                service et l’abonnement
                {u.packSouhaite ? <> ({PACK_SOUHAITE_LABEL[u.packSouhaite]})</> : null}.
              </p>
              <button
                className="adm-btn-dark full"
                onClick={() =>
                  startTransition(async () => {
                    const r = await confirmPaiement(u.id, true);
                    r.ok ? showToast("Paiement confirmé.") : showToast(r.error || "Erreur.", false);
                  })
                }
              >
                Marquer comme payé
              </button>
            </>
          ) : (
            <>
              <div className="adm-paid-ok">
                <strong>Paiement confirmé</strong>
                <span>Mise en service + abonnement</span>
              </div>
              <button
                className="adm-btn-ghost full"
                onClick={() =>
                  startTransition(async () => {
                    const r = await confirmPaiement(u.id, false);
                    r.ok ? showToast("Confirmation annulée.") : showToast(r.error || "Erreur.", false);
                  })
                }
              >
                Annuler la confirmation
              </button>
            </>
          )}
        </div>
      </div>

      <div className="adm-card">
        <div className="adm-card-h">
          <span className="adm-card-t">Initialiser le projet</span>
          {!showInit && (
            <button className="adm-btn-dark" onClick={() => setShowInit(true)}>
              + Initialiser ce client
            </button>
          )}
        </div>
        {!showInit ? (
          <p className="adm-empty-mini">
            Ce client n’a pas encore de projet. Clique sur « Initialiser » pour créer le projet, les
            étapes et la liste de documents par défaut.
          </p>
        ) : (
          <div className="adm-init-form">
            <div className="adm-field">
              <label>Formule facturée</label>
              <select value={pack} onChange={(e) => setPack(e.target.value as "presence" | "pro")}>
                <option value="presence">Présence — 550 € + 25 €/mois</option>
                <option value="pro">Pro — 1 200 € + 40 €/mois</option>
              </select>
              {u.packSouhaite && (
                <p className="adm-hint" style={{ marginTop: ".4rem" }}>
                  Le client a indiqué vouloir : {PACK_SOUHAITE_LABEL[u.packSouhaite]}
                </p>
              )}
            </div>
            <div className="adm-field">
              <label>URL du site</label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://exemple.com"
              />
            </div>
            <div className="adm-field">
              <label>Date de début d’abonnement</label>
              <input type="date" value={debut} onChange={(e) => setDebut(e.target.value)} />
            </div>
            <button
              className="adm-btn-dark"
              onClick={() =>
                startTransition(async () => {
                  const r = await initClient(u.id, url, debut, pack);
                  r.ok ? showToast("Client initialisé !") : showToast(r.error || "Erreur.", false);
                })
              }
            >
              Créer le projet →
            </button>
          </div>
        )}
      </div>
    </>
  );
}

/* ── Lien de paiement personnalisé à copier (avec client_reference_id) ──
 * Le lien contient l'ID interne du client : peu importe l'email saisi au
 * paiement, Stripe attribue le paiement au bon compte. Idéal pour l'envoyer
 * par WhatsApp ou email sans risque d'erreur d'attribution. */
function CopyPayLink({
  label,
  url,
  showToast,
}: {
  label: string;
  url: string;
  showToast: ToastFn;
}) {
  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      showToast("Lien copié — prêt à coller dans WhatsApp.");
    } catch {
      showToast("Copie impossible — sélectionne le lien à la main.", false);
    }
  }
  return (
    <div className="adm-field" style={{ marginBottom: "1rem" }}>
      <label>{label}</label>
      <div style={{ display: "flex", gap: ".5rem", alignItems: "stretch" }}>
        <input type="text" value={url} readOnly className="adm-readonly" style={{ flex: 1 }} onFocus={(e) => e.target.select()} />
        <button type="button" className="adm-btn-dark sm" onClick={copy} style={{ flexShrink: 0 }}>
          Copier
        </button>
      </div>
      <p className="adm-hint" style={{ marginTop: ".3rem" }}>
        Rattaché à ce client (paiement attribué au bon compte même si l’email saisi diffère).
      </p>
    </div>
  );
}

/* ── Formule & paiement assignés au client ──
 * Tant qu'aucune formule n'est définie, le client ne voit aucun lien de paiement.
 * presence/pro : montants + liens Stripe standards (auto). custom : sur-mesure. */
function FormuleCard({
  u,
  showToast,
  startTransition,
}: {
  u: ClientDetailData["utilisateur"];
  showToast: ToastFn;
  startTransition: StartT;
}) {
  const [formule, setFormule] = useState<"presence" | "pro" | "custom">(u.formuleDevis ?? "presence");
  const [setup, setSetup] = useState(u.montantSetupDevis ?? "");
  const [mensuel, setMensuel] = useState(u.montantMensuelDevis ?? "");
  const [lienSetup, setLienSetup] = useState(u.lienPaiementSetup ?? "");
  const [lienAbo, setLienAbo] = useState(u.lienPaiementAbonnement ?? "");
  // Présence = jamais de back-office. Pro = toujours. Custom = choix.
  const defaultBackoffice = formule === "pro" ? true : formule === "presence" ? false : (u.avecBackofficeDevis ?? false);
  const [avecBackoffice, setAvecBackoffice] = useState(defaultBackoffice);
  const isCustom = formule === "custom";

  // Quand la formule change, recalculer la valeur par défaut du back-office.
  function handleFormuleChange(val: "presence" | "pro" | "custom") {
    setFormule(val);
    if (val === "pro") setAvecBackoffice(true);
    else if (val === "presence") setAvecBackoffice(false);
    // Pour custom : on laisse la valeur actuelle (ou celle sauvegardée).
  }

  return (
    <div className="adm-card">
      <div className="adm-card-h">
        <span className="adm-card-t">Formule &amp; paiement du client</span>
        <button
          className="adm-btn-dark sm"
          onClick={() =>
            startTransition(async () => {
              const r = await setFormuleDevis(u.id, formule, setup || "0", mensuel || "0", lienSetup, lienAbo, avecBackoffice);
              r.ok ? showToast("Formule enregistrée.") : showToast(r.error || "Erreur.", false);
            })
          }
        >
          Enregistrer
        </button>
      </div>
      <p className={u.formuleDevis ? "adm-paid-ok" : "adm-muted"} style={{ marginBottom: "1rem" }}>
        {u.formuleDevis ? (
          <>
            <strong>✓ Formule définie</strong>
            <span>Le client voit son lien de paiement de mise en service dans son espace.</span>
          </>
        ) : (
          "Tant qu’aucune formule n’est enregistrée, le client NE voit PAS de lien de paiement (seulement « Finalisons votre formule »)."
        )}
      </p>

      {u.formuleDevis && u.lienPaiementSetup && (
        <CopyPayLink
          label="Lien de mise en service à envoyer (WhatsApp, email…)"
          url={buildPayLink(u.lienPaiementSetup, u.email, u.id)}
          showToast={showToast}
        />
      )}

      <div className="adm-field">
        <label>Formule facturée</label>
        <select value={formule} onChange={(e) => handleFormuleChange(e.target.value as typeof formule)}>
          <option value="presence">Présence — 550 € + 25 €/mois</option>
          <option value="pro">Pro — 1 200 € + 40 €/mois</option>
          <option value="custom">Personnalisé (prix sur-mesure)</option>
        </select>
      </div>

      {/* Case back-office : lecture seule pour presence/pro, éditable pour custom */}
      <div className="adm-field" style={{ flexDirection: "row", alignItems: "center", gap: ".6rem", marginTop: ".6rem" }}>
        <input
          type="checkbox"
          id="avec-backoffice"
          checked={avecBackoffice}
          disabled={!isCustom}
          onChange={(e) => setAvecBackoffice(e.target.checked)}
          style={{ width: "18px", height: "18px", cursor: isCustom ? "pointer" : "default", flexShrink: 0 }}
        />
        <label htmlFor="avec-backoffice" style={{ cursor: isCustom ? "pointer" : "default", margin: 0, fontWeight: 500 }}>
          Ce client aura un espace admin (back-office)
          {!isCustom && <span className="adm-muted" style={{ fontWeight: 400, marginLeft: ".4rem" }}>
            {formule === "pro" ? "— inclus dans le Pack Pro" : "— non inclus dans le Pack Présence"}
          </span>}
        </label>
      </div>

      {isCustom ? (
        <>
          <div className="adm-grid2" style={{ marginTop: ".8rem" }}>
            <div className="adm-field">
              <label>Mise en service (€)</label>
              <input type="number" step="0.01" value={setup} onChange={(e) => setSetup(e.target.value)} placeholder="350.00" />
            </div>
            <div className="adm-field">
              <label>Abonnement (€/mois)</label>
              <input type="number" step="0.01" value={mensuel} onChange={(e) => setMensuel(e.target.value)} placeholder="20.00" />
            </div>
          </div>
          <div className="adm-field">
            <label>Lien Stripe — mise en service (paiement unique)</label>
            <input type="text" value={lienSetup} onChange={(e) => setLienSetup(e.target.value)} placeholder="https://buy.stripe.com/..." />
          </div>
          <div className="adm-field">
            <label>Lien Stripe — abonnement mensuel</label>
            <input type="text" value={lienAbo} onChange={(e) => setLienAbo(e.target.value)} placeholder="https://buy.stripe.com/..." />
          </div>
          <p className="adm-hint" style={{ marginTop: ".3rem" }}>
            ⚠️ Le montant réellement débité est celui configuré dans le lien Stripe — vérifie qu’il
            correspond aux montants ci-dessus. Crée tes liens dans Stripe → <strong>Liens de
            paiement</strong> : un lien « paiement unique » pour la mise en service, un lien
            « abonnement » mensuel pour l’abonnement.
          </p>
        </>
      ) : (
        <p className="adm-hint" style={{ marginTop: ".5rem" }}>
          Montants et liens Stripe standards appliqués automatiquement. Choisis « Personnalisé »
          pour un tarif sur-mesure (client moins cher).
        </p>
      )}
    </div>
  );
}

/* ── Projet ── */
function ProjetCard({
  userId,
  projet,
  avecBackoffice,
  showToast,
  startTransition,
}: {
  userId: number;
  projet: NonNullable<ClientDetailData["projet"]>;
  avecBackoffice: boolean;
  showToast: ToastFn;
  startTransition: StartT;
}) {
  const [statut, setStatut] = useState(projet.statut ?? "en_cours");
  const [url, setUrl] = useState(projet.urlSite ?? "");
  const [debut] = useState(projet.abonnementDebut ?? "");
  const [stripe, setStripe] = useState(projet.stripeSubscriptionId ?? "");
  const [urlAdmin, setUrlAdmin] = useState(projet.urlAdminClient ?? "");
  const [pret, setPret] = useState(projet.pretMiseEnLigne);
  // Le client a un espace admin si Pack Pro (≥ 40 €/mois) OU si l'admin a coché
  // « avec back-office » sur une formule personnalisée (prix sur-mesure < 40 €).
  const aBackoffice = Number(projet.montantMensuel) >= 40 || avecBackoffice;

  return (
    <div className="adm-card">
      <div className="adm-card-h">
        <span className="adm-card-t">
          Projet — statut & abonnement
          <span className="adm-pack-badge" style={{ marginLeft: ".6rem" }}>
            {Number(projet.montantMensuel) >= 40 ? "Pack Pro" : "Pack Présence"} — {projet.montantSetup} € + {projet.montantMensuel} €/mois
          </span>
        </span>
        <button
          className="adm-btn-dark sm"
          onClick={() =>
            startTransition(async () => {
              const r = await updateProjet(userId, statut, projet.progression ?? 0, url, stripe, urlAdmin);
              r.ok ? showToast("Projet mis à jour.") : showToast(r.error || "Erreur.", false);
            })
          }
        >
          Enregistrer
        </button>
      </div>
      <div className="adm-grid2">
        <div>
          <div className="adm-field">
            <label>URL du site</label>
            <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} />
          </div>
          <div className="adm-field">
            <label>Début d’abonnement</label>
            <input type="text" value={debut ? frDate(debut) : "—"} readOnly className="adm-readonly" />
          </div>
          <div className="adm-field">
            <label>Stripe Subscription ID</label>
            <input
              type="text"
              value={stripe}
              onChange={(e) => setStripe(e.target.value)}
              placeholder="sub_xxxxxxxx"
            />
          </div>
          {aBackoffice && (
            <div className="adm-field">
              <label>Lien de l’espace d’administration du client (back-office)</label>
              <input
                type="text"
                value={urlAdmin}
                onChange={(e) => setUrlAdmin(e.target.value)}
                placeholder="https://exemple.com/admin"
              />
              <p className="adm-hint" style={{ marginTop: ".3rem" }}>
                Apparaît comme bouton « Gérer mon site » dans son espace client.
              </p>
            </div>
          )}
        </div>
        <div>
          <div className="adm-field">
            <label>Statut visible par le client</label>
            <select value={statut} onChange={(e) => setStatut(e.target.value as typeof statut)}>
              <option value="en_cours">🔧 En cours de création</option>
              <option value="en_ligne">🟢 En ligne</option>
              <option value="suspendu">⏸ Suspendu</option>
            </select>
          </div>
          <div className="adm-field">
            <label>
              Progression globale : {projet.progression ?? 0}%{" "}
              <span className="adm-hint">— calculée depuis les étapes</span>
            </label>
            <div className="adm-prog-readonly">
              <div className="adm-prog-readonly-fill" style={{ width: `${projet.progression ?? 0}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Mise en ligne : débloque le bouton « abonnement » côté client */}
      <div className="adm-mel" style={{ marginTop: "1.2rem", paddingTop: "1.2rem", borderTop: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
        <div className="adm-mel-info">
          <strong style={{ display: "block", color: "var(--ink)" }}>
            Site prêt pour la mise en ligne&nbsp;?
          </strong>
          <span className="adm-hint">
            {pret
              ? "✓ Le client voit le bouton « activer mon abonnement » dans son espace."
              : "Tant que ce n'est pas activé, le client NE voit PAS le bouton d'abonnement."}
          </span>
        </div>
        <button
          className={pret ? "adm-btn-ghost" : "adm-btn-dark"}
          onClick={() =>
            startTransition(async () => {
              const r = await setPretMiseEnLigne(userId, !pret);
              if (r.ok) {
                setPret(!pret);
                showToast(!pret ? "Abonnement débloqué pour le client." : "Bouton d'abonnement masqué.");
              } else showToast(r.error || "Erreur.", false);
            })
          }
        >
          {pret ? "Annuler la mise en ligne" : "✓ Marquer comme terminé (autoriser l'abonnement)"}
        </button>
      </div>
    </div>
  );
}

/* ── Scores PageSpeed ── */
function ScoresCard({
  userId,
  projet,
  showToast,
  startTransition,
}: {
  userId: number;
  projet: NonNullable<ClientDetailData["projet"]>;
  showToast: ToastFn;
  startTransition: StartT;
}) {
  const [perf, setPerf] = useState(projet.scorePerformance ?? "");
  const [acc, setAcc] = useState(projet.scoreAccessibility ?? "");
  const [bp, setBp] = useState(projet.scoreBestPractices ?? "");
  const [seo, setSeo] = useState(projet.scoreSeo ?? "");
  const [date, setDate] = useState(projet.scoreDate ?? today());

  const num = (v: string | number) => (v === "" ? 0 : Number(v));

  return (
    <div className="adm-card">
      <div className="adm-card-h">
        <span className="adm-card-t">Scores PageSpeed</span>
        <button
          className="adm-btn-dark sm"
          onClick={() =>
            startTransition(async () => {
              const r = await updateScores(userId, num(perf), num(acc), num(bp), num(seo), date);
              r.ok ? showToast("Scores mis à jour.") : showToast(r.error || "Erreur.", false);
            })
          }
        >
          Enregistrer
        </button>
      </div>
      <p className="adm-muted">
        Analyse le site sur{" "}
        <a href="https://pagespeed.web.dev" target="_blank" rel="noopener noreferrer">
          pagespeed.web.dev
        </a>{" "}
        et reporte les scores.
      </p>
      <div className="adm-grid4">
        <div className="adm-field">
          <label>Performance</label>
          <input type="number" min={0} max={100} value={perf} onChange={(e) => setPerf(e.target.value)} />
        </div>
        <div className="adm-field">
          <label>Accessibilité</label>
          <input type="number" min={0} max={100} value={acc} onChange={(e) => setAcc(e.target.value)} />
        </div>
        <div className="adm-field">
          <label>Bonnes pratiques</label>
          <input type="number" min={0} max={100} value={bp} onChange={(e) => setBp(e.target.value)} />
        </div>
        <div className="adm-field">
          <label>SEO</label>
          <input type="number" min={0} max={100} value={seo} onChange={(e) => setSeo(e.target.value)} />
        </div>
      </div>
      <div className="adm-field adm-field-date">
        <label>Date de l’analyse</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>
    </div>
  );
}

/* ── Étapes ── */
function EtapesCard({
  userId,
  etapes,
  showToast,
  startTransition,
}: {
  userId: number;
  etapes: ClientDetailData["etapes"];
  showToast: ToastFn;
  startTransition: StartT;
}) {
  const [rows, setRows] = useState(
    etapes.map((e) => ({ id: e.id, nom: e.nom, progression: e.progression ?? 0, statutTexte: e.statutTexte ?? "" }))
  );

  function update(id: number, patch: Partial<{ progression: number; statutTexte: string }>) {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  return (
    <div className="adm-card">
      <div className="adm-card-h">
        <span className="adm-card-t">Étapes du projet</span>
        <button
          className="adm-btn-dark sm"
          onClick={() =>
            startTransition(async () => {
              const r = await saveEtapes(
                userId,
                rows.map((r) => ({ id: r.id, progression: r.progression, statutTexte: r.statutTexte }))
              );
              r.ok
                ? showToast(`Étapes enregistrées · progression ${r.progression}%`)
                : showToast(r.error || "Erreur.", false);
            })
          }
        >
          Enregistrer tout
        </button>
      </div>
      {rows.length === 0 ? (
        <p className="adm-empty-mini">Aucune étape.</p>
      ) : (
        rows.map((r) => (
          <div className="adm-etape" key={r.id}>
            <div className="adm-etape-name">{r.nom}</div>
            <div className="adm-etape-ctrl">
              <div className="adm-etape-slider">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={r.progression}
                  onChange={(e) => update(r.id, { progression: Number(e.target.value) })}
                />
                <span className="adm-etape-val">{r.progression}%</span>
              </div>
              <input
                type="text"
                className="adm-etape-txt"
                value={r.statutTexte}
                onChange={(e) => update(r.id, { statutTexte: e.target.value })}
                placeholder="Texte affiché au client"
              />
            </div>
          </div>
        ))
      )}
    </div>
  );
}

/* ── Documents ── */
function DocsCard({
  documents,
  showToast,
  startTransition,
}: {
  documents: ClientDetailData["documents"];
  showToast: ToastFn;
  startTransition: StartT;
}) {
  const [rows, setRows] = useState(
    documents.map((d) => ({ id: d.id, nom: d.nom, icone: d.icone ?? "?", statut: d.statut ?? "missing" }))
  );

  return (
    <div className="adm-card">
      <div className="adm-card-h">
        <span className="adm-card-t">Documents requis</span>
        <button
          className="adm-btn-dark sm"
          onClick={() =>
            startTransition(async () => {
              const r = await saveDocs(rows.map((r) => ({ id: r.id, statut: r.statut })));
              r.ok ? showToast("Documents mis à jour.") : showToast(r.error || "Erreur.", false);
            })
          }
        >
          Enregistrer tout
        </button>
      </div>
      {rows.length === 0 ? (
        <p className="adm-empty-mini">Aucun document.</p>
      ) : (
        rows.map((d) => (
          <div className="adm-doc" key={d.id}>
            <span className="adm-doc-ic">{d.icone}</span>
            <span className="adm-doc-nm">{d.nom}</span>
            <select
              className="adm-doc-sel"
              value={d.statut}
              onChange={(e) =>
                setRows((rs) =>
                  rs.map((r) => (r.id === d.id ? { ...r, statut: e.target.value as typeof r.statut } : r))
                )
              }
            >
              <option value="missing">❌ En attente</option>
              <option value="pending">⏳ Optionnel</option>
              <option value="ok">✅ Reçu</option>
            </select>
          </div>
        ))
      )}
    </div>
  );
}

/* ── Interventions ── */
function InterventionsCard({
  userId,
  interventions,
  showToast,
  startTransition,
}: {
  userId: number;
  interventions: ClientDetailData["interventions"];
  showToast: ToastFn;
  startTransition: StartT;
}) {
  const [titre, setTitre] = useState("");
  const [desc, setDesc] = useState("");
  const [type, setType] = useState("security");
  const [date, setDate] = useState(today());

  return (
    <div className="adm-card">
      <div className="adm-card-h">
        <span className="adm-card-t">Interventions & maintenance</span>
      </div>
      <div className="adm-subform">
        <div className="adm-subform-t">+ Nouvelle intervention</div>
        <div className="adm-grid2">
          <div className="adm-field">
            <label>Titre</label>
            <input type="text" value={titre} onChange={(e) => setTitre(e.target.value)} placeholder="Ex : Mise à jour de sécurité" />
          </div>
          <div className="adm-field">
            <label>Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        </div>
        <div className="adm-grid2">
          <div className="adm-field">
            <label>Type</label>
            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="security">🔒 Sécurité</option>
              <option value="perf">⚡ Performance</option>
              <option value="update">🔄 Maintenance</option>
              <option value="content">✏️ Contenu</option>
            </select>
          </div>
          <div className="adm-field">
            <label>Description courte</label>
            <input type="text" value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Ex : 3 dépendances mises à jour" />
          </div>
        </div>
        <button
          className="adm-btn-dark sm"
          onClick={() => {
            if (!titre.trim()) return showToast("Titre requis.", false);
            startTransition(async () => {
              const r = await addIntervention(userId, titre, desc, type, date);
              if (r.ok) {
                showToast("Intervention ajoutée.");
                setTitre("");
                setDesc("");
              } else showToast(r.error || "Erreur.", false);
            });
          }}
        >
          Ajouter →
        </button>
      </div>

      {interventions.length === 0 ? (
        <p className="adm-empty-mini">Aucune intervention enregistrée.</p>
      ) : (
        interventions.map((iv) => (
          <div className="adm-iv" key={iv.id}>
            <span className="adm-iv-date">{frDate(iv.dateIntervention)}</span>
            <div className="adm-iv-body">
              <div className="adm-iv-t">{iv.titre}</div>
              {iv.description && <div className="adm-iv-d">{iv.description}</div>}
              <span className={`adm-tag ${iv.type}`}>{TYPE_INTERV_LABEL[iv.type ?? "update"]}</span>
            </div>
            <button
              className="adm-btn-x"
              onClick={() => {
                if (!confirm("Supprimer cette intervention ?")) return;
                startTransition(async () => {
                  const r = await delIntervention(iv.id);
                  r.ok ? showToast("Supprimée.") : showToast(r.error || "Erreur.", false);
                });
              }}
            >
              ✕
            </button>
          </div>
        ))
      )}
    </div>
  );
}

/* ── Factures ── */
function FacturesCard({
  userId,
  factures,
  showToast,
  startTransition,
}: {
  userId: number;
  factures: ClientDetailData["factures"];
  showToast: ToastFn;
  startTransition: StartT;
}) {
  const [num, setNum] = useState("");
  const [desc, setDesc] = useState("");
  const [montant, setMontant] = useState("");
  const [date, setDate] = useState(today());
  const [statut, setStatut] = useState("paid");
  const [showForm, setShowForm] = useState(false);
  const [pdf, setPdf] = useState<string | null>(null);
  const [pdfName, setPdfName] = useState("");

  function onPdfPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      setPdf(null);
      setPdfName("");
      return;
    }
    if (file.type !== "application/pdf") {
      showToast("Le fichier doit être un PDF.", false);
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setPdf(String(reader.result).split(",").pop() ?? null);
      setPdfName(file.name);
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="adm-card">
      <div className="adm-card-h">
        <span className="adm-card-t">Factures</span>
        <button className="adm-btn-ghost" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Fermer" : "+ Ajouter manuellement"}
        </button>
      </div>
      <p className="adm-muted" style={{ marginBottom: showForm ? "1rem" : ".4rem" }}>
        Les factures se créent automatiquement à chaque paiement Stripe. L’ajout manuel ne sert
        qu’aux cas particuliers (paiement en espèces/virement, régularisation).
      </p>
      {showForm && (
      <div className="adm-subform">
        <div className="adm-subform-t">+ Nouvelle facture</div>
        <div className="adm-grid2">
          <div className="adm-field">
            <label>Numéro</label>
            <input type="text" value={num} onChange={(e) => setNum(e.target.value)} placeholder="LRW-2026-004" />
          </div>
          <div className="adm-field">
            <label>Montant (€)</label>
            <input type="number" step="0.01" value={montant} onChange={(e) => setMontant(e.target.value)} placeholder="25.00" />
          </div>
        </div>
        <div className="adm-field">
          <label>Description</label>
          <input type="text" value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Abonnement juin 2026" />
        </div>
        <div className="adm-grid2">
          <div className="adm-field">
            <label>Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="adm-field">
            <label>Statut</label>
            <select value={statut} onChange={(e) => setStatut(e.target.value)}>
              <option value="paid">✅ Payé</option>
              <option value="pending">⏳ En attente</option>
            </select>
          </div>
        </div>
        <div className="adm-field">
          <label>PDF de la facture (optionnel)</label>
          <input type="file" accept="application/pdf" onChange={onPdfPick} />
          <p className="adm-hint" style={{ marginTop: ".3rem" }}>
            {pdfName
              ? `📎 ${pdfName} — remplacera le PDF généré automatiquement.`
              : "Si vide, un PDF est généré automatiquement."}
          </p>
        </div>
        <button
          className="adm-btn-dark sm"
          onClick={() => {
            if (!num.trim() || !desc.trim() || !montant) return showToast("Champs requis.", false);
            startTransition(async () => {
              const r = await addFacture(userId, num, desc, Number(montant), date, statut, pdf ?? undefined);
              if (r.ok) {
                showToast("Facture ajoutée.");
                setNum("");
                setDesc("");
                setMontant("");
                setPdf(null);
                setPdfName("");
              } else showToast(r.error || "Erreur.", false);
            });
          }}
        >
          Ajouter →
        </button>
      </div>
      )}

      {factures.length === 0 ? (
        <p className="adm-empty-mini">Aucune facture enregistrée.</p>
      ) : (
        factures.map((f) => (
          <div className="adm-iv" key={f.id}>
            <span className="adm-iv-date mono">{f.numero}</span>
            <div className="adm-iv-body">
              <div className="adm-iv-t">{f.description}</div>
              <div className="adm-iv-d">
                {frDate(f.dateFacture)} · <strong>{Number(f.montant).toFixed(2)} €</strong>
              </div>
              <span className={`adm-tag ${f.statut === "paid" ? "perf" : "update"}`}>
                {f.statut === "paid" ? "Payé" : "En attente"}
              </span>{" "}
              <a
                className="adm-pdf-link"
                href={`/api/facture/${f.id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                PDF ↓
              </a>
            </div>
            <button
              className="adm-btn-x"
              onClick={() => {
                if (!confirm("Supprimer cette facture ?")) return;
                startTransition(async () => {
                  const r = await delFacture(f.id);
                  r.ok ? showToast("Supprimée.") : showToast(r.error || "Erreur.", false);
                });
              }}
            >
              ✕
            </button>
          </div>
        ))
      )}
    </div>
  );
}

/* ── Demandes support + notifications système (séparées) ── */
function DemandesCard({
  demandes,
  showToast,
  startTransition,
}: {
  demandes: ClientDetailData["demandes"];
  showToast: ToastFn;
  startTransition: StartT;
}) {
  const vraiesDemandes = demandes.filter((d) => d.typeDemande !== "systeme");
  const notifsSysteme = demandes.filter((d) => d.typeDemande === "systeme");

  const statusSelect = (d: ClientDetailData["demandes"][number]) => (
    <select
      className={`adm-dem-select ${d.statut}`}
      defaultValue={d.statut}
      onChange={(e) =>
        startTransition(async () => {
          const r = await updateDemande(d.id, e.target.value);
          r.ok ? showToast("Statut mis à jour.") : showToast(r.error || "Erreur.", false);
        })
      }
    >
      <option value="new">🔴 Nouveau</option>
      <option value="in_progress">🟡 En cours</option>
      <option value="done">🟢 Traité</option>
    </select>
  );

  return (
    <>
      <div className="adm-card">
        <div className="adm-card-h">
          <span className="adm-card-t">Demandes support du client</span>
        </div>
        {vraiesDemandes.length === 0 ? (
          <p className="adm-empty-mini">Aucune demande pour ce client.</p>
        ) : (
          vraiesDemandes.map((d) => (
            <div className="adm-cdem" key={d.id}>
              <div className="adm-cdem-meta">
                {TYPE_DEMANDE_LABEL[d.typeDemande] ?? d.typeDemande} ·{" "}
                {new Date(d.createdAt).toLocaleDateString("fr-FR")}
              </div>
              <div className="adm-cdem-desc">{d.description}</div>
              {statusSelect(d)}
            </div>
          ))
        )}
      </div>

      {notifsSysteme.length > 0 && (
        <div className="adm-card adm-card-systeme">
          <div className="adm-card-h">
            <span className="adm-card-t">Activité automatique (Stripe)</span>
          </div>
          <p className="adm-muted" style={{ marginBottom: "1rem" }}>
            Notifications générées automatiquement (paiements, échecs, résiliations) — invisibles
            pour le client.
          </p>
          {notifsSysteme.map((d) => (
            <div className="adm-cdem" key={d.id}>
              <div className="adm-cdem-meta">
                {new Date(d.createdAt).toLocaleDateString("fr-FR")}
              </div>
              <div className="adm-cdem-desc">{d.description}</div>
              {statusSelect(d)}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
