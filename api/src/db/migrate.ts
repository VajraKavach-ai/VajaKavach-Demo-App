import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { db } from "./index.ts";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const migrationsFolder = join(__dirname, "..", "..", "drizzle");

export function runMigrations() {
  console.log("[DB] Running migrations...");
  migrate(db, { migrationsFolder });
  console.log("[DB] Migrations complete.");
}
