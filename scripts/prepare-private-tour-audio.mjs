import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";

const repoRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");

function parseArgs(argv) {
  const args = {
    file: path.join(repoRoot, "private-content", "catalog.json"),
    voiceId: process.env.POLLY_DEFAULT_VOICE_ID || "Amy",
    engine: process.env.POLLY_DEFAULT_ENGINE || "neural"
  };
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === "--file" && argv[index + 1]) {
      args.file = path.resolve(repoRoot, argv[index + 1]);
      index += 1;
      continue;
    }
    if (value === "--voice-id" && argv[index + 1]) {
      args.voiceId = String(argv[index + 1]).trim();
      index += 1;
      continue;
    }
    if (value === "--engine" && argv[index + 1]) {
      args.engine = String(argv[index + 1]).trim();
      index += 1;
    }
  }
  return args;
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function loadCatalog(filePath) {
  assert(fs.existsSync(filePath), `Private catalog file not found: ${filePath}`);
  const parsed = JSON.parse(fs.readFileSync(filePath, "utf8"));
  assert(parsed && typeof parsed === "object", "Private catalog must be a JSON object.");
  assert(Array.isArray(parsed.tours) && parsed.tours.length > 0, "Private catalog must contain at least one tour.");
  return parsed;
}

function runNodeScript(scriptName, scriptArgs) {
  const result = spawnSync("node", [path.join(repoRoot, "scripts", scriptName), ...scriptArgs], {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: "pipe"
  });

  if (result.stdout) {
    process.stdout.write(result.stdout);
  }
  if (result.stderr) {
    process.stderr.write(result.stderr);
  }
  if (result.status !== 0) {
    throw new Error(`${scriptName} failed with exit code ${result.status}.`);
  }
}

function hasAwsCredentials() {
  return Boolean(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);
}

const args = parseArgs(process.argv.slice(2));
const catalog = loadCatalog(args.file);
const tour = catalog.tours[0];
const tourId = String(tour.id || "").trim();
assert(tourId, "Primary tour is missing an id.");

const csvPath = path.join(repoRoot, "private-content", "exports", `${tourId}-narration-script-catalog.csv`);
const linesDir = path.join(repoRoot, "private-content", "exports", `${tourId}-narration-lines`);
const audioDir = path.join(repoRoot, "private-content", "assets", "tour-audio-private", "audio", tourId);

runNodeScript("export-private-tour-narration-catalog.mjs", [
  "--file",
  args.file,
  "--out-csv",
  csvPath,
  "--out-dir",
  linesDir,
  "--voice-id",
  args.voiceId,
  "--engine",
  args.engine
]);

runNodeScript("scaffold-private-asset-tree.mjs", [
  "--file",
  args.file,
  "--kind",
  "audio"
]);

runNodeScript("generate-polly-narration.mjs", [
  "--csv",
  csvPath,
  "--output-dir",
  audioDir,
  "--dry-run"
]);

console.log("");
console.log(`Audio workspace prepared for ${tourId}.`);
console.log(`Narration CSV: ${path.relative(repoRoot, csvPath)}`);
console.log(`Narration lines: ${path.relative(repoRoot, linesDir)}`);
console.log(`Audio folder: ${path.relative(repoRoot, audioDir)}`);
console.log("");

if (hasAwsCredentials()) {
  console.log("AWS Polly credentials detected. Next command:");
  console.log(
    `npm run narration:polly -- --csv ${path.relative(repoRoot, csvPath)} --output-dir ${path.relative(repoRoot, audioDir)}`
  );
} else {
  console.log("AWS Polly credentials are not loaded in this shell. Next options:");
  console.log("1. Record or generate MP3s manually using the exported line files.");
  console.log("2. Load AWS Polly credentials, then run:");
  console.log(
    `npm run narration:polly -- --csv ${path.relative(repoRoot, csvPath)} --output-dir ${path.relative(repoRoot, audioDir)}`
  );
}
console.log("3. Upload completed MP3s with:");
console.log(
  `npm run content:upload:private-assets -- --file ${path.relative(repoRoot, args.file)} --kind audio`
);
