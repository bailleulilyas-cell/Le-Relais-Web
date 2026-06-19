import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getClientData } from "@/lib/client-data";
import Dashboard, { type DashboardData } from "@/components/dashboard/Dashboard";

export const metadata: Metadata = {
  title: "Mon espace client | Le Relais Web",
  robots: { index: false, follow: false },
};

export default async function EspaceClientPage() {
  const session = await getSession();
  if (!session) redirect("/compte?from=/espace-client");

  const data = await getClientData(session.userId);
  if (!data) redirect("/compte");

  // Drizzle renvoie les colonnes `date` en objets Date — on normalise en YYYY-MM-DD.
  const isoDate = (v: unknown): string | null => {
    if (!v) return null;
    if (v instanceof Date) return v.toISOString().slice(0, 10);
    return String(v).slice(0, 10);
  };

  // Sérialisation server → client (types simples uniquement)
  const dash: DashboardData = {
    user: {
      prenom: data.utilisateur.prenom,
      nomEnseigne: data.utilisateur.nomEnseigne,
      email: data.utilisateur.email,
      paiementConfirme: data.utilisateur.paiementConfirme,
      descriptionProjet: data.utilisateur.descriptionProjet ?? null,
      packSouhaite: data.utilisateur.packSouhaite,
      formuleDevis: data.utilisateur.formuleDevis,
      montantSetupDevis: data.utilisateur.montantSetupDevis,
      montantMensuelDevis: data.utilisateur.montantMensuelDevis,
      lienPaiementSetup: data.utilisateur.lienPaiementSetup,
      lienPaiementAbonnement: data.utilisateur.lienPaiementAbonnement,
    },
    projet: data.projet
      ? {
          nomSite: data.projet.nomSite,
          urlSite: data.projet.urlSite,
          statut: data.projet.statut,
          pretMiseEnLigne: !!data.projet.pretMiseEnLigne,
          montantMensuel: String(data.projet.montantMensuel ?? "25.00"),
          abonnementDebut: isoDate(data.projet.abonnementDebut),
          scorePerformance: data.projet.scorePerformance,
          scoreAccessibility: data.projet.scoreAccessibility,
          scoreBestPractices: data.projet.scoreBestPractices,
          scoreSeo: data.projet.scoreSeo,
          scoreDate: isoDate(data.projet.scoreDate),
          hasStripe: !!data.projet.stripeSubscriptionId,
          urlAdminClient: data.projet.urlAdminClient ?? null,
        }
      : null,
    etapes: data.etapes.map((e) => ({
      nom: e.nom,
      progression: e.progression ?? 0,
      statutTexte: e.statutTexte ?? "",
    })),
    documents: data.documents.map((d) => ({
      nom: d.nom,
      icone: d.icone ?? "?",
      statut: d.statut ?? "missing",
    })),
    interventions: data.interventions.map((iv) => ({
      titre: iv.titre,
      description: iv.description ?? "",
      type: iv.type ?? "update",
      date: isoDate(iv.dateIntervention) ?? "",
    })),
    factures: data.factures.map((f) => ({
      id: f.id,
      numero: f.numero,
      description: f.description,
      montant: String(f.montant),
      date: isoDate(f.dateFacture) ?? "",
      statut: f.statut ?? "pending",
    })),
    demandes: data.demandes.map((d) => ({
      typeDemande: d.typeDemande ?? "autre",
      description: d.description ?? "",
      statut: d.statut ?? "new",
      date: d.createdAt instanceof Date ? d.createdAt.toISOString() : d.createdAt ? String(d.createdAt) : "",
    })),
    progressionGlobale: data.progressionGlobale,
    prochainPrelevement: data.prochainPrelevement,
    joursAvantPrelevement: data.joursAvantPrelevement,
    totalPaye: data.totalPaye,
  };

  return <Dashboard data={dash} />;
}
