import fs from "fs";
import path from "path";

const repoRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");

function parseArgs(argv) {
  const args = {
    file: path.join(repoRoot, "private-content", "catalog.json"),
    assetRoot: path.join(repoRoot, "private-content", "assets"),
    kind: "all"
  };
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
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

function collectAssets(catalog, kindFilter) {
  const rows = [];
  for (const tour of catalog.tours) {
    if (tour.coverImage?.bucket && tour.coverImage?.objectPath) {
      rows.push({
        kind: "image",
        bucket: normalizeText(tour.coverImage.bucket),
        objectPath: normalizeText(tour.coverImage.objectPath)
      });
    }
    for (const stop of Array.isArray(tour.stops) ? tour.stops : []) {
      for (const asset of Array.isArray(stop.mediaAssets) ? stop.mediaAssets : []) {
        rows.push({
          kind: normalizeText(asset.kind),
          bucket: normalizeText(asset.bucket),
          objectPath: normalizeText(asset.objectPath)
        });
      }
    }
  }

  return rows.filter((row) => {
    if (!row.kind || !row.bucket || !row.objectPath) {
      return false;
    }
    return kindFilter === "all" ? true : row.kind === kindFilter;
  });
}

function writePlaceholder(filePath) {
  if (fs.existsSync(filePath)) {
    return false;
  }
  const contents = [
    "Place the real private asset file here.",
    `Filename: ${path.basename(filePath)}`,
    "Delete this placeholder text file after replacing it with the real asset."
  ].join("\n");
  fs.writeFileSync(filePath, `${contents}\n`, "utf8");
  return true;
}

function scaffoldAssetTree({ file, assetRoot, kind }) {
  const catalog = loadCatalog(file);
  const assets = collectAssets(catalog, kind);
  assert(assets.length > 0, `No ${kind} assets found in ${file}.`);

  const readmePath = path.join(assetRoot, "README.md");
  if (!fs.existsSync(readmePath)) {
    fs.mkdirSync(assetRoot, { recursive: true });
    fs.writeFileSync(
      readmePath,
      [
        "# Private Assets",
        "",
        "This folder is local-only and mirrors the bucket/object paths referenced in the private catalog.",
        "Replace placeholder files with the real private media before uploading."
      ].join("\n"),
      "utf8"
    );
  }

  let createdDirectories = 0;
  let createdPlaceholders = 0;

  for (const asset of assets) {
    const directoryPath = path.join(assetRoot, asset.bucket, path.dirname(asset.objectPath));
    if (!fs.existsSync(directoryPath)) {
      fs.mkdirSync(directoryPath, { recursive: true });
      createdDirectories += 1;
    }

    const extension = path.extname(asset.objectPath) || ".bin";
    const placeholderPath = path.join(
      directoryPath,
      `${path.basename(asset.objectPath, extension)}.placeholder.txt`
    );
    if (writePlaceholder(placeholderPath)) {
      createdPlaceholders += 1;
    }
  }

  return {
    assetCount: assets.length,
    createdDirectories,
    createdPlaceholders
  };
}

const args = parseArgs(process.argv.slice(2));

try {
  const result = scaffoldAssetTree(args);
  console.log(
    `Scaffolded private asset tree for ${result.assetCount} asset(s): ${result.createdDirectories} new director${result.createdDirectories === 1 ? "y" : "ies"}, ${result.createdPlaceholders} placeholder file(s).`
  );
} catch (error) {
  console.error(error.message || error);
  process.exitCode = 1;
}
