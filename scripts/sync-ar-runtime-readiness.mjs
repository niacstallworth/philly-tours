import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { execFileSync } from "node:child_process";
import { readCatalogCsv, writeCatalogCsv } from "./lib/arAssetCatalogCsv.mjs";

const rootDir = process.cwd();
const catalogPath = path.join(rootDir, "docs", "ar-asset-catalog.csv");
const generatedDir = path.join(rootDir, "generated", "ar");
const stagingDir = path.join(rootDir, "generated", "ar-runtime-staging");
const reportDir = path.join(stagingDir, "catalog-sync");
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
    dryRun: false
  };

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === "--stop-id") {
      args.stopId = (argv[index + 1] || "").trim();
      index += 1;
      continue;
    }
    if (value === "--dry-run") {
      args.dryRun = true;
    }
  }

  return args;
}

function ensureDirectory(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function relativeRepoPath(absolutePath) {
  return path.relative(rootDir, absolutePath).replace(/\\/g, "/");
}

function readJsonIfPresent(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function assetExistsInRepo(assetPath) {
  const normalized = String(assetPath || "").replace(/^\/+/, "");
  if (!normalized) {
    return false;
  }

  const candidates = [
    path.join(rootDir, normalized),
    path.join(rootDir, "assets", normalized),
    path.join(rootDir, "ios", "PhillyARTours", normalized),
    path.join(rootDir, "ios", "PhillyARTours", "ARAssets", normalized)
  ];

  return candidates.some((candidate) => fs.existsSync(candidate));
}

function hasGeneratedStage(stopId, stage) {
  return fs.existsSync(path.join(generatedDir, stopId, stage));
}

function hasReviewedMeshArtifacts(stopId) {
  const reviewedDir = path.join(generatedDir, stopId, "rough_mesh", "manual", "reviewed");
  if (!fs.existsSync(reviewedDir)) {
    return false;
  }

  const fileNames = fs.readdirSync(reviewedDir, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name);
  return fileNames.some((fileName) => {
    const lower = fileName.toLowerCase();
    return (lower.endsWith(".usdz") || lower.endsWith(".glb")) && !lower.endsWith("-cleanup-notes-template.md");
  });
}

function loadRuntimeStaging(stopId) {
  const stopStagingDir = path.join(stagingDir, stopId);
  return {
    meshIngest: readJsonIfPresent(path.join(stopStagingDir, "mesh-ingest-manifest.json")),
    runtimeStage: readJsonIfPresent(path.join(stopStagingDir, "staging-manifest.json"))
  };
}

function manifestSuggestsReady(manifest) {
  if (!manifest?.assets?.length) {
    return false;
  }
  const readyResults = new Set(["copied", "skipped_existing"]);
  return manifest.assets.every((asset) => readyResults.has(String(asset?.result || "")));
}

function manifestHasMissingSource(manifest) {
  if (!manifest?.assets?.length) {
    return false;
  }
  return manifest.assets.some((asset) => String(asset?.result || "") === "missing_source");
}

function stripPipelineSyncNote(notes) {
  return String(notes || "")
    .split(/\r?\n/)
    .filter((line) => !line.trim().startsWith("[pipeline-sync]"))
    .join("\n")
    .trim();
}

function withPipelineSyncNote(notes, syncNote) {
  const stripped = stripPipelineSyncNote(notes);
  if (!syncNote) {
    return stripped;
  }
  return stripped ? `${stripped}\n[pipeline-sync] ${syncNote}` : `[pipeline-sync] ${syncNote}`;
}

function derivePipelineState(record) {
  const stopId = String(record.stopId || "").trim();
  const currentStatus = String(record.assetStatus || "").trim() || "planned";
  const runtimeAssetsPresent = {
    ios: assetExistsInRepo(record.iosAsset),
    android: assetExistsInRepo(record.androidAsset),
    web: assetExistsInRepo(record.webAsset)
  };
  const allRuntimeAssetsPresent = runtimeAssetsPresent.ios && runtimeAssetsPresent.android && runtimeAssetsPresent.web;
  const runtimeStaging = loadRuntimeStaging(stopId);
  const hasTextBrief = hasGeneratedStage(stopId, "text_brief");
  const hasConceptImage = hasGeneratedStage(stopId, "concept_image");
  const hasRoughMesh = hasGeneratedStage(stopId, "rough_mesh");
  const hasReviewedAssets = hasReviewedMeshArtifacts(stopId);
  const hasAnyGenerated = hasTextBrief || hasConceptImage || hasRoughMesh;

  if (currentStatus === "approved") {
    return {
      nextStatus: "approved",
      syncNote: "approved status preserved",
      runtimeAssetsPresent,
      hasAnyGenerated,
      hasReviewedAssets,
      runtimeStaging
    };
  }

  if (allRuntimeAssetsPresent || manifestSuggestsReady(runtimeStaging.meshIngest) || manifestSuggestsReady(runtimeStaging.runtimeStage)) {
    return {
      nextStatus: "ready",
      syncNote: "runtime assets present in repo and ready for device validation",
      runtimeAssetsPresent,
      hasAnyGenerated,
      hasReviewedAssets,
      runtimeStaging
    };
  }

  if (hasAnyGenerated || hasReviewedAssets || runtimeStaging.meshIngest || runtimeStaging.runtimeStage) {
    let syncNote = "generated pipeline artifacts exist";
    if (manifestHasMissingSource(runtimeStaging.meshIngest)) {
      syncNote = "rough-mesh handoff exists; reviewed exports still missing";
    } else if (hasReviewedAssets) {
      syncNote = "reviewed mesh exports are present; run ar:mesh:ingest";
    } else if (hasRoughMesh) {
      syncNote = "rough-mesh handoff is ready for cleanup";
    } else if (hasConceptImage) {
      syncNote = "concept-image references exist; rough mesh is next";
    } else if (hasTextBrief) {
      syncNote = "text brief exists; concept image is next";
    }

    return {
      nextStatus: "in_production",
      syncNote,
      runtimeAssetsPresent,
      hasAnyGenerated,
      hasReviewedAssets,
      runtimeStaging
    };
  }

  return {
    nextStatus: "planned",
    syncNote: "no generated pipeline artifacts yet",
    runtimeAssetsPresent,
    hasAnyGenerated,
    hasReviewedAssets,
    runtimeStaging
  };
}

function buildMarkdownReport(report) {
  const lines = [
    "# AR Runtime Readiness Sync",
    "",
    `Generated at: ${report.generatedAt}`,
    `Dry run: ${report.dryRun ? "yes" : "no"}`,
    `Stops processed: ${report.stops.length}`,
    ""
  ];

  for (const stop of report.stops) {
    lines.push(`## ${stop.stopTitle}`, "");
    lines.push(`- Stop ID: \`${stop.stopId}\``);
    lines.push(`- Status: \`${stop.previousStatus}\` -> \`${stop.nextStatus}\``);
    lines.push(`- Sync note: ${stop.syncNote}`);
    lines.push(
      `- Runtime assets present: iOS=${stop.runtimeAssetsPresent.ios ? "yes" : "no"}, Android=${stop.runtimeAssetsPresent.android ? "yes" : "no"}, Web=${stop.runtimeAssetsPresent.web ? "yes" : "no"}`
    );
    if (stop.notes) {
      lines.push(`- Notes: ${stop.notes}`);
    }
    lines.push("");
  }

  return `${lines.join("\n")}\n`;
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
  const selectedRecords = records.filter((record) => !args.stopId || record.stopId === args.stopId);

  const reportStops = [];
  for (const record of selectedRecords) {
    const pipelineState = derivePipelineState(record);
    const previousStatus = String(record.assetStatus || "").trim() || "planned";
    const nextNotes = withPipelineSyncNote(record.notes, pipelineState.syncNote);

    if (!args.dryRun) {
      record.assetStatus = pipelineState.nextStatus;
      record.notes = nextNotes;
    }

    reportStops.push({
      stopId: record.stopId,
      stopTitle: record.stopTitle,
      previousStatus,
      nextStatus: pipelineState.nextStatus,
      syncNote: pipelineState.syncNote,
      runtimeAssetsPresent: pipelineState.runtimeAssetsPresent,
      notes: nextNotes
    });
  }

  const report = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    dryRun: args.dryRun,
    stops: reportStops
  };

  ensureDirectory(reportDir);
  fs.writeFileSync(path.join(reportDir, "report.json"), `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(path.join(reportDir, "report.md"), buildMarkdownReport(report));

  if (!args.dryRun) {
    writeCatalogCsv(catalogPath, headers, records);
    runRegeneration();
  }

  console.log(
    `${args.dryRun ? "Previewed" : "Synced"} AR runtime readiness for ${reportStops.length} stop(s). Report: ${relativeRepoPath(path.join(reportDir, "report.md"))}`
  );
}

main();
