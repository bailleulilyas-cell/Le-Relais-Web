/**
 * Ajoute la colonne avec_backoffice_devis à utilisateurs.
 * Idempotent : vérifie information_schema avant ALTER.
 * Usage : node scripts/add-avec-backoffice.mjs
 */
import mysql from "mysql2/promise";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Lecture manuelle de .env.local (dotenv n'est pas une dépendance du projet)
const envPath = resolve(__dirname, "../.env.local");
const envContent = readFileSync(envPath, "utf8");
const DATABASE_URL = envContent
  .split("\n")
  .find((l) => l.startsWith("DATABASE_URL="))
  ?.replace(/^DATABASE_URL=/, "")
  .replace(/^["']|["']$/g, "")
  .trim();

if (!DATABASE_URL) {
  console.error("DATABASE_URL introuvable dans .env.local");
  process.exit(1);
}

const conn = await mysql.createConnection(DATABASE_URL);

const [rows] = await conn.execute(
  `SELECT COLUMN_NAME FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE()
     AND TABLE_NAME = 'utilisateurs'
     AND COLUMN_NAME = 'avec_backoffice_devis'`
);

if (rows.length > 0) {
  console.log("✓ Colonne avec_backoffice_devis existe déjà — rien à faire.");
} else {
  await conn.execute(
    `ALTER TABLE utilisateurs
     ADD COLUMN avec_backoffice_devis tinyint(1) DEFAULT NULL
     AFTER lien_paiement_abonnement`
  );
  console.log("✓ Colonne avec_backoffice_devis ajoutée.");
}

await conn.end();
