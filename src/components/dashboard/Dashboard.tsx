"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { buildPayLink } from "@/lib/pay-link";

/* ── Types sérialisés (server → client) ── */
export type DashUser = {
  id: number;
  prenom: string;
  nomEnseigne: string;
  email: string;
  paiementConfirme: boolean;
  descriptionProjet: string | null;
  packSouhaite: "presence" | "pro" | "indecis" | null;
  // Formule + liens de paiement assignés par l'admin. Tant que formuleDevis est
  // null, le client ne voit aucun lien (juste « Finalisons votre formule »).
  formuleDevis: "presence" | "pro" | "custom" | null;
  montantSetupDevis: string | null;
  montantMensuelDevis: string | null;
  lienPaiementSetup: string | null;
  lienPaiementAbonnement: string | null;
};
export type DashProjet = {
  nomSite: string | null;
  urlSite: string | null;
  statut: "en_cours" | "en_ligne" | "suspendu" | null;
  pretMiseEnLigne: boolean;
  montantMensuel: string;
  montantSetup: string;
  abonnementDebut: string | null;
  scorePerformance: number | null;
  scoreAccessibility: number | null;
  scoreBestPractices: number | null;
  scoreSeo: number | null;
  scoreDate: string | null;
  hasStripe: boolean;
  urlAdminClient: string | null;
} | null;
export type DashEtape = { nom: string; progression: number; statutTexte: string };
export type DashDocument = { nom: string; icone: string; statut: "missing" | "pending" | "ok" };
export type DashIntervention = {
  titre: string;
  description: string;
  type: "security" | "perf" | "update" | "content";
  date: string;
};
export type DashFacture = {
  id: number;
  numero: string;
  description: string;
  montant: string;
  date: string;
  statut: "paid" | "pending";
};
export type DashDemande = {
  typeDemande: string;
  description: string;
  statut: "new" | "in_progress" | "done";
  date: string;
};
export type DashboardData = {
  user: DashUser;
  projet: DashProjet;
  etapes: DashEtape[];
  documents: DashDocument[];
  interventions: DashIntervention[];
  factures: DashFacture[];
  demandes: DashDemande[];
  progressionGlobale: number;
  prochainPrelevement: string | null;
  joursAvantPrelevement: number;
  totalPaye: number;
};

type Tab = "dashboard" | "projet" | "support" | "facturation";

const STATUT_LABEL: Record<string, string> = {
  en_cours: "En cours de création",
  en_ligne: "En ligne",
  suspendu: "Suspendu",
};
const TYPE_TAG: Record<string, { label: string; cls: string }> = {
  security: { label: "Sécurité", cls: "t-security" },
  perf: { label: "Performance", cls: "t-perf" },
  update: { label: "Maintenance", cls: "t-update" },
  content: { label: "Contenu", cls: "t-content" },
};
const DEMANDE_STATUT: Record<string, { label: string; cls: string }> = {
  new: { label: "En attente", cls: "d-new" },
  in_progress: { label: "En cours", cls: "d-prog" },
  done: { label: "Traitée", cls: "d-done" },
};

function frDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso.length <= 10 ? iso + "T00:00:00" : iso);
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}
function eur(n: number | string): string {
  return Number(n).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function Dashboard({ data }: { data: DashboardData }) {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [drawer, setDrawer] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [liveStatus, setLiveStatus] = useState<"checking" | "online" | "offline" | "none">(
    "checking"
  );
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { user, projet } = data;
  const hasProjet = !!projet;
  const initiale = user.prenom.charAt(0).toUpperCase();
  const heure = new Date().getHours();
  const salut = heure < 12 ? "Bonjour" : heure < 18 ? "Bon après-midi" : "Bonsoir";

  function showToast(msg: string) {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3200);
  }

  function go(t: Tab) {
    setTab(t);
    setDrawer(false);
    window.scrollTo(0, 0);
  }

  async function logout() {
    try {
      await fetch("/api/deconnexion", { method: "POST", credentials: "same-origin" });
    } catch {
      /* ignore */
    }
    window.location.href = "/";
  }

  // Vérification live de l'état du site
  useEffect(() => {
    if (!projet?.urlSite) {
      setLiveStatus("none");
      return;
    }
    let active = true;
    (async () => {
      try {
        const r = await fetch("/api/client/status", { credentials: "same-origin" });
        const d = await r.json();
        if (!active) return;
        setLiveStatus(d.status === "online" ? "online" : d.status === "offline" ? "offline" : "none");
      } catch {
        if (active) setLiveStatus("offline");
      }
    })();
    return () => {
      active = false;
    };
  }, [projet?.urlSite]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setDrawer(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const nbNew = data.demandes.filter((d) => d.statut === "new").length;

  const tabTitles: Record<Tab, string> = {
    dashboard: "Tableau de bord",
    projet: "Mon projet",
    support: "Support & modifications",
    facturation: "Facturation",
  };

  return (
    <div className="dash">
      {/* ── Sidebar ── */}
      {drawer && <div className="dash-backdrop" onClick={() => setDrawer(false)} />}
      <aside className={`dash-side${drawer ? " open" : ""}`}>
        <button
          className="dash-side-close"
          onClick={() => setDrawer(false)}
          aria-label="Fermer le menu"
        >
          ✕
        </button>
        <div className="dash-side-brand">
          <span className="dash-side-logo">LR</span>
          <div>
            <div className="dash-side-name">Le Relais Web</div>
            <div className="dash-side-loc">Espace client</div>
          </div>
        </div>
        <div className="dash-side-user">
          <span className="dash-side-av">{initiale}</span>
          <div>
            <div className="dash-side-uname">{user.prenom}</div>
            <div className="dash-side-urole">{user.nomEnseigne}</div>
            <div className="dash-side-ustat">
              {hasProjet ? STATUT_LABEL[projet!.statut ?? "en_cours"] : "Aucun projet actif"}
            </div>
          </div>
        </div>
        <nav className="dash-nav">
          <span className="dash-nav-sec">Principal</span>
          <button
            className={`dash-nav-link${tab === "dashboard" ? " active" : ""}`}
            onClick={() => go("dashboard")}
          >
            Tableau de bord
          </button>
          {hasProjet && (
            <button
              className={`dash-nav-link${tab === "projet" ? " active" : ""}`}
              onClick={() => go("projet")}
            >
              Mon projet
            </button>
          )}
          <span className="dash-nav-sec">Services</span>
          <button
            className={`dash-nav-link${tab === "support" ? " active" : ""}`}
            onClick={() => go("support")}
          >
            Support & modifications
            {nbNew > 0 && <span className="dash-nav-badge">{nbNew}</span>}
          </button>
          {hasProjet && (
            <button
              className={`dash-nav-link${tab === "facturation" ? " active" : ""}`}
              onClick={() => go("facturation")}
            >
              Facturation
            </button>
          )}
        </nav>
        <div className="dash-side-foot">
          <Link href="/" className="dash-side-back">
            ← Retour au site
          </Link>
          <button type="button" className="dash-side-logout" onClick={logout}>
            Se déconnecter
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="dash-main">
        <header className="dash-topbar">
          <button
            className="dash-burger"
            onClick={() => setDrawer(true)}
            aria-label="Ouvrir le menu"
          >
            <span />
            <span />
            <span />
          </button>
          <div className="dash-topbar-title">{tabTitles[tab]}</div>
          <StatusPill status={liveStatus} hasProjet={hasProjet} />
        </header>

        <main className="dash-content">
          {tab === "dashboard" && (
            <DashboardTab data={data} salut={salut} liveStatus={liveStatus} />
          )}
          {tab === "projet" && hasProjet && <ProjetTab data={data} />}
          {tab === "support" && (
            <SupportTab data={data} onToast={showToast} />
          )}
          {tab === "facturation" && hasProjet && (
            <FacturationTab data={data} onToast={showToast} />
          )}
        </main>
      </div>

      {toast && <div className="dash-toast show">{toast}</div>}
    </div>
  );
}

/* ─────────────────────────────────────────── */
function StatusPill({
  status,
  hasProjet,
}: {
  status: "checking" | "online" | "offline" | "none";
  hasProjet: boolean;
}) {
  if (!hasProjet || status === "none")
    return <span className="dash-pill neutral">Projet en préparation</span>;
  if (status === "checking")
    return <span className="dash-pill neutral">Vérification…</span>;
  if (status === "online")
    return (
      <span className="dash-pill online">
        <span className="dot" /> En ligne
      </span>
    );
  return <span className="dash-pill offline">Hors ligne</span>;
}

/* ── Onglet Tableau de bord ── */
function DashboardTab({
  data,
  salut,
  liveStatus,
}: {
  data: DashboardData;
  salut: string;
  liveStatus: string;
}) {
  const { user, projet } = data;
  // Montant mensuel affiché pour l'abonnement : projet (client actif) sinon devis.
  const montantMensuel = projet ? String(projet.montantMensuel) : user.montantMensuelDevis;
  return (
    <>
      <div className="dash-welcome">
        <span className="eyebrow">Espace client</span>
        <h1>
          {salut}, <span className="ital">{user.prenom}</span>
        </h1>
        <p>
          {user.nomEnseigne} · {frDate(new Date().toISOString())}
        </p>
      </div>

      {!projet && user.descriptionProjet && (
        <div className="dash-card" style={{ marginBottom: "1.4rem", borderLeft: "3px solid var(--color-accent)" }}>
          <div className="dash-card-h">
            <span className="dash-card-t">✓ Votre demande a bien été reçue</span>
          </div>
          <p style={{ fontSize: ".88rem", color: "var(--color-ink-muted)", lineHeight: 1.7, whiteSpace: "pre-line" }}>
            {user.descriptionProjet}
          </p>
          <p style={{ fontSize: ".8rem", color: "var(--color-ink-muted)", marginTop: ".8rem" }}>
            On revient vers vous sous 24h ouvrées. En attendant, vous pouvez tout suivre ici.
          </p>
        </div>
      )}

      {!user.paiementConfirme && (
        <PaiementCard
          montantSetup={user.montantSetupDevis}
          lienSetup={user.lienPaiementSetup}
          email={user.email}
          clientRef={user.id}
        />
      )}

      {user.paiementConfirme && projet && projet.pretMiseEnLigne && !projet.hasStripe && (
        <AbonnementCard
          montantMensuel={montantMensuel}
          lienAbonnement={user.lienPaiementAbonnement}
          email={user.email}
          clientRef={user.id}
        />
      )}

      {projet && (
        <>
          <div className="dash-kpis">
            <KpiCard
              val={liveStatus === "online" ? "En ligne" : liveStatus === "offline" ? "Hors ligne" : "…"}
              lbl="État du site"
              sub={liveStatus === "online" ? "Tout fonctionne" : liveStatus === "offline" ? "Équipe prévenue" : "Vérification"}
              tone={liveStatus === "online" ? "ok" : liveStatus === "offline" ? "warn" : "muted"}
            />
            <KpiCard
              val={projet.scorePerformance != null ? `${projet.scorePerformance}` : "—"}
              lbl="Score Google"
              sub={projet.scorePerformance != null && projet.scorePerformance >= 90 ? "Excellent" : "Mesure en cours"}
              tone="ok"
            />
            <KpiCard
              val={`J-${data.joursAvantPrelevement}`}
              lbl="Prochain prélèvement"
              sub={`${eur(projet.montantMensuel)} € le ${frDate(data.prochainPrelevement)}`}
              tone="amber"
            />
            <KpiCard
              val={`${data.interventions.length}`}
              lbl="Interventions"
              sub="Maintenance active"
              tone="ok"
            />
          </div>

          {projet.urlAdminClient && (
            <a
              href={projet.urlAdminClient}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary dash-manage-btn"
            >
              Gérer mon site →
            </a>
          )}

          {/* Bandeau statut technique */}
          <div className="dash-statusbar">
            <div className="dash-statusbar-ic">{liveStatus === "online" ? "✓" : "…"}</div>
            <div className="dash-statusbar-info">
              <h3>
                {liveStatus === "online"
                  ? "Votre site fonctionne parfaitement"
                  : liveStatus === "offline"
                    ? "Site temporairement indisponible"
                    : "Vérification en cours…"}
              </h3>
              <p>{projet.urlSite || "Site en préparation"}</p>
            </div>
            <span className={`dash-statusbar-bdg${liveStatus === "offline" ? " off" : ""}`}>
              {liveStatus === "online" ? "En ligne" : liveStatus === "offline" ? "Hors ligne" : "…"}
            </span>
          </div>

          <div className="dash-g31">
            <ScorePanel projet={projet} />
            <div>
              <NextPayCard data={data} />
              <div className="dash-card" style={{ marginTop: "1.2rem" }}>
                <div className="dash-card-h">
                  <span className="dash-card-t">Interventions récentes</span>
                </div>
                {data.interventions.length === 0 ? (
                  <p className="dash-empty-mini">Aucune intervention pour l’instant.</p>
                ) : (
                  data.interventions.slice(0, 3).map((iv, i) => (
                    <div className="dash-act" key={i}>
                      <span className={`dash-act-dot ${iv.type}`} />
                      <div>
                        <div className="dash-act-t">{iv.titre}</div>
                        <div className="dash-act-d">{frDate(iv.date)}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

function KpiCard({
  val,
  lbl,
  sub,
  tone,
}: {
  val: string;
  lbl: string;
  sub: string;
  tone: "ok" | "warn" | "amber" | "muted";
}) {
  return (
    <div className="dash-kpi">
      <div className="dash-kpi-val">{val}</div>
      <div className="dash-kpi-lbl">{lbl}</div>
      <div className={`dash-kpi-sub ${tone}`}>{sub}</div>
    </div>
  );
}

function ScorePanel({ projet }: { projet: NonNullable<DashProjet> }) {
  const rows: [string, number | null][] = [
    ["Rapidité du site", projet.scorePerformance],
    ["Accessibilité", projet.scoreAccessibility],
    ["Bonnes pratiques", projet.scoreBestPractices],
    ["Référencement Google", projet.scoreSeo],
  ];
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 150);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="dash-card dash-card-dark">
      <div className="dash-card-h">
        <span className="dash-card-t light">Score Google</span>
        <span className="dash-card-meta">
          {projet.scoreDate ? `Analyse du ${frDate(projet.scoreDate)}` : "En cours d’analyse"}
        </span>
      </div>
      {rows.map(([label, v]) => (
        <div className="dash-score-row" key={label}>
          <span className="dash-score-lbl">{label}</span>
          <div className="dash-score-bar">
            <div
              className="dash-score-fill"
              style={{ width: mounted && v != null ? `${v}%` : "0%" }}
            />
          </div>
          <span className="dash-score-val">{v != null ? v : "—"}</span>
        </div>
      ))}
    </div>
  );
}

function NextPayCard({ data }: { data: DashboardData }) {
  const { projet } = data;
  return (
    <div className="dash-paycard">
      <div className="dash-paycard-l">Prochain prélèvement</div>
      <div className="dash-paycard-d">{frDate(data.prochainPrelevement)}</div>
      <div className="dash-paycard-a">
        Abonnement — <strong>{eur(projet!.montantMensuel)} €/mois</strong>
      </div>
    </div>
  );
}

function eurOpt(v: string | null): string {
  return v != null ? eur(v) : "—";
}

/* Étape 1 — mise en service. Le bouton n'apparaît QUE si l'admin a assigné une
 * formule (lienPaiementSetup défini). Sinon, état d'attente neutre. */
function PaiementCard({
  montantSetup,
  lienSetup,
  email,
  clientRef,
}: {
  montantSetup: string | null;
  lienSetup: string | null;
  email: string;
  clientRef: number;
}) {
  if (!lienSetup) {
    return (
      <div className="dash-pay-cta">
        <div className="dash-pay-ic">💳</div>
        <h2>Finalisons votre formule</h2>
        <p>
          On définit ensemble la formule la mieux adaptée à votre projet, puis on vous envoie le
          lien de paiement de la mise en service.
        </p>
        <a
          href="https://wa.me/33695382157?text=Bonjour%2C%20je%20souhaite%20finaliser%20ma%20commande."
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary dash-pay-btn"
        >
          En discuter sur WhatsApp →
        </a>
        <p className="dash-pay-note">🔒 Paiement sécurisé par Stripe · Garantie 30 jours</p>
      </div>
    );
  }
  return (
    <div className="dash-pay-cta">
      <div className="dash-pay-ic">💳</div>
      <h2>Lancer votre projet</h2>
      <div className="dash-pay-price">
        <b>{eurOpt(montantSetup)} €</b>
        <em>mise en service · une seule fois</em>
      </div>
      <p>
        Réglée une seule fois pour démarrer la création de votre site.
        <br />
        <span>L’abonnement mensuel ne démarre qu’une fois votre site prêt.</span>
      </p>
      <a href={buildPayLink(lienSetup, email, clientRef)} className="btn-primary dash-pay-btn">
        Payer la mise en service →
      </a>
      <p className="dash-pay-note">🔒 Paiement sécurisé par Stripe · Satisfait ou remboursé 30 jours</p>
    </div>
  );
}

/* Étape 2 — abonnement : visible UNIQUEMENT quand l'admin a marqué le site « prêt ». */
function AbonnementCard({
  montantMensuel,
  lienAbonnement,
  email,
  clientRef,
}: {
  montantMensuel: string | null;
  lienAbonnement: string | null;
  email: string;
  clientRef: number;
}) {
  return (
    <div className="dash-pay-cta dash-pay-ready">
      <div className="dash-pay-ic">🚀</div>
      <h2>Votre site est prêt à être mis en ligne&nbsp;!</h2>
      <div className="dash-pay-price">
        <b>{eurOpt(montantMensuel)} €</b>
        <em>par mois · sans engagement</em>
      </div>
      <p>
        Dernière étape : activez votre abonnement (hébergement, nom de domaine, maintenance et
        support inclus) et on met votre site en ligne.
        <br />
        <span>Sans engagement · Résiliable à tout moment.</span>
      </p>
      {lienAbonnement ? (
        <a href={buildPayLink(lienAbonnement, email, clientRef)} className="btn-primary dash-pay-btn">
          Activer mon abonnement & mettre en ligne →
        </a>
      ) : (
        <a
          href="https://wa.me/33695382157?text=Bonjour%2C%20mon%20site%20est%20pr%C3%AAt%2C%20je%20souhaite%20activer%20mon%20abonnement."
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary dash-pay-btn"
        >
          Activer mon abonnement →
        </a>
      )}
      <p className="dash-pay-note">🔒 Paiement sécurisé par Stripe</p>
    </div>
  );
}

/* ── Onglet Mon projet ── */
function ProjetTab({ data }: { data: DashboardData }) {
  const docLabel: Record<string, string> = {
    missing: "À envoyer",
    pending: "Optionnel",
    ok: "Reçu ✓",
  };
  return (
    <>
      <div className="dash-welcome">
        <h1>
          Mon <span className="ital">projet</span>
        </h1>
        <p>Suivi en temps réel de votre site web.</p>
      </div>
      <div className="dash-g2">
        <div className="dash-card">
          <div className="dash-card-h">
            <span className="dash-card-t">Avancement général</span>
            <span
              className="dash-card-meta"
              style={{ color: data.progressionGlobale >= 100 ? "var(--color-accent)" : "var(--color-ink)" }}
            >
              {data.progressionGlobale}%
            </span>
          </div>
          <div className="dash-prog-global">
            <div className="dash-prog-global-fill" style={{ width: `${data.progressionGlobale}%` }} />
          </div>
          {data.etapes.length === 0 ? (
            <div className="dash-empty">
              <p>Les étapes de votre projet seront configurées très prochainement.</p>
            </div>
          ) : (
            data.etapes.map((e, i) => (
              <div className="dash-prog-item" key={i}>
                <div className="dash-prog-head">
                  <span className="dash-prog-name">{e.nom}</span>
                  <span
                    className="dash-prog-pct"
                    style={{ color: e.progression === 100 ? "var(--color-accent)" : undefined }}
                  >
                    {e.progression}%
                  </span>
                </div>
                <div className="dash-prog-bg">
                  <div
                    className={`dash-prog-fill${e.progression === 100 ? " done" : ""}`}
                    style={{ width: `${e.progression}%` }}
                  />
                </div>
                {e.statutTexte && <div className="dash-prog-st">{e.statutTexte}</div>}
              </div>
            ))
          )}
        </div>

        <div className="dash-card">
          <div className="dash-card-h">
            <span className="dash-card-t">Documents requis</span>
          </div>
          <p className="dash-doc-intro">
            Envoyez les éléments manquants à <strong>contact@lerelaisweb.com</strong> ou par{" "}
            <a
              href="https://wa.me/33695382157?text=Bonjour%2C%20je%20vous%20envoie%20un%20document%20pour%20mon%20projet."
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp
            </a>
            .
          </p>
          {data.documents.length === 0 ? (
            <div className="dash-empty">
              <p>La liste des documents sera configurée prochainement.</p>
            </div>
          ) : (
            data.documents.map((d, i) => (
              <div className="dash-doc-row" key={i}>
                <span className={`dash-doc-ic ${d.statut}`}>{d.icone}</span>
                <div>
                  <div className="dash-doc-name">{d.nom}</div>
                  <div className={`dash-doc-stat ${d.statut}`}>{docLabel[d.statut]}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

/* ── Onglet Support ── */
function SupportTab({
  data,
  onToast,
}: {
  data: DashboardData;
  onToast: (m: string) => void;
}) {
  const [type, setType] = useState("modification");
  const [desc, setDesc] = useState("");
  const [sending, setSending] = useState(false);
  const [sentOk, setSentOk] = useState(false);

  async function submit() {
    if (!desc.trim()) {
      onToast("Décrivez votre demande avant d’envoyer.");
      return;
    }
    setSending(true);
    try {
      const r = await fetch("/api/demande", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ type, description: desc }),
      });
      const d = await r.json();
      if (d.ok) {
        onToast("✓ Demande envoyée ! Réponse sous 24h.");
        setDesc("");
        setSentOk(true);
        setTimeout(() => setSentOk(false), 5000);
      } else {
        onToast(d.error || "Erreur, réessayez.");
      }
    } catch {
      onToast("Erreur réseau, réessayez.");
    }
    setSending(false);
  }

  return (
    <>
      <div className="dash-welcome">
        <h1>
          Support & <span className="ital">modifications</span>
        </h1>
        <p>Réponse sous 24h ouvrées. Votre demande est traitée par notre équipe.</p>
      </div>
      <div className="dash-g2">
        <div className="dash-card">
          <div className="dash-card-h">
            <span className="dash-card-t">Nouvelle demande</span>
          </div>
          <div className="dash-form">
            <label htmlFor="req-type">Type de demande</label>
            <select id="req-type" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="modification">Modification de texte / contenu</option>
              <option value="prix">Changement de prix ou horaires</option>
              <option value="photo">Ajout d’une photo</option>
              <option value="bug">Problème technique</option>
              <option value="autre">Autre demande</option>
            </select>
            <label htmlFor="req-desc">Décrivez votre demande</label>
            <textarea
              id="req-desc"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Ex : Merci de changer le prix du menu Mixte à 8,50 €…"
            />
          </div>
          <button className="btn-primary dash-form-btn" onClick={submit} disabled={sending}>
            {sending ? "Envoi…" : "Envoyer la demande"}
          </button>
          {sentOk && (
            <div className="dash-form-ok">
              <strong>Demande envoyée avec succès !</strong>
              <span>Réponse sous 24h ouvrées</span>
            </div>
          )}
          <p className="dash-form-note">🔒 Réponse sous 24h · Sans engagement · Zéro spam</p>
        </div>

        <div>
          <div className="dash-card" style={{ marginBottom: "1.2rem" }}>
            <div className="dash-card-h">
              <span className="dash-card-t">Mes demandes</span>
            </div>
            {data.demandes.length === 0 ? (
              <p className="dash-empty-mini">
                Aucune demande pour l’instant.
                <br />
                Envoyez votre première demande ci-contre.
              </p>
            ) : (
              data.demandes.map((d, i) => {
                const st = DEMANDE_STATUT[d.statut] ?? DEMANDE_STATUT.new;
                return (
                  <div className="dash-dem" key={i}>
                    <div className="dash-dem-head">
                      <span className="dash-dem-date">{frDate(d.date)}</span>
                      <span className={`dash-tag ${st.cls}`}>{st.label}</span>
                    </div>
                    <div className="dash-dem-desc">
                      {d.description.slice(0, 120)}
                      {d.description.length > 120 ? "…" : ""}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {data.interventions.length > 0 && (
            <div className="dash-card" style={{ marginBottom: "1.2rem" }}>
              <div className="dash-card-h">
                <span className="dash-card-t">Interventions de notre équipe</span>
              </div>
              {data.interventions.slice(0, 5).map((iv, i) => {
                const tg = TYPE_TAG[iv.type] ?? { label: "Autre", cls: "t-update" };
                const d = new Date(iv.date + "T00:00:00");
                return (
                  <div className="dash-iv" key={i}>
                    <div className="dash-iv-date">
                      <span className="day">{d.toLocaleDateString("fr-FR", { day: "2-digit" })}</span>
                      <span className="mon">
                        {d.toLocaleDateString("fr-FR", { month: "short" })}
                      </span>
                    </div>
                    <div>
                      <div className="dash-iv-t">{iv.titre}</div>
                      {iv.description && <div className="dash-iv-d">{iv.description}</div>}
                      <span className={`dash-tag ${tg.cls}`}>{tg.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <ContactCard />
        </div>
      </div>
    </>
  );
}

function ContactCard() {
  return (
    <div className="dash-card dash-card-dark">
      <div className="dash-card-t light" style={{ marginBottom: ".8rem" }}>
        Contact direct
      </div>
      <p className="dash-contact-intro">Une question urgente ? Écrivez-nous :</p>
      <a
        href="https://wa.me/33695382157?text=Bonjour%2C%20j%27ai%20une%20question%20concernant%20mon%20site."
        target="_blank"
        rel="noopener noreferrer"
        className="dash-contact-wa"
      >
        WhatsApp — réponse rapide par message
      </a>
      <a href="mailto:contact@lerelaisweb.com" className="dash-contact-mail">
        contact@lerelaisweb.com
      </a>
      <p className="dash-contact-note">Réponse garantie sous 24h ouvrées.</p>
    </div>
  );
}

/* ── Onglet Facturation ── */
function FacturationTab({
  data,
  onToast,
}: {
  data: DashboardData;
  onToast: (m: string) => void;
}) {
  const { projet } = data;
  const [resilState, setResilState] = useState<"idle" | "loading" | "done">("idle");

  async function resilier() {
    if (
      !confirm(
        "Êtes-vous sûr de vouloir résilier votre abonnement ?\n\nVotre site restera en ligne jusqu’à la fin de la période en cours."
      )
    )
      return;
    setResilState("loading");
    try {
      const r = await fetch("/api/resilier", { method: "POST", credentials: "same-origin" });
      const d = await r.json();
      if (d.ok) {
        onToast(d.message || "Résiliation enregistrée.");
        setResilState("done");
      } else {
        onToast(d.error || "Erreur, contactez contact@lerelaisweb.com");
        setResilState("idle");
      }
    } catch {
      onToast("Erreur réseau. Réessayez.");
      setResilState("idle");
    }
  }

  const recap: [string, string][] = [
    ["Offre", "Abonnement Le Relais Web"],
    ["Mensualité", `${eur(projet!.montantMensuel)} €/mois`],
    ["Début", frDate(projet!.abonnementDebut)],
    ["Prochain prélèvement", frDate(data.prochainPrelevement)],
    ["Engagement", "Sans engagement ✓"],
  ];

  return (
    <>
      <div className="dash-welcome">
        <h1>
          Ma <span className="ital">facturation</span>
        </h1>
        <p>Retrouvez toutes vos factures et le détail de votre abonnement.</p>
      </div>
      <div className="dash-g2">
        <div className="dash-card">
          <div className="dash-card-h">
            <span className="dash-card-t">Factures</span>
          </div>
          {data.factures.length === 0 ? (
            <div className="dash-empty">
              <p>
                Votre première facture apparaîtra ici après votre premier prélèvement.
                <br />
                <span>Vous recevrez aussi un email de confirmation.</span>
              </p>
            </div>
          ) : (
            data.factures.map((f, i) => (
              <div className="dash-fact" key={i}>
                <span className="dash-fact-num">{f.numero}</span>
                <div className="dash-fact-desc">
                  <div className="dash-fact-n">{f.description}</div>
                  <div className="dash-fact-d">{frDate(f.date)}</div>
                </div>
                <div className="dash-fact-right">
                  <span className="dash-fact-amt">{eur(f.montant)} €</span>
                  <span className={`dash-fact-stat ${f.statut}`}>
                    {f.statut === "paid" ? "Payé" : "En attente"}
                  </span>
                  <a
                    className="dash-fact-pdf"
                    href={`/api/facture/${f.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Télécharger la facture ${f.numero} en PDF`}
                  >
                    PDF ↓
                  </a>
                </div>
              </div>
            ))
          )}
        </div>

        <div>
          <div className="dash-card" style={{ marginBottom: "1.2rem" }}>
            <div className="dash-card-h">
              <span className="dash-card-t">Récapitulatif</span>
            </div>
            {recap.map(([k, v]) => (
              <div className="dash-recap-row" key={k}>
                <span>{k}</span>
                <strong>{v}</strong>
              </div>
            ))}
          </div>

          <div className="dash-paycard">
            <div className="dash-paycard-l">Votre compte</div>
            <div className="dash-paycard-d">À jour ✓</div>
            <div className="dash-paycard-a">
              {(() => {
                const n = data.factures.filter((f) => f.statut === "paid").length;
                return `${n} facture${n > 1 ? "s" : ""} réglée${n > 1 ? "s" : ""} sans incident`;
              })()}
            </div>
          </div>

          {/* Résiliation : visible UNIQUEMENT si un abonnement Stripe est actif. */}
          {projet!.hasStripe && (
            <div className="dash-card dash-resil" style={{ marginTop: "1.2rem" }}>
              <div className="dash-card-h">
                <span className="dash-card-t danger">Résilier mon abonnement</span>
              </div>
              <p className="dash-resil-text">
                Vous pouvez résilier à tout moment. Votre site restera en ligne jusqu’à la fin de la
                période en cours. Seuls les {eur(projet!.montantSetup)} € de mise en service sont
                remboursables (garantie 30 jours).
              </p>
              <button
                className="dash-resil-btn"
                onClick={resilier}
                disabled={resilState !== "idle"}
              >
                {resilState === "loading"
                  ? "Résiliation en cours…"
                  : resilState === "done"
                    ? "Résiliation confirmée ✓"
                    : "Résilier mon abonnement"}
              </button>
              <p className="dash-resil-note">
                Sans engagement · La résiliation prend effet en fin de période mensuelle.
                <br />
                Le code source de votre site vous appartient.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
