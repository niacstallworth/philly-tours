import fs from "fs";
import path from "path";

const repoRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");

function parseArgs(argv) {
  const args = {
    file: path.join(repoRoot, "private-content", "catalog.json"),
    outCsv: path.join(repoRoot, "private-content", "exports", "narration-script-catalog.csv"),
    outDir: path.join(repoRoot, "private-content", "exports", "narration-lines"),
    voiceId: process.env.POLLY_DEFAULT_VOICE_ID || "Amy",
    engine: process.env.POLLY_DEFAULT_ENGINE || "neural",
    textType: "text"
  };
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === "--file" && argv[index + 1]) {
      args.file = path.resolve(repoRoot, argv[index + 1]);
      index += 1;
      continue;
    }
    if (value === "--out-csv" && argv[index + 1]) {
      args.outCsv = path.resolve(repoRoot, argv[index + 1]);
      index += 1;
      continue;
    }
    if (value === "--out-dir" && argv[index + 1]) {
      args.outDir = path.resolve(repoRoot, argv[index + 1]);
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
      continue;
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
  assert(Array.isArray(parsed.tours), "Private catalog must contain a tours array.");
  return parsed;
}

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function csvEscape(value) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

function slugFromOutputFile(outputFile) {
  return outputFile.replace(/\.mp3$/i, "");
}

function collectRows(catalog, defaults) {
  const rows = [];
  for (const tour of catalog.tours) {
    for (const stop of Array.isArray(tour.stops) ? tour.stops : []) {
      for (const variant of ["drive", "walk"]) {
        const text = normalizeText(stop.scripts?.[variant]);
        if (!text) {
          continue;
        }
        const matchingAudio = (Array.isArray(stop.mediaAssets) ? stop.mediaAssets : []).find(
          (asset) => normalizeText(asset.kind) === "audio" && normalizeText(asset.variant) === variant
        );
        const outputFile = matchingAudio?.objectPath
          ? path.basename(matchingAudio.objectPath)
          : `${stop.id.replace(`${tour.id}-`, "")}-${variant}.mp3`;
        rows.push({
          stopId: normalizeText(stop.id),
          variant,
          title: normalizeText(stop.title),
          outputFile,
          voiceId: defaults.voiceId,
          engine: defaults.engine,
          textType: defaults.textType,
          text
        });
      }
    }
  }
  return rows;
}

function writeCsv(filePath, rows) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const lines = [
    "stopId,variant,title,outputFile,voiceId,engine,textType,text",
    ...rows.map((row) =>
      [
        row.stopId,
        row.variant,
        row.title,
        row.outputFile,
        row.voiceId,
        row.engine,
        row.textType,
        row.text
      ].map(csvEscape).join(",")
    )
  ];
  fs.writeFileSync(filePath, `${lines.join("\n")}\n`, "utf8");
}

function writeTextPackets(directoryPath, rows) {
  fs.mkdirSync(directoryPath, { recursive: true });
  for (const row of rows) {
    const packetPath = path.join(directoryPath, `${slugFromOutputFile(row.outputFile)}.txt`);
    const contents = [
      `Stop: ${row.title}`,
      `Stop ID: ${row.stopId}`,
      `Variant: ${row.variant}`,
      `Output File: ${row.outputFile}`,
      `Voice ID: ${row.voiceId}`,
      `Engine: ${row.engine}`,
      "",
      row.text
    ].join("\n");
    fs.writeFileSync(packetPath, `${contents}\n`, "utf8");
  }
}

const args = parseArgs(process.argv.slice(2));
const catalog = loadCatalog(args.file);
const rows = collectRows(catalog, args);
assert(rows.length > 0, `No narration rows found in ${args.file}.`);

writeCsv(args.outCsv, rows);
writeTextPackets(args.outDir, rows);

console.log(
  `Exported ${rows.length} narration row(s) to ${path.relative(repoRoot, args.outCsv)} and ${path.relative(repoRoot, args.outDir)}.`
);
