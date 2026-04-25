import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync, spawnSync } from "node:child_process";
import { loadCityPack } from "./lib/city-pack.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

function parseArgs(argv) {
  const result = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) {
      continue;
    }

    const key = token.slice(2);
    const value = argv[index + 1];
    result[key] = value;
    index += 1;
  }
  return result;
}

const args = parseArgs(process.argv.slice(2));
const cityId = String(args.city || "").trim().toLowerCase();
const destDir = path.resolve(String(args.dest || ""));

if (!cityId || !destDir) {
  console.error("Usage: npm run city:export -- --city <city-id> --dest </absolute/path/to/repo>");
  process.exit(1);
}

const cityPack = loadCityPack(repoRoot, cityId);

fs.rmSync(destDir, { recursive: true, force: true });
fs.mkdirSync(destDir, { recursive: true });

const fileListPath = path.join(os.tmpdir(), `city-export-${cityId}-${Date.now()}.txt`);

try {
  const trackedAndWorkingFiles = execFileSync(
    "git",
    ["ls-files", "--cached", "--others", "--exclude-standard", "-z"],
    { cwd: repoRoot }
  );
  fs.writeFileSync(fileListPath, trackedAndWorkingFiles);

  execFileSync(
    "rsync",
    ["-a", "--from0", `--files-from=${fileListPath}`, `${repoRoot}/`, `${destDir}/`],
    { stdio: "inherit" }
  );
} finally {
  fs.rmSync(fileListPath, { force: true });
}

for (const entry of fs.readdirSync(path.join(destDir, "cities"))) {
  if (entry !== cityId) {
    fs.rmSync(path.join(destDir, "cities", entry), { recursive: true, force: true });
  }
}

const repoCity = {
  id: cityId,
  cloudflarePagesProjectName: cityPack.city.slug || cityId
};
fs.writeFileSync(path.join(destDir, "repo-city.json"), `${JSON.stringify(repoCity, null, 2)}\n`);

const packageJsonPath = path.join(destDir, "package.json");
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
packageJson.name = cityPack.city.slug || `${cityId}-tours`;
packageJson.scripts = {
  ...packageJson.scripts,
  deploy: "node scripts/deploy-city-webapp.mjs",
  "deploy:dry-run": "DRY_RUN=1 node scripts/deploy-city-webapp.mjs"
};
fs.writeFileSync(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);

fs.writeFileSync(
  path.join(destDir, "README.md"),
  [
    `# ${cityPack.city.name}`,
    "",
    `This repo is the single-city ${cityPack.city.cityName} product repo.`,
    "",
    "Safety rules:",
    `- it is locked to the \`${cityId}\` city pack`,
    `- \`npm run deploy\` targets the ${repoCity.cloudflarePagesProjectName} Pages project only`,
    "- if someone sets a different CITY, the build scripts fail fast",
    "",
    "Useful commands:",
    "- `npm run city:validate`",
    "- `npm run webapp:build`",
    "- `npm run webapp:serve`",
    "- `npm run deploy:dry-run`",
    "- `npm run deploy`",
    ""
  ].join("\n")
);

spawnSync(process.execPath, [path.join(destDir, "scripts", "generate-city-runtime-registry.mjs")], {
  cwd: destDir,
  stdio: "inherit"
});

console.log(`Exported ${cityId} repo to ${destDir}`);
