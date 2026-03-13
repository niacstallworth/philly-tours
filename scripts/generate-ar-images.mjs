import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { readCatalogCsv } from "./lib/arAssetCatalogCsv.mjs";
import { IMAGE_PROVIDER_VALUES, resolveFallbackImageProvider, resolveImageProvider } from "./lib/arImageRouting.mjs";

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

  return result.status ?? 1;
}

function scriptForProvider(provider) {
  switch (provider) {
    case "fal":
      return "generate-fal-ar-images.mjs";
    case "stability":
      return "generate-stability-ar-images.mjs";
    case "replicate":
      return "generate-replicate-ar-images.mjs";
    default:
      throw new Error(`Unsupported provider '${provider}'`);
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
      resolvedProvider: resolveImageProvider(record),
      resolvedFallbackProvider: resolveFallbackImageProvider(record)
    }))
    .filter((record) => !args.provider || record.resolvedProvider === args.provider)
    .slice(0, args.limit);

  if (selected.length === 0) {
    console.log("No routed image-generation work to do.");
    return;
  }

  const fallbackRows = [];

  for (const record of selected) {
    const scriptArgs = ["--stop-id", record.stopId];
    if (args.force) {
      scriptArgs.push("--force");
    }

    const primaryStatus = runNodeScript(scriptForProvider(record.resolvedProvider), scriptArgs);
    if (primaryStatus === 0) {
      continue;
    }

    if (!record.resolvedFallbackProvider || record.resolvedFallbackProvider === record.resolvedProvider) {
      throw new Error(`Primary provider '${record.resolvedProvider}' failed for ${record.stopId} with no usable fallback.`);
    }

    console.log(
      `Primary provider '${record.resolvedProvider}' failed for ${record.stopTitle}. Falling back to '${record.resolvedFallbackProvider}'.`
    );
    const fallbackStatus = runNodeScript(scriptForProvider(record.resolvedFallbackProvider), scriptArgs);
    if (fallbackStatus !== 0) {
      throw new Error(
        `Fallback provider '${record.resolvedFallbackProvider}' also failed for ${record.stopId}.`
      );
    }
    fallbackRows.push(`${record.stopTitle}: ${record.resolvedProvider} -> ${record.resolvedFallbackProvider}`);
  }

  runNodeScript("import-ar-asset-catalog.mjs", []);

  if (fallbackRows.length > 0) {
    console.log("Fallback provider used for:");
    for (const line of fallbackRows) {
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
