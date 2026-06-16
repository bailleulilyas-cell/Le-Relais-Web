import Link from "next/link";
import { getAdminStats, getPendingDemandes } from "@/lib/admin-data";
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

const TYPE_LABEL: Record<string, string> = {
  modification: "Modification",
  prix: "Prix / horaires",
  photo: "Photo",
  bug: "Problème technique",
  autre: "Autre",
  systeme: "Notification système",
};

export default async function AdminDashboard() {
  const [stats, pending] = await Promise.all([getAdminStats(), getPendingDemandes()]);

  return (
    <>
      <div className="adm-head">
        <h1 className="adm-h1">Tableau de bord</h1>
        <p className="adm-sub">Vue d’ensemble de l’activité Le Relais Web</p>
      </div>

      {/* Stats principales */}
      <div className="adm-stats">
        <div className="adm-stat feat">
          <div className="adm-stat-val">{eur(stats.mrr)} €</div>
          <div className="adm-stat-lbl">Revenu mensuel récurrent</div>
          <div className="adm-stat-sub">{stats.actifs} client{stats.actifs > 1 ? "s" : ""} actif{stats.actifs > 1 ? "s" : ""}</div>
        </div>
        <div className="adm-stat">
          <div className="adm-stat-val">{eur2(stats.revenusMois)} €</div>
          <div className="adm-stat-lbl">Encaissé ce mois</div>
          <div className="adm-stat-sub">{eur2(stats.revenusTotal)} € au total</div>
        </div>
        <div className="adm-stat">
          <div className="adm-stat-val">{stats.totalClients}</div>
          <div className="adm-stat-lbl">Comptes inscrits</div>
          <div className="adm-stat-sub">{stats.enLigne} site{stats.enLigne > 1 ? "s" : ""} en ligne</div>
        </div>
        <div className={`adm-stat${stats.nbDemandesNew > 0 ? " alert" : ""}`}>
          <div className="adm-stat-val">{stats.nbDemandesNew}</div>
          <div className="adm-stat-lbl">Demandes en attente</div>
          <div className="adm-stat-sub">{pending.length} ouverte{pending.length > 1 ? "s" : ""}</div>
        </div>
      </div>

      {/* Répartition + derniers inscrits */}
      <div className="adm-grid2">
        <div className="adm-card">
          <div className="adm-card-h">
            <span className="adm-card-t">Répartition des comptes</span>
          </div>
          <div className="adm-repart">
            <div className="adm-repart-row">
              <span className="adm-dot prospect" />
              <span className="adm-repart-lbl">Prospects (pas encore payé)</span>
              <strong>{stats.prospects}</strong>
            </div>
            <div className="adm-repart-row">
              <span className="adm-dot paye" />
              <span className="adm-repart-lbl">Payés à configurer</span>
              <strong>{stats.payesNonConfigures}</strong>
            </div>
            <div className="adm-repart-row">
              <span className="adm-dot actif" />
              <span className="adm-repart-lbl">Clients actifs</span>
              <strong>{stats.actifs}</strong>
            </div>
            <div className="adm-repart-row">
              <span className="adm-dot suspendu" />
              <span className="adm-repart-lbl">Suspendus</span>
              <strong>{stats.suspendus}</strong>
            </div>
          </div>
        </div>

        <div className="adm-card">
          <div className="adm-card-h">
            <span className="adm-card-t">Derniers inscrits</span>
          </div>
          {stats.derniersInscrits.length === 0 ? (
            <p className="adm-empty-mini">Aucun inscrit.</p>
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
      </div>

      {/* Demandes en attente */}
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
              <div className="adm-dem-desc">{d.description.slice(0, 220)}{d.description.length > 220 ? "…" : ""}</div>
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
    </>
  );
}
