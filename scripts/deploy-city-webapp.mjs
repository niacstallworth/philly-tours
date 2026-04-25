import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { loadCityPack } from "./lib/city-pack.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const cityPack = loadCityPack(repoRoot);
const projectName =
  process.env.CLOUDFLARE_PAGES_PROJECT_NAME ||
  process.env.CF_PAGES_PROJECT_NAME ||
  cityPack.city.slug ||
  cityPack.cityId;

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    env: process.env,
    stdio: "inherit"
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

console.log(`Deploying city pack "${cityPack.cityId}" to Cloudflare Pages project "${projectName}"`);
run("npm", ["run", "webapp:build"]);
run("wrangler", ["pages", "deploy", "web-dist", "--project-name", projectName]);
