import fs from "node:fs";
import path from "node:path";
import { readCatalogCsv } from "./lib/arAssetCatalogCsv.mjs";
import { STYLE_PRESET_VALUES, VISUAL_PRIORITY_VALUES, resolveStylePreset, resolveVisualPriority } from "./lib/arPromptBuilder.mjs";

const rootDir = process.cwd();
const csvPath = path.join(rootDir, "docs", "ar-asset-catalog.csv");
const outputPath = path.join(rootDir, "src", "data", "arAssetCatalog.ts");

const ASSET_STATUS_VALUES = new Set(["planned", "in_production", "ready", "approved"]);
const ANCHOR_STYLE_VALUES = new Set(["front_of_user", "ground", "image_target", "location_marker"]);
const FALLBACK_TYPE_VALUES = new Set(["box", "card", "none"]);
const COORD_QUALITY_VALUES = new Set(["verified", "approximate"]);
const EFFORT_VALUES = new Set(["", "low", "medium", "high"]);

function normalizeRepoPath(assetPath) {
  return assetPath.replace(/^\/+/, "");
}

function assetExistsInRepo(assetPath) {
  const normalized = normalizeRepoPath(assetPath);
  const candidates = [
    path.join(rootDir, normalized),
    path.join(rootDir, "assets", normalized)
  ];

  return candidates.some((candidate) => fs.existsSync(candidate));
}

function required(value, fieldName, rowNumber) {
  if (!value.trim()) {
    throw new Error(`Row ${rowNumber}: ${fieldName} is required`);
  }
  return value.trim();
}

function asNumber(value, fieldName, rowNumber) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw new Error(`Row ${rowNumber}: ${fieldName} must be a number`);
  }
  return parsed;
}

function asEnum(value, allowed, fieldName, rowNumber) {
  if (!allowed.has(value)) {
    throw new Error(`Row ${rowNumber}: ${fieldName} must be one of ${Array.from(allowed).join(", ")}`);
  }
  return value;
}

function readCatalogRows() {
  const { records } = readCatalogCsv(csvPath);

  return records.map((record, index) => {
    const rowNumber = index + 2;

    return {
      tourId: required(record.tourId, "tourId", rowNumber),
      tourTitle: required(record.tourTitle, "tourTitle", rowNumber),
      stopId: required(record.stopId, "stopId", rowNumber),
      stopTitle: required(record.stopTitle, "stopTitle", rowNumber),
      arPriority: asNumber(required(record.arPriority, "arPriority", rowNumber), "arPriority", rowNumber),
      arType: required(record.arType, "arType", rowNumber),
      assetStatus: asEnum(required(record.assetStatus, "assetStatus", rowNumber), ASSET_STATUS_VALUES, "assetStatus", rowNumber),
      iosAsset: required(record.iosAsset, "iosAsset", rowNumber),
      androidAsset: required(record.androidAsset, "androidAsset", rowNumber),
      webAsset: required(record.webAsset, "webAsset", rowNumber),
      iosAssetExistsLocal: assetExistsInRepo(required(record.iosAsset, "iosAsset", rowNumber)),
      androidAssetExistsLocal: assetExistsInRepo(required(record.androidAsset, "androidAsset", rowNumber)),
      webAssetExistsLocal: assetExistsInRepo(required(record.webAsset, "webAsset", rowNumber)),
      scale: asNumber(required(record.scale, "scale", rowNumber), "scale", rowNumber),
      rotationYDeg: asNumber(required(record.rotationYDeg, "rotationYDeg", rowNumber), "rotationYDeg", rowNumber),
      anchorStyle: asEnum(required(record.anchorStyle, "anchorStyle", rowNumber), ANCHOR_STYLE_VALUES, "anchorStyle", rowNumber),
      fallbackType: asEnum(required(record.fallbackType, "fallbackType", rowNumber), FALLBACK_TYPE_VALUES, "fallbackType", rowNumber),
      coordQuality: asEnum(required(record.coordQuality, "coordQuality", rowNumber), COORD_QUALITY_VALUES, "coordQuality", rowNumber),
      triggerRadiusM: asNumber(required(record.triggerRadiusM, "triggerRadiusM", rowNumber), "triggerRadiusM", rowNumber),
      assetNeeded: record.assetNeeded?.trim() || "",
      estimatedEffort: asEnum((record.estimatedEffort || "").trim(), EFFORT_VALUES, "estimatedEffort", rowNumber),
      notes: record.notes?.trim() || "",
      stylePreset: asEnum(resolveStylePreset(record), STYLE_PRESET_VALUES, "stylePreset", rowNumber),
      visualPriority: asEnum(resolveVisualPriority(record), VISUAL_PRIORITY_VALUES, "visualPriority", rowNumber),
      historicalEra: record.historicalEra?.trim() || "",
      negativePrompt: record.negativePrompt?.trim() || ""
    };
  });
}

function writeCatalogModule(rows) {
  const fileContents = `export type ARAssetCatalogEntry = {
  tourId: string;
  tourTitle: string;
  stopId: string;
  stopTitle: string;
  arPriority: number;
  arType: string;
  assetStatus: "planned" | "in_production" | "ready" | "approved";
  iosAsset: string;
  androidAsset: string;
  webAsset: string;
  iosAssetExistsLocal: boolean;
  androidAssetExistsLocal: boolean;
  webAssetExistsLocal: boolean;
  scale: number;
  rotationYDeg: number;
  verticalOffsetM?: number;
  anchorStyle: "front_of_user" | "ground" | "image_target" | "location_marker";
  fallbackType: "box" | "card" | "none";
  coordQuality: "verified" | "approximate";
  triggerRadiusM: number;
  assetNeeded: string;
  estimatedEffort: "low" | "medium" | "high" | "";
  notes: string;
  stylePreset: "" | "architectural" | "cinematic" | "editorial" | "museum_card" | "documentary";
  visualPriority: "" | "facade_accuracy" | "historical_accuracy" | "atmosphere" | "readability" | "silhouette";
  historicalEra: string;
  negativePrompt: string;
};

export const arAssetCatalog: ARAssetCatalogEntry[] = ${JSON.stringify(rows, null, 2)};

export const arAssetCatalogByStopId = new Map(arAssetCatalog.map((entry) => [entry.stopId, entry]));
`;

  fs.writeFileSync(outputPath, fileContents);
}

const rows = readCatalogRows().sort((left, right) => left.arPriority - right.arPriority || left.stopTitle.localeCompare(right.stopTitle));
writeCatalogModule(rows);
console.log(`Imported ${rows.length} AR asset catalog rows.`);
