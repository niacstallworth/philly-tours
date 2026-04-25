import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { loadCityPack } from "./lib/city-pack.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const outputDir = path.join(repoRoot, "web-dist");
const releaseDir = path.join(repoRoot, "web-release");
const cityPack = loadCityPack(repoRoot);
const zipSlug = cityPack.city.slug || cityPack.cityId;
const siteName = cityPack.city.name || cityPack.cityId;
const websiteOrigin = cityPack.city.websiteOrigin || "";
const zipPath = path.join(releaseDir, `${zipSlug}-webapp.zip`);

if (!fs.existsSync(outputDir)) {
  throw new Error("web-dist does not exist. Run `npm run webapp:build` first.");
}

fs.rmSync(releaseDir, { recursive: true, force: true });
fs.mkdirSync(releaseDir, { recursive: true });

execFileSync("zip", ["-rq", zipPath, "."], {
  cwd: outputDir,
  stdio: "inherit"
});

fs.writeFileSync(
  path.join(releaseDir, "README.txt"),
  [
    `${siteName} static release`,
    "",
    "Upload either:",
    "- the contents of web-dist/",
    "- or this zip file if your host accepts zipped static site uploads",
    "",
    "Active city pack:",
    `- ${cityPack.cityId}`,
    "",
    "Primary domain:",
    `- ${websiteOrigin || "Set websiteOrigin in cities/<city>/city.json"}`,
    ""
  ].join("\n")
);

console.log(`Packaged Cloudflare upload artifact at ${path.relative(repoRoot, zipPath)}`);
