import Link from "next/link";
import { getAdminStats, getPendingDemandes } from "@/lib/admin-data";
import { getSession } from "@/lib/session";
import DemandeStatusSelect from "@/components/admin/DemandeStatusSelect";

export const dynamic = "force-dynamic";

function eur(n: number): string {
  return n.toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}
function eur2(n: number): string {
  return n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function frDateTime(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
/** "2026-06" → "juin" (mois court, pour l'axe du graphique). */
function moisCourt(key: string): string {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("fr-FR", { month: "short" }).replace(".", "");
}

const TYPE_LABEL: Record<string, string> = {
  modification: "Modification",
  prix: "Prix / horaires",
  photo: "Photo",
  bug: "Problème technique",
  autre: "Autre",
  systeme: "Notification système",
};

export default async function AdminDashboard() {
  const [stats, pending, session] = await Promise.all([
    getAdminStats(),
    getPendingDemandes(),
    getSession(),
  ]);

  const heure = new Date().getHours();
  const salut = heure < 12 ? "Bonjour" : heure < 18 ? "Bon après-midi" : "Bonsoir";
  const aujourdhui = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  // ── « À faire en priorité » : on ne montre que ce qui réclame une action ──
  const aFaireAll: { label: string; count: number; tone: "red" | "amber" | "blue" }[] = [
    { label: "à configurer (ont payé)", count: stats.payesNonConfigures, tone: "amber" },
    { label: "demande(s) support en attente", count: stats.nbDemandesNew, tone: "red" },
    { label: "abonnement(s) à relancer", count: stats.abosAActiver, tone: "blue" },
  ];
  const aFaire = aFaireAll.filter((x) => x.count > 0);

  // ── Répartition (segments proportionnels) ──
  const repart = [
    { lbl: "Prospects", n: stats.prospects, cls: "prospect" },
    { lbl: "Payés à configurer", n: stats.payesNonConfigures, cls: "paye" },
    { lbl: "Clients actifs", n: stats.actifs, cls: "actif" },
    { lbl: "Suspendus", n: stats.suspendus, cls: "suspendu" },
  ];
  const repartTotal = repart.reduce((s, r) => s + r.n, 0);

  // ── Revenus 6 derniers mois ──
  const maxRevenu = Math.max(...stats.revenusParMois.map((m) => m.total), 1);
  const aDesRevenus = stats.revenusParMois.some((m) => m.total > 0);

  return (
    <>
      <div className="adm-head">
        <h1 className="adm-h1">
          {salut}, {session?.prenom ?? "Ilyas"}
        </h1>
        <p className="adm-sub" style={{ textTransform: "capitalize" }}>{aujourdhui}</p>
      </div>

      {/* Premier client pas encore là : écran qui encourage au lieu d'un tableau vide */}
      {stats.totalClients === 0 && (
        <div className="adm-onboard">
          <div className="adm-onboard-ic">🚀</div>
          <h2>Tout est prêt pour votre premier client</h2>
          <p>
            La base est vierge, le site est en ligne et fonctionnel. Dès qu’un prospect remplira
            le formulaire de devis, il apparaîtra ici automatiquement — et vous serez prévenu par email.
          </p>
          <div className="adm-onboard-actions">
            <a
              href="https://wa.me/33695382157?text=Bonjour%2C%20je%20vous%20propose%20la%20cr%C3%A9ation%20de%20votre%20site%20web."
              target="_blank"
              rel="noopener noreferrer"
              className="adm-btn-dark"
            >
              Tester un message de prospection
            </a>
            <a href="https://www.lerelaisweb.com/contact" target="_blank" rel="noopener noreferrer" className="adm-btn-ghost">
              Voir le formulaire de devis →
            </a>
          </div>
        </div>
      )}

      {/* À faire en priorité */}
      {aFaire.length > 0 && (
        <div className="adm-todo">
          <span className="adm-todo-t">À faire en priorité</span>
          <div className="adm-todo-list">
            {aFaire.map((x) => (
              <span className={`adm-todo-item ${x.tone}`} key={x.label}>
                <strong>{x.count}</strong> {x.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Stats principales */}
      <div className="adm-stats">
        <div className="adm-stat feat">
          <div className="adm-stat-val">{eur(stats.mrr)} €</div>
          <div className="adm-stat-lbl">Revenu mensuel récurrent</div>
          <div className="adm-stat-sub">
            {stats.actifs} client{stats.actifs > 1 ? "s" : ""} actif{stats.actifs > 1 ? "s" : ""}
          </div>
        </div>
        <div className="adm-stat">
          <div className="adm-stat-val">{eur2(stats.revenusMois)} €</div>
          <div className="adm-stat-lbl">Encaissé ce mois</div>
          <div className="adm-stat-sub">{eur2(stats.revenusTotal)} € au total</div>
        </div>
        <div className="adm-stat">
          <div className="adm-stat-val">{stats.totalClients}</div>
          <div className="adm-stat-lbl">Comptes inscrits</div>
          <div className="adm-stat-sub">
            {stats.enLigne} site{stats.enLigne > 1 ? "s" : ""} en ligne
          </div>
        </div>
        <div className={`adm-stat${stats.nbDemandesNew > 0 ? " alert" : ""}`}>
          <div className="adm-stat-val">{stats.nbDemandesNew}</div>
          <div className="adm-stat-lbl">Demandes en attente</div>
          <div className="adm-stat-sub">{pending.length} ouverte{pending.length > 1 ? "s" : ""}</div>
        </div>
      </div>

      {/* Graphiques : encaissé 6 mois + répartition */}
      <div className="adm-grid2">
        <div className="adm-card">
          <div className="adm-card-h">
            <span className="adm-card-t">Encaissé sur 6 mois</span>
            <span className="adm-pack-badge">{eur2(stats.revenusTotal)} € au total</span>
          </div>
          {aDesRevenus ? (
            <div className="adm-chart" role="img" aria-label="Encaissé par mois sur les 6 derniers mois">
              {stats.revenusParMois.map((m) => {
                const h = Math.round((m.total / maxRevenu) * 100);
                return (
                  <div className="adm-chart-col" key={m.mois}>
                    <div className="adm-chart-val">{m.total > 0 ? `${eur(m.total)}` : ""}</div>
                    <div className="adm-chart-barwrap">
                      <div
                        className={`adm-chart-bar${m.total > 0 ? "" : " empty"}`}
                        style={{ height: `${h}%` }}
                      />
                    </div>
                    <span className="adm-chart-x">{moisCourt(m.mois)}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="adm-empty-mini">
              Le graphique des revenus se remplira après votre premier paiement encaissé.
            </p>
          )}
        </div>

        <div className="adm-card">
          <div className="adm-card-h">
            <span className="adm-card-t">Répartition des comptes</span>
            {repartTotal > 0 && <span className="adm-pack-badge">{repartTotal} compte{repartTotal > 1 ? "s" : ""}</span>}
          </div>
          {repartTotal > 0 ? (
            <>
              <div className="adm-segbar" role="img" aria-label="Répartition des comptes">
                {repart.map((r) =>
                  r.n > 0 ? (
                    <span
                      key={r.cls}
                      className={`adm-seg ${r.cls}`}
                      style={{ width: `${(r.n / repartTotal) * 100}%` }}
                      title={`${r.lbl} : ${r.n}`}
                    />
                  ) : null
                )}
              </div>
              <div className="adm-repart">
                {repart.map((r) => (
                  <div className="adm-repart-row" key={r.cls}>
                    <span className={`adm-dot ${r.cls}`} />
                    <span className="adm-repart-lbl">{r.lbl}</span>
                    <strong>{r.n}</strong>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="adm-empty-mini">Aucun compte pour l’instant. Vos clients s’afficheront ici.</p>
          )}
        </div>
      </div>

      {/* Derniers inscrits + Demandes à traiter */}
      <div className="adm-grid2">
        <div className="adm-card">
          <div className="adm-card-h">
            <span className="adm-card-t">Derniers inscrits</span>
          </div>
          {stats.derniersInscrits.length === 0 ? (
            <p className="adm-empty-mini">Aucun inscrit pour l’instant.</p>
          ) : (
            stats.derniersInscrits.map((c) => (
              <Link key={c.id} href={`/admin/clients/${c.id}`} className="adm-recent">
                <span className="adm-recent-av">{c.prenom.charAt(0).toUpperCase()}</span>
                <span className="adm-recent-info">
                  <span className="adm-recent-name">{c.prenom}</span>
                  <span className="adm-recent-ens">{c.nomEnseigne}</span>
                </span>
                <span className="adm-recent-date">{c.date}</span>
              </Link>
            ))
          )}
        </div>

        <div className="adm-card">
          <div className="adm-card-h">
            <span className="adm-card-t">Demandes à traiter</span>
            {pending.length > 0 && <span className="adm-pill-alert">{pending.length}</span>}
          </div>
          {pending.length === 0 ? (
            <p className="adm-empty-mini">Aucune demande en attente. Tout est à jour. ✓</p>
          ) : (
            pending.map((d) => (
              <div className="adm-dem" key={d.id}>
                <div className="adm-dem-top">
                  <Link href={`/admin/clients/${d.userId}`} className="adm-dem-client">
                    {d.prenom}
                    {d.nomEnseigne ? <span className="adm-dem-ens"> · {d.nomEnseigne}</span> : null}
                  </Link>
                  <span className="adm-dem-date">{frDateTime(d.createdAt)}</span>
                </div>
                <div className="adm-dem-meta">{TYPE_LABEL[d.typeDemande] ?? d.typeDemande}</div>
                <div className="adm-dem-desc">
                  {d.description.slice(0, 220)}
                  {d.description.length > 220 ? "…" : ""}
                </div>
                <div className="adm-dem-actions">
                  <DemandeStatusSelect id={d.id} statut={d.statut} />
                  <Link href={`/admin/clients/${d.userId}`} className="adm-btn-sm">
                    Voir le client →
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
