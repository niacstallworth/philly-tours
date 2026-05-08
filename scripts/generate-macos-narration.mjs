import fs from "fs";
import path from "path";
import process from "process";
import { spawnSync } from "child_process";
import { readCatalogCsv } from "./lib/arAssetCatalogCsv.mjs";

const rootDir = process.cwd();
const defaultCsvPath = path.join(rootDir, "docs", "narration-script-catalog.csv");
const defaultOutputDir = path.join(rootDir, "assets", "audio");

function parseArgs(argv) {
  const args = {
    csv: defaultCsvPath,
    outputDir: defaultOutputDir,
    stopId: null,
    variant: null,
    limit: null,
    force: false,
    voice: "Eddy (English (US))",
    rate: "172",
    extension: "aiff"
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--csv") {
      args.csv = path.resolve(rootDir, argv[i + 1] || "");
      i += 1;
      continue;
    }
    if (arg === "--output-dir") {
      args.outputDir = path.resolve(rootDir, argv[i + 1] || "");
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
    if (arg === "--limit") {
      args.limit = Number(argv[i + 1] || "0") || null;
      i += 1;
      continue;
    }
    if (arg === "--force") {
      args.force = true;
      continue;
    }
    if (arg === "--voice") {
      args.voice = argv[i + 1] || args.voice;
      i += 1;
      continue;
    }
    if (arg === "--rate") {
      args.rate = argv[i + 1] || args.rate;
      i += 1;
      continue;
    }
    if (arg === "--extension") {
      args.extension = String(argv[i + 1] || args.extension).trim().replace(/^\./, "");
      i += 1;
    }
  }
  return args;
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function toRow(record) {
  const row = {
    stopId: String(record.stopId || "").trim(),
    variant: String(record.variant || "").trim(),
    title: String(record.title || "").trim(),
    outputFile: String(record.outputFile || "").trim(),
    text: String(record.text || "").trim()
  };
  assert(row.stopId, "Narration row missing stopId.");
  assert(["drive", "walk"].includes(row.variant), `Narration row ${row.stopId} has invalid variant.`);
  assert(row.outputFile, `Narration row ${row.stopId}/${row.variant} is missing outputFile.`);
  assert(row.text, `Narration row ${row.stopId}/${row.variant} is missing text.`);
  return row;
}

function runCommand(command, args, label) {
  const result = spawnSync(command, args, { encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error(`${label} failed: ${result.stderr || result.stdout || "unknown error"}`);
  }
}

function draftOutputFileName(fileName, extension) {
  return `${fileName.replace(/\.[^.]+$/i, "")}.${extension}`;
}

const args = parseArgs(process.argv.slice(2));
const { records } = readCatalogCsv(args.csv);
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
assert(limitedRows.length > 0, "No narration rows matched the requested filters.");

fs.mkdirSync(args.outputDir, { recursive: true });

let generatedCount = 0;
for (const row of limitedRows) {
  const outputFile = draftOutputFileName(row.outputFile, args.extension);
  const outputPath = path.join(args.outputDir, outputFile);
  if (fs.existsSync(outputPath) && !args.force) {
    continue;
  }

  runCommand(
    "say",
    ["-v", args.voice, "-r", args.rate, "-o", outputPath, row.text],
    `say for ${outputFile}`
  );
  generatedCount += 1;
  console.log(`Generated ${outputFile} (${row.stopId}/${row.variant})`);
}

console.log(`macOS narration generation complete. ${generatedCount} file(s) written.`);
