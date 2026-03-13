import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { readCatalogCsv } from "./lib/arAssetCatalogCsv.mjs";
import { IMAGE_PROVIDER_VALUES, resolveImageProvider } from "./lib/arImageRouting.mjs";

const rootDir = process.cwd();
const csvPath = path.join(rootDir, "docs", "ar-asset-catalog.csv");

function parseArgs(argv) {
  const args = {
    force: false,
    stopId: "",
    provider: "",
    limit: Number.POSITIVE_INFINITY
  };

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === "--force") {
      args.force = true;
      continue;
    }
    if (value === "--stop-id") {
      args.stopId = argv[index + 1] || "";
      index += 1;
      continue;
    }
    if (value === "--provider") {
      args.provider = argv[index + 1] || "";
      index += 1;
      continue;
    }
    if (value === "--limit") {
      const parsed = Number(argv[index + 1] || "");
      if (!Number.isFinite(parsed) || parsed <= 0) {
        throw new Error("--limit must be a positive number");
      }
      args.limit = parsed;
      index += 1;
      continue;
    }
  }

  return args;
}

function loadDotEnv() {
  const envPath = path.join(rootDir, ".env");
  if (!fs.existsSync(envPath)) {
    return;
  }

  const raw = fs.readFileSync(envPath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    if (!line || line.trim().startsWith("#")) {
      continue;
    }
    const separatorIndex = line.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }
    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) {
      process.env[key] = value.replace(/\\n/g, "\n");
    }
  }
}

function runNodeScript(scriptName, extraArgs) {
  const result = spawnSync(process.execPath, [path.join(rootDir, "scripts", scriptName), ...extraArgs], {
    cwd: rootDir,
    stdio: "inherit",
    env: process.env
  });

  if (result.status !== 0) {
    throw new Error(`${scriptName} failed with exit code ${result.status ?? "unknown"}`);
  }
}

function main() {
  loadDotEnv();
  const args = parseArgs(process.argv.slice(2));
  if (args.provider && !IMAGE_PROVIDER_VALUES.has(args.provider)) {
    throw new Error(`--provider must be one of ${Array.from(IMAGE_PROVIDER_VALUES).join(", ")}`);
  }

  const { records } = readCatalogCsv(csvPath);
  const selected = records
    .filter((record) => !args.stopId || record.stopId === args.stopId)
    .map((record) => ({
      ...record,
      resolvedProvider: resolveImageProvider(record)
    }))
    .filter((record) => !args.provider || record.resolvedProvider === args.provider)
    .slice(0, args.limit);

  if (selected.length === 0) {
    console.log("No routed image-generation work to do.");
    return;
  }

  const skippedReplicate = [];

  for (const record of selected) {
    if (record.resolvedProvider === "fal") {
      const scriptArgs = ["--stop-id", record.stopId];
      if (args.force) {
        scriptArgs.push("--force");
      }
      runNodeScript("generate-fal-ar-images.mjs", scriptArgs);
      continue;
    }

    if (record.resolvedProvider === "stability") {
      const scriptArgs = ["--stop-id", record.stopId];
      if (args.force) {
        scriptArgs.push("--force");
      }
      runNodeScript("generate-stability-ar-images.mjs", scriptArgs);
      continue;
    }

    if (record.resolvedProvider === "replicate") {
      skippedReplicate.push(`${record.stopTitle} (${record.stopId})`);
      continue;
    }
  }

  runNodeScript("import-ar-asset-catalog.mjs", []);

  if (skippedReplicate.length > 0) {
    console.log("Replicate routing selected for these stops, but Replicate is not wired yet:");
    for (const line of skippedReplicate) {
      console.log(`- ${line}`);
    }
  }
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
