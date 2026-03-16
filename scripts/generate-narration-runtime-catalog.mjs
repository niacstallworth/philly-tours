import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { readCatalogCsv } from "./lib/arAssetCatalogCsv.mjs";

const rootDir = process.cwd();
const csvPath = path.join(rootDir, "docs", "narration-script-catalog.csv");
const audioDir = path.join(rootDir, "assets", "audio");
const toursPath = path.join(rootDir, "src", "data", "tours.ts");
const outputPath = path.join(rootDir, "src", "data", "narrationCatalog.ts");

const { records } = readCatalogCsv(csvPath);
const audioFiles = new Set(
  fs.existsSync(audioDir)
    ? fs
        .readdirSync(audioDir, { withFileTypes: true })
        .filter((entry) => entry.isFile())
        .map((entry) => entry.name)
    : []
);

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function loadStopIndex() {
  const raw = fs.readFileSync(toursPath, "utf8");
  const match = raw.match(/export const tours: Tour\[\] = ([\s\S]*);\s*$/);
  if (!match) {
    throw new Error("Unable to parse tours from src/data/tours.ts");
  }
  const context = vm.createContext({});
  new vm.Script(`const tours = ${match[1]}; this.__tours = tours;`).runInContext(context);
  const byId = new Set();
  const byTitle = new Map();

  for (const tour of context.__tours) {
    for (const stop of tour.stops) {
      byId.add(stop.id);
      const key = normalize(stop.title);
      if (!byTitle.has(key)) {
        byTitle.set(key, []);
      }
      byTitle.get(key).push(stop.id);
    }
  }

  return { byId, byTitle };
}

const stopIndex = loadStopIndex();

const byStopId = new Map();

for (const record of records) {
  const rawStopId = String(record.stopId || "").trim();
  const variant = String(record.variant || "").trim();
  const title = String(record.title || "").trim();
  const outputFile = String(record.outputFile || "").trim();

  if (!rawStopId || !outputFile || (variant !== "drive" && variant !== "walk")) {
    continue;
  }

  let stopId = rawStopId;
  if (!stopIndex.byId.has(stopId)) {
    const titleMatches = stopIndex.byTitle.get(normalize(title)) || [];
    if (titleMatches.length === 1) {
      stopId = titleMatches[0];
    } else {
      continue;
    }
  }

  if (!audioFiles.has(outputFile)) {
    continue;
  }

  if (!byStopId.has(stopId)) {
    byStopId.set(stopId, {});
  }

  byStopId.get(stopId)[variant] = `/audio/${outputFile}`;
}

const sortedStopIds = Array.from(byStopId.keys()).sort((left, right) => left.localeCompare(right));
const lines = [
  'export type NarrationVariant = "drive" | "walk";',
  "",
  "export type NarrationCatalogEntry = {",
  "  drive?: string;",
  "  walk?: string;",
  "};",
  "",
  "export const narrationCatalogByStopId: Record<string, NarrationCatalogEntry> = {"
];

for (const stopId of sortedStopIds) {
  const entry = byStopId.get(stopId);
  lines.push(`  ${JSON.stringify(stopId)}: {`);
  if (entry.drive) {
    lines.push(`    drive: ${JSON.stringify(entry.drive)},`);
  }
  if (entry.walk) {
    lines.push(`    walk: ${JSON.stringify(entry.walk)},`);
  }
  lines.push("  },");
}

lines.push("};");
lines.push("");

fs.writeFileSync(outputPath, `${lines.join("\n")}\n`);

console.log(
  `Generated narration runtime catalog with ${sortedStopIds.length} stop entries from ${audioFiles.size} local audio file(s).`
);
