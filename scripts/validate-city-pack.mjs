import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getActiveCityId } from "./lib/city-pack.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const citiesRoot = path.join(repoRoot, "cities");

const cityId = String(process.argv[2] || getActiveCityId(repoRoot)).trim();

if (!cityId) {
  console.error("Missing city id. Run `npm run city:validate` or pass an explicit city id.");
  process.exit(1);
}

const cityDir = path.join(citiesRoot, cityId);

function fail(message) {
  console.error(`FAIL ${message}`);
  process.exitCode = 1;
}

function pass(message) {
  console.log(`PASS ${message}`);
}

function readJson(relativePath) {
  const filePath = path.join(cityDir, relativePath);
  if (!fs.existsSync(filePath)) {
    fail(`Missing required file ${path.join("cities", cityId, relativePath)}`);
    return null;
  }

  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    fail(`Invalid JSON in ${path.join("cities", cityId, relativePath)}: ${error.message}`);
    return null;
  }
}

function requireString(object, field, label) {
  if (!object || typeof object[field] !== "string" || !object[field].trim()) {
    fail(`${label} must include non-empty string field "${field}"`);
    return;
  }
  pass(`${label} has "${field}"`);
}

function requireArray(object, field, label) {
  if (!object || !Array.isArray(object[field]) || object[field].length === 0) {
    fail(`${label} must include non-empty array field "${field}"`);
    return;
  }
  pass(`${label} has "${field}"`);
}

function requireObject(object, field, label) {
  if (!object || !object[field] || typeof object[field] !== "object" || Array.isArray(object[field])) {
    fail(`${label} must include object field "${field}"`);
    return null;
  }
  pass(`${label} has "${field}"`);
  return object[field];
}

console.log(`Validating city pack: ${cityId}`);
console.log("========================================");

if (!fs.existsSync(cityDir)) {
  fail(`Missing city directory ${path.join("cities", cityId)}`);
  process.exit(process.exitCode || 1);
}

pass(`Found city directory ${path.join("cities", cityId)}`);

const city = readJson("city.json");
const branding = readJson("branding.json");
const seo = readJson("seo.json");
const social = readJson("social.json");
const businessProfile = readJson("business-profile.json");
const tours = readJson("tours.json");
const narration = readJson("narration.json");
const ar = readJson("ar.json");

requireString(city, "id", "city.json");
requireString(city, "name", "city.json");
requireString(city, "cityName", "city.json");
requireString(city, "slug", "city.json");
requireString(city, "websiteOrigin", "city.json");
requireArray(city, "serviceArea", "city.json");

const defaultMapCenter = requireObject(city, "defaultMapCenter", "city.json");
if (defaultMapCenter) {
  if (typeof defaultMapCenter.lat !== "number") fail('city.json "defaultMapCenter.lat" must be a number');
  else pass('city.json has numeric "defaultMapCenter.lat"');
  if (typeof defaultMapCenter.lng !== "number") fail('city.json "defaultMapCenter.lng" must be a number');
  else pass('city.json has numeric "defaultMapCenter.lng"');
  if (typeof defaultMapCenter.zoom !== "number") fail('city.json "defaultMapCenter.zoom" must be a number');
  else pass('city.json has numeric "defaultMapCenter.zoom"');
}

requireString(branding, "heroEyebrow", "branding.json");
requireString(branding, "heroTitle", "branding.json");
requireString(branding, "heroBody", "branding.json");
requireString(branding, "primary", "branding.json");
requireString(branding, "secondary", "branding.json");

requireString(seo, "homeTitle", "seo.json");
requireString(seo, "homeDescription", "seo.json");
requireString(seo, "catalogTitle", "seo.json");
requireString(seo, "catalogDescription", "seo.json");
requireString(seo, "homePanelEyebrow", "seo.json");
requireString(seo, "homePanelTitle", "seo.json");
requireString(seo, "homePanelBody", "seo.json");
requireString(seo, "searchImage", "seo.json");
requireArray(seo, "organizationType", "seo.json");
requireArray(seo, "knowsAbout", "seo.json");
requireArray(seo, "homePanelHighlights", "seo.json");

