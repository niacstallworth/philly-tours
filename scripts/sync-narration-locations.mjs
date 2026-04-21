import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const repoRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const toursPath = path.join(repoRoot, "src/data/tours.ts");
const narrationPath = path.join(repoRoot, "src/data/narrationScriptMap.ts");

function evaluateModule(filePath, exportName, replacement) {
  let source = fs.readFileSync(filePath, "utf8");
  source = source.replace(/^import .*\n/gm, "");
  source = source.replace(/^export type [^{=\n]+=\s*{[\s\S]*?^};\n/gm, "");
  source = source.replace(/^export type .*;\n/gm, "");
  source = source.replace(replacement, `globalThis.${exportName} =`);
  const context = { globalThis: {} };
  vm.createContext(context);
  vm.runInContext(source, context);
  return context.globalThis[exportName];
}

function extractLocation(description) {
  const match = String(description || "").match(/Location:\s*([^|]+)/i);
  return match ? match[1].trim() : "";
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function syncNarrationText(text, title, location) {
  let next = String(text || "");
  next = next.replace(
    /This stop is at .*?\. Slow down as you approach and continue on foot when it is safe for the full story\./g,
    `This stop is at ${location}. Slow down as you approach and continue on foot when it is safe for the full story.`
  );
  next = next.replace(
    /You are at .*?\. Take a moment to look around and connect this stop to the larger story of the tour\./g,
    `You are at ${location}. Take a moment to look around and connect this stop to the larger story of the tour.`
  );

  for (const titleVariant of [title, `The ${title}`]) {
    next = next.replace(
      new RegExp(
        `(${escapeRegex(titleVariant)}\\s+is ahead at )([^—]+?)(?=( —|, directly|, where|, the |, a |, an |\\.))`
      ),
      `$1${location}`
    );
    next = next.replace(
      new RegExp(
        `(${escapeRegex(titleVariant)}\\s+is at )([^—]+?)(?=( —|, directly|, where|, the |, a |, an |\\.))`
      ),
      `$1${location}`
    );
  }

  return next;
}

const tours = evaluateModule(toursPath, "__tours", /export const tours\s*:\s*Tour\[\]\s*=/);
const narration = evaluateModule(
  narrationPath,
  "__narration",
  /export const narrationScriptMapByStopId\s*:\s*Record<string,\s*NarrationScriptEntry>\s*=/
);

let updatedVariants = 0;
for (const tour of tours) {
  for (const stop of tour.stops || []) {
    const entry = narration[stop.id];
    if (!entry) {
      continue;
    }

    const location = extractLocation(stop.description);
    if (!location) {
      continue;
    }

    for (const variant of ["drive", "walk"]) {
      if (!entry[variant]) {
        continue;
      }
      const synced = syncNarrationText(entry[variant], stop.title, location);
      if (synced !== entry[variant]) {
        entry[variant] = synced;
        updatedVariants += 1;
      }
    }
  }
}

const output = [
  'export type NarrationScriptVariant = "drive" | "walk";',
  "",
  "export type NarrationScriptEntry = {",
  "  drive?: string;",
  "  walk?: string;",
  "};",
  "",
  `export const narrationScriptMapByStopId: Record<string, NarrationScriptEntry> = ${JSON.stringify(
    narration,
    null,
    2
  )};`,
  ""
].join("\n");

fs.writeFileSync(narrationPath, output);
console.log(JSON.stringify({ updatedVariants }, null, 2));
