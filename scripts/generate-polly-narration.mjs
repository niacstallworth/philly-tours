import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { PollyClient, SynthesizeSpeechCommand } from "@aws-sdk/client-polly";
import { readCatalogCsv } from "./lib/arAssetCatalogCsv.mjs";

const rootDir = process.cwd();
const csvPath = path.join(rootDir, "docs", "narration-script-catalog.csv");
const outputDir = path.join(rootDir, "assets", "audio");
const allowedEngines = new Set(["standard", "neural", "long-form", "generative"]);
const allowedTextTypes = new Set(["text", "ssml"]);
const homeDir = process.env.HOME || "";

function loadDotEnv(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }
  for (const rawLine of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }
    const idx = line.indexOf("=");
    if (idx <= 0) {
      continue;
    }
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (process.env[key] == null) {
      process.env[key] = value;
    }
  }
}

function parseArgs(argv) {
  const args = { limit: null, stopId: null, variant: null, force: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--limit") {
      args.limit = Number(argv[i + 1] || "0") || null;
      i += 1;
      continue;
    }
    if (arg === "--stop-id") {
      args.stopId = argv[i + 1] || null;
      i += 1;
      continue;
    }
    if (arg === "--variant") {
      args.variant = argv[i + 1] || null;
      i += 1;
      continue;
    }
    if (arg === "--force") {
      args.force = true;
    }
  }
  return args;
}

function toRow(record) {
  const row = {
    stopId: String(record.stopId || "").trim(),
    variant: String(record.variant || "").trim(),
    title: String(record.title || "").trim(),
    outputFile: String(record.outputFile || "").trim(),
    voiceId: String(record.voiceId || process.env.POLLY_DEFAULT_VOICE_ID || "Amy").trim(),
    engine: String(record.engine || process.env.POLLY_DEFAULT_ENGINE || "neural").trim(),
    textType: String(record.textType || "text").trim(),
    text: String(record.text || "").trim()
  };

  if (!row.stopId) {
    throw new Error("Narration row missing stopId.");
  }
  if (!row.variant) {
    throw new Error(`Narration row for ${row.stopId} is missing variant.`);
  }
  if (!["drive", "walk"].includes(row.variant)) {
    throw new Error(`Narration row ${row.stopId}/${row.variant} has invalid variant.`);
  }
  if (!row.outputFile) {
    throw new Error(`Narration row ${row.stopId}/${row.variant} is missing outputFile.`);
  }
  if (!allowedEngines.has(row.engine)) {
    throw new Error(`Narration row ${row.stopId}/${row.variant} has invalid engine ${row.engine}.`);
  }
  if (!allowedTextTypes.has(row.textType)) {
    throw new Error(`Narration row ${row.stopId}/${row.variant} has invalid textType ${row.textType}.`);
  }
  if (!row.text) {
    throw new Error(`Narration row ${row.stopId}/${row.variant} is missing text.`);
  }

  return row;
}

async function audioStreamToBuffer(stream) {
  if (!stream) {
    throw new Error("Polly returned no audio stream.");
  }
  if (typeof stream.transformToByteArray === "function") {
    const bytes = await stream.transformToByteArray();
    return Buffer.from(bytes);
  }
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

loadDotEnv(path.join(rootDir, ".env"));

const region = process.env.AWS_REGION || process.env.POLLY_AWS_REGION || "us-east-1";
const profile = process.env.AWS_PROFILE || process.env.POLLY_AWS_PROFILE || null;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID || "";
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || "";
const awsCredentialsPath = homeDir ? path.join(homeDir, ".aws", "credentials") : "";
const awsConfigPath = homeDir ? path.join(homeDir, ".aws", "config") : "";

if (!profile && !(accessKeyId && secretAccessKey)) {
  throw new Error(
    "AWS Polly credentials are not configured. Set AWS_PROFILE in .env and ensure ~/.aws/credentials exists, or set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in .env."
  );
}

if (profile && !fs.existsSync(awsCredentialsPath) && !fs.existsSync(awsConfigPath) && !(accessKeyId && secretAccessKey)) {
  throw new Error(
    `AWS_PROFILE is set to ${profile}, but no AWS profile files were found at ~/.aws/config or ~/.aws/credentials. Create that profile or add AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY to .env.`
  );
}

if (profile) {
  process.env.AWS_PROFILE = profile;
  process.env.AWS_SDK_LOAD_CONFIG = process.env.AWS_SDK_LOAD_CONFIG || "1";
}
const client = new PollyClient({ region });
const args = parseArgs(process.argv.slice(2));
const { records } = readCatalogCsv(csvPath);
const rows = records.map(toRow).filter((row) => {
  if (args.stopId && row.stopId !== args.stopId) {
    return false;
  }
  if (args.variant && row.variant !== args.variant) {
    return false;
  }
  return true;
});

const limitedRows = args.limit ? rows.slice(0, args.limit) : rows;
fs.mkdirSync(outputDir, { recursive: true });

let generatedCount = 0;
for (const row of limitedRows) {
  const outputPath = path.join(outputDir, row.outputFile);
  if (fs.existsSync(outputPath) && !args.force) {
    continue;
  }

  const command = new SynthesizeSpeechCommand({
    OutputFormat: "mp3",
    VoiceId: row.voiceId,
    Engine: row.engine,
    TextType: row.textType,
    Text: row.text
  });

  const response = await client.send(command);
  const buffer = await audioStreamToBuffer(response.AudioStream);
  fs.writeFileSync(outputPath, buffer);
  generatedCount += 1;
  console.log(`Generated ${row.outputFile} (${row.stopId}/${row.variant})`);
}

console.log(`Polly narration generation complete. ${generatedCount} file(s) written.`);
