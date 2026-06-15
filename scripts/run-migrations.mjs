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
const db = drizzle(pool);

try {
  await migrate(db, { migrationsFolder });
  console.log("==> Migrations completed successfully");
} catch (err) {
  console.error("==> Migration failed:", err.message);
  process.exit(1);
} finally {
  await pool.end();
}
