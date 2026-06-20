/**
 * Change le mot de passe du compte admin (#15, admin@lerelaisweb.com).
 * Le mot de passe est passé en argument — il ne transite jamais ailleurs.
 *
 * Usage :  node scripts/set-admin-password.mjs "TonNouveauMotDePasse"
 *
 * Choisis un mot de passe long (12+ caractères, mélange lettres/chiffres/symboles).
 * Astuce : pour éviter qu'il reste dans l'historique du terminal, ferme/efface
 * l'historique après (ou utilise une phrase de passe que tu changes ensuite).
 */
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const env = readFileSync(resolve(__dirname, "../.env.local"), "utf8");
const DATABASE_URL = env.split("\n").find((l) => l.startsWith("DATABASE_URL="))
  ?.replace(/^DATABASE_URL=/, "").replace(/^["']|["']$/g, "").trim();

const ADMIN_EMAIL = "admin@lerelaisweb.com";
const password = process.argv[2];

if (!password || password.length < 10) {
  console.error("✗ Donne un mot de passe d'au moins 10 caractères.");
  console.error('  Exemple : node scripts/set-admin-password.mjs "MonMotDePasse2026!"');
  process.exit(1);
}

const hash = await bcrypt.hash(password, 12);
const conn = await mysql.createConnection(DATABASE_URL);
const [r] = await conn.query(
  `UPDATE utilisateurs SET mot_de_passe = ? WHERE email = ? AND role = 'admin'`,
  [hash, ADMIN_EMAIL]
);
if (r.affectedRows === 1) {
  console.log(`✓ Mot de passe de ${ADMIN_EMAIL} mis à jour. Reconnecte-toi avec le nouveau.`);
} else {
  console.error(`✗ Aucun compte admin ${ADMIN_EMAIL} trouvé (rien changé).`);
  process.exitCode = 1;
}
await conn.end();
