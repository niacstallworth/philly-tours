import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const repoRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const toursSourcePath = path.join(repoRoot, "src/data/tours.ts");

function parseCsvLine(line) {
  const values = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (char === "," && !inQuotes) {
      values.push(current);
      current = "";
      continue;
    }
    current += char;
  }

  values.push(current);
  return values.map((value) => value.trim());
}

function parseCsv(filePath) {
  const lines = fs
    .readFileSync(filePath, "utf8")
    .split(/\r?\n/)
    .filter(Boolean);

  const headers = parseCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
  });
}

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

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’']/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function getLocationFromDescription(description) {
  const match = String(description || "").match(/Location:\s*([^|]+)/i);
  return match ? match[1].trim() : "";
}

const categoryAliases = new Map([
  ["black american legacy and quaker heritage", "Black American Legacy & Quaker Heritage"],
  ["rainbow girls philadelphia", "Rainbow Girls Philadelphia"],
  ["black american sports", "Black American Sports"],
  ["black inventors tour", "Black Inventors Tour"],
  ["library story hop", "Library Story Hop Tour"],
  ["black medical legacy", "Black Medical Legacy"],
  ["eastern star weekend", "Eastern Star Weekend"],
  ["jobs daughters", "Job's Daughters"],
  ["masonic hunt", "Masonic Scavenger Hunt"],
  ["black architects", "Black Architects Tour"],
  ["septa broad street line", "SEPTA Broad Street Line"],
  ["philadelphia foundations", "Philadelphia Foundations"],
  ["move memorial", "MOVE Bombing Memorial"],
  ["art odyssey", "Philly Black Art Odyssey"],
  ["college hop", "College Hop Tour"],
  ["speakeasy", "Speakeasy Tour"]
]);

const stopAliases = new Map([
  ["presidents house liberty bell center", "President's House / Liberty Bell Center"],
  ["cedar grove and laurel hill", "Cedar Grove & Laurel Hill mansions"],
  ["sweetbriar mansion lawn", "Sweetbriar Mansion lawn"],
  ["allen iverson courts", "Allen Iverson's Hampton Park Courts"],
  ["joe fraziers gym", "Joe Frazier's Gym (Cloverlay)"],
  ["maxies pizza", "Maxie's Pizza"],
  ["south kitchen and jazz club", "South Kitchen & Jazz Club"],
  ["tustin playground", "Sonny Hill League @ Tustin"],
  ["granville t woods site", "Granville T. Woods Railway Site"],
  ["lewis latimer exhibit", "Lewis Latimer Light Bulb Exhibit"],
  ["garrett morgan signal", "Garrett Morgan Traffic Signal"],
  ["yellow fever site", "Yellow Fever Sites"],
  ["breakfast den", "The Breakfast Den"],
  ["laurel hill cemetery", "Robert H. Johnson Chapter No. 5"],
  ["green eggs cafe dickinson", "Green Eggs Café"],
  ["fisher fine arts library", "Penn Campus - Fisher Library"],
  ["saint josephs university", "Saint Joseph's University"],
  ["curtis institute", "Curtis Institute of Music"],
  ["community college of philadelphia", "Community College of Philly"],
  ["olney and 5th", "Olney Black History Markers"],
  ["hunting park", "Hunting Park Centers"],
  ["wyoming ave", "Wyoming Ave Business District"],
  ["susquehanna dauphin", "North Philly Black Metropolis"],
  ["cecil b moore", "Cecil B. Moore Mural"],
  ["rockland", "Rockland Black Churches"],
  ["berks arts district", "Berks Street Arts District"],
  ["walnut locust", "Julian Abele Sites"],
  ["6221 osage ave", "Osage Avenue"],
  ["mural arts start", "Mural Arts Tour"],
  ["ranstead room", "The Ranstead Room"],
  ["library bar", "The Library Bar"],
  ["charlie was a sinner", "Charlie Was A Sinner"],
  ["mask and wig club", "Mask and Wig Club"],
  ["midnight and the wicked", "Midnight & The Wicked"]
]);

