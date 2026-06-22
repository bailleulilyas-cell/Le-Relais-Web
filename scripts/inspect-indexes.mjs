/**
 * Vérifie les index/contraintes de la table utilisateurs (lecture seule).
 * But : confirmer que `email` est bien UNIQUE en prod (anti-doublon de compte).
 * Usage : node scripts/inspect-indexes.mjs
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

const conn = await mysql.createConnection(DATABASE_URL);
const [idx] = await conn.query("SHOW INDEX FROM `utilisateurs`");
for (const i of idx) {
  console.log(`  ${i.Key_name.padEnd(20)} colonne=${i.Column_name.padEnd(20)} unique=${i.Non_unique === 0 ? "OUI" : "non"}`);
}
await conn.end();
