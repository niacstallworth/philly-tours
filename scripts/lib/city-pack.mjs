import fs from "node:fs";
import path from "node:path";

export function loadRepoCityConfig(repoRoot) {
  const configPath = path.join(repoRoot, "repo-city.json");
  if (!fs.existsSync(configPath)) {
    return null;
  }

  return JSON.parse(fs.readFileSync(configPath, "utf8"));
}

export function getActiveCityId(repoRoot = process.cwd()) {
  const repoCity = loadRepoCityConfig(repoRoot);
  const fixedCityId = String(repoCity?.id || "").trim().toLowerCase();
  const requestedCityId = String(process.env.CITY || "").trim().toLowerCase();
  const resolvedCityId = requestedCityId || fixedCityId || "philly";

  if (fixedCityId && requestedCityId && requestedCityId !== fixedCityId) {
    throw new Error(
      `This repo is locked to city "${fixedCityId}". Refusing requested CITY="${requestedCityId}".`
    );
  }

  return resolvedCityId;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function readOptionalJson(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }
  return readJson(filePath);
}

export function loadCityPack(repoRoot, cityId = getActiveCityId(repoRoot)) {
  const cityDir = path.join(repoRoot, "cities", cityId);
  if (!fs.existsSync(cityDir)) {
    throw new Error(`Missing city pack directory: ${path.relative(repoRoot, cityDir)}`);
  }

  return {
    cityId,
    cityDir,
    city: readJson(path.join(cityDir, "city.json")),
    branding: readJson(path.join(cityDir, "branding.json")),
    seo: readJson(path.join(cityDir, "seo.json")),
    social: readJson(path.join(cityDir, "social.json")),
    businessProfile: readJson(path.join(cityDir, "business-profile.json")),
    tours: readOptionalJson(path.join(cityDir, "tours.json")),
    narration: readOptionalJson(path.join(cityDir, "narration.json")),
    ar: readOptionalJson(path.join(cityDir, "ar.json"))
  };
}
