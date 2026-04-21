import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const repoRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const toursSourcePath = path.join(repoRoot, "src/data/tours.ts");

function loadDotEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }
    const eqIndex = line.indexOf("=");
    if (eqIndex <= 0) {
      continue;
    }
    const key = line.slice(0, eqIndex).trim();
    let value = line.slice(eqIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] == null) {
      process.env[key] = value;
    }
  }
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

  if (!lines.length) {
    return [];
  }

  const headers = parseCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
  });
}

function getLocationFromDescription(description) {
  const match = String(description || "").match(/Location:\s*([^|]+)/i);
  return match ? match[1].trim() : "";
}

function normalizeStopRecord(stop, tour) {
  return {
    source: "tour",
    tourId: tour.id,
    tourTitle: tour.title,
    stopId: stop.id,
    stopTitle: stop.title,
    location: getLocationFromDescription(stop.description),
    lat: stop.lat,
    lng: stop.lng,
    coordQuality: stop.coordQuality || "approximate"
  };
}

function loadTours() {
  return evaluateModule(toursSourcePath, "__tours", /export const tours\s*:\s*Tour\[\]\s*=/);
}

function parseArgs(argv) {
  const args = {
    csv: "",
    tour: "",
    stop: "",
    source: "census",
    limit: 0,
    onlyApproximate: false
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--csv") {
      args.csv = argv[i + 1] || "";
      i += 1;
    } else if (arg === "--tour") {
      args.tour = argv[i + 1] || "";
      i += 1;
    } else if (arg === "--stop") {
      args.stop = argv[i + 1] || "";
      i += 1;
    } else if (arg === "--source") {
      args.source = argv[i + 1] || "census";
      i += 1;
    } else if (arg === "--limit") {
      args.limit = Number(argv[i + 1] || 0);
      i += 1;
    } else if (arg === "--only-approximate") {
      args.onlyApproximate = true;
    }
  }

  return args;
}

async function geocodeWithCensus(query) {
  const url = `https://geocoding.geo.census.gov/geocoder/locations/onelineaddress?address=${encodeURIComponent(query)}&benchmark=Public_AR_Current&format=json`;
  const response = await fetch(url);
  if (!response.ok) {
    return { status: `http_${response.status}`, match: null };
  }
  const payload = await response.json();
  const match = payload?.result?.addressMatches?.[0];
  return {
    status: match ? "ok" : "no_match",
    match: match
      ? {
          address: match.matchedAddress,
          lat: match.coordinates.y,
          lng: match.coordinates.x
        }
      : null
  };
}

async function geocodeWithGoogle(query) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.EXPO_PUBLIC_GOOGLE_MAPS_JS_API_KEY || "";
  if (!apiKey) {
    return { status: "missing_google_key", match: null };
  }

  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${encodeURIComponent(apiKey)}`;
  const response = await fetch(url);
  if (!response.ok) {
    return { status: `http_${response.status}`, match: null };
  }
  const payload = await response.json();
  const result = payload?.results?.[0];
  return {
    status: payload?.status || "unknown",
    match: result
      ? {
          address: result.formatted_address,
          lat: result.geometry.location.lat,
          lng: result.geometry.location.lng
        }
      : null
  };
}

async function geocode(query, source) {
  if (source === "google") {
    return geocodeWithGoogle(query);
  }
  return geocodeWithCensus(query);
}

function buildPatchSuggestion(record, geocodeResult) {
  if (!record.source || record.source !== "tour" || !geocodeResult.match) {
    return null;
  }

  return {
    stopId: record.stopId,
    location: record.location,
    suggestion: {
      lat: geocodeResult.match.lat,
      lng: geocodeResult.match.lng,
      coordQuality: /block|district|area|campus|park|various/i.test(record.location) ? "approximate" : "verified"
    }
  };
}

function filterRecords(records, args) {
  return records.filter((record) => {
    if (args.tour && record.tourId !== args.tour) {
      return false;
    }
    if (args.stop && record.stopId !== args.stop) {
      return false;
    }
    if (args.onlyApproximate && record.coordQuality !== "approximate") {
      return false;
    }
    return Boolean(record.location);
  });
}

loadDotEnvFile(path.join(repoRoot, "server.local.env"));
loadDotEnvFile(path.join(repoRoot, ".env.server.local"));
loadDotEnvFile(path.join(repoRoot, ".env.server"));
loadDotEnvFile(path.join(repoRoot, ".env.production.local"));
loadDotEnvFile(path.join(repoRoot, ".env.web.local"));
loadDotEnvFile(path.join(repoRoot, ".env.local"));
loadDotEnvFile(path.join(repoRoot, ".env"));

const args = parseArgs(process.argv.slice(2));
const records = args.csv
  ? parseCsv(path.resolve(args.csv)).map((row) => ({
      source: "csv",
      stopTitle: row.Name || row.name || "",
      stopId: row.id || "",
      location: row.Address || row.address || "",
      lat: Number(row.Latitude || row.latitude || 0),
      lng: Number(row.Longitude || row.longitude || 0),
      coordQuality: row.coordQuality || "approximate"
    }))
  : loadTours().flatMap((tour) => tour.stops.map((stop) => normalizeStopRecord(stop, tour)));

const filteredRecords = filterRecords(records, args);
const limitedRecords = args.limit > 0 ? filteredRecords.slice(0, args.limit) : filteredRecords;
const results = [];

for (const record of limitedRecords) {
  const geocodeResult = await geocode(record.location, args.source);
  results.push({
    ...record,
    geocode: geocodeResult,
    patchSuggestion: buildPatchSuggestion(record, geocodeResult)
  });
}

console.log(
  JSON.stringify(
    {
      source: args.csv ? "csv" : "tour-data",
      geocoder: args.source,
      count: results.length,
      results
    },
    null,
    2
  )
);
