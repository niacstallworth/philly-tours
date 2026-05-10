import fs from "fs";
import path from "path";
import { Pool } from "pg";

const repoRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const excludedLaunchIds = new Set(["founders-demo-route", "founders-premium-sample"]);

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
  throw new Error("Set SUPABASE_DB_URL or EXPO_PUBLIC_SUPABASE_URL with SUPABASE_DB_PASSWORD before running smoke tests.");
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      accept: "application/json"
    }
  });
  const text = await response.text();
  return {
    ok: response.ok,
    status: response.status,
    body: text
  };
}

async function run() {
  const pool = createPool();
  const client = await pool.connect();
  try {
    const toursResult = await client.query(
      `select
         t.id,
         t.title,
         count(s.id)::int as stop_count
       from private_content.tours t
       left join private_content.tour_stops s on s.tour_id = t.id
       where t.is_published = true
       group by t.id
       order by t.sort_order asc, t.title asc`
    );

    const audioResult = await client.query(
      `select
         s.tour_id,
         count(*)::int as ready_audio_count
       from private_content.tour_media_assets a
       join private_content.tour_stops s on s.id = a.stop_id
       where a.kind = 'audio'
         and a.status = 'ready'
       group by s.tour_id`
    );

    const audioByTour = new Map(audioResult.rows.map((row) => [row.tour_id, row.ready_audio_count]));

    const rows = toursResult.rows.map((row) => {
      const stopCount = Number(row.stop_count || 0);
      const readyAudioCount = Number(audioByTour.get(row.id) || 0);
      return {
        id: row.id,
        title: row.title,
        stopCount,
        readyAudioCount,
        expectedAudioCount: stopCount * 2,
        audioComplete: readyAudioCount >= stopCount * 2
      };
    });

    const launchRows = rows.filter((row) => !excludedLaunchIds.has(row.id));
    const excludedRows = rows.filter((row) => excludedLaunchIds.has(row.id));
    const incomplete = launchRows.filter((row) => !row.audioComplete);

    console.log(`Published tours (all): ${rows.length}`);
    console.log(`Launch premium tours: ${launchRows.length}`);
    console.log(`Audio-complete launch tours: ${launchRows.length - incomplete.length}/${launchRows.length}`);
    if (excludedRows.length) {
      console.log(`Excluded from launch count: ${excludedRows.map((row) => row.id).join(", ")}`);
    }
    if (incomplete.length) {
      console.log("Incomplete launch tours:");
      for (const row of incomplete) {
        console.log(`- ${row.id}: ${row.readyAudioCount}/${row.expectedAudioCount} ready audio assets`);
      }
    }

    const serverBase = process.env.SMOKE_TEST_SERVER_BASE_URL || "http://127.0.0.1:4000";
    try {
      const catalog = await fetchJson(`${serverBase}/api/content/catalog`);
      console.log(`Catalog endpoint: HTTP ${catalog.status}`);
      if (!catalog.ok) {
        console.log(catalog.body.slice(0, 500));
      }
    } catch (error) {
      console.log(`Catalog endpoint: unavailable (${error.message})`);
    }
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch((error) => {
  console.error(error.message || error);
  process.exitCode = 1;
});