function parseArgs(argv) {
  const args = { csv: "", write: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--csv") {
      args.csv = argv[i + 1] || "";
      i += 1;
    } else if (arg === "--write") {
      args.write = true;
    }
  }
  return args;
}

const args = parseArgs(process.argv.slice(2));
if (!args.csv) {
  console.error("Usage: node scripts/import-stop-coordinate-csv.mjs --csv /path/to/file.csv [--write]");
  process.exit(1);
}

const tours = evaluateModule(toursSourcePath, "__tours", /export const tours\s*:\s*Tour\[\]\s*=/);
const rows = parseCsv(path.resolve(args.csv));
const matches = [];
const unmatched = [];

for (const row of rows) {
  const category = categoryAliases.get(normalize(row.Category)) || row.Category;
  const tour = tours.find((candidate) => candidate.title === category);
  const aliasedTitle = stopAliases.get(normalize(row.Name));
  const categorySpecificTitle =
    category === "Philly Black Art Odyssey" && normalize(row.Name) === "pa academy of fine arts"
      ? "PA Academy Fine Arts"
      : undefined;
  const stop =
    tour?.stops.find((candidate) => candidate.title === row.Name) ||
    tour?.stops.find((candidate) => normalize(candidate.title) === normalize(row.Name)) ||
    (categorySpecificTitle
      ? tour?.stops.find((candidate) => candidate.title === categorySpecificTitle) ||
        tour?.stops.find((candidate) => normalize(candidate.title) === normalize(categorySpecificTitle))
      : undefined) ||
    (aliasedTitle
      ? tour?.stops.find((candidate) => candidate.title === aliasedTitle) ||
        tour?.stops.find((candidate) => normalize(candidate.title) === normalize(aliasedTitle))
      : undefined);

  if (!tour || !stop) {
    unmatched.push({
      category: row.Category,
      name: row.Name,
      resolvedCategory: category,
      resolvedTitle: categorySpecificTitle || aliasedTitle || row.Name
    });
    continue;
  }

  matches.push({
    tourTitle: tour.title,
    stopTitle: stop.title,
    stopId: stop.id,
    address: row.Address,
    lat: Number(row.Latitude),
    lng: Number(row.Longitude),
    currentLat: stop.lat,
    currentLng: stop.lng,
    currentCoordQuality: stop.coordQuality || "approximate"
  });
}

if (args.write) {
  let source = fs.readFileSync(toursSourcePath, "utf8");
  for (const match of matches) {
    const stopBlockPattern = new RegExp(`(\"id\": \"${match.stopId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\",[\\s\\S]*?\"description\": \")([^\"]+?)( \\| Location: )([^\"]+)(\",[\\s\\S]*?\"lat\": )(-?\\d+(?:\\.\\d+)?)(,[\\s\\S]*?\"lng\": )(-?\\d+(?:\\.\\d+)?)(,[\\s\\S]*?\"coordQuality\": \")([^\"]+)(\")`, "m");
    source = source.replace(
      stopBlockPattern,
      (_, prefix, beforeLocation, separator, _oldLocation, latPrefix, _oldLat, lngPrefix, _oldLng, qualityPrefix, _oldQuality, qualitySuffix) =>
        `${prefix}${beforeLocation}${separator}${match.address}${latPrefix}${match.lat}${lngPrefix}${match.lng}${qualityPrefix}verified${qualitySuffix}`
    );
  }
  fs.writeFileSync(toursSourcePath, source);
}

console.log(
  JSON.stringify(
    {
      csvRows: rows.length,
      matched: matches.length,
      unmatchedCount: unmatched.length,
      unmatched,
      sampleMatches: matches.slice(0, 25)
    },
    null,
    2
  )
);
