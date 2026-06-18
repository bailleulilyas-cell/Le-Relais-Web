import {
  mysqlTable,
  int,
  varchar,
  text,
  boolean,
  date,
  datetime,
  timestamp,
  decimal,
  mysqlEnum,
} from "drizzle-orm/mysql-core";

export const utilisateurs = mysqlTable("utilisateurs", {
  id: int("id").autoincrement().primaryKey(),
  prenom: varchar("prenom", { length: 80 }).notNull(),
  nomFamille: varchar("nom_famille", { length: 80 }),
  nomEnseigne: varchar("nom_enseigne", { length: 120 }).notNull(),
  email: varchar("email", { length: 190 }).notNull().unique(),
  motDePasse: varchar("mot_de_passe", { length: 255 }).notNull(),
  secteurActivite: varchar("secteur_activite", { length: 120 }),
  // Coordonnées & contexte recueillis au devis (champs structurés, hors texte libre).
  telephone: varchar("telephone", { length: 30 }),
  ville: varchar("ville", { length: 120 }),
  aDejaSite: boolean("a_deja_site"),
  urlSiteActuel: varchar("url_site_actuel", { length: 255 }),
  aLogo: boolean("a_logo"),
  // Formule souhaitée par le prospect à l'inscription (indicatif — le prix réel
  // facturé est celui défini sur le projet par l'admin à l'initialisation).
  packSouhaite: mysqlEnum("pack_souhaite", ["presence", "pro", "indecis"]),
  descriptionProjet: text("description_projet"),
  role: mysqlEnum("role", ["client", "admin"]).default("client").notNull(),
  paiementConfirme: boolean("paiement_confirme").default(false).notNull(),
  resetToken: varchar("reset_token", { length: 64 }),
  resetTokenExpiry: datetime("reset_token_expiry"),
  dateInscription: timestamp("date_inscription").defaultNow().notNull(),
});

export const projets = mysqlTable("projets", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  nomSite: varchar("nom_site", { length: 255 }),
  urlSite: varchar("url_site", { length: 255 }),
  // Pack Pro uniquement : lien vers l'espace d'administration sur-mesure du client
  // (où il gère lui-même son contenu). Vide pour le Pack Présence.
  urlAdminClient: varchar("url_admin_client", { length: 500 }),
  statut: mysqlEnum("statut", ["en_cours", "en_ligne", "suspendu"]).default("en_cours"),
  progression: int("progression").default(0),
  abonnementDebut: date("abonnement_debut", { mode: "string" }),
  montantMensuel: decimal("montant_mensuel", { precision: 10, scale: 2 }).default("25.00"),
  montantSetup: decimal("montant_setup", { precision: 10, scale: 2 }).default("550.00"),
  scorePerformance: int("score_performance"),
  scoreAccessibility: int("score_accessibility"),
  scoreBestPractices: int("score_best_practices"),
  scoreSeo: int("score_seo"),
  scoreDate: date("score_date", { mode: "string" }),
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }),
});

export const etapes = mysqlTable("etapes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  nom: varchar("nom", { length: 150 }).notNull(),
  progression: int("progression").default(0),
  statutTexte: varchar("statut_texte", { length: 150 }).default(""),
  ordre: int("ordre").default(0),
});

export const documents = mysqlTable("documents", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  nom: varchar("nom", { length: 200 }).notNull(),
  icone: varchar("icone", { length: 10 }).default("?"),
  statut: mysqlEnum("statut", ["missing", "pending", "ok"]).default("missing"),
  ordre: int("ordre").default(0),
});

export const interventions = mysqlTable("interventions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  titre: varchar("titre", { length: 200 }).notNull(),
  description: text("description"),
  type: mysqlEnum("type", ["security", "perf", "update", "content"]).default("update"),
  dateIntervention: date("date_intervention", { mode: "string" }).notNull(),
});

export const factures = mysqlTable("factures", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  numero: varchar("numero", { length: 50 }).notNull(),
  description: varchar("description", { length: 200 }).notNull(),
  montant: decimal("montant", { precision: 10, scale: 2 }).notNull(),
  dateFacture: date("date_facture", { mode: "string" }).notNull(),
  statut: mysqlEnum("statut", ["paid", "pending"]).default("pending"),
  facturePdf: varchar("facture_pdf", { length: 500 }), // lien PDF Stripe (téléchargement)
  factureUrl: varchar("facture_url", { length: 500 }), // page facture hébergée Stripe
});

export const demandes = mysqlTable("demandes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  // "systeme" = notification interne générée automatiquement (paiement, échec, résiliation
  // Stripe...) : jamais affichée au client, uniquement visible côté admin.
  typeDemande: mysqlEnum("type_demande", ["modification", "prix", "photo", "bug", "autre", "systeme"]),
  description: text("description"),
  statut: mysqlEnum("statut", ["new", "in_progress", "done"]).default("new"),
  createdAt: datetime("created_at"),
});

export type Utilisateur = typeof utilisateurs.$inferSelect;
export type Projet = typeof projets.$inferSelect;
export type Etape = typeof etapes.$inferSelect;
export type Document = typeof documents.$inferSelect;
export type Intervention = typeof interventions.$inferSelect;
export type Facture = typeof factures.$inferSelect;
export type Demande = typeof demandes.$inferSelect;
