/**
 * Inspecte la structure RÉELLE de la base de prod (lecture seule).
 * N'effectue AUCUNE modification : uniquement des SHOW COLUMNS.
 * But : comparer la vraie base à src/lib/schema.ts pour détecter le « drift ».
 *
 * Usage :  node scripts/inspect-schema.mjs
 */
import mysql from "mysql2/promise";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const env = readFileSync(resolve(__dirname, "../.env.local"), "utf8");
const DATABASE_URL = env
  .split("\n")
  .find((l) => l.startsWith("DATABASE_URL="))
  ?.replace(/^DATABASE_URL=/, "")
  .replace(/^["']|["']$/g, "")
  .trim();

const TABLES = ["utilisateurs", "projets", "etapes", "documents", "interventions", "factures", "demandes"];

const conn = await mysql.createConnection(DATABASE_URL);
for (const t of TABLES) {
  console.log(`\n=== ${t} ===`);
  try {
    const [cols] = await conn.query(`SHOW FULL COLUMNS FROM \`${t}\``);
    for (const c of cols) {
      console.log(`  ${c.Field.padEnd(26)} ${c.Type.padEnd(28)} ${c.Null === "YES" ? "NULL" : "NOT NULL"}${c.Default != null ? ` def=${c.Default}` : ""}`);
    }
  } catch (e) {
    console.log(`  (erreur : ${e.message})`);
  }
}
await conn.end();
