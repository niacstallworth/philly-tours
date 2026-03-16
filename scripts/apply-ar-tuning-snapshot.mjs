import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { execFileSync } from "node:child_process";
import { readCatalogCsv, writeCatalogCsv } from "./lib/arAssetCatalogCsv.mjs";

const rootDir = process.cwd();
const catalogPath = path.join(rootDir, "docs", "ar-asset-catalog.csv");
const headers = [
  "tourId",
  "tourTitle",
  "stopId",
  "stopTitle",
  "arPriority",
  "arType",
  "assetStatus",
  "iosAsset",
  "androidAsset",
  "webAsset",
  "scale",
  "rotationYDeg",
  "verticalOffsetM",
  "anchorStyle",
  "fallbackType",
  "coordQuality",
  "triggerRadiusM",
  "assetNeeded",
  "estimatedEffort",
  "notes",
  "stylePreset",
  "visualPriority",
  "historicalEra",
  "negativePrompt"
];

function parseArgs(argv) {
  const args = {
    snapshot: "",
    stopId: "",
    scale: "",
    rotationYDeg: "",
    verticalOffsetM: ""
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--snapshot") {
      args.snapshot = argv[i + 1] || "";
      i += 1;
      continue;
    }
    if (arg === "--stop-id") {
      args.stopId = argv[i + 1] || "";
      i += 1;
      continue;
    }
    if (arg === "--scale") {
      args.scale = argv[i + 1] || "";
      i += 1;
      continue;
    }
    if (arg === "--rotationYDeg") {
      args.rotationYDeg = argv[i + 1] || "";
      i += 1;
      continue;
    }
    if (arg === "--verticalOffsetM") {
      args.verticalOffsetM = argv[i + 1] || "";
      i += 1;
      continue;
    }
  }

  return args;
}

function parseNumeric(value, fieldName) {
  const parsed = Number(String(value || "").trim());
  if (!Number.isFinite(parsed)) {
    throw new Error(`${fieldName} must be a valid number.`);
  }
  return parsed;
}

function readSnapshotFromClipboard() {
  if (process.platform !== "darwin") {
    return "";
  }
  try {
    return execFileSync("pbpaste", { encoding: "utf8" }).trim();
  } catch {
    return "";
  }
}

function resolveSnapshotText(args) {
  if (String(args.snapshot || "").trim()) {
    return String(args.snapshot).trim();
  }
  const fromClipboard = readSnapshotFromClipboard();
  if (fromClipboard) {
    return fromClipboard;
  }
  return "";
}

function parseSnapshot(snapshot) {
  const match = snapshot.match(
    /^(?<title>.+?)(?: \[(?<stopId>[^\]]+)\])?: scale (?<scale>-?\d+(?:\.\d+)?), rotationYDeg (?<rotation>-?\d+(?:\.\d+)?), verticalOffsetM (?<offset>-?\d+(?:\.\d+)?)$/i
  );
  if (!match?.groups) {
    throw new Error("Snapshot format is invalid. Copy the tuning snapshot from the AR screen or pass explicit values.");
  }

  return {
    title: match.groups.title.trim(),
    stopId: String(match.groups.stopId || "").trim(),
    scale: parseNumeric(match.groups.scale, "scale"),
    rotationYDeg: parseNumeric(match.groups.rotation, "rotationYDeg"),
    verticalOffsetM: parseNumeric(match.groups.offset, "verticalOffsetM")
  };
}

function resolveUpdate(args) {
  const snapshot = resolveSnapshotText(args);
  if (snapshot) {
    return parseSnapshot(snapshot);
  }

  if (!(args.stopId && args.scale && args.rotationYDeg && args.verticalOffsetM)) {
    throw new Error(
      "Provide a copied tuning snapshot, or pass --stop-id, --scale, --rotationYDeg, and --verticalOffsetM."
    );
  }

  return {
    title: "",
    stopId: String(args.stopId).trim(),
    scale: parseNumeric(args.scale, "scale"),
    rotationYDeg: parseNumeric(args.rotationYDeg, "rotationYDeg"),
    verticalOffsetM: parseNumeric(args.verticalOffsetM, "verticalOffsetM")
  };
}

function applyUpdate(update) {
  const catalog = readCatalogCsv(catalogPath);
  const records = catalog.records.map((record) => ({ ...record }));

  let target = null;
  if (update.stopId) {
    target = records.find((record) => record.stopId === update.stopId) || null;
  } else if (update.title) {
    const matches = records.filter((record) => record.stopTitle === update.title);
    if (matches.length > 1) {
      throw new Error(`Snapshot title "${update.title}" is ambiguous. Use a snapshot that includes the stopId.`);
    }
    target = matches[0] || null;
  }

  if (!target) {
    throw new Error(`Could not find AR asset catalog row for ${update.stopId || update.title}.`);
  }

  target.scale = String(update.scale);
  target.rotationYDeg = String(update.rotationYDeg);
  target.verticalOffsetM = String(update.verticalOffsetM);

  writeCatalogCsv(catalogPath, headers, records);
  return target;
}

function runCatalogImport() {
  execFileSync(process.execPath, [path.join(rootDir, "scripts", "import-ar-asset-catalog.mjs")], {
    cwd: rootDir,
    stdio: "inherit"
  });
}

const args = parseArgs(process.argv.slice(2));
const update = resolveUpdate(args);
const target = applyUpdate(update);
runCatalogImport();

console.log(
  `Applied tuning to ${target.stopTitle} (${target.stopId}): scale ${target.scale}, rotationYDeg ${target.rotationYDeg}, verticalOffsetM ${target.verticalOffsetM}`
);
