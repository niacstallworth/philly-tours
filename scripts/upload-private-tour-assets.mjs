import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

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
    assetRoot: path.join(repoRoot, "private-content", "assets"),
    kind: "all",
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
      continue;
    }
    if (value === "--asset-root" && argv[index + 1]) {
      args.assetRoot = path.resolve(repoRoot, argv[index + 1]);
      index += 1;
      continue;
    }
    if (value === "--kind" && argv[index + 1]) {
      args.kind = String(argv[index + 1]).trim().toLowerCase();
      index += 1;
    }
  }
  return args;
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function normalizeText(value, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

function loadCatalog(filePath) {
  assert(fs.existsSync(filePath), `Private catalog file not found: ${filePath}`);
  const parsed = JSON.parse(fs.readFileSync(filePath, "utf8"));
  assert(parsed && typeof parsed === "object", "Private catalog must be a JSON object.");
  assert(Array.isArray(parsed.tours), "Private catalog must contain a tours array.");
  return parsed;
}

function createSupabaseAdmin() {
  const supabaseUrl = normalizeText(process.env.EXPO_PUBLIC_SUPABASE_URL);
  const serviceRoleKey = normalizeText(process.env.SUPABASE_SERVICE_ROLE_KEY);
  assert(supabaseUrl, "EXPO_PUBLIC_SUPABASE_URL is required.");
  assert(serviceRoleKey, "SUPABASE_SERVICE_ROLE_KEY is required for private asset uploads.");
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false }
  });
}

function collectAssets(catalog, kindFilter) {
  const rows = [];
  for (const tour of catalog.tours) {
    if (tour.coverImage?.bucket && tour.coverImage?.objectPath) {
      rows.push({
        label: `${tour.id}:cover`,
        kind: "image",
        bucket: normalizeText(tour.coverImage.bucket),
        objectPath: normalizeText(tour.coverImage.objectPath),
        mimeType: normalizeText(tour.coverImage.mimeType, "image/jpeg")
      });
    }
    for (const stop of Array.isArray(tour.stops) ? tour.stops : []) {
      for (const asset of Array.isArray(stop.mediaAssets) ? stop.mediaAssets : []) {
        rows.push({
          label: `${stop.id}:${normalizeText(asset.kind)}:${normalizeText(asset.variant, "default")}`,
          kind: normalizeText(asset.kind),
          bucket: normalizeText(asset.bucket),
          objectPath: normalizeText(asset.objectPath),
          mimeType: normalizeText(asset.mimeType),
          status: normalizeText(asset.status, "draft")
        });
      }
    }
  }

  return rows.filter((row) => {
    if (!row.kind || !row.bucket || !row.objectPath) {
      return false;
    }
    if (kindFilter === "all") {
      return true;
    }
    return row.kind === kindFilter;
  });
}

function localPathForAsset(assetRoot, bucket, objectPath) {
  return path.join(assetRoot, bucket, objectPath);
}

async function uploadAssets({ file, assetRoot, kind, dryRun }) {
  const catalog = loadCatalog(file);
  const assets = collectAssets(catalog, kind);
  assert(assets.length > 0, `No ${kind} assets found in ${file}.`);

  const supabase = dryRun ? null : createSupabaseAdmin();
  let uploaded = 0;
  let missing = 0;

  for (const asset of assets) {
    const localPath = localPathForAsset(assetRoot, asset.bucket, asset.objectPath);
    if (!fs.existsSync(localPath)) {
      missing += 1;
      console.log(`MISSING ${asset.label} -> ${path.relative(repoRoot, localPath)}`);
      continue;
    }

    if (dryRun) {
      console.log(`READY ${asset.label} -> ${path.relative(repoRoot, localPath)} -> ${asset.bucket}/${asset.objectPath}`);
      uploaded += 1;
      continue;
    }

    const fileBuffer = fs.readFileSync(localPath);
    const { error } = await supabase.storage
      .from(asset.bucket)
      .upload(asset.objectPath, fileBuffer, {
        contentType: asset.mimeType || undefined,
        upsert: true
      });

    if (error) {
      throw new Error(`Failed to upload ${asset.label} to ${asset.bucket}/${asset.objectPath}: ${error.message}`);
    }

    console.log(`UPLOADED ${asset.label} -> ${asset.bucket}/${asset.objectPath}`);
    uploaded += 1;
  }

  return {
    assetCount: assets.length,
    uploaded,
    missing,
    dryRun
  };
}

const args = parseArgs(process.argv.slice(2));

uploadAssets(args)
  .then((result) => {
    const mode = result.dryRun ? "Dry run complete" : "Private asset upload complete";
    console.log(`${mode}: ${result.uploaded}/${result.assetCount} asset(s) ready or uploaded, ${result.missing} missing local file(s).`);
  })
  .catch((error) => {
    console.error(error.message || error);
    process.exitCode = 1;
  });
