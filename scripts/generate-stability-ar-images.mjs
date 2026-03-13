import fs from "node:fs";
import path from "node:path";
import { readCatalogCsv, writeCatalogCsv } from "./lib/arAssetCatalogCsv.mjs";
import { buildProviderPrompt } from "./lib/arPromptBuilder.mjs";

const rootDir = process.cwd();
const csvPath = path.join(rootDir, "docs", "ar-asset-catalog.csv");
const outputDir = path.join(rootDir, "assets", "generated", "ar-references");
const defaultEndpoint = process.env.STABILITY_DEFAULT_ENDPOINT?.trim() || "core";
const defaultAspectRatio = process.env.STABILITY_DEFAULT_ASPECT_RATIO?.trim() || "3:2";
const defaultOutputFormat = process.env.STABILITY_DEFAULT_OUTPUT_FORMAT?.trim() || "png";
const ENDPOINT_VALUES = new Set(["core", "ultra"]);
const ASPECT_RATIO_VALUES = new Set(["21:9", "16:9", "3:2", "5:4", "1:1", "4:5", "2:3", "9:16", "9:21"]);
const OUTPUT_FORMAT_VALUES = new Set(["png", "jpeg", "webp"]);

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

function parseArgs(argv) {
  const args = {
    force: false,
    stopId: "",
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
    if (value === "--limit") {
      const parsed = Number(argv[index + 1] || "");
      if (!Number.isFinite(parsed) || parsed <= 0) {
        throw new Error("--limit must be a positive number");
      }
      args.limit = parsed;
      index += 1;
    }
  }

  return args;
}

function sanitizeFileName(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function resolveOutputPath(record) {
  if (record.generatedImagePath?.trim()) {
    return record.generatedImagePath.trim();
  }
  return `assets/generated/ar-references/${sanitizeFileName(record.stopId)}.png`;
}

function buildPrompt(record) {
  return buildProviderPrompt(record, "stability", record.stabilityPrompt);
}

function assertEnum(value, allowed, fieldName, record) {
  if (!allowed.has(value)) {
    throw new Error(`Unsupported ${fieldName} '${value}' for ${record.stopId}`);
  }
}

async function generateForRecord(record, apiKey) {
  const endpoint = (record.stabilityEndpoint || defaultEndpoint).trim() || defaultEndpoint;
  const aspectRatio = (record.stabilityAspectRatio || defaultAspectRatio).trim() || defaultAspectRatio;
  const outputFormat = (record.stabilityOutputFormat || defaultOutputFormat).trim() || defaultOutputFormat;

  assertEnum(endpoint, ENDPOINT_VALUES, "stabilityEndpoint", record);
  assertEnum(aspectRatio, ASPECT_RATIO_VALUES, "stabilityAspectRatio", record);
  assertEnum(outputFormat, OUTPUT_FORMAT_VALUES, "stabilityOutputFormat", record);

  const prompt = buildPrompt(record);
  const form = new FormData();
  form.set("prompt", prompt);
  form.set("aspect_ratio", aspectRatio);
  form.set("output_format", outputFormat);

  const response = await fetch(`https://api.stability.ai/v2beta/stable-image/generate/${endpoint}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "image/*"
    },
    body: form
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Stability generation failed for ${record.stopId}: ${response.status} ${body}`);
  }

  const outputPathRelative = resolveOutputPath(record).replace(/\.[a-z0-9]+$/i, `.${outputFormat}`);
  const absolutePath = path.join(rootDir, outputPathRelative);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  const bytes = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(absolutePath, bytes);

  return {
    ...record,
    generatedImageProvider: "stability",
    stabilityEndpoint: endpoint,
    stabilityPrompt: prompt,
    stabilityAspectRatio: aspectRatio,
    stabilityOutputFormat: outputFormat,
    generatedImagePath: outputPathRelative
  };
}

async function main() {
  loadDotEnv();

  const apiKey = process.env.STABILITY_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("STABILITY_API_KEY is required in the environment or .env");
  }

  fs.mkdirSync(outputDir, { recursive: true });
  const args = parseArgs(process.argv.slice(2));
  const { headers, records } = readCatalogCsv(csvPath);
  const nextHeaders = [...headers];
  for (const header of [
    "stabilityEndpoint",
    "stabilityPrompt",
    "stabilityAspectRatio",
    "stabilityOutputFormat",
    "generatedImagePath"
  ]) {
    if (!nextHeaders.includes(header)) {
      nextHeaders.push(header);
    }
  }

  const filteredRecords = records
    .filter((record) => !args.stopId || record.stopId === args.stopId)
    .filter((record) => args.force || !fs.existsSync(path.join(rootDir, resolveOutputPath(record))))
    .slice(0, args.limit);

  if (filteredRecords.length === 0) {
    console.log("No Stability generation work to do.");
    return;
  }

  const updatedByStopId = new Map();
  for (const record of filteredRecords) {
    console.log(`Generating Stability concept image for ${record.stopTitle}...`);
    const updated = await generateForRecord(record, apiKey);
    updatedByStopId.set(record.stopId, updated);
  }

  const nextRecords = records.map((record) => updatedByStopId.get(record.stopId) || record);
  writeCatalogCsv(csvPath, nextHeaders, nextRecords);
  console.log(`Generated ${updatedByStopId.size} Stability concept image(s).`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
