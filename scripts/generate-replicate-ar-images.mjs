import fs from "node:fs";
import path from "node:path";
import { readCatalogCsv, writeCatalogCsv } from "./lib/arAssetCatalogCsv.mjs";
import { buildProviderPrompt } from "./lib/arPromptBuilder.mjs";

const rootDir = process.cwd();
const csvPath = path.join(rootDir, "docs", "ar-asset-catalog.csv");
const outputDir = path.join(rootDir, "assets", "generated", "ar-references");
const defaultModel = process.env.REPLICATE_DEFAULT_MODEL?.trim() || "black-forest-labs/flux-pro";
const defaultAspectRatio = process.env.REPLICATE_DEFAULT_ASPECT_RATIO?.trim() || "3:2";
const defaultOutputFormat = process.env.REPLICATE_DEFAULT_OUTPUT_FORMAT?.trim() || "png";
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
  return buildProviderPrompt(record, "replicate", record.replicatePrompt);
}

function assertEnum(value, allowed, fieldName, record) {
  if (!allowed.has(value)) {
    throw new Error(`Unsupported ${fieldName} '${value}' for ${record.stopId}`);
  }
}

function splitModel(model) {
  const parts = model.split("/");
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    throw new Error(`Replicate model must be in owner/name format. Received '${model}'.`);
  }
  return {
    owner: parts[0],
    name: parts[1]
  };
}

async function downloadFile(url, relativePath) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Replicate image download failed: ${response.status} ${response.statusText}`);
  }

  const absolutePath = path.join(rootDir, relativePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  const bytes = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(absolutePath, bytes);
}

async function generateForRecord(record, apiToken) {
  const model = (record.replicateModel || defaultModel).trim() || defaultModel;
  const aspectRatio = (record.replicateAspectRatio || defaultAspectRatio).trim() || defaultAspectRatio;
  const outputFormat = (record.replicateOutputFormat || defaultOutputFormat).trim() || defaultOutputFormat;
  assertEnum(aspectRatio, ASPECT_RATIO_VALUES, "replicateAspectRatio", record);
  assertEnum(outputFormat, OUTPUT_FORMAT_VALUES, "replicateOutputFormat", record);
  const prompt = buildPrompt(record);
  const { owner, name } = splitModel(model);

  const response = await fetch(`https://api.replicate.com/v1/models/${owner}/${name}/predictions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
      Prefer: "wait"
    },
    body: JSON.stringify({
      input: {
        prompt,
        aspect_ratio: aspectRatio,
        output_format: outputFormat
      }
    })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Replicate generation failed for ${record.stopId}: ${response.status} ${body}`);
  }

  const prediction = await response.json();
  const output = Array.isArray(prediction.output) ? prediction.output[0] : prediction.output;
  if (!output || typeof output !== "string") {
    throw new Error(`Replicate returned no image output for ${record.stopId}`);
  }

  const outputPathRelative = resolveOutputPath(record).replace(/\.[a-z0-9]+$/i, `.${outputFormat}`);
  await downloadFile(output, outputPathRelative);

  return {
    ...record,
    generatedImageProvider: "replicate",
    replicateModel: model,
    replicatePrompt: prompt,
    replicateAspectRatio: aspectRatio,
    replicateOutputFormat: outputFormat,
    generatedImagePath: outputPathRelative
  };
}

async function main() {
  loadDotEnv();
  const apiToken = process.env.REPLICATE_API_TOKEN?.trim();
  if (!apiToken) {
    throw new Error("REPLICATE_API_TOKEN is required in the environment or .env");
  }

  fs.mkdirSync(outputDir, { recursive: true });
  const args = parseArgs(process.argv.slice(2));
  const { headers, records } = readCatalogCsv(csvPath);
  const nextHeaders = [...headers];
  for (const header of [
    "replicateModel",
    "replicatePrompt",
    "replicateAspectRatio",
    "replicateOutputFormat",
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
    console.log("No Replicate generation work to do.");
    return;
  }

  const updatedByStopId = new Map();
  for (const record of filteredRecords) {
    console.log(`Generating Replicate concept image for ${record.stopTitle}...`);
    const updated = await generateForRecord(record, apiToken);
    updatedByStopId.set(record.stopId, updated);
  }

  const nextRecords = records.map((record) => updatedByStopId.get(record.stopId) || record);
  writeCatalogCsv(csvPath, nextHeaders, nextRecords);
  console.log(`Generated ${updatedByStopId.size} Replicate concept image(s).`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
