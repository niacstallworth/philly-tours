import fs from "node:fs";
import path from "node:path";
import { fal } from "@fal-ai/client";
import { readCatalogCsv, writeCatalogCsv } from "./lib/arAssetCatalogCsv.mjs";

const rootDir = process.cwd();
const csvPath = path.join(rootDir, "docs", "ar-asset-catalog.csv");
const outputDir = path.join(rootDir, "assets", "generated", "ar-references");
const defaultModel = process.env.FAL_DEFAULT_MODEL?.trim() || "fal-ai/flux/dev";
const defaultImageSize = process.env.FAL_DEFAULT_IMAGE_SIZE?.trim() || "landscape_4_3";
const IMAGE_SIZE_VALUES = new Set(["square_hd", "square", "portrait_4_3", "portrait_16_9", "landscape_4_3", "landscape_16_9"]);

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
      continue;
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
  return `assets/generated/ar-references/${sanitizeFileName(record.stopId)}.jpeg`;
}

function inferExtension(contentType, url) {
  if (contentType?.includes("png")) {
    return ".png";
  }
  if (contentType?.includes("webp")) {
    return ".webp";
  }
  if (contentType?.includes("jpeg") || contentType?.includes("jpg")) {
    return ".jpeg";
  }
  const pathname = new URL(url).pathname.toLowerCase();
  if (pathname.endsWith(".png")) {
    return ".png";
  }
  if (pathname.endsWith(".webp")) {
    return ".webp";
  }
  if (pathname.endsWith(".jpg") || pathname.endsWith(".jpeg")) {
    return ".jpeg";
  }
  return ".jpeg";
}

async function downloadFile(url, desiredRelativePath) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Image download failed: ${response.status} ${response.statusText}`);
  }

  const extension = inferExtension(response.headers.get("content-type"), url);
  const relativePathWithExt = desiredRelativePath.replace(/\.[a-z0-9]+$/i, "") + extension;
  const absolutePath = path.join(rootDir, relativePathWithExt);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  const bytes = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(absolutePath, bytes);
  return relativePathWithExt;
}

function buildPrompt(record) {
  if (record.falPrompt?.trim()) {
    return record.falPrompt.trim();
  }

  const arTypeLabel = (record.arType || "ar scene").replaceAll("_", " ");
  const assetBrief = (record.assetNeeded || "historic Philadelphia storytelling scene").trim();
  return `Concept art for an augmented reality ${arTypeLabel} experience at ${record.stopTitle} in Philadelphia. Show ${assetBrief}. Historically grounded. Strong composition for a mobile AR experience.`;
}

async function generateForRecord(record) {
  const model = (record.falModel || defaultModel).trim() || defaultModel;
  const imageSize = (record.falImageSize || defaultImageSize).trim() || defaultImageSize;
  if (!IMAGE_SIZE_VALUES.has(imageSize)) {
    throw new Error(`Unsupported fal image size '${imageSize}' for ${record.stopId}`);
  }

  const prompt = buildPrompt(record);
  const result = await fal.subscribe(model, {
    input: {
      prompt,
      image_size: imageSize,
      num_images: 1
    },
    logs: true
  });

  const image = result.data?.images?.[0];
  if (!image?.url) {
    throw new Error(`No image URL returned for ${record.stopId}`);
  }

  const outputPathRelative = resolveOutputPath(record);
  const savedRelativePath = await downloadFile(image.url, outputPathRelative);

  return {
    ...record,
    falModel: model,
    falPrompt: prompt,
    falImageSize: imageSize,
    generatedImagePath: savedRelativePath
  };
}

async function main() {
  loadDotEnv();

  const falKey = process.env.FAL_KEY?.trim();
  if (!falKey) {
    throw new Error("FAL_KEY is required in the environment or .env");
  }

  fal.config({
    credentials: falKey
  });

  fs.mkdirSync(outputDir, { recursive: true });
  const args = parseArgs(process.argv.slice(2));
  const { headers, records } = readCatalogCsv(csvPath);
  const nextHeaders = [...headers];
  for (const header of ["falModel", "falPrompt", "falImageSize", "generatedImagePath"]) {
    if (!nextHeaders.includes(header)) {
      nextHeaders.push(header);
    }
  }
  const filteredRecords = records
    .filter((record) => !args.stopId || record.stopId === args.stopId)
    .filter((record) => args.force || !fs.existsSync(path.join(rootDir, resolveOutputPath(record))))
    .slice(0, args.limit);

  if (filteredRecords.length === 0) {
    console.log("No fal generation work to do.");
    return;
  }

  const updatedByStopId = new Map();
  for (const record of filteredRecords) {
    console.log(`Generating fal concept image for ${record.stopTitle}...`);
    const updated = await generateForRecord(record);
    updatedByStopId.set(record.stopId, updated);
  }

  const nextRecords = records.map((record) => updatedByStopId.get(record.stopId) || record);
  writeCatalogCsv(csvPath, nextHeaders, nextRecords);
  console.log(`Generated ${updatedByStopId.size} fal concept image(s).`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
