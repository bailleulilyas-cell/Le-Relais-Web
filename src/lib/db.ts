import { drizzle, type MySql2Database } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

let _db: MySql2Database<typeof schema> | null = null;

export function getDb() {
  if (!_db) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL manquant — configurez votre base de données.");
    const pool = mysql.createPool(url);
    _db = drizzle(pool, { schema, mode: "default" });
  }
  return _db;
}
