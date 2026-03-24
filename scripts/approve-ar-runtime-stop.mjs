import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { execFileSync } from "node:child_process";
import { readCatalogCsv, writeCatalogCsv } from "./lib/arAssetCatalogCsv.mjs";

const rootDir = process.cwd();
const catalogPath = path.join(rootDir, "docs", "ar-asset-catalog.csv");
const reportDir = path.join(rootDir, "generated", "ar-runtime-staging", "manual-status");
const headers = [
  "tourId",
  "tourTitle",
  "stopId",
  "stopTitle",
  "arPriority",
  "arType",
  "assetStatus",
  "iosAsset",
  "androidAsset",
  "webAsset",
  "scale",
  "rotationYDeg",
  "verticalOffsetM",
  "anchorStyle",
  "fallbackType",
  "coordQuality",
  "triggerRadiusM",
  "assetNeeded",
  "estimatedEffort",
  "notes",
  "stylePreset",
  "visualPriority",
  "historicalEra",
  "negativePrompt"
];

function parseArgs(argv) {
  const args = {
    stopId: "",
    note: "",
    dryRun: false,
    force: false
  };

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === "--stop-id") {
      args.stopId = (argv[index + 1] || "").trim();
      index += 1;
      continue;
    }
    if (value === "--note") {
      args.note = (argv[index + 1] || "").trim();
      index += 1;
      continue;
    }
    if (value === "--dry-run") {
      args.dryRun = true;
      continue;
    }
    if (value === "--force") {
      args.force = true;
    }
  }

  if (!args.stopId) {
    throw new Error("Missing required --stop-id");
  }

  return args;
}

function ensureDirectory(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function relativeRepoPath(absolutePath) {
  return path.relative(rootDir, absolutePath).replace(/\\/g, "/");
}

function stripManualStatusNote(notes) {
  return String(notes || "")
    .split(/\r?\n/)
    .filter((line) => !line.trim().startsWith("[manual-status]"))
    .join("\n")
    .trim();
}

function withManualStatusNote(notes, manualStatusNote) {
  const stripped = stripManualStatusNote(notes);
  if (!manualStatusNote) {
    return stripped;
  }
  return stripped ? `${stripped}\n[manual-status] ${manualStatusNote}` : `[manual-status] ${manualStatusNote}`;
}

function buildManualStatusNote(note) {
  const approvedAt = new Date().toISOString();
  const trimmedNote = String(note || "").trim();
  return trimmedNote ? `approved on-device ${approvedAt} | ${trimmedNote}` : `approved on-device ${approvedAt}`;
}

function buildMarkdownReport(report) {
  return `# AR Manual Status Approval

- Generated at: ${report.generatedAt}
- Dry run: ${report.dryRun ? "yes" : "no"}
- Stop ID: \`${report.stopId}\`
- Stop title: ${report.stopTitle}
- Status: \`${report.previousStatus}\` -> \`${report.nextStatus}\`
- Notes: ${report.notes || "none"}
`;
}

function runRegeneration() {
  const scripts = [
    "scripts/import-ar-asset-catalog.mjs",
    "scripts/generate-ar-scene-manifests.mjs",
    "scripts/generate-ar-job-packs.mjs",
    "scripts/generate-ar-review-dashboard.mjs"
  ];

  for (const script of scripts) {
    execFileSync(process.execPath, [path.join(rootDir, script)], {
      cwd: rootDir,
      stdio: "inherit"
    });
  }
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const catalog = readCatalogCsv(catalogPath);
  const records = catalog.records.map((record) => ({ ...record }));
  const record = records.find((candidate) => candidate.stopId === args.stopId);

  if (!record) {
    throw new Error(`Could not find stopId "${args.stopId}" in ${relativeRepoPath(catalogPath)}`);
  }

  const previousStatus = String(record.assetStatus || "").trim() || "planned";
  if (previousStatus === "planned" && !args.force) {
    throw new Error(
      `Refusing to approve "${args.stopId}" while it is still planned. Move it to in_production/ready first, or rerun with --force if you really mean it.`
    );
  }

  const manualStatusNote = buildManualStatusNote(args.note);
  const nextNotes = withManualStatusNote(record.notes, manualStatusNote);
  const report = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    dryRun: args.dryRun,
    stopId: record.stopId,
    stopTitle: record.stopTitle,
    previousStatus,
    nextStatus: "approved",
    notes: nextNotes
  };

  ensureDirectory(reportDir);
  fs.writeFileSync(path.join(reportDir, `${record.stopId}.json`), `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(path.join(reportDir, `${record.stopId}.md`), buildMarkdownReport(report));

  if (!args.dryRun) {
    record.assetStatus = "approved";
    record.notes = nextNotes;
    writeCatalogCsv(catalogPath, headers, records);
    runRegeneration();
  }

  console.log(
    `${args.dryRun ? "Previewed" : "Approved"} ${record.stopId}. Report: ${relativeRepoPath(path.join(reportDir, `${record.stopId}.md`))}`
  );
}

main();
