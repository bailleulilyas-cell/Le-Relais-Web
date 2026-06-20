/**
 * Liste tout le contenu de la base (lecture seule) pour décider quoi nettoyer.
 * Usage : node scripts/list-data.mjs
 */
import mysql from "mysql2/promise";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const env = readFileSync(resolve(__dirname, "../.env.local"), "utf8");
const DATABASE_URL = env.split("\n").find((l) => l.startsWith("DATABASE_URL="))
  ?.replace(/^DATABASE_URL=/, "").replace(/^["']|["']$/g, "").trim();

const conn = await mysql.createConnection(DATABASE_URL);

const [users] = await conn.execute(
  `SELECT u.id, u.role, u.prenom, u.nom_famille, u.nom_enseigne, u.email,
          u.paiement_confirme, u.date_inscription,
          (SELECT COUNT(*) FROM projets p WHERE p.user_id = u.id) AS a_projet,
          (SELECT COUNT(*) FROM factures f WHERE f.user_id = u.id) AS nb_factures,
          (SELECT COUNT(*) FROM demandes d WHERE d.user_id = u.id) AS nb_demandes
   FROM utilisateurs u
   ORDER BY u.role DESC, u.id ASC`
);

console.log(`\n=== ${users.length} COMPTE(S) DANS LA BASE ===\n`);
for (const u of users) {
  const nom = `${u.prenom} ${u.nom_famille ?? ""}`.trim();
  console.log(
    `#${u.id} [${u.role.toUpperCase()}] ${nom} — « ${u.nom_enseigne} »\n` +
    `      ${u.email}\n` +
    `      payé:${u.paiement_confirme ? "OUI" : "non"} · projet:${u.a_projet ? "OUI" : "non"} · ` +
    `factures:${u.nb_factures} · demandes:${u.nb_demandes} · inscrit:${new Date(u.date_inscription).toLocaleDateString("fr-FR")}\n`
  );
}

// Totaux des tables annexes
const [[counts]] = await conn.execute(
  `SELECT
     (SELECT COUNT(*) FROM projets) AS projets,
     (SELECT COUNT(*) FROM etapes) AS etapes,
     (SELECT COUNT(*) FROM documents) AS documents,
     (SELECT COUNT(*) FROM interventions) AS interventions,
     (SELECT COUNT(*) FROM factures) AS factures,
     (SELECT COUNT(*) FROM demandes) AS demandes`
);
console.log("=== LIGNES DANS LES TABLES ANNEXES ===");
console.log(counts);

await conn.end();
