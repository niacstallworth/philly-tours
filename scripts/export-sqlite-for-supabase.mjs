import fs from "fs";
import path from "path";
import Database from "better-sqlite3";

const repoRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const dbPath = process.env.DB_PATH
  ? path.resolve(repoRoot, process.env.DB_PATH)
  : path.resolve(repoRoot, "server", "payments.db");
const outDir = path.resolve(repoRoot, "supabase", "seed-data");

const tables = [
  "users",
  "payment_orders",
  "entitlements",
  "iap_receipts",
  "idempotency",
  "provider_events",
  "deletion_requests"
];

if (!fs.existsSync(dbPath)) {
  console.error(`SQLite database not found at ${dbPath}`);
  process.exit(1);
}

fs.mkdirSync(outDir, { recursive: true });

const db = new Database(dbPath, { readonly: true });

try {
  for (const table of tables) {
    const rows = db.prepare(`SELECT * FROM ${table}`).all();
    const outPath = path.join(outDir, `${table}.json`);
    fs.writeFileSync(outPath, JSON.stringify(rows, null, 2) + "\n", "utf8");
    console.log(`${table}: exported ${rows.length} row(s) -> ${outPath}`);
  }
} finally {
  db.close();
}