if (!social || !Array.isArray(social.sameAs)) {
  fail('social.json must include array field "sameAs"');
} else {
  pass('social.json has "sameAs"');
}

requireString(businessProfile, "businessName", "business-profile.json");
requireString(businessProfile, "website", "business-profile.json");
requireString(businessProfile, "primaryCategory", "business-profile.json");
requireString(businessProfile, "shortDescription", "business-profile.json");
requireString(businessProfile, "fullDescription", "business-profile.json");

if (!Array.isArray(tours) || tours.length === 0) {
  fail('tours.json must be a non-empty array');
} else {
  pass('tours.json is a non-empty array');
  tours.forEach((tour, index) => {
    const label = `tours.json[${index}]`;
    requireString(tour, "id", label);
    requireString(tour, "title", label);
    if (typeof tour.durationMin !== "number") fail(`${label} must include numeric field "durationMin"`);
    else pass(`${label} has numeric "durationMin"`);
    if (typeof tour.distanceMiles !== "number") fail(`${label} must include numeric field "distanceMiles"`);
    else pass(`${label} has numeric "distanceMiles"`);
    requireArray(tour, "stops", label);

    if (tour.cardMedia) {
      const cardMedia = requireObject(tour, "cardMedia", label);
      if (cardMedia) {
        requireString(cardMedia, "type", `${label}.cardMedia`);
        requireString(cardMedia, "src", `${label}.cardMedia`);
      }
    }

    if (Array.isArray(tour.stops)) {
      tour.stops.forEach((stop, stopIndex) => {
        const stopLabel = `${label}.stops[${stopIndex}]`;
        requireString(stop, "id", stopLabel);
        requireString(stop, "title", stopLabel);
        requireString(stop, "description", stopLabel);
        if (typeof stop.lat !== "number") fail(`${stopLabel} must include numeric field "lat"`);
        else pass(`${stopLabel} has numeric "lat"`);
        if (typeof stop.lng !== "number") fail(`${stopLabel} must include numeric field "lng"`);
        else pass(`${stopLabel} has numeric "lng"`);
      });
    }
  });
}

if (
  !narration ||
  typeof narration !== "object" ||
  Array.isArray(narration) ||
  !narration.catalogByStopId ||
  typeof narration.catalogByStopId !== "object" ||
  Array.isArray(narration.catalogByStopId) ||
  !narration.scriptMapByStopId ||
  typeof narration.scriptMapByStopId !== "object" ||
  Array.isArray(narration.scriptMapByStopId)
) {
  fail('narration.json must include object fields "catalogByStopId" and "scriptMapByStopId"');
} else {
  pass('narration.json has "catalogByStopId"');
  pass('narration.json has "scriptMapByStopId"');
  const catalogKeys = Object.keys(narration.catalogByStopId);
  const scriptKeys = Object.keys(narration.scriptMapByStopId);
  if (catalogKeys.length === 0) fail('narration.json "catalogByStopId" must not be empty');
  else pass(`narration.json catalog has ${catalogKeys.length} entries`);
  if (scriptKeys.length === 0) fail('narration.json "scriptMapByStopId" must not be empty');
  else pass(`narration.json script map has ${scriptKeys.length} entries`);
}

if (!ar || typeof ar !== "object" || Array.isArray(ar) || Object.keys(ar).length === 0) {
  fail("ar.json must be a non-empty object keyed by stop id");
} else {
  pass(`ar.json has ${Object.keys(ar).length} stop entries`);
  const sampleEntry = Object.values(ar)[0];
  if (!sampleEntry || typeof sampleEntry !== "object" || Array.isArray(sampleEntry)) {
    fail("ar.json entries must be objects");
  } else {
    requireString(sampleEntry, "id", "ar.json sample entry");
    requireString(sampleEntry, "title", "ar.json sample entry");
    requireString(sampleEntry, "arType", "ar.json sample entry");
  }
}

if (!process.exitCode) {
  console.log("========================================");
  console.log(`City pack "${cityId}" passed validation.`);
}
