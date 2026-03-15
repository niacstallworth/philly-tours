import fs from "node:fs";
import path from "node:path";
import process from "node:process";
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

function parseArgs(argv) {
  const args = {
    inputs: [],
    replaceExisting: false
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--replace-existing") {
      args.replaceExisting = true;
      continue;
    }
    args.inputs.push(arg);
  }

  if (!args.inputs.length) {
    throw new Error("Provide one or more CSV files to import.");
  }

  return args;
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
  if (index.byId.has(record.stopId)) {
    return { stopId: record.stopId, reason: "exact" };
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

function toCatalogRow(record, stopId) {
  return {
    stopId,
    variant: String(record.variant || "").trim(),
    title: String(record.title || "").trim(),
    outputFile: String(record.outputFile || "").trim(),
    voiceId: String(record.voiceId || "Amy").trim(),
    engine: String(record.engine || "neural").trim(),
    textType: String(record.textType || "text").trim(),
    text: String(record.text || "").trim()
  };
}

const args = parseArgs(process.argv.slice(2));
const tours = loadTours();
const stopIndex = buildStopIndex(tours);
const existing = readCatalogCsv(catalogPath);
const recordMap = new Map(existing.records.map((record) => [`${record.stopId}::${record.variant}`, record]));

const summary = {
  imported: 0,
  updated: 0,
  exact: 0,
  titleMapped: 0,
  skippedExisting: 0,
  ambiguous: [],
  unmatched: []
};

for (const inputFile of args.inputs) {
  const source = readCatalogCsv(path.resolve(inputFile));
  for (const record of source.records) {
    const resolved = resolveStopId(record, stopIndex);
    if (!resolved.stopId) {
      if (resolved.reason === "ambiguous") {
        summary.ambiguous.push({
          input: inputFile,
          title: record.title,
          variant: record.variant,
          candidates: resolved.candidates
        });
      } else {
        summary.unmatched.push({
          input: inputFile,
          title: record.title,
          stopId: record.stopId,
          variant: record.variant
        });
      }
      continue;
    }

    if (resolved.reason === "exact") {
      summary.exact += 1;
    } else if (resolved.reason === "title") {
      summary.titleMapped += 1;
    }

    const key = `${resolved.stopId}::${record.variant}`;
    if (recordMap.has(key) && !args.replaceExisting) {
      summary.skippedExisting += 1;
      continue;
    }

    const nextRecord = toCatalogRow(record, resolved.stopId);
    if (recordMap.has(key)) {
      summary.updated += 1;
    } else {
      summary.imported += 1;
    }
    recordMap.set(key, nextRecord);
  }
}

const sortedRecords = Array.from(recordMap.values()).sort((left, right) => {
  if (left.stopId === right.stopId) {
    return left.variant.localeCompare(right.variant);
  }
  return left.stopId.localeCompare(right.stopId);
});

writeCatalogCsv(catalogPath, headers, sortedRecords);

console.log(JSON.stringify(summary, null, 2));
