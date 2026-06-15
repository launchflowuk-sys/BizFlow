#!/usr/bin/env node
import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { fileURLToPath } from "url";
import { readFileSync } from "fs";
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
  const client = await pool.connect();
  try {
    // If the schema already exists (e.g. from a prior drizzle-kit push) but the
    // drizzle migrations tracking table does not yet exist, the migrator will try
    // to re-run every SQL file and fail with "already exists" errors.
    //
    // Detect this: if 'tenants' table exists but __drizzle_migrations does not,
    // stamp the initial migration as already applied so the migrator skips it.
    const { rows: migRows } = await client.query(`
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'drizzle' AND table_name = '__drizzle_migrations'
      LIMIT 1
    `);

    if (migRows.length === 0) {
      const { rows: tenantRows } = await client.query(`
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'tenants'
        LIMIT 1
      `);

      if (tenantRows.length > 0) {
        console.log("    Existing schema detected — stamping migrations as applied...");
        await client.query(`CREATE SCHEMA IF NOT EXISTS drizzle`);
        await client.query(`
          CREATE TABLE IF NOT EXISTS drizzle.__drizzle_migrations (
            id serial PRIMARY KEY,
            hash text NOT NULL,
            created_at bigint
          )
        `);

        const journal = JSON.parse(
          readFileSync(path.join(migrationsFolder, "meta/_journal.json"), "utf8")
        );
        for (const entry of journal.entries) {
          await client.query(
            `INSERT INTO drizzle.__drizzle_migrations (hash, created_at)
             SELECT $1, $2
             WHERE NOT EXISTS (
               SELECT 1 FROM drizzle.__drizzle_migrations WHERE hash = $1
             )`,
            [entry.tag, Date.now()]
          );
        }
        console.log("    Stamped. Future schema changes will migrate normally.");
      }
    }
  } finally {
    client.release();
  }

  const db = drizzle(pool);
  await migrate(db, { migrationsFolder });
  console.log("==> Migrations completed successfully");
} catch (err) {
  console.error("==> Migration failed:", err.message);
  process.exit(1);
} finally {
  await pool.end();
}
