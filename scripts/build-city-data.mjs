import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { loadCityPack } from "./lib/city-pack.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const cityPack = loadCityPack(repoRoot);

console.log(`Building browser data for city pack: ${cityPack.cityId}`);

const result = spawnSync(process.execPath, [path.join(repoRoot, "scripts", "build-webapp-data.mjs")], {
  cwd: repoRoot,
  env: process.env,
  stdio: "inherit"
});

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}
