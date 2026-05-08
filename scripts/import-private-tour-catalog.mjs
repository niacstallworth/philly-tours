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

function parseArgs(argv) {
  const args = {
    file: path.join(repoRoot, "private-content", "catalog.json"),
    dryRun: false
  };
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === "--dry-run") {
      args.dryRun = true;
      continue;
    }
    if (value === "--file" && argv[index + 1]) {
      args.file = path.resolve(repoRoot, argv[index + 1]);
      index += 1;
    }
  }
  return args;
}

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
  throw new Error("Set SUPABASE_DB_URL or EXPO_PUBLIC_SUPABASE_URL with SUPABASE_DB_PASSWORD before importing private content.");
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function normalizeText(value, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

function normalizeNullableText(value) {
  const normalized = normalizeText(value);
  return normalized || null;
}

function normalizeNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function normalizeInteger(value, fallback = 0) {
  return Math.round(normalizeNumber(value, fallback));
}

function normalizeBoolean(value, fallback = false) {
  return typeof value === "boolean" ? value : fallback;
}

function loadCatalog(filePath) {
  assert(fs.existsSync(filePath), `Private catalog file not found: ${filePath}`);
  const parsed = JSON.parse(fs.readFileSync(filePath, "utf8"));
  assert(parsed && typeof parsed === "object", "Private catalog must be a JSON object.");
  assert(Array.isArray(parsed.tours), "Private catalog must contain a tours array.");
  return parsed;
}

function validateTour(tour, tourIndex) {
  assert(normalizeText(tour.id), `Tour at index ${tourIndex} is missing id.`);
  assert(normalizeText(tour.title), `Tour ${tour.id || tourIndex} is missing title.`);
  assert(Array.isArray(tour.stops), `Tour ${tour.id} must include a stops array.`);
  for (const [stopIndex, stop] of tour.stops.entries()) {
    assert(normalizeText(stop.id), `Tour ${tour.id} stop ${stopIndex} is missing id.`);
    assert(normalizeText(stop.title), `Tour ${tour.id} stop ${stop.id || stopIndex} is missing title.`);
    assert(Number.isFinite(Number(stop.lat)), `Tour ${tour.id} stop ${stop.id} is missing a valid lat.`);
    assert(Number.isFinite(Number(stop.lng)), `Tour ${tour.id} stop ${stop.id} is missing a valid lng.`);
  }
}

async function importCatalog({ file, dryRun }) {
  const catalog = loadCatalog(file);
  catalog.tours.forEach(validateTour);

  const pool = createPool();
  const client = await pool.connect();
  try {
    await client.query("begin");
    for (const [tourIndex, tour] of catalog.tours.entries()) {
      const tourId = normalizeText(tour.id);
      await client.query("delete from private_content.tours where id = $1", [tourId]);
      await client.query(
        `insert into private_content.tours (
          id, slug, city_id, title, summary, duration_min, distance_miles, rating,
          required_plan_id, is_published, sort_order, cover_image_bucket, cover_image_path
        ) values (
          $1, $2, $3, $4, $5, $6, $7, $8,
          $9, $10, $11, $12, $13
        )`,
        [
          tourId,
          normalizeNullableText(tour.slug || tourId),
          normalizeText(tour.cityId, "philly"),
          normalizeText(tour.title),
          normalizeNullableText(tour.summary),
          normalizeInteger(tour.durationMin, 0),
          normalizeNumber(tour.distanceMiles, 0),
          tour.rating == null ? null : normalizeNumber(tour.rating, 0),
          normalizeNullableText(tour.requiredPlanId),
          normalizeBoolean(tour.isPublished, false),
          normalizeInteger(tour.sortOrder, tourIndex),
          normalizeNullableText(tour.coverImage?.bucket),
          normalizeNullableText(tour.coverImage?.objectPath)
        ]
      );

      for (const [stopIndex, stop] of tour.stops.entries()) {
        const stopId = normalizeText(stop.id);
        await client.query(
          `insert into private_content.tour_stops (
            id, tour_id, title, description, lat, lng, coord_quality, trigger_radius_m,
            vertical_offset_m, stop_order, ar_type, ar_priority, asset_needed, estimated_effort, street_view
          ) values (
            $1, $2, $3, $4, $5, $6, $7, $8,
            $9, $10, $11, $12, $13, $14, $15
          )`,
          [
            stopId,
            tourId,
            normalizeText(stop.title),
            normalizeNullableText(stop.description),
            normalizeNumber(stop.lat, 0),
            normalizeNumber(stop.lng, 0),
            normalizeText(stop.coordQuality, "approximate"),
            normalizeInteger(stop.triggerRadiusM, 35),
            stop.verticalOffsetM == null ? null : normalizeNumber(stop.verticalOffsetM, 0),
            normalizeInteger(stop.stopOrder, stopIndex),
            normalizeNullableText(stop.arType),
            stop.arPriority == null ? null : normalizeInteger(stop.arPriority, 0),
            normalizeNullableText(stop.assetNeeded),
            normalizeNullableText(stop.estimatedEffort),
            stop.streetView == null ? null : JSON.stringify(stop.streetView)
          ]
        );

        for (const variant of ["walk", "drive"]) {
          const scriptText = normalizeText(stop.scripts?.[variant]);
          if (!scriptText) {
            continue;
          }
          await client.query(
            `insert into private_content.tour_stop_scripts (
              stop_id, variant, script_text, is_published
            ) values ($1, $2, $3, $4)`,
            [stopId, variant, scriptText, true]
          );
        }

        const mediaAssets = Array.isArray(stop.mediaAssets) ? stop.mediaAssets : [];
        for (const asset of mediaAssets) {
          const kind = normalizeText(asset.kind);
          const objectPath = normalizeText(asset.objectPath);
          assert(kind, `Tour ${tourId} stop ${stopId} has a media asset missing kind.`);
          assert(objectPath, `Tour ${tourId} stop ${stopId} has a media asset missing objectPath.`);
          await client.query(
            `insert into private_content.tour_media_assets (
              stop_id, kind, variant, platform, bucket, object_path, mime_type, is_private, status
            ) values (
              $1, $2, $3, $4, $5, $6, $7, $8, $9
            )`,
            [
              stopId,
              kind,
              normalizeNullableText(asset.variant),
              normalizeNullableText(asset.platform),
              normalizeNullableText(asset.bucket),
              objectPath,
              normalizeNullableText(asset.mimeType),
              asset.isPrivate == null ? true : normalizeBoolean(asset.isPrivate, true),
              normalizeText(asset.status, "draft")
            ]
          );
        }
      }
    }

    if (dryRun) {
      await client.query("rollback");
    } else {
      await client.query("commit");
    }
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
    await pool.end();
  }

  return {
    tourCount: catalog.tours.length,
    stopCount: catalog.tours.reduce((total, tour) => total + tour.stops.length, 0),
    dryRun
  };
}

const args = parseArgs(process.argv.slice(2));

importCatalog(args)
  .then((result) => {
    console.log(
      `${result.dryRun ? "Dry run complete" : "Private content imported"}: ${result.tourCount} tour(s), ${result.stopCount} stop(s).`
    );
  })
  .catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
