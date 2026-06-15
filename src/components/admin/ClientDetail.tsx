"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ClientDetail as ClientDetailData } from "@/lib/admin-data";
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
};
const today = () => new Date().toISOString().slice(0, 10);

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
            <span>{u.email}</span>
            <span>Inscrit le {frDate(u.dateInscription)}</span>
            {u.secteurActivite && <span>{u.secteurActivite}</span>}
          </div>
        </div>
      </div>

      {!projet ? (
        <ProspectView u={u} showToast={showToast} startTransition={startTransition} />
      ) : (
        <>
          <ProjetCard userId={u.id} projet={projet} showToast={showToast} startTransition={startTransition} />
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

  return (
    <>
      <div className="adm-grid2">
        <div className="adm-card">
          <div className="adm-card-h">
            <span className="adm-card-t">Description à l’inscription</span>
          </div>
          {u.secteurActivite && (
            <div className="adm-field-static">
              <span className="adm-field-k">Secteur</span>
              <span className="adm-field-v">{u.secteurActivite}</span>
            </div>
          )}
          {u.descriptionProjet ? (
            <div className="adm-field-static">
              <span className="adm-field-k">Projet décrit</span>
              <div className="adm-desc-box">{u.descriptionProjet}</div>
            </div>
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
                Ce client n’a pas encore payé. Confirme quand Stripe valide les <strong>400 €</strong>{" "}
                de mise en service + l’abonnement <strong>25 €/mois</strong>.
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
              <PaymentLinkGenerator userId={u.id} showToast={showToast} />
            </>
          ) : (
            <>
              <div className="adm-paid-ok">
                <strong>Paiement confirmé</strong>
                <span>400 € + 25 €/mois</span>
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
                  const r = await initClient(u.id, url, debut);
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

/* ── Génération de lien de paiement Stripe (admin) ── */
function PaymentLinkGenerator({ userId, showToast }: { userId: number; showToast: ToastFn }) {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [url, setUrl] = useState("");
  const [errMsg, setErrMsg] = useState("");

  async function generate() {
    setState("loading");
    try {
      const r = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ userId }),
      });
      const d = await r.json();
      if (d.ok && d.url) {
        setUrl(d.url);
        setState("done");
        showToast("Lien Stripe généré.");
      } else {
        setErrMsg(d.error || "Erreur Stripe.");
        setState("error");
      }
    } catch {
      setErrMsg("Erreur réseau.");
      setState("error");
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      showToast("Lien copié.");
    } catch {
      showToast("Copie impossible, sélectionnez manuellement.", false);
    }
  }

  return (
    <div className="adm-paylink">
      <div className="adm-paylink-label">Lien de paiement à envoyer</div>
      {state === "done" ? (
        <div className="adm-paylink-row">
          <input type="text" readOnly value={url} onFocus={(e) => e.target.select()} />
          <button className="adm-btn-dark sm" onClick={copy}>
            Copier
          </button>
        </div>
      ) : (
        <button className="adm-btn-ghost full" onClick={generate} disabled={state === "loading"}>
          {state === "loading" ? "Génération…" : "Générer le lien de paiement →"}
        </button>
      )}
      {state === "error" && <p className="adm-paylink-err">{errMsg}</p>}
    </div>
  );
}

/* ── Projet ── */
function ProjetCard({
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
  const [statut, setStatut] = useState(projet.statut ?? "en_cours");
  const [url, setUrl] = useState(projet.urlSite ?? "");
  const [debut] = useState(projet.abonnementDebut ?? "");
  const [stripe, setStripe] = useState(projet.stripeSubscriptionId ?? "");

  return (
    <div className="adm-card">
      <div className="adm-card-h">
        <span className="adm-card-t">Projet — statut & abonnement</span>
        <button
          className="adm-btn-dark sm"
          onClick={() =>
            startTransition(async () => {
              const r = await updateProjet(userId, statut, projet.progression ?? 0, url, stripe);
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

  return (
    <div className="adm-card">
      <div className="adm-card-h">
        <span className="adm-card-t">Factures</span>
      </div>
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
        <button
          className="adm-btn-dark sm"
          onClick={() => {
            if (!num.trim() || !desc.trim() || !montant) return showToast("Champs requis.", false);
            startTransition(async () => {
              const r = await addFacture(userId, num, desc, Number(montant), date, statut);
              if (r.ok) {
                showToast("Facture ajoutée.");
                setNum("");
                setDesc("");
                setMontant("");
              } else showToast(r.error || "Erreur.", false);
            });
          }}
        >
          Ajouter →
        </button>
      </div>

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

/* ── Demandes support ── */
function DemandesCard({
  demandes,
  showToast,
  startTransition,
}: {
  demandes: ClientDetailData["demandes"];
  showToast: ToastFn;
  startTransition: StartT;
}) {
  return (
    <div className="adm-card">
      <div className="adm-card-h">
        <span className="adm-card-t">Demandes support du client</span>
      </div>
      {demandes.length === 0 ? (
        <p className="adm-empty-mini">Aucune demande pour ce client.</p>
      ) : (
        demandes.map((d) => (
          <div className="adm-cdem" key={d.id}>
            <div className="adm-cdem-meta">
              {TYPE_DEMANDE_LABEL[d.typeDemande] ?? d.typeDemande} ·{" "}
              {new Date(d.createdAt).toLocaleDateString("fr-FR")}
            </div>
            <div className="adm-cdem-desc">{d.description}</div>
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
          </div>
        ))
      )}
    </div>
  );
}
