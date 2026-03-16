import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { readCatalogCsv, writeCatalogCsv } from "./lib/arAssetCatalogCsv.mjs";

const rootDir = process.cwd();
const toursPath = path.join(rootDir, "src", "data", "tours.ts");
const catalogPath = path.join(rootDir, "docs", "narration-script-catalog.csv");
const headers = ["stopId", "variant", "title", "outputFile", "voiceId", "engine", "textType", "text"];

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function loadTours() {
  const raw = fs.readFileSync(toursPath, "utf8");
  const match = raw.match(/export const tours: Tour\[\] = ([\s\S]*);\s*$/);
  if (!match) {
    throw new Error("Unable to parse tours from src/data/tours.ts");
  }
  const context = vm.createContext({});
  new vm.Script(`const tours = ${match[1]}; this.__tours = tours;`).runInContext(context);
  return context.__tours;
}

function buildStopIndex(tours) {
  const byId = new Map();
  const byTitle = new Map();

  for (const tour of tours) {
    for (const stop of tour.stops) {
      byId.set(stop.id, stop);
      const key = normalize(stop.title);
      if (!byTitle.has(key)) {
        byTitle.set(key, []);
      }
      byTitle.get(key).push(stop);
    }
  }

  return { byId, byTitle };
}

function resolveStopId(record, index) {
  const stopId = String(record.stopId || "").trim();
  if (index.byId.has(stopId)) {
    return { stopId, reason: "exact" };
  }

  const titleMatches = index.byTitle.get(normalize(record.title)) || [];
  if (titleMatches.length === 1) {
    return { stopId: titleMatches[0].id, reason: "title" };
  }

  if (titleMatches.length > 1) {
    return { stopId: null, reason: "ambiguous", candidates: titleMatches.map((stop) => stop.id) };
  }

  return { stopId: null, reason: "unmatched" };
}

const tours = loadTours();
const stopIndex = buildStopIndex(tours);
const catalog = readCatalogCsv(catalogPath);
const normalizedMap = new Map();
const summary = {
  exact: 0,
  titleMapped: 0,
  deduped: 0,
  ambiguous: [],
  unmatched: []
};

for (const record of catalog.records) {
  const resolved = resolveStopId(record, stopIndex);
  if (!resolved.stopId) {
    if (resolved.reason === "ambiguous") {
      summary.ambiguous.push({
        title: record.title,
        variant: record.variant,
        candidates: resolved.candidates
      });
    } else {
      summary.unmatched.push({
        stopId: record.stopId,
        title: record.title,
        variant: record.variant
      });
    }
    continue;
  }

  if (resolved.reason === "exact") {
    summary.exact += 1;
  } else {
    summary.titleMapped += 1;
  }

  const nextRecord = {
    ...record,
    stopId: resolved.stopId
  };
  const key = `${nextRecord.stopId}::${nextRecord.variant}`;
  if (normalizedMap.has(key)) {
    summary.deduped += 1;
    continue;
  }
  normalizedMap.set(key, nextRecord);
}

const normalizedRecords = Array.from(normalizedMap.values()).sort((left, right) => {
  if (left.stopId === right.stopId) {
    return left.variant.localeCompare(right.variant);
  }
  return left.stopId.localeCompare(right.stopId);
});

writeCatalogCsv(catalogPath, headers, normalizedRecords);
console.log(JSON.stringify(summary, null, 2));
