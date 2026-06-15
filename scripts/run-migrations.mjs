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
  // Drizzle-orm wraps the underlying pg error — check both err.code and
  // err.cause?.code, and fall back to message text.
  const pgCode = err?.code ?? err?.cause?.code;
  const msg = String(err?.message ?? err ?? "");
  const isAlreadyExists =
    ["42710", "42P07", "42701"].includes(pgCode) ||
    msg.includes("already exists");

  if (isAlreadyExists) {
    console.log(`==> Schema already exists — migration treated as complete`);
  } else {
    console.error("==> Migration failed:", msg);
    process.exit(1);
  }
} finally {
  await pool.end();
}
