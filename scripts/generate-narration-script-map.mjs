import fs from "node:fs";
import path from "node:path";
import { readCatalogCsv } from "./lib/arAssetCatalogCsv.mjs";

const rootDir = process.cwd();
const csvPath = path.join(rootDir, "docs", "narration-script-catalog.csv");
const outputPath = path.join(rootDir, "src", "data", "narrationScriptMap.ts");

const { records } = readCatalogCsv(csvPath);
const allowedVariants = new Set(["drive", "walk"]);
const byStopId = new Map();

for (const record of records) {
  const stopId = String(record.stopId || "").trim();
  const variant = String(record.variant || "").trim();
  const text = String(record.text || "").trim();
  if (!stopId || !allowedVariants.has(variant) || !text) {
    continue;
  }

  if (!byStopId.has(stopId)) {
    byStopId.set(stopId, {});
  }

  byStopId.get(stopId)[variant] = text;
}

const sortedStopIds = Array.from(byStopId.keys()).sort((left, right) => left.localeCompare(right));
const lines = [
  'export type NarrationScriptVariant = "drive" | "walk";',
  "",
  "export type NarrationScriptEntry = {",
  "  drive?: string;",
  "  walk?: string;",
  "};",
  "",
  "export const narrationScriptMapByStopId: Record<string, NarrationScriptEntry> = {"
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

console.log(`Generated narration script map with ${sortedStopIds.length} stop entries.`);
