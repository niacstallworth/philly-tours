import fs from "fs";
import path from "path";
import { Pool } from "pg";

const repoRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");

function loadDotEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }
  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }
    const eqIndex = line.indexOf("=");
    if (eqIndex <= 0) {
      continue;
    }
    const key = line.slice(0, eqIndex).trim();
    let value = line.slice(eqIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] == null) {
      process.env[key] = value;
    }
  }
}

loadDotEnvFile(path.join(repoRoot, "server.local.env"));
loadDotEnvFile(path.join(repoRoot, ".env.server.local"));
loadDotEnvFile(path.join(repoRoot, ".env.server"));
loadDotEnvFile(path.join(repoRoot, ".env"));

function inferSupabaseProjectRef() {
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || "";
  const match = supabaseUrl.match(/^https:\/\/([a-z0-9]+)\.supabase\.co/i);
  return match ? match[1] : "";
}

function createPool() {
  const connectionString = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL || "";
  if (connectionString) {
    return new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false }
    });
  }
  const projectRef = inferSupabaseProjectRef();
  const password = process.env.SUPABASE_DB_PASSWORD || "";
  if (projectRef && password) {
    return new Pool({
      host: `db.${projectRef}.supabase.co`,
      port: 5432,
      database: "postgres",
      user: "postgres",
      password,
      ssl: { rejectUnauthorized: false }
    });
  }
  throw new Error("Missing DB env. Set SUPABASE_DB_URL or EXPO_PUBLIC_SUPABASE_URL with SUPABASE_DB_PASSWORD.");
}

async function main() {
  const envSummary = {
    SUPABASE_DB_URL: Boolean(process.env.SUPABASE_DB_URL),
    DATABASE_URL: Boolean(process.env.DATABASE_URL),
    EXPO_PUBLIC_SUPABASE_URL: Boolean(process.env.EXPO_PUBLIC_SUPABASE_URL),
    SUPABASE_DB_PASSWORD: Boolean(process.env.SUPABASE_DB_PASSWORD),
    SUPABASE_SERVICE_ROLE_KEY: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY)
  };

  console.log("Private content env check:");
  console.log(JSON.stringify(envSummary, null, 2));

  const pool = createPool();
  try {
    const pingResult = await pool.query("select current_database() as database_name, now() as server_time");
    const tablesResult = await pool.query(`
      select table_name
      from information_schema.tables
      where table_schema = 'private_content'
      order by table_name asc
    `);

    console.log("Database connection ok:");
    console.log(JSON.stringify(pingResult.rows[0], null, 2));

    console.log("private_content tables:");
    console.log(
      JSON.stringify(
        tablesResult.rows.map((row) => row.table_name),
        null,
        2
      )
    );

    const requiredTables = [
      "tour_media_assets",
      "tour_stop_scripts",
      "tour_stops",
      "tours"
    ];
    const availableTables = new Set(tablesResult.rows.map((row) => row.table_name));
    const missingTables = requiredTables.filter((tableName) => !availableTables.has(tableName));

    if (missingTables.length) {
      throw new Error(`Missing private_content tables: ${missingTables.join(", ")}`);
    }

    console.log("Private content preflight passed.");
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
