/**
 * Supprime UNIQUEMENT les comptes test #14 et #25 + toutes leurs données.
 * Garde l'admin #15. Ordre de suppression = même que l'action admin deleteClient
 * (tables enfants d'abord). Transaction : tout ou rien.
 * Usage : node scripts/delete-test-clients.mjs
 */
import mysql from "mysql2/promise";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const env = readFileSync(resolve(__dirname, "../.env.local"), "utf8");
const DATABASE_URL = env.split("\n").find((l) => l.startsWith("DATABASE_URL="))
  ?.replace(/^DATABASE_URL=/, "").replace(/^["']|["']$/g, "").trim();

const IDS = [14, 25]; // ⚠️ IDs explicites — l'admin #15 n'est jamais touché

const conn = await mysql.createConnection(DATABASE_URL);

// Sécurité : on vérifie que ces IDs ne sont pas admin avant de toucher quoi que ce soit.
const [check] = await conn.query(
  `SELECT id, role, email FROM utilisateurs WHERE id IN (?)`, [IDS]
);
const adminInList = check.find((r) => r.role === "admin");
if (adminInList) {
  console.error(`ABANDON : un compte admin (#${adminInList.id}) est dans la liste. Rien supprimé.`);
  await conn.end();
  process.exit(1);
}
console.log("Comptes à supprimer :", check.map((r) => `#${r.id} ${r.email}`).join(", "));

await conn.beginTransaction();
try {
  for (const tbl of ["demandes", "factures", "interventions", "documents", "etapes", "projets"]) {
    const [r] = await conn.query(`DELETE FROM ${tbl} WHERE user_id IN (?)`, [IDS]);
    console.log(`  ${tbl}: ${r.affectedRows} ligne(s) supprimée(s)`);
  }
  const [ru] = await conn.query(`DELETE FROM utilisateurs WHERE id IN (?)`, [IDS]);
  console.log(`  utilisateurs: ${ru.affectedRows} compte(s) supprimé(s)`);
  await conn.commit();
  console.log("\n✓ Suppression terminée (transaction validée).");
} catch (e) {
  await conn.rollback();
  console.error("\n✗ Erreur — transaction annulée, rien supprimé.", e.message);
  process.exitCode = 1;
}

await conn.end();
