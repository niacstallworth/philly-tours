import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { readCatalogCsv, writeCatalogCsv } from "./lib/arAssetCatalogCsv.mjs";

const rootDir = process.cwd();
const toursPath = path.join(rootDir, "src", "data", "tours.ts");
const catalogPath = path.join(rootDir, "docs", "narration-script-catalog.csv");
const headers = ["stopId", "variant", "title", "outputFile", "voiceId", "engine", "textType", "text"];

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

function slugFromAudioUrl(audioUrl, stopId) {
  const base = String(audioUrl || "")
    .split("/")
    .pop();
  if (base && base.endsWith(".mp3")) {
    return base.slice(0, -4);
  }
  return String(stopId || "");
}

function splitDescription(description) {
  const parts = String(description || "")
    .split("|")
    .map((part) => part.trim())
    .filter(Boolean);
  const summary = parts[0] || "This site is part of the route.";
  const locationPart = parts.find((part) => part.toLowerCase().startsWith("location:")) || "";
  const location = locationPart ? locationPart.replace(/^location:\s*/i, "").trim() : "";
  return { summary, location };
}

function stripTrailingPunctuation(value) {
  return String(value || "")
    .trim()
    .replace(/[.\s]+$/, "");
}

function buildDriveText(stop) {
  const { summary, location } = splitDescription(stop.description);
  const summaryLine = stripTrailingPunctuation(summary);
  const locationLine = location ? ` This stop is at ${stripTrailingPunctuation(location)}.` : "";
  return `${stop.title} is ahead. ${summaryLine}.${locationLine} Slow down as you approach and continue on foot when it is safe for the full story.`;
}

function buildWalkText(stop) {
  const { summary, location } = splitDescription(stop.description);
  const summaryLine = stripTrailingPunctuation(summary);
  const locationLine = location ? ` You are at ${stripTrailingPunctuation(location)}.` : "";
  return `You are now at ${stop.title}. ${summaryLine}.${locationLine} Take a moment to look around and connect this stop to the larger story of the tour.`;
}

const tours = loadTours();
const { records } = readCatalogCsv(catalogPath);
const existingKeys = new Set(records.map((record) => `${record.stopId}::${record.variant}`));
const nextRecords = [...records];
let added = 0;

for (const tour of tours) {
  for (const stop of tour.stops) {
    const baseSlug = slugFromAudioUrl(stop.audioUrl, stop.id);
    for (const variant of ["drive", "walk"]) {
      const key = `${stop.id}::${variant}`;
      if (existingKeys.has(key)) {
        continue;
      }

      nextRecords.push({
        stopId: stop.id,
        variant,
        title: stop.title,
        outputFile: `${baseSlug}-${variant}.mp3`,
        voiceId: "Amy",
        engine: "neural",
        textType: "text",
        text: variant === "drive" ? buildDriveText(stop) : buildWalkText(stop)
      });
      existingKeys.add(key);
      added += 1;
    }
  }
}

nextRecords.sort((left, right) => {
  if (left.stopId === right.stopId) {
    return left.variant.localeCompare(right.variant);
  }
  return left.stopId.localeCompare(right.stopId);
});

writeCatalogCsv(catalogPath, headers, nextRecords);
console.log(`Seeded ${added} missing narration row(s). Catalog now has ${nextRecords.length} row(s).`);
