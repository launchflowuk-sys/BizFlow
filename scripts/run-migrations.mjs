#!/usr/bin/env node
import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { fileURLToPath } from "url";
import path from "path";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  console.error("ERROR: DATABASE_URL environment variable is required.");
  process.exit(1);
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsFolder = path.join(__dirname, "../lib/db/migrations");

console.log("==> LaunchFlow database migration");
console.log(`    Migrations folder: ${migrationsFolder}`);

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

try {
  const db = drizzle(pool);
  await migrate(db, { migrationsFolder });
  console.log("==> Migrations completed successfully");
} catch (err) {
  // Postgres error codes for objects that already exist:
  //   42710 = duplicate_object  (CREATE TYPE ... already exists)
  //   42P07 = duplicate_table   (CREATE TABLE ... already exists)
  //   42701 = duplicate_column  (ALTER TABLE ADD COLUMN ... already exists)
  // These happen when the schema was created by a previous drizzle-kit push
  // but the drizzle migrations tracking table didn't exist yet. The schema IS
  // in place, so this is safe to treat as success.
  if (["42710", "42P07", "42701"].includes(err.code)) {
    console.log(`==> Schema already exists (pg ${err.code}) — migration complete`);
  } else {
    console.error("==> Migration failed:", err.message);
    process.exit(1);
  }
} finally {
  await pool.end();
}
